"use client";

import { User, Sparkles, BookOpen } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
    <div className={cn("flex w-full gap-4 py-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-snu-yellow/20 border border-snu-yellow/30 flex-shrink-0 flex items-center justify-center mt-1">
          <Sparkles className="w-4 h-4 text-snu-yellow" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
          isUser
            ? "bg-snu-blue text-white rounded-br-sm shadow-md"
            : "glass-panel rounded-bl-sm"
        )}
      >
        {/* Basic text rendering. In a full app, use react-markdown here */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Sources Citation Accordion */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors list-none">
                <BookOpen className="w-3 h-3" />
                <span>View {message.sources.length} sources</span>
              </summary>
              <div className="mt-3 space-y-2">
                {message.sources.map((source, idx) => (
                  <div key={idx} className="bg-black/30 rounded-md p-3 text-xs border border-white/5">
                    <div className="font-medium text-snu-yellow mb-1">
                      {source.metadata?.source?.split('/').pop() || "Unknown Source"}
                    </div>
                    <div className="text-slate-400 line-clamp-2">"{source.content}"</div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}
