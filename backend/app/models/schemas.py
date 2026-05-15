from pydantic import BaseModel
from typing import List, Optional

class HistoryMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[HistoryMessage]] = []
    session_id: Optional[str] = None

class SourceDocument(BaseModel):
    content: str
    metadata: dict

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[SourceDocument]] = None

class WaitlistRequest(BaseModel):
    name: str
    email: str
