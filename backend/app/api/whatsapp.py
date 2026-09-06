import logging
import asyncio
import httpx
from fastapi import APIRouter, Request, BackgroundTasks, HTTPException
from app.config import settings
from app.rag.pipeline import generate_streaming_response

logger = logging.getLogger(__name__)

router = APIRouter()

async def send_whatsapp_message(to_number: str, body: str):
    """Send a WhatsApp message via Twilio API using httpx."""
    if not settings.twilio_account_sid or not settings.twilio_auth_token or not settings.twilio_whatsapp_number:
        logger.error("Twilio credentials missing. Cannot send WhatsApp message.")
        return

    chunks = [body[i:i+1500] for i in range(0, len(body), 1500)]
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    
    async with httpx.AsyncClient() as client:
        for chunk in chunks:
            data = {
                "To": to_number,
                "From": settings.twilio_whatsapp_number,
                "Body": chunk
            }
            try:
                response = await client.post(
                    url,
                    data=data,
                    auth=(settings.twilio_account_sid, settings.twilio_auth_token),
                    timeout=10.0
                )
                if response.status_code not in (200, 201):
                    logger.error("Failed to send WhatsApp message: %s - %s", response.status_code, response.text)
            except Exception as e:
                logger.error("Error sending WhatsApp message via Twilio: %s", e)

async def process_whatsapp_query(user_query: str, from_number: str):
    """Run the RAG pipeline asynchronously and send the result back via WhatsApp."""
    try:
        full_response = ""
        generator = generate_streaming_response(
            query=user_query,
            session_id=from_number, # use phone number as session id
            user_ip="whatsapp"
        )
        import json
        async for sse_chunk in generator:
            if sse_chunk.startswith("data: "):
                try:
                    data_str = sse_chunk[6:].strip()
                    if not data_str:
                        continue
                    payload = json.loads(data_str)
                    if payload.get("type") == "chunk" and payload.get("text"):
                        full_response += payload["text"]
                except Exception:
                    pass
        
        if not full_response.strip():
            full_response = "I'm sorry, I couldn't generate a response right now. Please try again later."
            
        await send_whatsapp_message(from_number, full_response.strip())
        
    except Exception as e:
        logger.error("Error processing WhatsApp query: %s", e)
        await send_whatsapp_message(from_number, "An internal error occurred while processing your request. Please try again.")

@router.post("/webhook")
async def twilio_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Webhook endpoint for Twilio to send incoming WhatsApp messages.
    Returns 200 OK immediately, kicking off background processing.
    """
    form_data = await request.form()
    
    body = form_data.get("Body", "").strip()
    from_number = form_data.get("From", "")
    
    if not body or not from_number:
        raise HTTPException(status_code=400, detail="Invalid WhatsApp payload")
        
    logger.info("Received WhatsApp message from %s: %s", from_number, body)
    
    background_tasks.add_task(process_whatsapp_query, body, from_number)
    
    from fastapi.responses import Response
    twiml = "<Response></Response>"
    return Response(content=twiml, media_type="application/xml")
