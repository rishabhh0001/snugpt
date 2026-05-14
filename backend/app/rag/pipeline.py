import os
import json
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from app.rag.prompts import qa_prompt
from app.rag.vectorstore import get_retriever
from app.config import settings

# Initialize NVIDIA NIM Chat Model
# Ensure API key is set
api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
if not api_key:
    raise ValueError("NVIDIA_API_KEY is not set. Please set it in .env")

# Use the specific Llama 3.3 70B model requested
llm = ChatNVIDIA(
    model="meta/llama-3.3-70b-instruct",
    nvidia_api_key=api_key,
    temperature=0.1,
    max_tokens=1024
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

async def generate_streaming_response(query: str):
    retriever = get_retriever()
    
    # Get relevant documents first so we can include them in the metadata
    docs = retriever.invoke(query)
    
    # Format docs for the prompt
    context_str = format_docs(docs)
    
    # Prepare the prompt
    messages = qa_prompt.format_messages(context=context_str, question=query)
    
    # First, yield the metadata about sources
    sources_data = []
    for doc in docs:
        sources_data.append({
            "content": doc.page_content[:200] + "...", # Preview
            "metadata": doc.metadata
        })
    
    # We yield sources as a custom JSON event string first
    yield f'data: {{"type": "sources", "data": {json.dumps(sources_data)}}}\n\n'
    
    # Stream the LLM response
    async for chunk in llm.astream(messages):
        # We yield chunks as standard SSE
        # Escape newlines or handle via json
        yield f'data: {{"type": "chunk", "text": {json.dumps(chunk.content)}}}\n\n'
        
    yield f'data: {{"type": "done"}}\n\n'
