"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble, { MessageProps } from "./MessageBubble";
import { useConversations } from "./useConversations";
import Sidebar from "./Sidebar";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";

export default function ChatInterface() {
  const { conversations, activeId, activeConversation, setActiveId, createNew, updateMessages, deleteConversation } =
    useConversations();

  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messages: MessageProps[] = activeConversation?.messages ?? [];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Keyboard shortcuts (Cmd+K / Ctrl+K for a new chat)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNew();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [conversations]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const queryText = (customQuery || "").trim();
    if (!queryText || isLoading) return;

    let convId = activeId;
    if (!convId) convId = createNew();

    const userMsg: MessageProps = { role: "user", content: queryText };
    const placeholderMsg: MessageProps = { role: "assistant", content: "", sources: [] };
    const nextMessages: MessageProps[] = [...messages, userMsg, placeholderMsg];

    updateMessages(convId, nextMessages);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Prefer /api/chat (Next proxy). Fall back to /_/backend if /api/chat 404s (legacy deploys).
      let endpoint = "/api/chat";
      let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          query: queryText,
          session_id: convId,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 404) {
        endpoint = "/_/backend/api/chat";
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            query: queryText,
            session_id: convId,
            history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          }),
        });
      }

      if (!res.ok) {
        const rawText = await res.text();
        console.error("DEBUG: Raw Backend Response:", rawText);
        let errorData;
        try {
          errorData = JSON.parse(rawText);
        } catch (e) {
          errorData = { error: rawText };
        }
        const isHtml = rawText.trimStart().startsWith("<!");
        throw new Error(
          isHtml
            ? "Chat API is unavailable. Redeploy the latest version and try again."
            : errorData.error || errorData.detail || `Backend error: ${res.status}`
        );
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;
      let current = [...nextMessages];

      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "done") { streamDone = true; break; }

              const updated = [...current];
              const last = updated[updated.length - 1];
              if (!last || last.role !== "assistant") continue;

              if (data.type === "sources") last.sources = data.data;
              else if (data.type === "chunk" && data.text) last.content += data.text;

              current = updated;
              updateMessages(convId!, current);
            } catch { /* skip malformed */ }
          }
        }
      }

      // Fallback if no content streamed
      const finalMsgs = [...current];
      const last = finalMsgs[finalMsgs.length - 1];
      if (last?.role === "assistant" && !last.content.trim()) {
        last.content = "I'm having trouble generating a response right now. Please try again.";
        updateMessages(convId!, finalMsgs);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error("Chat error:", err);
        const errMsgs = [...messages, userMsg, {
          role: "assistant" as const,
          content: "I encountered a connection error. Please try again.",
        }];
        updateMessages(convId!, errMsgs);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNew = () => {
    createNew();
    setSidebarOpen(false);
  };

  const handleSendMessage = ({ input: queryText }: { input: string }) => {
    handleSubmit(undefined, queryText);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0 border-r" style={{ borderColor: "var(--color-border)" }}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={deleteConversation}
        />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-72"
            >
              <Sidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={deleteConversation}
                mobile
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile logo (visible when sidebar hidden) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border" style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.svg" alt="SNUGPT" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-white">SNUGPT</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={handleNew}
            title="New chat"
            className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06] text-gray-400 hover:text-white"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 pb-36">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 text-center px-4 py-8 pt-20"
                >
                  {/* SNU Logo large */}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mb-4 md:mb-6 border-2 shadow-xl"
                    style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/avatar.svg"
                      alt="SNUGPT logo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                    How can I assist your SNU journey today?
                  </h2>
                  <p className="text-xs md:text-sm mb-6 md:mb-10" style={{ color: "var(--color-muted)" }}>
                    Query university student handbooks, policy manuals, and ERP guides in real-time.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 relative"
          style={{ background: "linear-gradient(to top, var(--color-bg) 70%, transparent)" }}>
          <div className="max-w-3xl mx-auto relative">
            <PureMultimodalInput
              chatId={activeId || "new-chat"}
              messages={messages.map((m, i) => ({ id: `${i}`, content: m.content, role: m.role }))}
              attachments={attachments}
              setAttachments={setAttachments}
              onSendMessage={handleSendMessage}
              onStopGenerating={handleStop}
              isGenerating={isLoading}
              canSend={!isLoading}
              selectedVisibilityType="private"
            />
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--color-muted)" }}>
              SNUGPT is an unofficial student assistant and can make mistakes. Verify critical info on{" "}
              <a href="https://snu.edu.in" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white transition-colors">
                snu.edu.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
