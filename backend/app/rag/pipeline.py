import os
import re
import asyncio
import json
import logging
from typing import Optional
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.rag.prompts import qa_prompt
from app.rag.vectorstore import add_qa_pair, retrieve_documents, rerank_documents
from app.config import settings
from app.rag.cache import search_cache, save_to_cache
from app.models.chat_log import save_error_telemetry
from app.utils.email import send_error_email

import threading

logger = logging.getLogger(__name__)

# Lazy initialization of LLM to prevent startup crashes
_llm = None
_llm_lock = threading.Lock()

def get_llm():
    global _llm
    if _llm is not None:
        return _llm
        
    with _llm_lock:
        if _llm is None:
            api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
            if not api_key:
                # We don't raise here to avoid crashing the worker, but we'll fail gracefully during generation
                return None
            _llm = ChatNVIDIA(
                model="nvidia/nemotron-3-super-120b-a12b",
                nvidia_api_key=api_key,
                temperature=0.1,
                max_tokens=16384,
                model_kwargs={"chat_template_kwargs": {"enable_thinking": True}}
            )
    return _llm

# ── Safety Guardrail ─────────────────────────────────────────────────────────
JAILBREAK_PATTERNS = [
    r"ignore (all |previous |your )?(instructions|rules|guidelines|constraints)",
    r"(pretend|act|behave|roleplay|play).{0,30}(you are|as if|like you.re|you.re now)",
    r"(your true self|your real personality|without restrictions|no limits)",
    r"(dan|do anything now|jailbreak|bypass|override).{0,20}(mode|prompt|system)",
    r"forget (everything|all|your|that).{0,20}(told|said|instructions|rules)",
    r"you are (now|actually|really|secretly) (a|an|the)",
    r"(disregard|ignore|override).{0,20}(safety|rules|guidelines|training)",
]

TOXIC_PATTERNS = [
    r"\b(fuck|shit|bitch|asshole|bastard|cunt|dick|pussy|whore|slut|retard)\b",
    r"\b(kill yourself|kys|go die|end yourself)\b",
    r"\b(rape|molest|sexually|naked|nude|porn|xxx)\b",
    r"\b(bomb|terrorist|attack|weapon|explosive|gun|shoot)\b",
    r"\bhate (you|this|them|all)\b",
]

COMPILED_JAILBREAK = [re.compile(p, re.IGNORECASE) for p in JAILBREAK_PATTERNS]
COMPILED_TOXIC    = [re.compile(p, re.IGNORECASE) for p in TOXIC_PATTERNS]


def check_safety(query: str) -> Optional[str]:
    """Returns a refusal message if the query is unsafe, else None."""
    for pattern in COMPILED_JAILBREAK:
        if pattern.search(query):
            return "I'm here to help with Shiv Nadar University questions only. I can't follow instructions that ask me to change my role or ignore my guidelines. How can I help you with something SNU-related? 🎓"
    for pattern in COMPILED_TOXIC:
        if pattern.search(query):
            return "I'm not able to respond to messages with inappropriate language. Please keep our conversation respectful and I'll be happy to help with any SNU-related questions! 😊"
    return None


def preprocess_temporal_query(query: str) -> str:
    """Temporal Query Expansion Engine: Intercepts the prompt and appends temporal metadata context
    to ensure vector search retrieves active policies rather than outdated handbook pages.
    """
    from datetime import datetime
    now = datetime.now()
    month = now.month
    year = now.year
    
    # Determine the SNU academic semester
    # Spring: Jan - May (1-5)
    # Summer: Jun - Jul (6-7)
    # Monsoon: Aug - Dec (8-12)
    if 1 <= month <= 5:
        semester = f"Spring {year}"
    elif 6 <= month <= 7:
        semester = f"Summer {year}"
    else:
        semester = f"Monsoon {year}"
        
    date_str = now.strftime("%B %Y")
    temporal_context = f"Current Date: {date_str}, Semester: {semester}"
    
    # Append the temporal context to the query before vector store lookup
    enhanced_query = f"{query} (Context: {temporal_context})"
    return enhanced_query


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def save_qa_to_vectorstore(query: str, answer: str):
    """Persist a Q&A pair back into ChromaDB so the bot learns from real conversations."""
    try:
        add_qa_pair(query, answer)
        logger.info("[Learning] Saved Q&A to vectorstore.")
    except Exception as e:
        logger.error("[Learning] Failed to save Q&A: %s", e)


