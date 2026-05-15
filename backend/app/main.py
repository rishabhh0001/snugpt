from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.rag.pipeline import generate_streaming_response
from app.config import settings
from app.models.database import database, init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await database.connect()
    init_db()
    yield
    # Shutdown logic
    await database.disconnect()

app = FastAPI(title="SnuGPT API", version="1.0.0", lifespan=lifespan)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: ChatRequest, fastapi_request: Request):
    # Extract client IP
    forwarded_for = fastapi_request.headers.get("x-forwarded-for")
    if forwarded_for:
        user_ip = forwarded_for.split(",")[0].strip()
    else:
        user_ip = fastapi_request.client.host if fastapi_request.client else "unknown"

    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    return StreamingResponse(
        generate_streaming_response(
            request.query, 
            history=history, 
            session_id=request.session_id,
            user_ip=user_ip
        ),
        media_type="text/event-stream"
    )
