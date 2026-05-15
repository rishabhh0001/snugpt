# app/main.py
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import ChatRequest, ChatResponse, WaitlistRequest
from app.models.waitlist import add_to_waitlist
from app.rag.pipeline import generate_streaming_response
from app.config import settings
from app.models.database import database, init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    try:
        await database.connect()
        init_db()
    except Exception as e:
        import logging
        logging.error(f"Startup failure (Database): {e}")
    yield
    # Shutdown logic
    try:
        await database.disconnect()
    except Exception:
        pass

app = FastAPI(title="SnuGPT API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db": database.is_connected}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.error(f"Global error caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


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

@app.post("/api/waitlist")
async def waitlist(request: WaitlistRequest):
    try:
        await add_to_waitlist(request.name, request.email)
        return {"message": "Successfully joined the waitlist"}
    except Exception as e:
        from fastapi import HTTPException
        # Check for unique constraint violation
        error_str = str(e).lower()
        if "unique constraint" in error_str or "already exists" in error_str:
            raise HTTPException(status_code=400, detail="This email is already on the waitlist.")
        raise HTTPException(status_code=500, detail=str(e))
