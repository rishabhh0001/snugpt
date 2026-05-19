"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ThumbsUp, ThumbsDown, Copy, Check, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShiningText } from "@/components/ui/shining-text";

export interface SourceDocument {
  content: string;
  metadata: { source?: string;[key: string]: unknown };
}

export interface MessageProps {
  id?: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  sources?: SourceDocument[];
  feedback?: "up" | "down" | null;
}

function getFilename(src: string): string {
  return src.split(/[/\\]/).pop()?.replace(/_/g, " ").replace(/\.md$/i, "") ?? src;
}

export default function MessageBubble({
  message,
  chatId,
  onRegenerate,
}: {
  message: MessageProps;
  chatId?: string;
  onRegenerate?: () => void;
}) {
  const isUser = message.role === "user";
  const isLoader = !isUser && !message.content;

  const [activeFeedback, setActiveFeedback] = useState<"up" | "down" | null>(
    message.feedback || null
  );
  const [copied, setCopied] = useState(false);

  if (message.role === "system" || message.role === "data") return null;

  const submitFeedback = async (action: "up" | "down" | "copy" | "regenerate") => {
    if (!chatId) return;
    try {
      let endpoint = "/api/chat/feedback";
      let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: message.id || null,
          action,
        }),
      });

      if (res.status === 404) {
        endpoint = "/_/backend/api/chat/feedback";
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.id || null,
            action,
          }),
        });
      }

      if (!res.ok) {
        console.error("Failed to submit feedback:", await res.text());
      }
    } catch (err) {
      console.error("Feedback connection error:", err);
    }
  };

  const handleThumbsUp = async () => {
    const newFeedback = activeFeedback === "up" ? null : "up";
    setActiveFeedback(newFeedback);
    if (newFeedback) {
      await submitFeedback("up");
    }
  };

  const handleThumbsDown = async () => {
    const newFeedback = activeFeedback === "down" ? null : "down";
    setActiveFeedback(newFeedback);
    if (newFeedback) {
      await submitFeedback("down");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await submitFeedback("copy");
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleRegenerate = async () => {
    await submitFeedback("regenerate");
    if (onRegenerate) {
      onRegenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-3 py-4 ${isUser ? "justify-end" : "justify-start"} ${isLoader ? "items-center" : ""}`}
    >
      {/* Assistant avatar — user uploaded avatar */}
      {!isUser && (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 overflow-hidden border ${isLoader ? "" : "mt-0.5"}`}
          style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.svg"
            alt="SNUGPT"
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>

        {/* Message content */}
        <div
          className={`rounded-2xl px-4 py-3 text-[13.5px] leading-[1.7] ${isUser
            ? "rounded-br-sm text-white"
            : "rounded-bl-sm"
            }`}
          style={isUser
            ? { background: "var(--color-surface-hover)", color: "var(--color-text)" }
            : { color: "var(--color-text)" }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.content ? (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            /* Typing indicator */
            <div className="py-1 min-w-[120px]">
              <ShiningText text="SNUGPT is thinking..." />
            </div>
          )}
        </div>

        {/* Sources */}
        <AnimatePresence>
          {!isUser && message.sources && message.sources.length > 0 && message.content && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 w-full"
            >
              <details className="group">
                <summary className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold uppercase tracking-widest transition-colors list-none select-none"
                  style={{ color: "var(--color-muted)" }}>
                  <BookOpen className="w-3 h-3" />
                  <span className="group-hover:text-color-text transition-colors">
                    {message.sources.length} source{message.sources.length !== 1 ? "s" : ""}
                  </span>
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.sources.map((src, i) => {
                    const isWeb = src.metadata?.source === "Web Search";
                    const name = isWeb ? "Web Search" : getFilename(src.metadata?.source ?? "Source");
                    const preview = src.content?.slice(0, 60).trim();
                    return (
                      <span
                        key={i}
                        title={preview}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-all cursor-default hover:border-yellow-500/30 hover:text-color-text"
                        style={{
                          background: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-muted)"
                        }}
                      >
                        <span>{isWeb ? "🌐" : "📄"}</span>
                        <span className="truncate font-medium" style={{ maxWidth: "140px" }}>{name}</span>
                      </span>
                    );
                  })}
                </div>
              </details>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Buttons */}
        {!isUser && message.content && (
          <div className="flex items-center gap-2 mt-2 px-0.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
            {message.content !== "This response was stopped." && (
              <>
                <button
                  onClick={handleThumbsUp}
                  title="Helpful"
                  className={`p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center ${
                    activeFeedback === "up" ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" : "hover:text-color-text"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleThumbsDown}
                  title="Not helpful"
                  className={`p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center ${
                    activeFeedback === "down" ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" : "hover:text-color-text"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3 bg-white/[0.08] mx-1" />
              </>
            )}
            <button
              onClick={handleCopy}
              title="Copy answer"
              className="p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center hover:text-color-text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-yellow-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onRegenerate && (
              <button
                onClick={handleRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center hover:text-color-text"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
