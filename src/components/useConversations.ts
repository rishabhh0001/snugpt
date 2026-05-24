"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageProps } from "./MessageBubble";
import {
  type Conversation,
  getAllConversations,
  saveConversation,
  deleteConversationFromDB
} from "@/lib/db";

export type { Conversation };

const STORAGE_KEY = "snugpt_conversations";
const MAX_CONVERSATIONS = 50;

function genId() {
  return crypto.randomUUID();
}

function titleFromMessages(messages: MessageProps[]): string {
  const first = messages.find((m) => m.role === "user");
  return first ? first.content.slice(0, 48) + (first.content.length > 48 ? "…" : "") : "New conversation";
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from IndexedDB on mount with dynamic localStorage fallback migration
  useEffect(() => {
    async function load() {
      try {
        // 1. Fetch from IndexedDB
        let parsed = await getAllConversations();
        
        // 2. Check if IndexedDB is empty and migration is needed
        if (parsed.length === 0 && typeof window !== "undefined") {
          const rawLegacy = localStorage.getItem(STORAGE_KEY);
          if (rawLegacy) {
            try {
              const legacyConvs: Conversation[] = JSON.parse(rawLegacy);
              if (legacyConvs.length > 0) {
                console.info("Migrating legacy localStorage chat histories to IndexedDB...");
                // Write all legacy conversations to IndexedDB
                for (const c of legacyConvs) {
                  await saveConversation(c);
                }
                // Fetch migrated list
                parsed = await getAllConversations();
                // Clean up legacy key
                localStorage.removeItem(STORAGE_KEY);
              }
            } catch (err) {
              console.error("Failed to migrate legacy chat history:", err);
            }
          }
        }

        // 3. Fallback to initializing a blank conversation if empty
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
        } else {
          const blank = newConversation();
          setConversations([blank]);
          setActiveId(blank.id);
          await saveConversation(blank);
        }
      } catch (err) {
        console.error("Failed to load conversations from IndexedDB:", err);
        // Fallback to memory
        const blank = newConversation();
        setConversations([blank]);
        setActiveId(blank.id);
      }
    }
    load();
  }, []);

  function newConversation(): Conversation {
    return { id: genId(), title: "New conversation", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
  }

  const createNew = useCallback(() => {
    const c = newConversation();
    setConversations((prev) => {
      const next = [c, ...prev].slice(0, MAX_CONVERSATIONS);
      saveConversation(c).catch((e) => console.error("Failed to save new conversation:", e));
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
      
      const updatedConv = next.find((c) => c.id === id);
      if (updatedConv) {
        saveConversation(updatedConv).catch((e) => console.error("Failed to update messages in DB:", e));
      }
      
      return next;
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      
      deleteConversationFromDB(id).catch((e) => console.error("Failed to delete conversation from DB:", e));
      
      setActiveId((currentActive) => {
        if (currentActive === id) {
          return next[0]?.id ?? null;
        }
        return currentActive;
      });
      
      return next;
    });
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return { conversations, activeId, activeConversation, setActiveId, createNew, updateMessages, deleteConversation };
}
