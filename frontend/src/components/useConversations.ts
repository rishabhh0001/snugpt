"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageProps } from "./MessageBubble";

export interface Conversation {
  id: string;
  title: string;
  messages: MessageProps[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "snugpt_conversations";
const MAX_CONVERSATIONS = 50;

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromMessages(messages: MessageProps[]): string {
  const first = messages.find((m) => m.role === "user");
  return first ? first.content.slice(0, 48) + (first.content.length > 48 ? "…" : "") : "New conversation";
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Conversation[] = JSON.parse(raw);
        setConversations(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } else {
        // First visit — create a blank conversation
        const blank = newConversation();
        setConversations([blank]);
        setActiveId(blank.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([blank]));
      }
    } catch {
      const blank = newConversation();
      setConversations([blank]);
      setActiveId(blank.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function newConversation(): Conversation {
    return { id: genId(), title: "New conversation", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
  }

  const save = useCallback((updated: Conversation[]) => {
    const trimmed = updated.slice(0, MAX_CONVERSATIONS);
    setConversations(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }, []);

  const createNew = useCallback(() => {
    const c = newConversation();
    setConversations((prev) => {
      const next = [c, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_CONVERSATIONS)));
      return next;
    });
    setActiveId(c.id);
    return c.id;
  }, []);

  const updateMessages = useCallback((id: string, messages: MessageProps[]) => {
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? { ...c, messages, title: titleFromMessages(messages), updatedAt: Date.now() }
          : c
      );
      
      // Debounce the localStorage save to prevent lag during fast token streaming
      if ((window as any)._saveTimeout) clearTimeout((window as any)._saveTimeout);
      (window as any)._saveTimeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_CONVERSATIONS)));
      }, 500);
      
      return next;
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActiveId((prev) => {
      if (prev === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      }
      return prev;
    });
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return { conversations, activeId, activeConversation, setActiveId, createNew, updateMessages, deleteConversation, save };
}
