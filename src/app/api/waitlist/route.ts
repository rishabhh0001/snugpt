import { NextRequest } from "next/server";
import { getPythonApiUrl } from "@/lib/backend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(getPythonApiUrl("/api/waitlist"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Waitlist proxy error:", error);
    return new Response(
      JSON.stringify({ detail: "Could not reach waitlist service." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
