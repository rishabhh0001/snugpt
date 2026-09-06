import os
import sys
import io
import csv
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents, _get_collection

SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1MKDnur1qTq7WjT-PIEdLA95jZORb7HD6A_UbkMDELZ8/export?format=csv&gid=1017888812"

def parse_and_upload():
    req = urllib.request.Request(SHEET_CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
    
    reader = list(csv.reader(io.StringIO(content)))
    print(f"Total rows read: {len(reader)}")

    # Row 0 or 1 contains headers
    # Let's see rows
    for i, r in enumerate(reader[:5]):
        clean = [c.strip() for c in r if c.strip()]
        print(f"Header check row {i}: {clean}")

    # Find the header row (contains 'Club' or 'Name' or 'Description')
    header_idx = -1
    for i, r in enumerate(reader):
        row_str = " ".join(r).lower()
        if "description" in row_str or "instagram" in row_str or "email" in row_str:
            header_idx = i
            break

    print(f"Detected header row index: {header_idx}")
    headers = [h.strip() for h in reader[header_idx]] if header_idx >= 0 else []
    print(f"Headers: {headers}")

    clubs = []
    for r in reader[header_idx + 1:]:
        if not any(r):
            continue
        # Columns: ['S no.', 'Society Name', 'Logo', 'Soceity Details', 'Instagram', 'Ēmail ID', 'Contact Person', 'Position', 'Contact Details']
        row_padded = [c.strip() for c in r] + [""] * 10
        
        s_no = row_padded[0]
        name = row_padded[1]
        logo = row_padded[2]
        desc = row_padded[3]
        insta = row_padded[4]
        email = row_padded[5]
        contact_name = row_padded[6]
        contact_role = row_padded[7]
        contact_phone = row_padded[8]

        if not name and s_no and not s_no.isdigit():
            name = s_no

        if name:
            clubs.append({
                "name": name,
                "description": desc,
                "instagram": insta,
                "email": email,
                "contact_name": contact_name,
                "contact_role": contact_role,
                "contact_phone": contact_phone
            })

    print(f"Extracted {len(clubs)} clubs/societies:")
    for c in clubs:
        print(f"- {c['name']} | Contact: {c['contact_name']} ({c['email']})")

    docs = []
    for c in clubs:
        content_parts = [
            f"Shiv Nadar University Club / Student Society: {c['name']}",
            f"Description: {c['description']}" if c['description'] else "",
            f"Instagram: {c['instagram']}" if c['instagram'] else "",
            f"Official Email: {c['email']}" if c['email'] else "",
            f"Point of Contact: {c['contact_name']} ({c['contact_role']})" if c['contact_name'] else "",
            f"Contact Phone: {c['contact_phone']}" if c['contact_phone'] else ""
        ]
        page_content = "\n".join([p for p in content_parts if p])
        
        metadata = {
            "id": f"snu_club_{c['name'].lower().replace(' ', '_')[:30]}",
            "source": "student_clubs_directory",
            "category": "Student Life / Clubs & Societies",
            "club_name": c["name"],
            "email": c["email"],
            "instagram": c["instagram"]
        }
        docs.append(Document(page_content=page_content, metadata=metadata))

    # Comprehensive Directory Chunk
    directory_lines = ["Shiv Nadar University (SNU) Academic & Technical Clubs & Societies Directory:"]
    for c in clubs:
        desc_brief = (c['description'][:120] + "...") if len(c['description']) > 120 else c['description']
        contact_info = f"Contact: {c['contact_name']} ({c['email']})" if c['contact_name'] else f"Email: {c['email']}"
        directory_lines.append(f"- **{c['name']}**: {desc_brief} | {contact_info} | Insta: {c['instagram']}")
    
    docs.append(Document(
        page_content="\n".join(directory_lines),
        metadata={
            "id": "snu_clubs_directory_overview",
            "source": "student_clubs_directory",
            "category": "Student Life / Clubs & Societies",
            "subject": "Complete Clubs and Societies List"
        }
    ))

    print(f"\nUploading {len(docs)} club documents to Chroma DB...")
    # Optional purge of existing club records
    try:
        col = _get_collection()
        col.delete(where={"source": "student_clubs_directory"})
        print("Purged previous club records to prevent duplicates.")
    except Exception as e:
        print(f"Note on purge: {e}")

    add_documents(docs)
    print("SUCCESS: Successfully uploaded all clubs and societies to Chroma DB!")

if __name__ == "__main__":
    parse_and_upload()
