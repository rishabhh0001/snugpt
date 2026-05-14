"use client";

import { useState } from "react";
import { Plus, MessageSquare, Trash2, GraduationCap, X, ChevronRight } from "lucide-react";
import { Conversation } from "./useConversations";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  mobile?: boolean;
  onClose?: () => void;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, mobile, onClose }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}
      style={{ background: "var(--color-sidebar)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "var(--color-snu-yellow)" }}>
            <GraduationCap className="w-4 h-4" style={{ color: "var(--color-snu-blue)" }} />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">SnuGPT</span>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.06] text-gray-300 hover:text-white border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          New chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {conversations.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--color-muted)" }}>
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="group relative flex items-center rounded-xl cursor-pointer transition-all"
              style={{
                background: conv.id === activeId ? "var(--color-surface-hover)" : "transparent",
              }}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-start gap-2.5 px-3 py-2.5 flex-1 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: conv.id === activeId ? "var(--color-snu-yellow)" : "var(--color-muted)" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate text-gray-300 group-hover:text-white transition-colors leading-tight">
                    {conv.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {timeAgo(conv.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Delete button */}
              {(hoveredId === conv.id || conv.id === activeId) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="absolute right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
                  style={{ color: "var(--color-muted)" }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <a
          href="https://github.com/rishabhh0001"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] transition-colors"
          style={{ color: "var(--color-muted)" }}
        >
          <ChevronRight className="w-3 h-3" />
          Built by Rishabh Joshi
        </a>
      </div>
    </aside>
  );
}
