import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()
_database: Database | None = None


def _async_database_url() -> str | None:
    raw = settings.database_url
    if not raw:
        return None

    url = raw.strip()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def _sync_database_url() -> str | None:
    raw = settings.database_url
    if not raw:
        return None

    url = raw.strip()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "")
    if url.startswith("postgresql://") and "+psycopg2" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def get_database() -> Database:
    if _database is None:
        raise RuntimeError("Database is not configured or not connected")
    return _database


def is_database_connected() -> bool:
    return _database is not None and _database.is_connected


async def connect_database() -> None:
    global _database
    async_url = _async_database_url()
    if not async_url:
        logger.warning("DATABASE_URL is not set; waitlist and chat logs disabled.")
        return

    _database = Database(async_url)
    await _database.connect()
    init_db()
    logger.info("Connected to Neon database.")


async def disconnect_database() -> None:
    global _database
    if _database is not None and _database.is_connected:
        await _database.disconnect()
    _database = None


_sync_engine = None
_SessionLocal = None


def get_sync_engine():
    global _sync_engine
    if _sync_engine is None:
        sync_url = _sync_database_url()
        if not sync_url:
            return None
        _sync_engine = create_engine(sync_url, pool_pre_ping=True)
    return _sync_engine


def get_session():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_sync_engine()
        if engine:
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal


def init_db():
    try:
        engine = get_sync_engine()
        if not engine:
            logger.warning("DATABASE_URL not set; skipping table creation.")
            return
        import app.models.chat_log  # noqa: F401
        import app.models.waitlist  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized.")
    except Exception as e:
        logger.error("Database initialization failed: %s", e)
