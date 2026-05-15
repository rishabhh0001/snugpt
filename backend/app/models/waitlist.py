from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
import uuid
from app.models.database import Base

class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

async def add_to_waitlist(name: str, email: str):
    """Saves a waitlist entry to the database."""
    from app.models.database import database
    
    query_insert = """
    INSERT INTO waitlist (id, name, email, timestamp)
    VALUES (:id, :name, :email, CURRENT_TIMESTAMP)
    """
    
    values = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email
    }
    
    await database.execute(query=query_insert, values=values)
