import os
import sys
from dotenv import load_dotenv
from langchain_core.documents import Document
import logging

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vectorstore import add_documents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

holiday_data = """
Holiday Day List – 2026

S.No Date Holiday Day
1 January 1, 2026 New Year's Day Thursday
2 January 26, 2026 Republic Day Monday
3 March 4, 2026 Holi Wednesday
4 March 21, 2026 Id Ul Fitr+ Saturday
5 April 14, 2026 Ambedkar Jayanti Tuesday
6 August 15, 2026 Independence Day Saturday
7 October 2, 2026 Gandhi Jayanti Friday
8 October 20, 2026 Dussehra Tuesday
9 November 8, 2026 Deepavali Sunday
* November 9, 2026 Govardhan Puja Monday
10 November 24, 2026 Guru Nanak’s Birthday Tuesday
11 December 25, 2026 Christmas Day Friday
* In lieu of Deepavali falling on Sunday, the restricted holiday of Goverdhan Puja will be observed as University Holiday

List of Restricted Holidays – 2026

S.No Date Holiday Day
1 January 5, 2026 Guru Gobind Singh's Birthday Monday
2 January 14, 2026 Makar Sankranti Wednesday
3 January 23, 2026 Basant Panchami/Sri Panchami Friday
4 February 15, 2026 Maha Shivaratri Sunday
5 March 26, 2026 Ram Navami Thursday
6 March 31, 2026 Mahavir Jayanti Tuesday
7 April 3, 2026 Good Friday Friday
8 April 14, 2026 Vaisakhi / Vishu Tuesday
9 May 1, 2026 Buddha Purnima Friday
10 May 27, 2026 Id-Ul-Zuha (Bakrid) Wednesday
11 June 26, 2026 Muharram Friday
12 August 26, 2026 Milad-Un-Nabi / Eid-E-Milad Wednesday
13 August 28, 2026 Raksha Bandhan Friday
14 September 4, 2026 Janmashtami Friday
15 September 14, 2026 Vinayak Chaturthi / Ganesh Chaturthi Monday
16 October 19, 2026 Maha Ashtami Monday
17 October 20, 2026 Maha Navami Tuesday
18 October 29, 2026 Karaka Chaturthi (Karva Chouth) Thursday
19 November 11, 2026 Bhai Duj Wednesday
20 November 24, 2026 Guru Teg Bahadur Martyrdom Day Tuesday

Each University member can avail 2 days of Restricted Holiday from the above-mentioned list as appropriate.
+ Particular date and day of the holiday is subject to moon sightings and may differ from the one given above. If a change is required, communication will be issued by HR after the Government releases the required notification.
Note: We are currently reviewing the UH and RH list. Any changes, if applicable, will be notified separately.
"""

def upload_holidays():
    logger.info("Uploading holiday data...")
    
    docs = []
    
    # We can split the data manually into chunks so they are easily retrievable
    sections = holiday_data.split("List of Restricted Holidays – 2026")
    
    main_holidays_text = "Holiday Day List – 2026\n" + sections[0].replace("Holiday Day List – 2026", "").strip()
    restricted_holidays_text = "List of Restricted Holidays – 2026\n" + sections[1].strip()
    
    docs.append(Document(
        page_content=main_holidays_text,
        metadata={
            "source": "University Holiday List 2026",
            "type": "Holidays",
            "year": 2026
        }
    ))
    
    docs.append(Document(
        page_content=restricted_holidays_text,
        metadata={
            "source": "University Restricted Holiday List 2026",
            "type": "Restricted Holidays",
            "year": 2026
        }
    ))
    
    try:
        add_documents(docs)
        logger.info(f"Successfully uploaded {len(docs)} documents for holidays.")
    except Exception as e:
        logger.error(f"Error uploading holiday data: {e}")

if __name__ == "__main__":
    upload_holidays()
