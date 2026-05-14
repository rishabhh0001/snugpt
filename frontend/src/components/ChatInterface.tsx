"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import MessageBubble, { SourceDocument, MessageProps } from "./MessageBubble";
import QuickActions from "./QuickActions";

export default function ChatInterface() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMsg] }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          // Parse SSE events. Very basic parsing.
          const lines = chunkStr.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;
              
              try {
                const data = JSON.parse(dataStr);
                
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  
                  if (data.type === "sources") {
                    lastMsg.sources = data.data;
                  } else if (data.type === "chunk") {
                    lastMsg.content += data.text;
                  }
                  
                  return newMsgs;
                });
              } catch (e) {
                console.error("Failed to parse SSE JSON", e, dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I encountered an error connecting to the knowledge base." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto pt-10">
            <h2 className="text-3xl font-bold mb-3 text-white">How can I help you?</h2>
            <p className="text-slate-400 mb-8">
              I'm SnuGPT, trained on Shiv Nadar University's official documents. Ask me about admissions, academics, campus facilities, or IT support.
            </p>
            <QuickActions onSelect={(q) => handleSubmit(undefined, q)} />
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1].role === "user" && (
              <div className="flex justify-start py-4 pl-12">
                <div className="glass-panel px-5 py-3 rounded-2xl rounded-bl-sm shimmer w-32 h-10"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-snu-yellow/50 to-snu-blue-light/50 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 pl-4 shadow-2xl"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about SNU..."
              className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 py-3 text-sm md:text-base resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 mb-0.5 rounded-xl bg-snu-blue hover:bg-snu-blue-light disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-500">
              SnuGPT can make mistakes. Check important deadlines on the official SNU website.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
