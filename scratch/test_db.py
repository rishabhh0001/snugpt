import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.models.database import connect_database, disconnect_database, get_database
from app.models.contact import save_contact_message

async def test():
    try:
        print("Connecting to database...")
        await connect_database()
        
        db = get_database()
        print("Database connected. Testing query...")
        
        # Test basic select
        result = await db.fetch_one("SELECT 1")
        print("Select 1 result:", result)
        
        # Check if contact_messages table exists
        try:
            tbl_check = await db.fetch_one("SELECT COUNT(*) FROM contact_messages")
            print("contact_messages count:", tbl_check)
        except Exception as te:
            print("Error querying contact_messages table:", te)
            
        # Test user table check
        try:
            user_check = await db.fetch_one("SELECT COUNT(*) FROM users")
            print("users count:", user_check)
        except Exception as ue:
            print("Error querying users table:", ue)
            
    except Exception as e:
        print("Connection failed:", e)
    finally:
        await disconnect_database()
        print("Disconnected.")

if __name__ == "__main__":
    asyncio.run(test())