async def _fetch_web_results(query: str, max_results: int = 5) -> list[dict]:
    import httpx
    from bs4 import BeautifulSoup
    import urllib.parse

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    try:
        async with httpx.AsyncClient(headers=headers, timeout=4.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                results = []
                for a in soup.find_all('a', class_='result__snippet'):
                    try:
                        parent = a.parent
                        if not parent or not parent.parent:
                            continue
                        parent = parent.parent
                        title_elem = parent.find('a', class_='result__url')
                        if title_elem:
                            title = title_elem.text.strip()
                            href = str(title_elem.get('href', ''))
                            
                            if href.startswith('//duckduckgo.com/l/?kh=-1&uddg='):
                                href = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0])
                            elif 'uddg=' in href:
                                href = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0])
                            
                            if not href.startswith('http'):
                                href = 'https://' + href.lstrip('/')
                                
                            results.append({
                                "title": title,
                                "url": href,
                                "snippet": a.text.strip()
                            })
                            if len(results) >= max_results:
                                break
                    except Exception as parse_err:
                        logger.warning("[WebSearch] Failed parsing individual result snippet: %s", parse_err)
                if results:
                    return results
    except Exception as e:
        logger.error("[WebSearch] Async DDG scrape failed: %s", e)

    try:
        from duckduckgo_search import DDGS
        def _fallback():
            with DDGS() as ddgs:
                return [{
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                } for r in ddgs.text(query, max_results=max_results)]
        return await asyncio.to_thread(_fallback)
    except Exception as err:
        logger.error("[WebSearch] Fallback duckduckgo_search failed: %s", err)
        return []


