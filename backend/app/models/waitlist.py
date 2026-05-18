import logging
import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func

from app.models.database import Base, get_database, is_database_connected

logger = logging.getLogger(__name__)


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(String(36), primary_key=True)
    first_name = Column(String(255), nullable=False)
    mobile_number = Column(String(20), nullable=False)
    email_address = Column(String(255), nullable=False, unique=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


async def add_to_waitlist(first_name: str, mobile_number: str, email_address: str):
    """Save a waitlist signup to Neon."""
    if not is_database_connected():
        raise RuntimeError("Database is not connected")

    db = get_database()

    query_insert = """
    INSERT INTO waitlist (id, first_name, mobile_number, email_address, timestamp)
    VALUES (:id, :first_name, :mobile_number, :email_address, CURRENT_TIMESTAMP)
    """

    values = {
        "id": str(uuid.uuid4()),
        "first_name": first_name.strip(),
        "mobile_number": mobile_number.strip(),
        "email_address": email_address.strip().lower(),
    }

    await db.execute(query=query_insert, values=values)
    logger.info("Waitlist signup saved for %s", values["email_address"])
