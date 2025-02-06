from langgraph.graph import StateGraph
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIAgent:
    def __init__(self):
        self.workflow = StateGraph(dict)
        
    def generate_sql(self, schema: str, query: str) -> str:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL"),
            messages=[{
                "role": "system",
                "content": f"Generate optimized SQL for schema:\n{schema}"
            }, {
                "role": "user",
                "content": query
            }]
        )
        return response.choices[0].message.content
