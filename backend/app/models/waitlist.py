import logging
import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func

from app.models.database import Base, get_database, is_database_connected

logger = logging.getLogger(__name__)


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(String(16), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


async def add_to_waitlist(name: str, email: str):
    """Save a waitlist signup to Neon."""
    if not is_database_connected():
        raise RuntimeError("Database is not connected")

    db = get_database()

    query_insert = """
    INSERT INTO waitlist (id, name, email, timestamp)
    VALUES (:id, :name, :email, CURRENT_TIMESTAMP)
    """

    values = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "email": email.strip().lower(),
    }

    await db.execute(query=query_insert, values=values)
    logger.info("Waitlist signup saved for %s", values["email"])
