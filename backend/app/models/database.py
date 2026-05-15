import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
from app.config import settings

logger = logging.getLogger(__name__)

# Ensure the database URL has the correct driver for 'databases' library
# Ensure the database URL has the correct driver for 'databases' library
raw_db_url = settings.database_url
if not raw_db_url:
    # Safe fallback to prevent module-level crash
    db_url = "postgresql+asyncpg://localhost/snugpt"
else:
    db_url = raw_db_url
    # Handle both postgres:// and postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Ensure +asyncpg is present for the async 'database' object
    if "postgresql" in db_url and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

database = Database(db_url)

# Lazy initialization for engines and sessions
_sync_engine = None
_SessionLocal = None

def get_sync_engine():
    global _sync_engine
    if _sync_engine is None:
        db_url = settings.database_url
        if not db_url or "postgresql" not in db_url:
            # Fallback for initialization phase if URL is missing
            return None
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        sync_url = db_url.replace("+asyncpg", "").replace("postgresql://", "postgresql+psycopg2://", 1)
        _sync_engine = create_engine(sync_url, pool_pre_ping=True)
    return _sync_engine

def get_session():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_sync_engine()
        if engine:
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal

Base = declarative_base()

def init_db():
    try:
        engine = get_sync_engine()
        if not engine:
            logger.warning("No database engine available for init_db.")
            return
        import app.models.chat_log
        import app.models.waitlist
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
