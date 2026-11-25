"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ThumbsUp, ThumbsDown, Copy, Check, RotateCw, Sparkles } from "lucide-react";
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
  follow_ups?: string[];
  groundedFollowups?: boolean;
}

function getFilename(src: string): string {
  return src.split(/[/\\]/).pop()?.replace(/_/g, " ").replace(/\.md$/i, "") ?? src;
}

function preprocessMarkdown(text: string): string {
  if (!text) return "";

  const lines = text.split("\n");
  const processedLines: string[] = [];
  let inTable = false;
  let expectedPipes = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect if we are in a table
    const isDelimiter = /^\s*\|?\s*(:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(trimmed);

    if (isDelimiter && processedLines.length > 0) {
      inTable = true;
      // Count pipes in the delimiter row to know expected pipes per row
      expectedPipes = (trimmed.match(/\|/g) || []).length;
      processedLines.push(line);
      continue;
    }

    if (inTable) {
      // Check if table has ended: an empty line or a line without any pipes (unless it's a continuation)
      const hasPipes = trimmed.includes("|");

      if (trimmed === "" || (!hasPipes && !/^[a-zA-Z0-9]/.test(trimmed))) {
        inTable = false;
        expectedPipes = 0;
        processedLines.push(line);
        continue;
      }

      const startsWithPipe = trimmed.startsWith("|");
      const pipeCount = (trimmed.match(/\|/g) || []).length;

      // Continuation condition:
      // 1. Doesn't start with a pipe, but has a letter/number (likely cell content text)
      // 2. Starts with a pipe, but has far fewer pipes than expected (broken cell content)
      const isContinuation = !startsWithPipe || (pipeCount < expectedPipes - 1);

      if (isContinuation && processedLines.length > 0) {
        let prev = processedLines.pop()!;
        prev = prev.trimEnd();

        let cleanCurr = trimmed;
        if (prev.endsWith("|") && cleanCurr.startsWith("|")) {
          const lastPipeIndex = prev.lastIndexOf("|");
          const beforeLastPipe = prev.substring(0, lastPipeIndex);
          const afterLastPipe = prev.substring(lastPipeIndex); // "|"

          cleanCurr = cleanCurr.substring(1).trim();

          if (cleanCurr.endsWith("|")) {
            prev = `${beforeLastPipe.trimEnd()} <br /> ${cleanCurr}`;
          } else {
            prev = `${beforeLastPipe.trimEnd()} <br /> ${cleanCurr} ${afterLastPipe}`;
          }
        } else if (prev.endsWith("|")) {
          const lastPipeIndex = prev.lastIndexOf("|");
          if (lastPipeIndex !== -1) {
            const beforeLastPipe = prev.substring(0, lastPipeIndex);
            const afterLastPipe = prev.substring(lastPipeIndex); // "|"

            if (cleanCurr.endsWith("|")) {
              cleanCurr = cleanCurr.substring(0, cleanCurr.length - 1).trimEnd();
            }

            prev = `${beforeLastPipe.trimEnd()} <br /> ${cleanCurr} ${afterLastPipe}`;
          } else {
            prev = `${prev} <br /> ${cleanCurr}`;
          }
        } else {
          prev = `${prev} <br /> ${cleanCurr}`;
        }

        processedLines.push(prev);
      } else {
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join("\n");
}

export default function MessageBubble({
  message,
  chatId,
  onRegenerate,
  onFollowUpClick,
  isLast = false,
  isTyping = false,
}: {
  message: MessageProps;
  chatId?: string;
  onRegenerate?: () => void;
  onFollowUpClick?: (text: string) => void;
  isLast?: boolean;
  isTyping?: boolean;
}) {
  const isUser = message.role === "user";
  const isLoader = !isUser && !message.content;

  // Regex to detect [MAP: Building, Room] tags in assistant responses
  const mapRegex = /\[MAP:\s*([^,\s\]][^,\]]*?)(?:,\s*([^\]]+?))?\]/i;
  const mapMatch = !isUser && message.content ? message.content.match(mapRegex) : null;
  const cleanContent = !isUser && message.content ? message.content.replace(mapRegex, "").trim() : message.content;

  const [activeFeedback, setActiveFeedback] = useState<"up" | "down" | null>(
    message.feedback || null
  );
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);

  if (message.role === "system" || message.role === "data") return null;

  const submitFeedback = async (action: "up" | "down" | "copy" | "regenerate" | "report") => {
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

      if (action === "report") setReport(res.ok ? "Reported" : "Retry report");
      if (!res.ok) {
        console.error("Failed to submit feedback:", await res.text());
      }
    } catch (err) {
      if (action === "report") setReport("Retry report");
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
            <div className={`prose-chat ${isTyping ? "typing-cursor" : ""}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 w-full rounded-xl border border-white/5 bg-zinc-900/10 dark:bg-zinc-950/20">
                      <table className="min-w-full divide-y divide-white/5 text-left border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/[0.02]">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3.5 py-2.5 text-xs font-semibold text-color-text border-b border-white/5 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3.5 py-2.5 text-xs text-color-muted border-b border-white/[0.02] align-top whitespace-normal">
                      {children}
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      {children}
                    </tr>
                  )
                }}
              >
                {preprocessMarkdown(cleanContent)}
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
              <details className="group rounded-xl border border-color-border bg-color-surface">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold select-none"
                  style={{ color: "var(--color-muted)" }}>
                  <BookOpen className="w-3 h-3" />
                  <span className="group-hover:text-color-text transition-colors">
                    Source excerpts · {message.sources.length}
                  </span>
                </summary>
                <div className="grid gap-3 border-t border-color-border p-3">
                  {message.sources.map((src, i) => {
                    const name = typeof src.metadata.title === "string" && src.metadata.title
                      ? src.metadata.title : getFilename(src.metadata.source ?? "Source");
                    const preview = src.content?.trim();
                    return (
                      <div key={i} className="min-w-0 border-l-2 border-amber-400/50 pl-3">
                        <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                          <span className="font-semibold text-color-text">{name}</span>
                          {typeof src.metadata.page === "number" && <span className="whitespace-nowrap text-color-muted">PDF p. {src.metadata.page}</span>}
                          {typeof src.metadata.last_checked === "string" && <span className="text-color-muted">Checked {src.metadata.last_checked}</span>}
                        </div>
                        {preview && <p className="mt-1 break-words text-xs leading-5 text-color-muted">{preview}{preview.length >= 120 ? "…" : ""}</p>}
                      </div>
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
            {chatId && message.id && !isTyping && <button disabled={report === "Reported"} onClick={() => submitFeedback("report")}>{report || "Report incorrect answer"}</button>}
            {message.content !== "This response was stopped." && (
              <>
                <button
                  onClick={handleThumbsUp}
                  title="Helpful"
                  className={`p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center ${activeFeedback === "up" ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" : "hover:text-color-text"
                    }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleThumbsDown}
                  title="Not helpful"
                  className={`p-1.5 rounded-md hover:bg-color-surface-hover transition-all duration-150 active:scale-90 flex items-center justify-center ${activeFeedback === "down" ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" : "hover:text-color-text"
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
        
        {/* Smart Follow-up Questions (Shown after each AI answer) */}
        {!isUser && isLast && !isTyping && (() => {
          const followUps = message.groundedFollowups ? message.follow_ups ?? [] : [];

          if (followUps.length === 0) return null;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 mt-4 pt-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase select-none opacity-80" style={{ color: "var(--color-text-warning, #f2a900)" }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask about these sources</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {followUps.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onFollowUpClick && onFollowUpClick(q)}
                    className="text-left px-3.5 py-2 text-[12.5px] rounded-xl border transition-all hover:bg-yellow-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: "rgba(242,169,0,0.2)",
                      color: "var(--color-text-warning, #f2a900)"
                    }}
                  >
                    <span>{q}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono">↵</span>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </motion.div>
  );
}
