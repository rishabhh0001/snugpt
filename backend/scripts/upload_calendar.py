import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents

def add_calendar_events():
    data = [
        {"id":"snu_monsoon_2026_2026-08-17","date":"2026-08-17","semester":"Monsoon 2026","event":"Start of classes for all students","category":"academic","text":"Shiv Nadar University Monsoon 2026: Classes for all students start on 17 August 2026."},
        {"id":"snu_monsoon_2026_2026-08-15","date":"2026-08-15","semester":"Monsoon 2026","event":"Independence Day","category":"holiday","text":"Shiv Nadar University Monsoon 2026: Independence Day is observed on 15 August 2026."},
        {"id":"snu_monsoon_2026_2026-09-05_11","date_start":"2026-09-05","date_end":"2026-09-11","semester":"Monsoon 2026","event":"Mid-Term Examinations","category":"examination","text":"Shiv Nadar University Monsoon 2026: Mid-Term Examinations are scheduled from 5 September to 11 September 2026."},
        {"id":"snu_spring_2027_2027-01-11","date":"2027-01-11","semester":"Spring 2027","event":"Start of classes for all students","category":"academic","text":"Shiv Nadar University Spring 2027: Classes for all students start on 11 January 2027."},
        {"id":"snu_spring_2027_2027-01-26","date":"2027-01-26","semester":"Spring 2027","event":"Republic Day","category":"holiday","text":"Shiv Nadar University Spring 2027: Republic Day is observed on 26 January 2027."},
        {"id":"snu_spring_2027_2027-05-21","date":"2027-05-21","semester":"Spring 2027","event":"Result Declaration Day","category":"results","text":"Shiv Nadar University Spring 2027: Result Declaration Day is 21 May 2027."}
    ]

    docs = []
    for item in data:
        # Use the 'text' field as the main content, and the rest as metadata
        content = item.pop("text")
        
        # Ensure metadata values are strings, ints, floats, or bools for ChromaDB
        metadata = {k: str(v) for k, v in item.items()}
        metadata["source"] = "academic_calendar"
        
        doc = Document(page_content=content, metadata=metadata)
        docs.append(doc)

    print(f"Adding {len(docs)} academic calendar events to Chroma DB...")
    add_documents(docs)
    print("Successfully added events to Chroma DB!")

if __name__ == "__main__":
    add_calendar_events()
