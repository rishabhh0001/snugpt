import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.documents import Document
from app.rag.vectorstore import add_documents

def upload_circular():
    docs = []

    # 1. Complete raw circular document
    full_text = (
        "Shiv Nadar University - Official Academic Circular from Office of the Dean of Academics (Partha) / Vice Chancellor:\n\n"
        "Announcement 1:\n"
        "Dear All,\n"
        "Based on suggestions from the student council, feedback from faculty members and discussions among the VC and all Deans, the following was decided:\n"
        "1) Attendance: Attendance to be given to all students till September 7, 2026 (Years 1-4)\n"
        "2) Missed graded components: Some students may need accommodation if they have missed a graded component. Missed components can be accommodated by faculty members as they deem appropriate for the course.\n"
        "3) Individual student issues/exceptions needed: These are being resolved on a case-by-case basis through the School SPOCS and the Office of the Dean of Academics as required.\n\n"
        "Best,\n"
        "Partha\n\n"
        "---\n\n"
        "Announcement 2 (Clarifications):\n"
        "Dear All,\n"
        "Yesterday, there was a meeting between the President of the Student Council and the Vice Chancellor. The following clarifications were sought by the students:\n"
        "1. Attendance - As already stated, attendance will be given to all students until, and including, September 7, 2026. No action is required from any student or faculty member.\n"
        "2. Missed graded components - This will be accommodated by faculty members. No documentation is required. ODA will not ask for or verify any document.\n\n"
        "Best,\n"
        "Partha"
    )
    docs.append(Document(
        page_content=full_text,
        metadata={
            "id": "snu_circular_attendance_sept_2026_full",
            "source": "official_circular",
            "category": "Academic Policy",
            "subject": "Attendance and Missed Graded Components Relief",
            "semester": "Monsoon 2026",
            "author": "Office of the Dean of Academics (Partha)",
        }
    ))

    # 2. Targeted Chunk: Attendance Policy
    attendance_chunk = (
        "Shiv Nadar University Attendance Relief Policy (Monsoon 2026):\n"
        "Attendance is automatically given/granted to all students (Years 1, 2, 3, and 4) until, and including, September 7, 2026.\n"
        "- No action is required from any student or faculty member.\n"
        "- This decision was finalized following suggestions from the Student Council, faculty feedback, and discussions between the Vice Chancellor (VC) and Deans."
    )
    docs.append(Document(
        page_content=attendance_chunk,
        metadata={
            "id": "snu_circular_attendance_policy_sept7",
            "source": "official_circular",
            "category": "Attendance",
            "subject": "Full Attendance Relief till September 7, 2026",
            "semester": "Monsoon 2026",
            "author": "Office of the Dean of Academics (Partha)",
        }
    ))

    # 3. Targeted Chunk: Missed Graded Components & No Documentation
    grading_chunk = (
        "Shiv Nadar University Policy on Missed Graded Components & Evaluations (Monsoon 2026):\n"
        "- Missed graded components (quizzes, tests, evaluations, assignments) will be accommodated by course faculty members as they deem appropriate for their course.\n"
        "- NO documentation is required from students. The Office of the Dean of Academics (ODA) will NOT ask for or verify any document.\n"
        "- Individual student exceptions or specific issues are handled on a case-by-case basis through School SPOCs and the Office of the Dean of Academics."
    )
    docs.append(Document(
        page_content=grading_chunk,
        metadata={
            "id": "snu_circular_missed_graded_components_sept7",
            "source": "official_circular",
            "category": "Grading & Evaluation",
            "subject": "Missed Graded Components Accommodation and No Documentation Policy",
            "semester": "Monsoon 2026",
            "author": "Office of the Dean of Academics (Partha)",
        }
    ))

    print(f"Uploading {len(docs)} circular documents/chunks to Chroma DB...")
    add_documents(docs)
    print("Successfully uploaded official attendance circular to Chroma DB!")

if __name__ == "__main__":
    upload_circular()
