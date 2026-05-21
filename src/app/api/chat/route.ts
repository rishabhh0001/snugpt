import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const isDev = process.env.NODE_ENV === "development";
    const backendUrl = isDev
      ? (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000")
      : `${req.nextUrl.origin}/_/backend`;

    const targetUrl = `${backendUrl}/api/chat`;

    // Forward the request to the Python RAG backend
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the stream directly to the client with hardened SSE headers
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("[Next.js Chat API Route Error]:", err);
    return NextResponse.json(
      { error: "Internal Server Error in Next.js edge stream.", detail: err.message },
      { status: 500 }
    );
  }
}
