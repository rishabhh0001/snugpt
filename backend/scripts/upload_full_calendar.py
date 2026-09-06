import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents, _get_collection

def add_full_calendar_events():
    # Remove older Monsoon 2026 and Spring 2027 entries to prevent stale/duplicate data
    try:
        col = _get_collection()
        print("Purging existing Monsoon 2026 and Spring 2027 calendar records from Chroma...")
        col.delete(where={"semester": "Monsoon 2026"})
        col.delete(where={"semester": "Spring 2027"})
        print("Purge completed.")
    except Exception as e:
        print(f"Note: Could not purge existing records: {e}")

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
        ("2026-12-13", "Monsoon 2026", "Start of winter vacations for Monsoon 2026", "Vacation"),
        ("2026-12-14 to 2026-12-15", "Monsoon 2026", "End Term Examinations", "Examination"),
        ("2026-12-17", "Monsoon 2026", "Last Day for Viewing Answer Sheets", "Academic Deadline"),
        ("2026-12-19", "Monsoon 2026", "Result Submission Day", "Results"),
        ("2026-12-22", "Monsoon 2026", "Result Declaration Day", "Results"),
        ("2026-12-25", "Monsoon 2026", "Christmas Day", "Holiday"),

        # Spring 2027
        ("2027-01-01", "Spring 2027", "New Year's Day", "Holiday"),
        ("2027-01-08", "Spring 2027", "I Grade clearance exam", "Examination"),
        ("2027-01-11", "Spring 2027", "Start of classes for all students", "Academic"),
        ("2027-01-14", "Spring 2027", "Makar Sankranti", "Holiday"),
        ("2027-01-15", "Spring 2027", "I Grade Result Submission Day", "Results"),
        ("2027-01-18", "Spring 2027", "Last date to drop half semester CCC courses", "Academic Deadline"),
        ("2027-01-19", "Spring 2027", "Last date to add half semester CCC courses", "Academic Deadline"),
        ("2027-01-25", "Spring 2027", "Last Date to add full semester UG courses", "Academic Deadline"),
        ("2027-01-26", "Spring 2027", "Republic Day", "Holiday"),
        ("2027-02-08", "Spring 2027", "Last date to drop full semester UG courses & last date to add/drop PG and PhD courses (Early February, approx. Feb 8)", "Academic Deadline"),
        ("2027-02-13", "Spring 2027", "Deans List Felicitation Ceremony", "Academic"),
        ("2027-02-19 to 2027-02-21", "Spring 2027", "Breeze festival / Breeze No Class Day", "University Event / No Class"),
        ("2027-02-22", "Spring 2027", "Registration open for Second half CCC", "Academic Deadline"),
        ("2027-02-26", "Spring 2027", "First Half finishes", "Academic"),
        ("2027-03-01 to 2027-03-05", "Spring 2027", "Mid Term Examinations", "Examination"),
        ("2027-03-06", "Spring 2027", "Maha Shivaratri No Class day", "Holiday / No Class"),
        ("2027-03-08", "Spring 2027", "Mid Term Examinations", "Examination"),
        ("2027-03-09", "Spring 2027", "No Class Day", "No Class"),
        ("2027-03-10", "Spring 2027", "Eid", "Holiday"),
        ("2027-03-11", "Spring 2027", "Second Half Begins", "Academic"),
        ("2027-03-22", "Spring 2027", "Holi", "Holiday"),
        ("2027-03-26", "Spring 2027", "Good Friday", "Holiday"),
        ("2027-04-08", "Spring 2027", "SNU Day / No class day (approx.)", "University Occasion / No Class"),
        ("2027-04-14", "Spring 2027", "Ambedkar Jayanti", "Holiday"),
        ("2027-04-15", "Spring 2027", "Ram Navami", "Holiday"),
        ("2027-04-19", "Spring 2027", "Mahavir Jayanti (approx.)", "Holiday"),
        ("2027-04-22", "Spring 2027", "Last date to drop second half CCC courses", "Academic Deadline"),
        ("2027-04-23", "Spring 2027", "Last date to add second half CCC courses", "Academic Deadline"),
        ("2027-04-29", "Spring 2027", "Last Teaching Day", "Academic"),
        ("2027-04-30", "Spring 2027", "Buffer Day", "Buffer"),
        ("2027-05-01", "Spring 2027", "Buffer Day", "Buffer"),
        ("2027-05-03 to 2027-05-14", "Spring 2027", "End Term Examinations", "Examination"),
        ("2027-05-15", "Spring 2027", "Summer vacations start", "Vacation"),
        ("2027-05-17", "Spring 2027", "Id-Ul-Zuha (Bakrid) and Last Day for Viewing Answer Sheets", "Holiday / Academic Deadline"),
        ("2027-05-19", "Spring 2027", "Result Submission Day", "Results"),
        ("2027-05-20", "Spring 2027", "Buddha Purnima", "Holiday"),
        ("2027-05-21", "Spring 2027", "Result Declaration Day", "Results"),
        ("2027-05-28 to 2027-05-29", "Spring 2027", "Reserve day for convocation", "University Event"),
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
        "- December 13, 2026: Start of winter vacations for Monsoon 2026\n"
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
        "Special No-Class / Event Days: October 10 (No class day), October 30-31 (Surge / No class day), November 1 (Surge Event), December 13 (Start of winter vacations)."
    )
    docs.append(Document(
        page_content=monsoon_holidays,
        metadata={"semester": "Monsoon 2026", "category": "Holiday", "source": "academic_calendar", "id": "snu_monsoon_2026_holidays"}
    ))

    monsoon_exams = (
        "Shiv Nadar University (SNU) Monsoon 2026 Examination & Results Schedule:\n"
        "- October 5 to October 9, 2026: Mid Term Examinations\n"
        "- December 4 to December 12, 2026: End Term Examinations (December 5 & 12 include Swayam Exams)\n"
        "- December 13, 2026: Start of winter vacations for Monsoon 2026\n"
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

    # Spring 2027 Comprehensive summary documents
    spring_overview = (
        "Shiv Nadar University (SNU) Spring 2027 Complete Academic Calendar & Dates:\n"
        "- January 1, 2027: New Year's Day (Holiday)\n"
        "- January 8, 2027: I Grade clearance exam\n"
        "- January 11, 2027: Start of classes for all students\n"
        "- January 14, 2027: Makar Sankranti (Holiday)\n"
        "- January 15, 2027: I Grade Result Submission Day\n"
        "- January 18, 2027: Last date to drop half semester CCC courses\n"
        "- January 19, 2027: Last date to add half semester CCC courses\n"
        "- January 25, 2027: Last Date to add full semester UG courses\n"
        "- January 26, 2027: Republic Day (Holiday)\n"
        "- Early February (approx. February 8, 2027): Last date to drop full semester UG courses & last date to add/drop PG and PhD courses\n"
        "- February 13, 2027: Deans List Felicitation Ceremony\n"
        "- February 19 - February 21, 2027: Breeze festival / Breeze No Class Day\n"
        "- February 22, 2027: Registration open for Second half CCC\n"
        "- February 26, 2027: First Half finishes\n"
        "- March 1 - March 5, 2027: Mid Term Examinations\n"
        "- March 6, 2027: Maha Shivaratri No Class day (Holiday)\n"
        "- March 8, 2027: Mid Term Examinations\n"
        "- March 9, 2027: No Class Day\n"
        "- March 10, 2027: Eid (Holiday)\n"
        "- March 11, 2027: Second Half Begins\n"
        "- March 22, 2027: Holi (Holiday)\n"
        "- March 26, 2027: Good Friday (Holiday)\n"
        "- April 8, 2027 (approx.): SNU Day / No class day\n"
        "- April 14, 2027: Ambedkar Jayanti (Holiday)\n"
        "- April 15, 2027: Ram Navami (Holiday)\n"
        "- April 19, 2027 (approx.): Mahavir Jayanti (Holiday)\n"
        "- April 22, 2027: Last date to drop second half CCC courses\n"
        "- April 23, 2027: Last date to add second half CCC courses\n"
        "- April 29, 2027: Last Teaching Day\n"
        "- April 30, 2027: Buffer Day\n"
        "- May 1, 2027: Buffer Day\n"
        "- May 3 - May 14, 2027: End Term Examinations\n"
        "- May 15, 2027: Summer vacations start\n"
        "- May 17, 2027: Id-Ul-Zuha (Bakrid) and Last Day for Viewing Answer Sheets\n"
        "- May 19, 2027: Result Submission Day\n"
        "- May 20, 2027: Buddha Purnima (Holiday)\n"
        "- May 21, 2027: Result Declaration Day\n"
        "- May 28 - May 29, 2027: Reserve day for convocation"
    )
    docs.append(Document(
        page_content=spring_overview,
        metadata={"semester": "Spring 2027", "category": "Academic Calendar", "source": "academic_calendar", "id": "snu_spring_2027_overview"}
    ))

    spring_holidays = (
        "Shiv Nadar University (SNU) Spring 2027 Official Holidays & Festivals:\n"
        "- January 1, 2027: New Year's Day\n"
        "- January 14, 2027: Makar Sankranti\n"
        "- January 26, 2027: Republic Day\n"
        "- February 19 - February 21, 2027: Breeze festival / Breeze No Class Day\n"
        "- March 6, 2027: Maha Shivaratri No Class day\n"
        "- March 9, 2027: No Class Day\n"
        "- March 10, 2027: Eid\n"
        "- March 22, 2027: Holi\n"
        "- March 26, 2027: Good Friday\n"
        "- April 8, 2027 (approx.): SNU Day / No class day\n"
        "- April 14, 2027: Ambedkar Jayanti\n"
        "- April 15, 2027: Ram Navami\n"
        "- April 19, 2027 (approx.): Mahavir Jayanti\n"
        "- May 17, 2027: Id-Ul-Zuha (Bakrid)\n"
        "- May 20, 2027: Buddha Purnima\n"
        "Vacation: Summer vacations start on May 15, 2027."
    )
    docs.append(Document(
        page_content=spring_holidays,
        metadata={"semester": "Spring 2027", "category": "Holiday", "source": "academic_calendar", "id": "snu_spring_2027_holidays"}
    ))

    spring_exams = (
        "Shiv Nadar University (SNU) Spring 2027 Examination, Vacations & Results Schedule:\n"
        "- January 8, 2027: I Grade clearance exam\n"
        "- March 1 - March 5, 2027 & March 8, 2027: Mid Term Examinations\n"
        "- May 3 - May 14, 2027: End Term Examinations\n"
        "- May 15, 2027: Summer vacations start\n"
        "- May 17, 2027: Last Day for Viewing Answer Sheets & Id-Ul-Zuha (Bakrid)\n"
        "- May 19, 2027: Result Submission Day\n"
        "- May 21, 2027: Result Declaration Day\n"
        "- May 28 - May 29, 2027: Reserve day for convocation\n"
        "Buffer Days: April 30, May 1, 2027."
    )
    docs.append(Document(
        page_content=spring_exams,
        metadata={"semester": "Spring 2027", "category": "Examination", "source": "academic_calendar", "id": "snu_spring_2027_exams"}
    ))

    spring_deadlines = (
        "Shiv Nadar University (SNU) Spring 2027 Course Add/Drop and Registration Deadlines:\n"
        "- January 11, 2027: Start of classes for all students\n"
        "- January 18, 2027: Last date to drop half semester CCC courses\n"
        "- January 19, 2027: Last date to add half semester CCC courses\n"
        "- January 25, 2027: Last Date to add full semester UG courses\n"
        "- Early February (approx. February 8, 2027): Last date to drop full semester UG courses & last date to add/drop PG and PhD courses\n"
        "- February 22, 2027: Registration open for Second half CCC\n"
        "- February 26, 2027: First Half finishes\n"
        "- March 11, 2027: Second Half Begins\n"
        "- April 22, 2027: Last date to drop second half CCC courses\n"
        "- April 23, 2027: Last date to add second half CCC courses\n"
        "- April 29, 2027: Last Teaching Day"
    )
    docs.append(Document(
        page_content=spring_deadlines,
        metadata={"semester": "Spring 2027", "category": "Academic Deadline", "source": "academic_calendar", "id": "snu_spring_2027_deadlines"}
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
