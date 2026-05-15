import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
from app.config import settings

logger = logging.getLogger(__name__)

# Ensure the database URL has the correct driver for 'databases' library
db_url = settings.database_url
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

database = Database(db_url)

# For synchronous initialization (SQLAlchemy create_all)
# We must strip the async driver prefix for the sync engine
sync_url = db_url.replace("+asyncpg", "")
sync_engine = create_engine(sync_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
Base = declarative_base()

def init_db():
    try:
        import app.models.chat_log
        import app.models.waitlist
        Base.metadata.create_all(bind=sync_engine)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Don't raise, allowing the app to start even if DB is temporarily unavailable
