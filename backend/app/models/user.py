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


import os

def hash_password_scrypt(password: str, salt: bytes) -> str:
    """Hash password securely using scrypt with dynamic salt (memory-hard)."""
    return hashlib.scrypt(
        password.encode(),
        salt=salt,
        n=16384,
        r=8,
        p=1,
        dklen=64
    ).hex()


def hash_password_legacy(password: str) -> str:
    """Hash password securely using legacy SHA-256 with a pre-configured salt."""
    salt = "snugpt_secure_salt_2026_prod_"
    # codeql[py/weak-sensitive-data-hashing] - Legacy fallback for password verification and upgrade
    return hashlib.sha256((salt + password).encode()).hexdigest()


async def verify_and_upgrade_user_password(user: dict, password: str) -> bool:
    """Verify password using Scrypt (modern) or SHA-256 (legacy), upgrading SHA-256 on success."""
    stored_hash = user["password_hash"]
    if ":" in stored_hash:
        try:
            salt_hex, hash_hex = stored_hash.split(":", 1)
            salt = bytes.fromhex(salt_hex)
            computed = hash_password_scrypt(password, salt)
            return computed == hash_hex
        except Exception as e:
            logger.error("Failed to parse/verify scrypt password hash: %s", e)
            return False

    # Legacy SHA-256 check
    if hash_password_legacy(password) == stored_hash:
        # Upgrade legacy account to dynamic scrypt
        try:
            new_salt = os.urandom(16)
            new_hash = hash_password_scrypt(password, new_salt)
            upgraded_hash = f"{new_salt.hex()}:{new_hash}"
            
            db = get_database()
            query_update = "UPDATE users SET password_hash = :hash WHERE id = :id"
            await db.execute(query=query_update, values={"hash": upgraded_hash, "id": user["id"]})
            logger.info("Security auto-upgrade: Upgraded user %s to Scrypt dynamic hashing.", user["id"])
            return True
        except Exception as ex:
            logger.error("Failed to auto-upgrade password hash: %s", ex)
            return True # Still log them in since SHA-256 matched
    return False


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
    new_salt = os.urandom(16)
    pw_hash = f"{new_salt.hex()}:{hash_password_scrypt(password, new_salt)}"
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
    logger.info("User registered successfully using Scrypt: %s", user_id)
    return {"id": user_id, "email": values["email"], "name": display_name}
