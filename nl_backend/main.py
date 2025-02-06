from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, TypedDict
import uuid
import openai
from langgraph.graph import StateGraph, END
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import Engine
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session storage with connection pooling
sessions: Dict[str, dict] = {}


class DatabaseConnection(BaseModel):
    db_type: str
    host: str
    port: int
    username: str
    password: str
    database: str
    schema: Optional[str] = None


class QueryRequest(BaseModel):
    session_id: str
    query: str


class QueryResponse(BaseModel):
    sql: str
    summary: str
    success: bool
    error: Optional[str] = None


def get_engine(db_config: Dict) -> Engine:
    if db_config['db_type'] == 'postgresql':
        uri = f"postgresql+psycopg2://{db_config['username']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    elif db_config['db_type'] == 'mysql':
        uri = f"mysql+pymysql://{db_config['username']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    else:
        raise ValueError("Unsupported database type")
    return create_engine(uri, pool_pre_ping=True)


def get_schema(engine: Engine) -> str:
    inspector = inspect(engine)
    schema = []
    for table in inspector.get_table_names():
        columns = [f"{col['name']} ({str(col['type'])})"
                   for col in inspector.get_columns(table)]
        schema.append(f"Table {table}: {', '.join(columns)}")
    return '\n'.join(schema)


@app.post("/connect")
async def connect(conn: DatabaseConnection):
    try:
        engine = get_engine(conn.model_dump())  # Fix: Use model_dump instead of dict
        with engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))  # Fix: Wrap SQL string with text()

        session_id = str(uuid.uuid4())
        schema = get_schema(engine)

        sessions[session_id] = {
            "engine": engine,
            "schema": schema,
            "config": conn.model_dump(),  # Fix: Use model_dump instead of dict
            "connection_count": 0
        }
        return {"session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class AgentState(TypedDict):
    natural_query: str
    schema: str
    sql: Optional[str]
    valid: bool
    results: Optional[Any]
    summary: Optional[str]
    error: Optional[str]  # Fix: Add missing key 'error'
    session_id: str  # Fix: Add missing key 'session_id'


def analyze_query(state: AgentState) -> AgentState:
    prompt = f"""Database schema:
{state['schema']}
Natural language query:
{state['natural_query']}
Generate optimized SQL query considering indexes and data distribution.
Return only the SQL without explanations."""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    state['sql'] = response.choices[0].message.content.strip()
    return state


def validate_sql(state: AgentState) -> AgentState:
    forbidden_keywords = ['DROP', 'TRUNCATE', 'GRANT', 'REVOKE']
    state['valid'] = all(
        keyword not in state['sql'].upper()
        for keyword in forbidden_keywords
    )
    return state


def execute_query(state: AgentState) -> AgentState:
    if not state['valid']:
        return state
    try:
        engine = sessions[state['session_id']]['engine']
        with engine.connect() as conn:
            result = conn.execute(text(state['sql']))  # Fix: Wrap SQL string with text()
            state['results'] = [dict(row) for row in result.mappings()]
        return state
    except Exception as e:
        state['error'] = str(e)
        return state


def summarize_results(state: AgentState) -> AgentState:
    prompt = f"""SQL Query:
{state['sql']}
Results:
{state['results'][:3]} [truncated] 
Generate concise natural language summary including:
- Main insights
- Data patterns
- Anomalies if present
- Business implications"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    state['summary'] = response.choices[0].message.content.strip()
    return state


workflow = StateGraph(AgentState)
workflow.add_node("analyze", analyze_query)
workflow.add_node("validate", validate_sql)
workflow.add_node("execute", execute_query)
workflow.add_node("summarize", summarize_results)
workflow.set_entry_point("analyze")
workflow.add_edge("analyze", "validate")
workflow.add_conditional_edges(
    "validate",
    lambda state: "execute" if state['valid'] else END,
)
workflow.add_edge("execute", "summarize")
workflow.add_edge("summarize", END)


@app.post("/query")
async def query_endpoint(request: QueryRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    state = {
        "natural_query": request.query,
        "schema": sessions[request.session_id]["schema"],
        "session_id": request.session_id,
        "valid": True,
        "sql": "",  # Fix: Initialize missing keys
        "summary": "",
        "error": None,
    }

    for node_name in workflow.nodes:
        node = workflow.nodes[node_name]
        state = node(state)  # Fix: Correctly call the node function

    if state.get('error'):
        return QueryResponse(success=False, error=state['error'])

    return QueryResponse(
        sql=state['sql'],
        summary=state['summary'],
        success=True
    )