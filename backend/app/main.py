import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.models.database import connect_database, disconnect_database, is_database_connected, get_database
from app.models.schemas import ChatRequest, WaitlistRequest, FeedbackRequest, ShareChatRequest, ShareChatResponse
from app.models.waitlist import add_to_waitlist
from app.models.chat_log import save_chat_feedback, save_shared_chat, get_shared_chat
from app.rag.pipeline import generate_streaming_response
from app.rag.vectorstore import add_qa_pair
import uuid
import io
import base64
import qrcode
import qrcode.image.svg

import asyncio

logger = logging.getLogger(__name__)

BACKEND_PREFIX = "/_/backend"


class StripBackendPrefixMiddleware(BaseHTTPMiddleware):
    """Map /_/backend/api/* rewrites to FastAPI /api/* routes."""

    async def dispatch(self, request: Request, call_next):
        path = request.scope.get("path", "")
        # Strip prefixes added by Vercel rewrites or deployment structure
        for prefix in [BACKEND_PREFIX, "/api/py/index.py", "/api/py"]:
            if path.startswith(prefix):
                request.scope["path"] = path[len(prefix) :] or "/"
                break
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
        await add_to_waitlist(
            first_name=request.first_name,
            mobile_number=request.mobile_number,
            email_address=request.email_address
        )
        return {"message": "Successfully joined the waitlist"}
    except Exception as e:
        error_str = str(e).lower()
        if "unique constraint" in error_str or "already exists" in error_str or "duplicate" in error_str or "email_address" in error_str:
            raise HTTPException(status_code=400, detail="This email is already on the waitlist.") from e
        logger.error("Waitlist error: %s", e)
        raise HTTPException(status_code=500, detail="Could not save waitlist entry. Please try again.") from e


@app.post("/api/chat/feedback")
async def chat_feedback(request: FeedbackRequest):
    try:
        # 1. Save feedback event to SQL database
        await save_chat_feedback(
            chat_id=request.chat_id,
            action=request.action,
            message_id=request.message_id
        )

        # 2. Reinforce Vector store (ChromaDB) if the feedback is positive or negative
        if request.action in ("up", "down") and request.message_id:
            db = get_database()
            query_select = "SELECT user_query, ai_response FROM chat_logs WHERE id = :id"
            row = await db.fetch_one(query=query_select, values={"id": request.message_id})
            if row:
                user_query = row["user_query"]
                ai_response = row["ai_response"]
                # Save to vector store in a background thread to prevent request blocking
                await asyncio.to_thread(add_qa_pair, user_query, ai_response, request.action)
                print(f"[Feedback Vectorstore] Reinforced vector DB for log {request.message_id} with action {request.action}")
            else:
                logger.warning("Could not find chat log %s for reinforcing vector store.", request.message_id)

        return {"message": f"Successfully captured feedback: {request.action}"}
    except Exception as e:
        logger.error("Feedback submission error: %s", e)
        raise HTTPException(status_code=500, detail="Could not capture feedback. Please try again.") from e


@app.post("/api/share", response_model=ShareChatResponse)
async def share_chat(request: ShareChatRequest, fastapi_request: Request):
    try:
        share_id = str(uuid.uuid4())
        
        # Determine origin for construction of frontend URL
        origin = fastapi_request.headers.get("origin")
        if not origin:
            # Fallback to host header if origin isn't present
            host = fastapi_request.headers.get("host") or "snugpt.org"
            scheme = fastapi_request.url.scheme
            origin = f"{scheme}://{host}"
            
        share_url = f"{origin}/share/{share_id}"
        
        # Generate clean base64 SVG QR code using vector rendering
        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=4,
        )
        qr.add_data(share_url)
        qr.make(fit=True)
        img = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
        
        stream = io.BytesIO()
        img.save(stream)
        svg_bytes = stream.getvalue()
        base64_qr = f"data:image/svg+xml;base64,{base64.b64encode(svg_bytes).decode('utf-8')}"
        
        # Serialize messages to dictionary format for database JSON field
        serialized_messages = [m.model_dump() for m in request.messages]
        
        # Save chat snapshot to SQL database
        success = await save_shared_chat(
            share_id=share_id,
            messages=serialized_messages,
            title=request.title,
            session_id=request.session_id
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Database failure saving shared chat snapshot.")
            
        return ShareChatResponse(
            share_id=share_id,
            share_url=share_url,
            qr_code_base64=base64_qr
        )
    except Exception as e:
        logger.error("Error creating shared chat: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to share chat: {str(e)}")


@app.get("/api/share/{share_id}")
async def get_share(share_id: str):
    shared = await get_shared_chat(share_id)
    if not shared:
        raise HTTPException(status_code=404, detail="Shared chat not found.")
    return shared

