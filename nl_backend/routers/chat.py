from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import inspect  # Added missing import
from services.ai_agent import AIAgent
from services.database import get_db
from models.schemas import QueryRequest

router = APIRouter()
agent = AIAgent()


@router.post("/query")
async def process_query(request: QueryRequest, db=Depends(get_db)):
    try:
        # Retrieve schema from database
        inspector = inspect(db.connection())
        schema = "\n".join([
            f"Table {table}: {[col['name'] for col in inspector.get_columns(table)]}"
            for table in inspector.get_table_names()
        ])

        sql_query = agent.generate_sql(schema, request.query)
        return {"sql": sql_query, "summary": "..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
