import logging
import uuid
import hashlib
from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func
from typing import Optional

from app.models.database import Base, get_database, is_database_connected

logger = logging.getLogger(__name__)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def hash_password(password: str) -> str:
    """Hash password securely using SHA-256 with a pre-configured salt."""
    salt = "snugpt_secure_salt_2026_prod_"
    return hashlib.sha256((salt + password).encode()).hexdigest()


async def get_user_by_email(email: str) -> Optional[dict]:
    """Retrieve user details by email."""
    if not is_database_connected():
        raise RuntimeError("Database is not connected")

    db = get_database()
    query = "SELECT id, email, password_hash, name FROM users WHERE email = :email"
    row = await db.fetch_one(query=query, values={"email": email.strip().lower()})
    if row:
        return dict(row)
    return None


async def create_user(email: str, password: str, name: Optional[str] = None) -> dict:
    """Create a new user account."""
    if not is_database_connected():
        raise RuntimeError("Database is not connected")

    db = get_database()
    pw_hash = hash_password(password)
    user_id = str(uuid.uuid4())
    display_name = name or email.split("@")[0]

    query_insert = """
    INSERT INTO users (id, email, password_hash, name, created_at)
    VALUES (:id, :email, :password_hash, :name, CURRENT_TIMESTAMP)
    """

    values = {
        "id": user_id,
        "email": email.strip().lower(),
        "password_hash": pw_hash,
        "name": display_name,
    }

    await db.execute(query=query_insert, values=values)
    logger.info("User registered successfully: %s", values["email"])
    return {"id": user_id, "email": values["email"], "name": display_name}
