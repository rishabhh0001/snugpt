"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble, { MessageProps } from "./MessageBubble";
import QuickActions from "./QuickActions";

export default function ChatInterface() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll on new messages or during streaming
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const queryText = customQuery || input;
    if (!queryText.trim() || isLoading) return;

    // Add user message
    const userMsg: MessageProps = { role: "user", content: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Add a temporary assistant message to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

      // In production go directly to the backend prefix; in dev use the Next.js proxy
      const endpoint = process.env.NODE_ENV === "production"
        ? "/_/backend/api/chat"
        : "/api/chat";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          // Send last 10 messages as history (excluding the empty assistant placeholder we just added)
          history: messages.slice(-11, -1).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { value, done: doneReading } = await reader.read();

        if (doneReading) {
          streamDone = true;
          break;
        }

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last (possibly incomplete) line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === "done") {
                streamDone = true;
                break;
              }

              setMessages((prev) => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (!lastMsg || lastMsg.role !== "assistant") return prev;

                if (data.type === "sources") {
                  lastMsg.sources = data.data;
                } else if (data.type === "chunk" && data.text) {
                  lastMsg.content += data.text;
                }
                return newMsgs;
              });
            } catch {
              // Skip malformed lines silently
            }
          }
        }
      }

      // If we got no content at all, show a fallback message
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            ...last,
            content: "I'm having trouble generating a response right now. Please try again.",
          };
          return newMsgs;
        }
        return prev;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "I encountered an error connecting to the SNU servers. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-32 px-2 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-full text-center max-w-2xl mx-auto pt-4 md:pt-10 px-4 pb-40"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-snu-yellow to-snu-yellow-dark flex items-center justify-center shadow-[0_0_30px_rgba(242,169,0,0.3)] mb-8 animate-float">
                <Sparkles className="w-8 h-8 text-snu-blue" />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 snu-gradient-text">
                Welcome to SnuGPT
              </h2>
              <p className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed">
                Your intelligent companion for all things Shiv Nadar University. 
                Ask about courses, admissions, hostel life, or campus services.
              </p>
              <QuickActions onSelect={(q) => handleSubmit(undefined, q)} />
            </motion.div>
          ) : (
            <div className="space-y-2 max-w-4xl mx-auto w-full">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="absolute -top-12 left-0 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3 h-3" />
              New Conversation
            </button>
          )}
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-snu-yellow/20 via-snu-blue-light/20 to-snu-yellow/20 rounded-2xl blur-lg opacity-50 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center gap-2 glass-panel p-2 pl-5 rounded-2xl shadow-2xl border-white/10 group-focus-within:border-snu-yellow/30 transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SnuGPT anything..."
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 py-4 text-sm md:text-base placeholder:text-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3.5 rounded-xl bg-snu-yellow hover:bg-snu-yellow-dark disabled:bg-slate-800 disabled:text-slate-500 text-snu-blue transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-snu-yellow/10"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] md:text-xs text-slate-500 font-medium">
              SnuGPT is an AI assistant. Verify critical information on <a href="https://snu.edu.in" className="text-snu-yellow/80 hover:text-snu-yellow underline underline-offset-2">snu.edu.in</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