async def generate_streaming_response(
    query: str,
    history: Optional[list] = None,
    session_id: Optional[str] = None,
    user_ip: Optional[str] = None,
    regenerate: Optional[bool] = False,
    previous_response: Optional[str] = None,
    web_search: bool = False,
    user_email: Optional[str] = None,
):
    if history is None:
        history = []
    import uuid
    log_id = str(uuid.uuid4())

    # ── Layer 1: Pre-LLM guardrail ────────────────────────────────────────────
    blocked = check_safety(query)
    if blocked:
        yield f'data: {{"type": "sources", "data": []}}\n\n'
        yield f'data: {{"type": "chunk", "text": {json.dumps(blocked)}}}\n\n'
        yield f'data: {{"type": "done"}}\n\n'
        return

    # Yield the message_id at the absolute start of the stream
    yield f'data: {{"type": "message_id", "id": "{log_id}"}}\n\n'

    # ── Layer 2: Semantic Cache Check (Redis + GPTCache) ──────────────────────
    if not regenerate:
        cached_response = search_cache(query)
        if cached_response:
            yield f'data: {{"type": "sources", "data": []}}\n\n'
            chunk_size = 40
            for i in range(0, len(cached_response), chunk_size):
                chunk = cached_response[i:i+chunk_size]
                yield f'data: {{"type": "chunk", "text": {json.dumps(chunk)}}}\n\n'
                await asyncio.sleep(0.002)
            yield f'data: {{"type": "done"}}\n\n'
            return

    try:
        try:
            enhanced_query = preprocess_temporal_query(query)
            logger.info("[Temporal Query Expansion] Query: '%s' -> Enhanced: '%s'", query, enhanced_query)
            docs = await asyncio.to_thread(retrieve_documents, enhanced_query, k=15)
        except Exception as e:
            logger.error("Retriever error: %s", e)
            docs = []

        positive_docs = []
        negative_docs = []
        for doc in docs:
            if doc.metadata.get("source") == "chat_learning" and doc.metadata.get("feedback") == "down":
                negative_docs.append(doc)
            else:
                positive_docs.append(doc)

        try:
            positive_docs = await rerank_documents(query, positive_docs, top_n=5)
        except Exception as re_err:
            logger.error("Reranking error: %s", re_err)
            positive_docs = positive_docs[:5]

        if not positive_docs or (positive_docs and positive_docs[0].metadata.get("rerank_score", 1.0) < -1.0):
            logger.info("[Agentic RAG] Insufficient DB confidence or empty results. Automatically falling back to Web Search.")
            web_search = True

        context_str = "--- DATABASE DOCUMENTS (SNU Knowledge Base) ---\n"
        context_str += format_docs(positive_docs) if positive_docs else "(No documents retrieved)"

        if negative_docs:
            context_str += "\n\n--- CRITICAL: AVOID THESE ANSWERS (STUDENT NEGATIVE FEEDBACK) ---\n"
            context_str += "The following answers previously received negative student feedback for this or similar queries. Do NOT repeat these responses or replicate their structure/errors:\n"
            for ndoc in negative_docs:
                context_str += f"- {ndoc.page_content}\n"

        web_results_data = []
        if web_search:
            logger.info("[WebSearch] Fetching live web results for: %s", query)
            web_results_data = await _fetch_web_results(query, max_results=5)
            if web_results_data:
                context_str += "\n\n--- LIVE WEB SEARCH RESULTS ---\n"
                context_str += "The following results were fetched live from the web to supplement the knowledge base:\n\n"
                for i, r in enumerate(web_results_data, 1):
                    context_str += f"{i}. **{r['title']}**\n"
                    context_str += f"   URL: {r['url']}\n"
                    context_str += f"   {r['snippet']}\n\n"
            else:
                context_str += "\n\n--- LIVE WEB SEARCH RESULTS ---\n(No web results could be retrieved at this time)"

        web_results = ""

        history_str = ""
        if history:
            recent = history[-6:]
            history_str = "\n--- CONVERSATION HISTORY ---\n"
            for msg in recent:
                role_label = "User" if msg.get("role") == "user" else "Assistant"
                history_str += f"{role_label}: {msg.get('content', '')}\n"
            history_str += "---\n"

        full_context = context_str + history_str

        if regenerate:
            full_context += "\n\n--- REGENERATE DIRECTIVE ---"
            full_context += "\nThe user has explicitly requested to REGENERATE this response because the previous attempt was unsatisfactory."
            if previous_response:
                full_context += f"\n\nHere is the rejected PREVIOUS response:\n[PREVIOUS RESPONSE]\n{previous_response}\n[END PREVIOUS RESPONSE]"
                full_context += "\n\nCRITICAL INSTRUCTIONS FOR RE-CHECKING, RE-FRAMING, & REVALIDATING:"
                full_context += "\n1. Carefully read and re-check all retrieved database documents above for the correct information."
                full_context += "\n2. Revalidate all claims, links, dates, and names from the previous response against the database documents."
                full_context += "\n3. Completely re-frame the answer. Structure it more clearly, use concise bullet points, and address any missing context or errors."
                full_context += "\n4. DO NOT repeat the previous response or copy-paste major parts of it. Re-write the content to be significantly better and more accurate."
            else:
                full_context += "\n\nPlease re-read the database documents carefully, revalidate the information, and re-frame the answer with improved structure, clarity, and precision."

        seen_sources: set = set()
        sources_data = []
        for doc in positive_docs:
            src = doc.metadata.get("source", "")
            key = src.split("/")[-1].split("\\")[-1]
            if key and key not in seen_sources and len(sources_data) < 5:
                seen_sources.add(key)
                sources_data.append({
                    "content": doc.page_content[:120],
                    "metadata": doc.metadata,
                    "source_type": "db",
                })

        for r in web_results_data[:5]:
            sources_data.append({
                "content": r["snippet"][:120],
                "metadata": {
                    "source": r["url"],
                    "title": r["title"],
                },
                "source_type": "web",
            })

        yield f'data: {{"type": "sources", "data": {json.dumps(sources_data)}}}\n\n'

        api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
        if not api_key:
            yield f'data: {{"type": "chunk", "text": "NVIDIA API Key is not configured. Please contact the administrator."}}\n\n'
            yield f'data: {{"type": "done"}}\n\n'
            return

        if regenerate:
            llm = ChatNVIDIA(
                model="nvidia/nemotron-3-super-120b-a12b",
                nvidia_api_key=api_key,
                temperature=0.4,
                max_tokens=16384,
                model_kwargs={"chat_template_kwargs": {"enable_thinking": True}}
            )
        else:
            llm = get_llm()
            if not llm:
                yield f'data: {{"type": "chunk", "text": "NVIDIA Key is not configured. Please contact the administrator."}}\n\n'
                yield f'data: {{"type": "done"}}\n\n'
                return

        messages = qa_prompt.format_messages(context=full_context, question=query)

        got_content = False
        full_response = ""
        async for chunk in llm.astream(messages):
            text = chunk.content
            if text and isinstance(text, str):
                got_content = True
                full_response += text
                yield f'data: {{"type": "chunk", "text": {json.dumps(text)}}}\n\n'

        if not got_content:
            yield f'data: {{"type": "chunk", "text": "I could not generate a response. Please try again."}}\n\n'
        elif full_response and len(full_response) > 30:
            from app.models.chat_log import save_chat_log

            async def _log_chat():
                try:
                    await save_chat_log(
                        query,
                        full_response,
                        session_id=session_id,
                        context={"sources": sources_data},
                        user_ip=user_ip,
                        log_id=log_id,
                    )
                except Exception as log_err:
                    logger.error("Chat log save failed: %s", log_err)

            await asyncio.gather(_log_chat())
            
            if full_response.strip() and not regenerate:
                await save_to_cache(query, full_response.strip())

    except Exception as e:
        import traceback
        import secrets
        error_details = traceback.format_exc()
        logger.error("Pipeline error: %s", error_details)
        
        # Generate clean 6-digit alphanumeric error ID
        error_id = "".join(secrets.choice("0123456789ABCDEF") for _ in range(6))
        
        async def _log_error():
            try:
                await save_error_telemetry(
                    error_id=error_id,
                    reason=str(e),
                    what_caused=error_details,
                    query=query,
                    user_ip=user_ip or "unknown",
                    user_details={"email": user_email} if user_email else None
                )
            except Exception as db_err:
                logger.error("Failed to save error telemetry: %s", db_err)
            try:
                await send_error_email(
                    error_id=error_id,
                    reason=str(e),
                    what_caused=error_details,
                    query=query,
                    user_ip=user_ip or "unknown",
                    user_email=user_email
                )
            except Exception as email_err:
                logger.error("Failed to send error notification: %s", email_err)

        # Run telemetry operations in the background concurrently
        await asyncio.gather(_log_error())

        error_msg = (
            f"❌ **Neural Engine Error**: An internal system error occurred. Please try again later.\n\n"
            f"**Error ID:** `{error_id}`\n\n"
            f"If this issue persists, please [report it to us via the Contact Page](/contact) "
            f"along with the Error ID so we can resolve it."
        )
        yield f'data: {{"type": "chunk", "text": {json.dumps(error_msg)}}}\n\n'

    finally:
        yield f'data: {{"type": "done"}}\n\n'
