# models/schemas.py
from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str  # Natural language query from the user