import logging
import uuid
from typing import Optional

from sqlalchemy import Column, DateTime, JSON, String, Text, Integer
from sqlalchemy.sql import func

from app.models.database import Base, get_database, is_database_connected

logger = logging.getLogger(__name__)


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(String(36), primary_key=True)
    session_id = Column(String(64), index=True)
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    context = Column(JSON, nullable=True)
    user_ip = Column(String(45), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class ChatFeedback(Base):
    __tablename__ = "chat_feedback"

    id = Column(String(36), primary_key=True)
    chat_id = Column(String(64), index=True)
    message_id = Column(String(64), nullable=True)
    action = Column(String(20), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


async def save_chat_log(
    query: str,
    response: str,
    session_id: Optional[str] = None,
    context: Optional[dict] = None,
    user_ip: Optional[str] = None,
    log_id: Optional[str] = None,
):
    """Persist a chat turn to Neon for analytics and future training."""
    if not is_database_connected():
        logger.warning("Database not connected; skipping chat log save.")
        return

    db = get_database()

    query_insert = """
    INSERT INTO chat_logs (id, session_id, user_query, ai_response, context, user_ip, timestamp)
    VALUES (:id, :session_id, :user_query, :ai_response, :context, :user_ip, CURRENT_TIMESTAMP)
    """

    values = {
        "id": log_id or str(uuid.uuid4()),
        "session_id": session_id or "anonymous",
        "user_query": query,
        "ai_response": response,
        "context": context,
        "user_ip": user_ip,
    }

    try:
        await db.execute(query=query_insert, values=values)
    except Exception as e:
        logger.error("Failed to save chat log: %s", e)


async def save_chat_feedback(
    chat_id: str,
    action: str,
    message_id: Optional[str] = None,
):
    """Capture message feedback (up, down, copy, regenerate) with timestamp."""
    if not is_database_connected():
        logger.warning("Database not connected; skipping chat feedback save.")
        return

    db = get_database()

    query_insert = """
    INSERT INTO chat_feedback (id, chat_id, message_id, action, timestamp)
    VALUES (:id, :chat_id, :message_id, :action, CURRENT_TIMESTAMP)
    """

    values = {
        "id": str(uuid.uuid4()),
        "chat_id": chat_id,
        "message_id": message_id,
        "action": action,
    }

    try:
        await db.execute(query=query_insert, values=values)
        print(f"[Feedback] Saved {action} feedback for chat {chat_id}")
    except Exception as e:
        logger.error("Failed to save chat feedback: %s", e)


class SharedChat(Base):
    __tablename__ = "shared_chats"

    id = Column(String(36), primary_key=True)  # unique share token/id
    session_id = Column(String(64), index=True, nullable=True)
    title = Column(String(255), nullable=True)
    messages = Column(JSON, nullable=False)    # frozen messages array
    views = Column(Integer, server_default="0", nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


async def save_shared_chat(
    share_id: str,
    messages: list,
    title: Optional[str] = None,
    session_id: Optional[str] = None,
) -> bool:
    """Save a snapshot of a conversation to shared_chats table."""
    if not is_database_connected():
        logger.warning("Database not connected; skipping shared chat save.")
        return False

    db = get_database()

    query_insert = """
    INSERT INTO shared_chats (id, session_id, title, messages, views, timestamp)
    VALUES (:id, :session_id, :title, :messages, 0, CURRENT_TIMESTAMP)
    """

    values = {
        "id": share_id,
        "session_id": session_id,
        "title": title or "Shared SNUGPT Chat",
        "messages": messages,
    }

    try:
        await db.execute(query=query_insert, values=values)
        return True
    except Exception as e:
        logger.error("Failed to save shared chat: %s", e)
        return False


async def get_shared_chat(share_id: str) -> Optional[dict]:
    """Retrieve shared chat and increment view count."""
    if not is_database_connected():
        logger.warning("Database not connected; cannot fetch shared chat.")
        return None

    db = get_database()

    query_select = """
    SELECT id, session_id, title, messages, views, timestamp 
    FROM shared_chats 
    WHERE id = :id
    """
    try:
        row = await db.fetch_one(query=query_select, values={"id": share_id})
        if row:
            # Increment view count in the background asynchronously
            query_update = "UPDATE shared_chats SET views = views + 1 WHERE id = :id"
            await db.execute(query=query_update, values={"id": share_id})
            
            data = dict(row)
            # Make sure views count in returned data represents the incremented value
            data["views"] += 1
            return data
    except Exception as e:
        logger.error("Failed to fetch shared chat: %s", e)
    return None


