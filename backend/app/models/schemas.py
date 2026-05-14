from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str
    
class SourceDocument(BaseModel):
    content: str
    metadata: dict
    
class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[SourceDocument]] = None
