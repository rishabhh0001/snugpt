import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.models.database import connect_database, disconnect_database, is_database_connected, get_database
from app.models.schemas import ChatRequest, FeedbackRequest, ShareChatRequest, ShareChatResponse, ContactRequest, AuthRequest
from app.models.user import get_user_by_email, create_user, verify_and_upgrade_user_password
from app.models.chat_log import save_chat_feedback, save_shared_chat, get_shared_chat
from app.models.contact import save_contact_message
from app.rag.pipeline import generate_streaming_response
from app.rag.vectorstore import add_qa_pair
from app.api import whatsapp
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


app = FastAPI(title="SNUGPT API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(StripBackendPrefixMiddleware)

app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])

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
        content={"detail": "Internal server error. Please try again later."},
    )


import time

_redis_client = None

def get_redis_client():
    global _redis_client
    if not getattr(settings, "enable_redis", False):
        return None
    if _redis_client is None and settings.redis_url:
        import redis.asyncio as aioredis
        _redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client

@app.post("/api/chat")
async def chat(request: ChatRequest, fastapi_request: Request):
    forwarded_for = fastapi_request.headers.get("x-forwarded-for")
    if forwarded_for:
        user_ip = forwarded_for.split(",")[0].strip()
    else:
        user_ip = fastapi_request.client.host if fastapi_request.client else "unknown"

    # Serverless-friendly Redis Rate Limiter (only if enabled)
    if getattr(settings, "enable_redis", False):
        try:
            redis_client = get_redis_client()
            if redis_client:
                current_minute = int(time.time() // 60)
                rate_key = f"rate_limit:chat:{user_ip}:{current_minute}"
                count = await redis_client.incr(rate_key)
                if count == 1:
                    await redis_client.expire(rate_key, 60)
                if count > 15:
                    logger.warning(f"Rate limit exceeded for IP: {user_ip}")
                    raise HTTPException(status_code=429, detail="Too many requests. Please slow down and try again in a minute.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Redis rate limiter bypassed due to error: {e}")

    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    return StreamingResponse(
        generate_streaming_response(
            request.query,
            history=history,
            session_id=request.session_id,
            user_ip=user_ip,
            regenerate=request.regenerate,
            previous_response=request.previous_response,
            web_search=request.web_search or False,
            user_email=request.user_email,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )



@app.post("/api/contact")
async def contact(request: ContactRequest):
    try:
        message_id = await save_contact_message(
            name=request.name,
            email=request.email,
            subject=request.subject,
            message=request.message
        )

        if settings.contact_apps_script_url:
            import requests
            def send_email_webhook():
                payload = {
                    "name": request.name,
                    "email": request.email,
                    "subject": request.subject or "New Contact Message",
                    "message": request.message
                }
                try:
                    response = requests.post(settings.contact_apps_script_url, json=payload, timeout=12)
                    logger.info("Google Apps Script webhook trigger response: %s", response.status_code)
                except Exception as ex:
                    logger.error("Failed to call Google Apps Script webhook: %s", ex)

            await asyncio.to_thread(send_email_webhook)
        else:
            logger.warning("CONTACT_APPS_SCRIPT_URL not configured. Direct logging completed without email dispatch.")

        return {"message": "Message successfully received and logged.", "id": message_id}
    except Exception as e:
        logger.error("Contact form error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to log message. Please try again.") from e


@app.post("/api/auth/authenticate")
async def authenticate(request: AuthRequest):
    email = request.email.strip().lower()
    password = request.password
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email/User ID and password are required.")
    
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    try:
        user = await get_user_by_email(email)
        if user:
            is_valid = await verify_and_upgrade_user_password(user, password)
            if is_valid:
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"] or email.split("@")[0]
                }
            else:
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
        else:
            new_user = await create_user(email, password)
            return {
                "id": new_user["id"],
                "email": new_user["email"],
                "name": new_user["name"],
                "is_new": True
            }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error("Authentication error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error during authentication.")


@app.post("/api/chat/feedback")
async def chat_feedback(request: FeedbackRequest):
    try:
        await save_chat_feedback(
            chat_id=request.chat_id,
            action=request.action,
            message_id=request.message_id
        )

        if request.action in ("up", "down") and request.message_id:
            db = get_database()
            query_select = "SELECT user_query, ai_response FROM chat_logs WHERE id = :id"
            row = await db.fetch_one(query=query_select, values={"id": request.message_id})
            if row:
                user_query = row["user_query"]
                ai_response = row["ai_response"]
                # await asyncio.to_thread(add_qa_pair, user_query, ai_response, request.action)
                # print(f"[Feedback Vectorstore] Reinforced vector DB for log {request.message_id} with action {request.action}")
                print(f"[Maintenance] Auto-learning from chat is temporarily disabled for {request.message_id}")
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
        
        origin = fastapi_request.headers.get("origin")
        if not origin:
            host = fastapi_request.headers.get("host") or "snugpt.rishabhj.in"
            scheme = fastapi_request.url.scheme
            origin = f"{scheme}://{host}"
            
        share_url = f"{origin}/share/{share_id}"
        
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
        
        serialized_messages = [m.model_dump() for m in request.messages]
        
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
        raise HTTPException(status_code=500, detail="Failed to share chat due to an internal error.")


@app.get("/api/share/{share_id}")
async def get_share(share_id: str):
    shared = await get_shared_chat(share_id)
    if not shared:
        raise HTTPException(status_code=404, detail="Shared chat not found.")
    return shared


@app.get("/api/auth/admin-check")
async def admin_check(email: str):
    email_clean = email.strip().lower()
    allowed_admins = [e.strip().lower() for e in settings.admin_emails.split(",") if e.strip()]
    is_admin = email_clean in allowed_admins
    return {"is_admin": is_admin}


