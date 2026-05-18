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
    first_name: str
    mobile_number: str
    email_address: str

class FeedbackRequest(BaseModel):
    chat_id: str
    message_id: Optional[str] = None
    action: str  # "up", "down", "copy", "regenerate"


class ShareChatRequest(BaseModel):
    messages: List[HistoryMessage]
    title: Optional[str] = None
    session_id: Optional[str] = None


class ShareChatResponse(BaseModel):
    share_id: str
    share_url: str
    qr_code_base64: str

