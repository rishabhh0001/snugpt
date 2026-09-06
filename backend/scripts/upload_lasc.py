import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents

def upload_lasc():
    docs = []

    # 1. Comprehensive Overview Document
    lasc_overview = (
        "Shiv Nadar University (SNU) - Learning and Academic Support Center (LASC):\n\n"
        "The Learning and Academic Support Center (LASC) is an academic support initiative at Shiv Nadar University designed to provide students with additional tutoring, academic guidance, concept clarification, and practice outside of regular classroom hours.\n\n"
        "What LASC Offers:\n"
        "- Regular tutorial and review sessions for selected difficult/core courses.\n"
        "- Guided discussions and dedicated doubt-clearing sessions to strengthen understanding of course concepts.\n"
        "- Direct, one-on-one and small-group interaction with peer/student tutors in a comfortable, focused setting.\n"
        "- Additional academic assistance outside normal class hours for students needing extra help.\n\n"
        "Courses Supported under LASC:\n"
        "- Chemistry / Chemical Eng: CHD217 / CHD2002\n"
        "- Computer Science: CSD101 / CSD1001 (Introduction to Computing and Programming)\n"
        "- Design & Management: DOM104 / DOM1001\n"
        "- Electrical & Computer Engineering: ECE1001, ECE201 / ECE2001, ECE203 / ECE2003\n"
        "- Economics: ECO101 / ECO1001\n"
        "- Finance & Accounting: FAC1005 / FAC1001, FAC202 / FAC2003\n"
        "- Mathematics: MAT1003, MAT2004, MAT220 / MAT2001\n"
        "- Physics: PHY101 / PHY1011\n\n"
        "How to Enroll & Join Sessions:\n"
        "Students can join the course-specific LASC group through the official LASC WhatsApp community invite link: https://chat.whatsapp.com/KBGOSMhryhm81dsy7eHeqP\n\n"
        "LASC Student Coordinators & Contacts:\n"
        "- Rakshith Aravindan (Email: ra174@snu.edu.in)\n"
        "- Navya Jain (Email: nj255@snu.edu.in)"
    )
    docs.append(Document(
        page_content=lasc_overview,
        metadata={
            "id": "snu_lasc_overview_monsoon_2026",
            "source": "lasc_academic_support",
            "category": "Academic Tutoring & Student Support",
            "subject": "Learning and Academic Support Center (LASC)",
            "semester": "Monsoon 2026",
        }
    ))

    # 2. Targeted Course-Level Support Chunk
    courses_chunk = (
        "LASC Supported Courses & Peer Tutoring at Shiv Nadar University:\n"
        "Peer tutoring and regular doubt-clearing sessions through LASC are available for the following courses (both legacy and 4-digit codes):\n"
        "- CSD101 / CSD1001: Introduction to Computing and Programming\n"
        "- MAT220 / MAT2001, MAT1003, MAT2004: Mathematics courses\n"
        "- PHY101 / PHY1011: Introduction to Physics\n"
        "- ECE1001, ECE201 / ECE2001, ECE203 / ECE2003: Electrical & Computer Engineering\n"
        "- ECO101 / ECO1001: Principles of Economics\n"
        "- CHD217 / CHD2002: Chemical Engineering\n"
        "- DOM104 / DOM1001: Operations Management / Design\n"
        "- FAC1005 / FAC1001, FAC202 / FAC2003: Financial Accounting\n"
        "Students enrolled in LASC get access to small-group guided problem solving, extra tutorial classes, and direct help from student tutors."
    )
    docs.append(Document(
        page_content=courses_chunk,
        metadata={
            "id": "snu_lasc_courses_list",
            "source": "lasc_academic_support",
            "category": "Course Tutoring",
            "subject": "Courses Offered in LASC Tutoring",
            "semester": "Monsoon 2026",
        }
    ))

    # 3. Targeted Enrollment & Contact Details Chunk
    enrollment_chunk = (
        "How to Join LASC (Learning and Academic Support Center) at SNU:\n"
        "- To join LASC for any supported course, join the course's corresponding WhatsApp group via the official LASC community link: https://chat.whatsapp.com/KBGOSMhryhm81dsy7eHeqP\n"
        "- Participation is free and open to all students who need additional academic guidance or practice in covered courses.\n"
        "- For queries, support, or questions about LASC sessions, contact the student coordinators:\n"
        "  * Rakshith Aravindan: ra174@snu.edu.in\n"
        "  * Navya Jain: nj255@snu.edu.in"
    )
    docs.append(Document(
        page_content=enrollment_chunk,
        metadata={
            "id": "snu_lasc_enrollment_contact",
            "source": "lasc_academic_support",
            "category": "Enrollment & Contacts",
            "subject": "LASC Enrollment Link and Coordinator Contacts",
            "semester": "Monsoon 2026",
        }
    ))

    print(f"Uploading {len(docs)} LASC documents to Chroma DB...")
    add_documents(docs)
    print("Successfully uploaded LASC knowledge documents to Chroma DB!")

if __name__ == "__main__":
    upload_lasc()
