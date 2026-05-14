"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  if (message.role === "system" || message.role === "data") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-3 py-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant avatar — Rishabh's avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden mt-0.5 border"
          style={{ borderColor: "rgba(242,169,0,0.3)", background: "#1a1a1a" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://github.com/rishabhh0001.png"
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
            <div className="flex gap-1 py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-blink"
                  style={{ background: "var(--color-snu-yellow)", animationDelay: `${i * 0.2}s` }}
                />
              ))}
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
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-colors cursor-default"
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
