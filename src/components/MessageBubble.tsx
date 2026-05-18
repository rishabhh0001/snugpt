"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShiningText } from "@/components/ui/shining-text";

export interface SourceDocument {
  content: string;
  metadata: { source?: string;[key: string]: unknown };
}

export interface MessageProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
  sources?: SourceDocument[];
}

function getFilename(src: string): string {
  return src.split(/[/\\]/).pop()?.replace(/_/g, " ").replace(/\.md$/i, "") ?? src;
}

export default function MessageBubble({ message }: { message: MessageProps }) {
  const isUser = message.role === "user";
  const isLoader = !isUser && !message.content;
  if (message.role === "system" || message.role === "data") return null;

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
                  <span className="group-hover:text-white transition-colors">
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
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-all cursor-default hover:border-yellow-500/30 hover:text-white"
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
      </div>
    </motion.div>
  );
}
