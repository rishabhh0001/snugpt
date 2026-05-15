import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.models.database import connect_database, disconnect_database, is_database_connected
from app.models.schemas import ChatRequest, WaitlistRequest
from app.models.waitlist import add_to_waitlist
from app.rag.pipeline import generate_streaming_response

logger = logging.getLogger(__name__)

BACKEND_PREFIX = "/_/backend"


class StripBackendPrefixMiddleware(BaseHTTPMiddleware):
    """Map /_/backend/api/* rewrites to FastAPI /api/* routes."""

    async def dispatch(self, request: Request, call_next):
        path = request.scope.get("path", "")
        if path.startswith(BACKEND_PREFIX):
            request.scope["path"] = path[len(BACKEND_PREFIX) :] or "/"
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_database()
    except Exception as e:
        logger.error("Startup failure (database): %s", e)
    yield
    try:
        await disconnect_database()
    except Exception:
        pass


app = FastAPI(title="SnuGPT API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(StripBackendPrefixMiddleware)


@app.get("/")
@app.get("/api")
async def root():
    return {"service": "snugpt-api", "status": "ok"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "db": is_database_connected(),
        "chroma_cloud": bool(settings.chroma_api_key and settings.use_chroma_cloud),
        "nvidia": bool(settings.nvidia_api_key),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


@app.post("/api/chat")
async def chat(request: ChatRequest, fastapi_request: Request):
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
            user_ip=user_ip,
        ),
        media_type="text/event-stream",
    )


@app.post("/api/waitlist")
async def waitlist(request: WaitlistRequest):
    try:
        await add_to_waitlist(request.name, request.email)
        return {"message": "Successfully joined the waitlist"}
    except Exception as e:
        error_str = str(e).lower()
        if "unique constraint" in error_str or "already exists" in error_str or "duplicate" in error_str:
            raise HTTPException(status_code=400, detail="This email is already on the waitlist.") from e
        logger.error("Waitlist error: %s", e)
        raise HTTPException(status_code=500, detail="Could not save waitlist entry. Please try again.") from e
