"use client";

import { User, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SourceDocument {
  content: string;
  metadata: {
    source?: string;
    [key: string]: any;
  };
}

export interface MessageProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
  sources?: SourceDocument[];
}

export default function MessageBubble({ message }: { message: MessageProps }) {
  const isUser = message.role === "user";

  if (message.role === "system" || message.role === "data") return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex w-full gap-3 md:gap-4 py-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-snu-yellow/30 to-snu-yellow/10 border border-snu-yellow/20 flex-shrink-0 flex items-center justify-center mt-1 shadow-lg">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-snu-yellow animate-pulse" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[90%] md:max-w-[82%] rounded-2xl px-4 py-3 text-[13px] md:text-sm leading-relaxed transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-snu-blue to-snu-blue-light text-white rounded-br-none shadow-[0_10px_25px_-5px_rgba(0,46,91,0.4)]"
            : "glass-panel rounded-bl-none hover:border-white/20"
        )}
      >
        <div className="min-w-0">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-snu-yellow underline underline-offset-2 hover:text-yellow-300 transition-colors font-medium break-all"
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-[13px] md:text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                code: ({ children }) => <code className="bg-white/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <div className="flex gap-1 py-1">
              <span className="w-1.5 h-1.5 bg-snu-yellow/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-snu-yellow/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-snu-yellow/50 rounded-full animate-bounce"></span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {!isUser && message.sources && message.sources.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-3 border-t border-white/5"
            >
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-snu-yellow transition-colors list-none">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span>References ({message.sources.length})</span>
                  <div className="ml-auto w-4 h-4 rounded-full border border-white/10 flex items-center justify-center group-open:rotate-180 transition-transform">
                    <ExternalLink className="w-2 h-2" />
                  </div>
                </summary>
                <div className="mt-4 space-y-3">
                  {message.sources.map((source, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/[0.03] rounded-xl p-3 text-xs border border-white/5 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="font-bold text-snu-yellow mb-1.5 flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-snu-yellow rounded-full"></div>
                        {source.metadata?.source
                          ? source.metadata.source === "Web Search"
                            ? "🌐 Web Search"
                            : source.metadata.source.split(/[\\/]/).pop()?.replace(/_/g, ' ').replace('.md', '') || source.metadata.source
                          : "Document Source"}
                      </div>
                      <div className="text-slate-400 leading-relaxed italic">
                        "{source.content}"
                      </div>
                    </motion.div>
                  ))}
                </div>
              </details>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isUser && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-800/50 border border-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
          <User className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
        </div>
      )}
    </motion.div>
  );
}
