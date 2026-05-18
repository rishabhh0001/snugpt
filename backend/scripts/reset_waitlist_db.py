import os
import sys
import asyncio
from databases import Database

# Add backend to path
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root, "backend"))

from app.config import settings

async def reset():
    url = settings.database_url
    if not url:
        print("DATABASE_URL is not set.")
        return

    # Map to asyncpg
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    print(f"Connecting to PostgreSQL/Neon...")
    db = Database(url)
    await db.connect()
    
    print("Dropping legacy waitlist table...")
    await db.execute("DROP TABLE IF EXISTS waitlist CASCADE;")
    print("Waitlist table dropped successfully!")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(reset())
