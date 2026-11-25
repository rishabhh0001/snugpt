import ChatInterface from "@/components/ChatInterface";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const draft = typeof q === "string" ? q.trim().slice(0, 1500) : "";

  return <ChatInterface key={draft} initialDraft={draft} />;
}
