import logging
import uuid

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.sql import func

from typing import Optional

from app.models.database import Base, get_database, is_database_connected

logger = logging.getLogger(__name__)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


async def save_contact_message(name: str, email: str, subject: Optional[str], message: str) -> str:

    """Save a contact message submission to the Neon PostgreSQL database."""
    if not is_database_connected():
        raise RuntimeError("Database is not connected")

    db = get_database()

    query_insert = """
    INSERT INTO contact_messages (id, name, email, subject, message, timestamp)
    VALUES (:id, :name, :email, :subject, :message, CURRENT_TIMESTAMP)
    """

    message_id = str(uuid.uuid4())
    values = {
        "id": message_id,
        "name": name.strip(),
        "email": email.strip().lower(),
        "subject": subject.strip() if subject else None,
        "message": message.strip(),
    }

    await db.execute(query=query_insert, values=values)
    logger.info("Contact message saved for %s with ID %s", values["email"], message_id)
    return message_id
