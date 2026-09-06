import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents, _get_collection

def add_full_calendar_events():
    # Remove older Monsoon 2026 entries to prevent stale/duplicate data
    try:
        col = _get_collection()
        print("Purging existing Monsoon 2026 calendar records from Chroma...")
        col.delete(where={"semester": "Monsoon 2026"})
        print("Purge completed.")
    except Exception as e:
        print(f"Note: Could not purge existing Monsoon 2026 records: {e}")

    events_raw = [
        # Monsoon 2026
        ("2026-07-16", "Monsoon 2026", "Summer Last Teaching Day", "Academic"),
        ("2026-08-15", "Monsoon 2026", "Independence Day", "Holiday"),
        ("2026-08-17", "Monsoon 2026", "Start of classes for all students", "Academic"),
        ("2026-08-21", "Monsoon 2026", "I Grade Result Submission Day", "Results"),
        ("2026-08-24", "Monsoon 2026", "Last date to drop 1st half CCC courses", "Academic Deadline"),
        ("2026-08-25", "Monsoon 2026", "Last date to add 1st half CCC courses", "Academic Deadline"),
        ("2026-08-26", "Monsoon 2026", "Milad-un-Nabi / Id-E-Milad", "Holiday"),
        ("2026-08-28", "Monsoon 2026", "Raksha Bandhan", "Holiday"),
        ("2026-08-31", "Monsoon 2026", "Last Date to add full semester UG courses", "Academic Deadline"),
        ("2026-09-04", "Monsoon 2026", "Janmashtami", "Holiday"),
        ("2026-09-07", "Monsoon 2026", "Last date to drop full semester UG courses / Last date to add or drop PG and PHD courses", "Academic Deadline"),
        ("2026-09-14", "Monsoon 2026", "Vinayaka Chaturthi / Ganesh Chaturthi", "Holiday"),
        ("2026-09-19", "Monsoon 2026", "Deans' List Felicitation Ceremony", "Academic"),
        ("2026-09-28", "Monsoon 2026", "Registration for second half CCC", "Academic Deadline"),
        ("2026-09-30", "Monsoon 2026", "First Half Finishes", "Academic"),
        ("2026-10-02", "Monsoon 2026", "Gandhi Jayanti", "Holiday"),
        ("2026-10-05 to 2026-10-09", "Monsoon 2026", "Mid Term Examinations", "Examination"),
        ("2026-10-10", "Monsoon 2026", "No class day", "No Class"),
        ("2026-10-12", "Monsoon 2026", "2nd half begins", "Academic"),
        ("2026-10-19", "Monsoon 2026", "Maha Ashtami", "Holiday"),
        ("2026-10-20", "Monsoon 2026", "Dussehra / Maha Navami", "Holiday"),
        ("2026-10-29", "Monsoon 2026", "Karaka Chaturthi / Karva Chauth", "Holiday"),
        ("2026-10-30 to 2026-10-31", "Monsoon 2026", "Surge / No class day", "No Class"),
        ("2026-11-01", "Monsoon 2026", "Surge Event", "University Event"),
        ("2026-11-08", "Monsoon 2026", "Deepavali", "Holiday"),
        ("2026-11-09", "Monsoon 2026", "Govardhan Puja", "Holiday"),
        ("2026-11-11", "Monsoon 2026", "Bhai Duj", "Holiday"),
        ("2026-11-16", "Monsoon 2026", "Last Date to Drop Second half CCC's", "Academic Deadline"),
        ("2026-11-17", "Monsoon 2026", "Last Date to Add Second half CCC's", "Academic Deadline"),
        ("2026-11-24", "Monsoon 2026", "Guru Nanak's Birthday", "Holiday"),
        ("2026-11-30", "Monsoon 2026", "Last Teaching Day as per Tuesday Schedule", "Academic"),
        ("2026-12-01", "Monsoon 2026", "Last Teaching Day as per Friday schedule / Buffer day for class", "Academic / Buffer"),
        ("2026-12-02 to 2026-12-03", "Monsoon 2026", "End Term Break / Buffer Day", "Buffer"),
        ("2026-12-04 to 2026-12-12", "Monsoon 2026", "End Term Examinations (December 5 & 12 include Swayam Exams)", "Examination"),
        ("2026-12-14 to 2026-12-15", "Monsoon 2026", "End Term Examinations", "Examination"),
        ("2026-12-17", "Monsoon 2026", "Last Day for Viewing Answer Sheets", "Academic Deadline"),
        ("2026-12-19", "Monsoon 2026", "Result Submission Day", "Results"),
        ("2026-12-22", "Monsoon 2026", "Result Declaration Day", "Results"),
        ("2026-12-25", "Monsoon 2026", "Christmas Day", "Holiday"),

        # Spring 2027
        ("2027-01-01", "Spring 2027", "New Year's Day", "Holiday"),
        ("2027-01-07 to 2027-01-09", "Spring 2027", "I Grade Clearance Exam", "Examination"),
        ("2027-01-11", "Spring 2027", "Start of Classes for All Students", "Academic"),
        ("2027-01-14", "Spring 2027", "Makar Sankranti", "Holiday"),
        ("2027-01-15", "Spring 2027", "I Grade Result Submission Day", "Results"),
        ("2027-01-18", "Spring 2027", "Last date to drop half-semester CCC courses", "Academic Deadline"),
        ("2027-01-19", "Spring 2027", "Last date to add half-semester CCC courses", "Academic Deadline"),
        ("2027-01-25", "Spring 2027", "Last date to add full-semester UG courses", "Academic Deadline"),
        ("2027-01-26", "Spring 2027", "Republic Day", "Holiday"),
        ("2027-02-01", "Spring 2027", "Last date to drop full-semester UG courses & last date to add/drop PG and PhD courses", "Academic Deadline"),
        ("2027-02-13", "Spring 2027", "Deans' List Felicitation Ceremony", "Academic"),
        ("2027-02-19", "Spring 2027", "Breeze / No Class Day", "No Class"),
        ("2027-02-20", "Spring 2027", "Breeze / No Class Day", "No Class"),
        ("2027-02-21", "Spring 2027", "Breeze", "No Class"),
        ("2027-02-22", "Spring 2027", "Registration Open for Second-Half CCCs", "Academic"),
        ("2027-02-26", "Spring 2027", "First Half Finishes", "Academic"),
        ("2027-02-27", "Spring 2027", "Buffer Day", "Buffer"),
        ("2027-03-01 to 2027-03-05", "Spring 2027", "Mid-Term Examinations", "Examination"),
        ("2027-03-06", "Spring 2027", "Maha Shivaratri / No Class Day", "Holiday / No Class"),
        ("2027-03-08", "Spring 2027", "Mid-Term Examination", "Examination"),
        ("2027-03-09", "Spring 2027", "No Class Day", "No Class"),
        ("2027-03-10", "Spring 2027", "Eid", "Holiday"),
        ("2027-03-11", "Spring 2027", "Second Half Begins", "Academic"),
        ("2027-03-18", "Spring 2027", "Last date to drop Second-Half CCC courses", "Academic Deadline"),
        ("2027-03-19", "Spring 2027", "Last date to add Second-Half CCC courses", "Academic Deadline"),
        ("2027-03-22", "Spring 2027", "Holi", "Holiday"),
        ("2027-03-26", "Spring 2027", "Good Friday", "Holiday"),
        ("2027-04-08", "Spring 2027", "SNU Day / No Class Day", "University Occasion"),
        ("2027-04-14", "Spring 2027", "Ambedkar Jayanti", "Holiday"),
        ("2027-04-15", "Spring 2027", "Ram Navami", "Holiday"),
        ("2027-04-29", "Spring 2027", "Last Teaching Day", "Academic"),
        ("2027-04-30", "Spring 2027", "Buffer Day", "Buffer"),
        ("2027-05-01", "Spring 2027", "Buffer Day", "Buffer"),
        ("2027-05-03 to 2027-05-08", "Spring 2027", "End-Term Examinations", "Examination"),
        ("2027-05-10 to 2027-05-13", "Spring 2027", "End-Term Examinations", "Examination"),
        ("2027-05-17", "Spring 2027", "Id-Ul-Zuha / Bakrid + Last Day for Viewing Answer Sheets", "Holiday / Academic"),
        ("2027-05-19", "Spring 2027", "Result Submission Day", "Results"),
        ("2027-05-20", "Spring 2027", "Buddha Purnima", "Holiday"),
        ("2027-05-21", "Spring 2027", "Result Declaration Day", "Results"),
        ("2027-05-28", "Spring 2027", "Reserve Day for Convocation", "University Event"),
        ("2027-05-29", "Spring 2027", "Reserve Day for Convocation", "University Event"),
    ]

    docs = []
    for date_str, semester, event, category in events_raw:
        # Create text sentence
        if "to" in date_str:
            text = f"Shiv Nadar University {semester}: {event} are scheduled from {date_str}."
        else:
            is_are = "are" if "Examinations" in event or "Classes" in event else "is"
            text = f"Shiv Nadar University {semester}: {event} {is_are} on {date_str}."
        
        # ID generation
        clean_event = "".join(c for c in event if c.isalnum()).lower()
        doc_id = f"snu_{semester.lower().replace(' ', '_')}_{date_str.replace(' ', '')}_{clean_event[:10]}"
        
        metadata = {
            "id": doc_id,
            "semester": semester,
            "event": event,
            "category": category,
            "source": "academic_calendar"
        }
        
        if "to" in date_str:
            d_start, d_end = date_str.split(" to ")
            metadata["date_start"] = d_start
            metadata["date_end"] = d_end
        else:
            metadata["date"] = date_str

        doc = Document(page_content=text, metadata=metadata)
        docs.append(doc)
        
    # Also add the special notes
    notes = [
        ("Monsoon 2026", "The Monsoon calendar explicitly notes that self-course registration dates will be announced later, so that should not be stored as a fixed date."),
        ("Spring 2027", "SNU marks Eid with an asterisk in the calendar, indicating it is subject to the applicable determination."),
        ("Spring 2027", "The Spring calendar also explicitly states that self-course registration dates will be announced later.")
    ]
    
    for semester, note in notes:
        doc_id = f"snu_{semester.lower().replace(' ', '_')}_note_{hash(note)}"
        metadata = {
            "id": doc_id,
            "semester": semester,
            "event": "Special Note",
            "category": "Note",
            "source": "academic_calendar"
        }
        docs.append(Document(page_content=note, metadata=metadata))

    # Comprehensive summary documents for multi-hop & overview RAG retrieval
    monsoon_overview = (
        "Shiv Nadar University (SNU) Monsoon 2026 Complete Academic Calendar & Dates:\n"
        "- July 16, 2026: Summer Last Teaching Day\n"
        "- August 15, 2026: Independence Day (Holiday)\n"
        "- August 17, 2026: Start of classes for all students\n"
        "- August 21, 2026: I Grade Result Submission Day\n"
        "- August 24, 2026: Last date to drop 1st half CCC courses\n"
        "- August 25, 2026: Last date to add 1st half CCC courses\n"
        "- August 26, 2026: Milad-un-Nabi / Id-E-Milad (Holiday)\n"
        "- August 28, 2026: Raksha Bandhan (Holiday)\n"
        "- August 31, 2026: Last Date to add full semester UG courses\n"
        "- September 4, 2026: Janmashtami (Holiday)\n"
        "- September 7, 2026: Last date to drop full semester UG courses / Last date to add or drop PG and PHD courses\n"
        "- September 14, 2026: Vinayaka Chaturthi / Ganesh Chaturthi (Holiday)\n"
        "- September 19, 2026: Deans' List Felicitation Ceremony\n"
        "- September 28, 2026: Registration for second half CCC\n"
        "- September 30, 2026: First Half Finishes\n"
        "- October 2, 2026: Gandhi Jayanti (Holiday)\n"
        "- October 5 - October 9, 2026: Mid Term Examinations\n"
        "- October 10, 2026: No class day\n"
        "- October 12, 2026: 2nd half begins\n"
        "- October 19, 2026: Maha Ashtami (Holiday)\n"
        "- October 20, 2026: Dussehra / Maha Navami (Holiday)\n"
        "- October 29, 2026: Karaka Chaturthi / Karva Chauth (Holiday)\n"
        "- October 30 - October 31, 2026: Surge / No class day\n"
        "- November 1, 2026: Surge Event\n"
        "- November 8, 2026: Deepavali (Holiday)\n"
        "- November 9, 2026: Govardhan Puja (Holiday)\n"
        "- November 11, 2026: Bhai Duj (Holiday)\n"
        "- November 16, 2026: Last Date to Drop Second half CCC's\n"
        "- November 17, 2026: Last Date to Add Second half CCC's\n"
        "- November 24, 2026: Guru Nanak's Birthday (Holiday)\n"
        "- November 30, 2026: Last Teaching Day as per Tuesday Schedule\n"
        "- December 1, 2026: Last Teaching Day as per Friday schedule / Buffer day for class\n"
        "- December 2 - December 3, 2026: End Term Break / Buffer Day\n"
        "- December 4 - December 12, 2026: End Term Examinations (December 5 & 12 include Swayam Exams)\n"
        "- December 14 - December 15, 2026: End Term Examinations\n"
        "- December 17, 2026: Last Day for Viewing Answer Sheets\n"
        "- December 19, 2026: Result Submission Day\n"
        "- December 22, 2026: Result Declaration Day\n"
        "- December 25, 2026: Christmas Day (Holiday)"
    )
    docs.append(Document(
        page_content=monsoon_overview,
        metadata={"semester": "Monsoon 2026", "category": "Academic Calendar", "source": "academic_calendar", "id": "snu_monsoon_2026_overview"}
    ))

    monsoon_holidays = (
        "Shiv Nadar University (SNU) Monsoon 2026 Official Holidays:\n"
        "- August 15, 2026: Independence Day\n"
        "- August 26, 2026: Milad-un-Nabi / Id-E-Milad\n"
        "- August 28, 2026: Raksha Bandhan\n"
        "- September 4, 2026: Janmashtami\n"
        "- September 14, 2026: Vinayaka Chaturthi / Ganesh Chaturthi\n"
        "- October 2, 2026: Gandhi Jayanti\n"
        "- October 19, 2026: Maha Ashtami\n"
        "- October 20, 2026: Dussehra / Maha Navami\n"
        "- October 29, 2026: Karaka Chaturthi / Karva Chauth\n"
        "- November 8, 2026: Deepavali\n"
        "- November 9, 2026: Govardhan Puja\n"
        "- November 11, 2026: Bhai Duj\n"
        "- November 24, 2026: Guru Nanak's Birthday\n"
        "- December 25, 2026: Christmas Day\n"
        "Special No-Class / Event Days: October 10 (No class day), October 30-31 (Surge / No class day), November 1 (Surge Event)."
    )
    docs.append(Document(
        page_content=monsoon_holidays,
        metadata={"semester": "Monsoon 2026", "category": "Holiday", "source": "academic_calendar", "id": "snu_monsoon_2026_holidays"}
    ))

    monsoon_exams = (
        "Shiv Nadar University (SNU) Monsoon 2026 Examination & Results Schedule:\n"
        "- October 5 to October 9, 2026: Mid Term Examinations\n"
        "- December 4 to December 12, 2026: End Term Examinations (December 5 & 12 include Swayam Exams)\n"
        "- December 14 to December 15, 2026: End Term Examinations\n"
        "- December 17, 2026: Last Day for Viewing Answer Sheets\n"
        "- December 19, 2026: Result Submission Day\n"
        "- December 22, 2026: Result Declaration Day\n"
        "Breaks: December 2 to December 3, 2026 (End Term Break / Buffer Day)."
    )
    docs.append(Document(
        page_content=monsoon_exams,
        metadata={"semester": "Monsoon 2026", "category": "Examination", "source": "academic_calendar", "id": "snu_monsoon_2026_exams"}
    ))

    monsoon_deadlines = (
        "Shiv Nadar University (SNU) Monsoon 2026 Course Add/Drop and Registration Deadlines:\n"
        "- August 17, 2026: Start of classes for all students\n"
        "- August 24, 2026: Last date to drop 1st half CCC courses\n"
        "- August 25, 2026: Last date to add 1st half CCC courses\n"
        "- August 31, 2026: Last Date to add full semester UG courses\n"
        "- September 7, 2026: Last date to drop full semester UG courses / Last date to add or drop PG and PHD courses\n"
        "- September 28, 2026: Registration for second half CCC\n"
        "- September 30, 2026: First Half Finishes\n"
        "- October 12, 2026: 2nd half begins\n"
        "- November 16, 2026: Last Date to Drop Second half CCC's\n"
        "- November 17, 2026: Last Date to Add Second half CCC's\n"
        "- November 30, 2026: Last Teaching Day as per Tuesday Schedule\n"
        "- December 1, 2026: Last Teaching Day as per Friday schedule / Buffer day for class"
    )
    docs.append(Document(
        page_content=monsoon_deadlines,
        metadata={"semester": "Monsoon 2026", "category": "Academic Deadline", "source": "academic_calendar", "id": "snu_monsoon_2026_deadlines"}
    ))

    print(f"Adding {len(docs)} academic calendar events and notes to Chroma DB...")
    
    # Upload in batches
    batch_size = 50
    for i in range(0, len(docs), batch_size):
        add_documents(docs[i:i+batch_size])
        print(f"Uploaded batch {i//batch_size + 1}")
        
    print("Successfully added all events to Chroma DB!")

if __name__ == "__main__":
    add_full_calendar_events()
