import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from app.rag.pipeline import generate_streaming_response

async def run():
    queries = [
        "How do I apply for a partial tuition waiver?",
        "What is the attendance policy for core courses?",
        "How can I book a room in the library?",
        "What are the library timings?",
        "How do I register for an elective?",
        "Where is the dining hall located?"
    ]
    
    for q in queries:
        print(f"Q: {q}")
        response = ""
        async for chunk in generate_streaming_response(q):
            if '"type": "chunk"' in chunk:
                # very hacky extraction
                import json
                try:
                    data = chunk.split('data: ')[1].strip()
                    js = json.loads(data)
                    response += js.get("text", "")
                except Exception as e:
                    pass
        print(f"A: {response}\n")

if __name__ == "__main__":
    asyncio.run(run())
