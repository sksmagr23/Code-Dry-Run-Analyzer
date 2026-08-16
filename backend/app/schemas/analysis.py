from pydantic import BaseModel, Field
from typing import Optional

class AnalysisRequest(BaseModel):
    query: Optional[str] = Field(None, description="Optional user query or focus of analysis (e.g. 'Why is my recursion slow?').")
