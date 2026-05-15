import os
import re
import json
from typing import Optional
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.rag.prompts import qa_prompt
from app.rag.vectorstore import get_retriever, get_vectorstore
from app.config import settings

# Lazy initialization of LLM to prevent startup crashes
_llm = None

def get_llm():
    global _llm
    if _llm is None:
        api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
        if not api_key:
            # We don't raise here to avoid crashing the worker, but we'll fail gracefully during generation
            return None
        _llm = ChatNVIDIA(
            model="meta/llama-3.3-70b-instruct",
            nvidia_api_key=api_key,
            temperature=0.1,
            max_tokens=1024
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


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def save_qa_to_vectorstore(query: str, answer: str):
    """Persist a Q&A pair back into ChromaDB so the bot learns from real conversations."""
    try:
        from langchain_core.documents import Document
        vs = get_vectorstore()
        doc = Document(
            page_content=f"Q: {query}\nA: {answer}",
            metadata={"source": "chat_learning", "type": "learned_qa"}
        )
        vs.add_documents([doc])
        print("[Learning] Saved Q&A to vectorstore.")
    except Exception as e:
        print(f"[Learning] Failed to save Q&A: {e}")


async def generate_streaming_response(query: str, history: list = [], session_id: Optional[str] = None, user_ip: Optional[str] = None):
    # ── Layer 1: Pre-LLM guardrail ────────────────────────────────────────────
    blocked = check_safety(query)
    if blocked:
        yield f'data: {{"type": "sources", "data": []}}\n\n'
        yield f'data: {{"type": "chunk", "text": {json.dumps(blocked)}}}\n\n'
        yield f'data: {{"type": "done"}}\n\n'
        return

    try:
        # Get relevant documents from DB
        try:
            retriever = get_retriever()
            docs = retriever.invoke(query)
        except Exception as e:
            print(f"Retriever error: {e}")
            docs = []

        # Format DB docs for the prompt
        context_str = "--- DATABASE DOCUMENTS ---\n"
        context_str += format_docs(docs) if docs else "(No documents retrieved)"

        # Run web search as fallback/supplement
        web_results = ""
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
                if results:
                    web_results = "\n".join([f"{r['title']}: {r['body']}" for r in results])
            
            if web_results:
                context_str += "\n\n--- WEB SEARCH RESULTS ---\n"
                context_str += web_results
        except Exception as e:
            print(f"Web search failed: {e}")

        # Build conversation history (last 6 turns max)
        history_str = ""
        if history:
            recent = history[-6:]
            history_str = "\n--- CONVERSATION HISTORY ---\n"
            for msg in recent:
                role_label = "User" if msg.get("role") == "user" else "Assistant"
                history_str += f"{role_label}: {msg.get('content', '')}\n"
            history_str += "---\n"

        full_context = context_str + history_str

        # Build sources — deduped by filename, max 8, Web Search only if useful
        seen_sources: set = set()
        sources_data = []
        for doc in docs:
            src = doc.metadata.get("source", "")
            key = src.split("/")[-1].split("\\")[-1]
            if key and key not in seen_sources and len(sources_data) < 8:
                seen_sources.add(key)
                sources_data.append({
                    "content": doc.page_content[:120],
                    "metadata": doc.metadata
                })
        if web_results and len(web_results.strip()) > 50:
            sources_data.append({
                "content": web_results[:120],
                "metadata": {"source": "Web Search"}
            })

        yield f'data: {{"type": "sources", "data": {json.dumps(sources_data)}}}\n\n'

        # Prepare and stream LLM response
        llm = get_llm()
        if not llm:
            yield f'data: {{"type": "chunk", "text": "NVIDIA API Key is not configured. Please contact the administrator."}}\n\n'
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
            # Async learning: save Q&A pair to vectorstore
            import asyncio
            from app.models.chat_log import save_chat_log
            
            asyncio.create_task(
                asyncio.to_thread(save_qa_to_vectorstore, query, full_response)
            )
            # Secure Logging: save to structured DB
            asyncio.create_task(
                save_chat_log(query, full_response, session_id=session_id, context={"sources": sources_data}, user_ip=user_ip)
            )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Pipeline error: {error_details}")
        error_msg = f"Neural Engine Error: {str(e)[:100]}"
        yield f'data: {{"type": "chunk", "text": {json.dumps(error_msg)}}}\n\n'

    finally:
        yield f'data: {{"type": "done"}}\n\n'
