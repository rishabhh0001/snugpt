from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
from app.config import settings

# For async operations
database = Database(settings.database_url)
metadata = MetaData()

Base = declarative_base(metadata=metadata)

# For synchronous operations (migrations/setup if needed)
# SQLite doesn't strictly need this for basic usage but good practice
sync_engine = create_engine(settings.database_url.replace("+asyncpg", ""))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

def init_db():
    import app.models.chat_log # Ensure models are registered
    import app.models.waitlist # Ensure waitlist model is registered
    Base.metadata.create_all(bind=sync_engine)
