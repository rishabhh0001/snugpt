from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from typing import Optional
import uuid
from app.models.database import Base

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(String(36), primary_key=True)
    session_id = Column(String(64), index=True)
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    context = Column(JSON, nullable=True) 
    user_ip = Column(String(45), nullable=True) 
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

async def save_chat_log(query: str, response: str, session_id: Optional[str] = None, context: Optional[dict] = None, user_ip: Optional[str] = None):
    """Saves a chat interaction to the secure database for future training."""
    from app.models.database import database
    
    query_insert = """
    INSERT INTO chat_logs (id, session_id, user_query, ai_response, context, user_ip, timestamp)
    VALUES (:id, :session_id, :user_query, :ai_response, :context, :user_ip, CURRENT_TIMESTAMP)
    """
    
    import json
    values = {
        "id": str(uuid.uuid4()),
        "session_id": session_id or "ann",
        "user_query": query,
        "ai_response": response,
        "context": json.dumps(context) if context else None,
        "user_ip": user_ip
    }
    
    try:
        await database.execute(query=query_insert, values=values)
    except Exception:
        pass # Fail silently to not block user interaction
