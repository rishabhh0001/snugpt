"""Import selected public SNU pages and PDFs into the configured Neon corpus."""
import argparse
import logging
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
import sys
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.rag.neon_store import connect, ingest

logging.getLogger("pypdf").setLevel(logging.ERROR)
SNU = "https://snu.edu.in"
WIKI = "https://wiki.snu.edu.in/index.php?title="
WIKI_ARTICLES = (
    "Main_Page",
    "Setting_up_your_NetID_Password",
    "How_to_create_Request_(For_Night_and_Day_Out_Pass)",
    "How_to_login_in_Digii_(Formely_Coll_Poll)",
    "Configuration_of_Wi-Fi_for_SNU-STAFF_or_SNU-STUDENT_on_Apple_Device",
    "Configuration_of_Wi-Fi_for_SNU-STAFF_or_SNU-STUDENT_on_Android_Device",
    "Configuration_of_Wi-Fi_for_SNU-STAFF_or_SNU-STUDENT_on_Window_Device",
    "Get_Informed:_Frequently_Asked_Questions%22",
)
PDFS = {
    "/site/assets/files/16490/student_handbook_5_8_2025.pdf?v=2": "Student Handbook 2025–2026",
    "/site/assets/files/11150/ug_handbook.pdf": "Undergraduate Handbook 2024–2025 (archive)",
    "/site/assets/files/16490/btech__cse_202529_updated_course_list.pdf?v=2": "CSE proposed curriculum, 2025 onwards",
    "/site/assets/files/6905/prospectus_electrical_and_computer_engineering_program_compressed.pdf": "ECE program prospectus",
    "/site/assets/files/6991/bms_brochure_28_march_2023_low_res-1.pdf": "BMS brochure 2023 (archive)",
    "/site/assets/files/6969/b_sc__research_in_economics-prospectus.pdf": "Economics program prospectus",
    "/site/assets/files/24802/shivnadaruniversity_delhincr_ugbrochure_26_27.pdf": "Undergraduate admissions brochure 2026–2027",
    "/site/assets/files/16490/nondiscriminatory_admissions_policy_10_6_1_1.pdf?v=2": "Admissions policy",
}
PAGES = (
    "/admissions/", "/admissions/faqs/", "/admissions/financial-aid/", "/academics/",
    "/student-life/", "/home/mandatory-disclosure/", "/home/mandatory-disclosure/academic-calendar-all/",
    "/programs/btech-in-computer-science-engineering/programme-structure/",
    "/programs/btech-in-electrical-and-computer-engineering/programme-structure/",
    "/schools/school-of-engineering/programs/btech-in-electrical-and-computer-engineering/overview/",
    "/schools/school-of-management-and-entrepreneurship/programs/bachelor-of-management-studies/programme-structure/",
    "/programs/bsc-research-in-economics/programme-structure/",
    "/programs/bsc-research-in-economics-finance/programme-structure/",
    "/programs/bachelor-of-management-studies/faqs/",
    "/programs/", "/faculty/", "/about/", "/about/vice-chancellor/", "/about/chancellor/",
    "/departments/", "/contact-us/", "/student-clubs/", "/library/", "/facilities/",
    "/facilities/housing-facilities/", "/facilities/shuttle-services/", "/facilities/health-wellness/",
    "/facilities/sports/", "/facilities/cafe/", "/facilities/safety-and-security/",
    "/career-development/", "/schools/school-of-engineering/admissions/",
)
SPLITTER = RecursiveCharacterTextSplitter(chunk_size=950, chunk_overlap=110)
HOSTS = {"snu.edu.in", "snu.ac.in", "snuadmissions.com", "wiki.snu.edu.in"}
SNAPSHOTS = Path(__file__).resolve().parents[1] / "knowledge_base" / "scraped_web"


def snapshot_documents(url):
    # Only use a crawl snapshot if its recorded source matches the requested URL.
    for path in SNAPSHOTS.glob("*.md"):
        with path.open(encoding="utf-8-sig", errors="replace") as stream:
            if stream.readline().strip().removeprefix("# Source: ").rstrip("/") != url.rstrip("/"):
                continue
            title = stream.readline().strip().removeprefix("# Title: ")
            body = stream.read().strip()
        metadata = {"source": url, "title": title, "type": "web", "snapshot": True}
        return [Document(page_content=chunk.replace("\x00", ""), metadata=metadata)
                for chunk in SPLITTER.split_text(body) if len(chunk.strip()) >= 50]
    return []


