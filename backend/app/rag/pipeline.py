import os
import re
import json
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_community.tools import DuckDuckGoSearchRun
from app.rag.prompts import qa_prompt
from app.rag.vectorstore import get_retriever
from app.config import settings

# Initialize NVIDIA NIM Chat Model
api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
if not api_key:
    raise ValueError("NVIDIA_API_KEY is not set. Please set it in .env")

llm = ChatNVIDIA(
    model="meta/llama-3.3-70b-instruct",
    nvidia_api_key=api_key,
    temperature=0.1,
    max_tokens=1024
)

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

def check_safety(query: str) -> str | None:
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


async def generate_streaming_response(query: str):
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
        try:
            search_tool = DuckDuckGoSearchRun()
            web_results = search_tool.invoke(query)
            context_str += "\n\n--- WEB SEARCH RESULTS ---\n"
            context_str += web_results
        except Exception as e:
            print(f"Web search failed: {e}")

        # Yield sources metadata
        sources_data = []
        for doc in docs:
            sources_data.append({
                "content": doc.page_content[:200] + "...",
                "metadata": doc.metadata
            })
        sources_data.append({
            "content": "Real-time web search via DuckDuckGo",
            "metadata": {"source": "Web Search"}
        })
        yield f'data: {{"type": "sources", "data": {json.dumps(sources_data)}}}\n\n'

        # Prepare and stream LLM response
        messages = qa_prompt.format_messages(context=context_str, question=query)
        
        got_content = False
        async for chunk in llm.astream(messages):
            text = chunk.content
            if text:
                got_content = True
                yield f'data: {{"type": "chunk", "text": {json.dumps(text)}}}\n\n'

        if not got_content:
            yield f'data: {{"type": "chunk", "text": "I could not generate a response. Please try again."}}\n\n'

    except Exception as e:
        print(f"Pipeline error: {e}")
        error_msg = f"An error occurred: {str(e)[:200]}"
        yield f'data: {{"type": "chunk", "text": {json.dumps(error_msg)}}}\n\n'

    finally:
        yield f'data: {{"type": "done"}}\n\n'
