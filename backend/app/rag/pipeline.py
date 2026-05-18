import os
import re
import json
from typing import Optional
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.rag.prompts import qa_prompt
from app.rag.vectorstore import add_qa_pair, retrieve_documents
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
            model="meta/llama-3.1-8b-instruct",
            nvidia_api_key=api_key,
            temperature=0.1,
            max_tokens=8192
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
        add_qa_pair(query, answer)
        print("[Learning] Saved Q&A to vectorstore.")
    except Exception as e:
        print(f"[Learning] Failed to save Q&A: {e}")


async def generate_streaming_response(
    query: str,
    history: list = [],
    session_id: Optional[str] = None,
    user_ip: Optional[str] = None,
    regenerate: Optional[bool] = False,
    previous_response: Optional[str] = None,
):
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

    try:
        # Get relevant documents from DB (fetch slightly more to identify feedback)
        try:
            import asyncio
            docs = await asyncio.to_thread(retrieve_documents, query, k=6)
        except Exception as e:
            print(f"Retriever error: {e}")
            docs = []

        # Filter out positive vs negative feedback documents
        positive_docs = []
        negative_docs = []
        for doc in docs:
            # Check metadata for chat_learning source and thumbs down
            if doc.metadata.get("source") == "chat_learning" and doc.metadata.get("feedback") == "down":
                negative_docs.append(doc)
            else:
                positive_docs.append(doc)

        # Slice positive docs back to top 4 for context density
        positive_docs = positive_docs[:4]

        # Format DB docs for the prompt
        context_str = "--- DATABASE DOCUMENTS ---\n"
        context_str += format_docs(positive_docs) if positive_docs else "(No documents retrieved)"

        # Add negative feedback reinforcement if present to guide the model
        if negative_docs:
            context_str += "\n\n--- CRITICAL: AVOID THESE ANSWERS (STUDENT NEGATIVE FEEDBACK) ---\n"
            context_str += "The following answers previously received negative student feedback for this or similar queries. Do NOT repeat these responses or replicate their structure/errors:\n"
            for ndoc in negative_docs:
                context_str += f"- {ndoc.page_content}\n"

        web_results = ""

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

        # Build sources — deduped by filename, max 8
        seen_sources: set = set()
        sources_data = []
        for doc in positive_docs:
            src = doc.metadata.get("source", "")
            key = src.split("/")[-1].split("\\")[-1]
            if key and key not in seen_sources and len(sources_data) < 8:
                seen_sources.add(key)
                sources_data.append({
                    "content": doc.page_content[:120],
                    "metadata": doc.metadata
                })

        yield f'data: {{"type": "sources", "data": {json.dumps(sources_data)}}}\n\n'

        # Prepare and stream LLM response
        api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
        if not api_key:
            yield f'data: {{"type": "chunk", "text": "NVIDIA API Key is not configured. Please contact the administrator."}}\n\n'
            yield f'data: {{"type": "done"}}\n\n'
            return

        # Elevate temperature slightly for regeneration to encourage creative re-framing and detailed revalidation
        if regenerate:
            llm = ChatNVIDIA(
                model="meta/llama-3.1-8b-instruct",
                nvidia_api_key=api_key,
                temperature=0.4,
                max_tokens=8192
            )
        else:
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
            import asyncio
            from app.models.chat_log import save_chat_log

            # Persist concurrently before stream ends
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
                    print(f"Chat log save failed: {log_err}")

            # Vector learning is now triggered on explicit user feedback (thumbs up / thumbs down)
            await asyncio.gather(_log_chat())

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Pipeline error: {error_details}")
        error_msg = f"Neural Engine Error: {str(e)[:100]}"
        yield f'data: {{"type": "chunk", "text": {json.dumps(error_msg)}}}\n\n'

    finally:
        yield f'data: {{"type": "done"}}\n\n'