def pdf_documents(data, metadata):
    reader = PdfReader(BytesIO(data))
    return [
        Document(page_content=chunk.replace("\x00", ""), metadata={**metadata, "page": page_number})
        for page_number, page in enumerate(reader.pages, 1)
        for chunk in SPLITTER.split_text(page.extract_text() or "")
        if len(chunk.strip()) >= 50
    ]


def fetch(item):
    url, title = item
    try:
        response = httpx.get(url, timeout=24, follow_redirects=True)
        response.raise_for_status()
        if (urlparse(str(response.url)).hostname or "").removeprefix("www.") not in HOSTS:
            return url, [], "redirected outside official sites"
        is_pdf = ".pdf" in urlparse(url).path.lower()
        if is_pdf:
            docs = pdf_documents(response.content, {"source": url, "title": title, "type": "pdf",
                                                   "last_checked": datetime.now(timezone.utc).date().isoformat()})
            return url, docs, None if docs else "no extractable content"
        else:
            soup = BeautifulSoup(response.text, "html.parser")
            title = soup.title.get_text(" ", strip=True) if soup.title else title
            for tag in soup.select("script, style, header, footer, nav, noscript, form"):
                tag.decompose()
            main = soup.select_one(".mw-parser-output") or soup.find("main") or soup.body
            pages = [(None, main.get_text("\n", strip=True) if main else "")]
        documents = []
        for page, content in pages:
            if len(content.strip()) < 80:
                continue
            metadata = {"source": url, "title": title, "last_checked": datetime.now(timezone.utc).date().isoformat(), "type": "pdf" if is_pdf else "web"}
            if page is not None:
                metadata["page"] = page
            for chunk in SPLITTER.split_text(content):
                if len(chunk.strip()) >= 50:
                    documents.append(Document(page_content=chunk.replace("\x00", ""), metadata=metadata))
        return url, documents, None if documents else "no extractable content"
    except Exception as exc:
        if ".pdf" not in urlparse(url).path.lower():
            docs = snapshot_documents(url)
            if docs:
                return url, docs, None
        status = f" HTTP {exc.response.status_code}" if isinstance(exc, httpx.HTTPStatusError) else ""
        return url, [], type(exc).__name__ + status


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--match", action="append", help="Only process URLs matching one of these substrings")
    parser.add_argument("--pdf", action="append", type=Path, default=[], help="Include a supplied local PDF")
    args = parser.parse_args()
    if args.upload:
        with closing(connect()) as db, db.cursor() as cur:
            cur.execute("SELECT count(*) FROM snugpt_chunks")
            print("Rows before import:", cur.fetchone()[0], flush=True)
    sources = [(SNU + p, title) for p, title in PDFS.items()]
    sources += [("https://snuadmissions.com/", "Undergraduate admissions")]
    sources += [(WIKI + article, article.replace("_", " ")) for article in WIKI_ARTICLES]
    sources += [(SNU + p, p) for p in PAGES]
    if args.match:
        sources = [item for item in sources if any(match in item[0] for match in args.match)]
    failures = 0
    for path in args.pdf:
        title = path.stem.removesuffix(" (1)").replace("_", " ")
        docs = pdf_documents(path.read_bytes(), {"source": path.name.removesuffix(" (1).pdf") + ".pdf"
                                                if path.name.endswith(" (1).pdf") else path.name,
                                                 "title": title, "type": "pdf"})
        print("Collected", len(docs), path.name, flush=True)
        if args.upload and docs:
            try:
                ingest(docs)
                print("Stored", path.name, flush=True)
            except RuntimeError as exc:
                failures += 1
                print("Upload incomplete", path.name, str(exc), flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for url, docs, error in pool.map(fetch, sources):
            if error:
                failures += 1
                print("Skipped", url, error, flush=True)
                continue
            print("Collected", len(docs), url, flush=True)
            if args.upload:
                try:
                    ingest(docs)
                    print("Stored", url, flush=True)
                except RuntimeError as exc:
                    failures += 1
                    print("Upload incomplete", url, str(exc), flush=True)
    if args.upload:
        with closing(connect()) as db, db.cursor() as cur:
            cur.execute("SELECT count(*), count(DISTINCT metadata->>'source'), pg_total_relation_size('snugpt_chunks') FROM snugpt_chunks")
            print("Neon rows, sources, bytes:", cur.fetchone(), flush=True)
    print("Sources with errors:", failures, flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Import stopped:", type(exc).__name__, str(exc) if type(exc) is RuntimeError else getattr(exc, "pgcode", "") or "", file=sys.stderr)
        sys.exit(1)
