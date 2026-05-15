import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, messages } = await req.json();
    
    // Support both old {messages: [...]} format and new {query: "..."} format
    let finalQuery = query;
    if (!finalQuery && messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.role === 'user') {
        finalQuery = latestMessage.content;
      }
    }

    if (!finalQuery) {
      return new Response("Invalid request", { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    // Call FastAPI backend
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: finalQuery }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    // Pass the SSE stream directly back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
