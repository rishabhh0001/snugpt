"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePen, ShieldCheck, UploadCloud, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble, { MessageProps } from "./MessageBubble";
import { useConversations } from "./useConversations";
import Sidebar from "./Sidebar";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";
import Link from "next/link";
import { useSession } from "next-auth/react";


export default function ChatInterface() {
  const { conversations, activeId, activeConversation, setActiveId, createNew, updateMessages, deleteConversation } =
    useConversations();

  const [isLoading, setIsLoading] = useState(false);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTitle, setAdminTitle] = useState("");
  const [adminContent, setAdminContent] = useState("");
  const [isAdminUploading, setIsAdminUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

  useEffect(() => {
    async function checkAdminStatus() {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/admin-check`
          : "/_/backend/api/auth/admin-check";
        const res = await fetch(`${backendUrl}?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.is_admin);
        }
      } catch (err) {
        console.error("Admin status check failed:", err);
      }
    }
    checkAdminStatus();
  }, [session]);

  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || !adminContent.trim() || !session?.user?.email) return;

    setIsAdminUploading(true);
    setUploadStatus({ type: null, msg: "" });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload-knowledge`
        : "/_/backend/api/admin/upload-knowledge";

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          title: adminTitle,
          content: adminContent
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: "success", msg: data.message || "Knowledge uploaded successfully!" });
        setAdminTitle("");
        setAdminContent("");
      } else {
        setUploadStatus({ type: "error", msg: data.detail || "Failed to upload knowledge." });
      }
    } catch (err: any) {
      setUploadStatus({ type: "error", msg: err.message || "A network error occurred." });
    } finally {
      setIsAdminUploading(false);
    }
  };

  const messages: MessageProps[] = activeConversation?.messages ?? [];

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  
  useEffect(() => {
    scrollToBottom(isLoading ? "auto" : "smooth");
  }, [messages, isLoading]);

  // Online / Offline Status Detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const goOnline = () => setIsOnline(true);
      const goOffline = () => setIsOnline(false);
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);
      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
  }, []);

  // Keyboard shortcuts (Cmd+K / Ctrl+K for a new chat)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNew();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [conversations]);

  // Local Offline Scoring and Search Handler
  const performOfflineSearch = async (queryText: string): Promise<string> => {
    try {
      const { getAllMaterials, getAllConversations } = await import("@/lib/db");
      const queryTokens = queryText.toLowerCase().split(/\W+/).filter(Boolean);
      if (queryTokens.length === 0) return "Please enter a valid search query.";

      const [materials, localConvs] = await Promise.all([
        getAllMaterials(),
        getAllConversations()
      ]);

      interface ScoredItem {
        title: string;
        content: string;
        source: string;
        score: number;
      }

      const scoredItems: ScoredItem[] = [];

      // Score cached study materials / sources
      for (const m of materials) {
        let score = 0;
        const contentLower = m.content.toLowerCase();
        const titleLower = m.title.toLowerCase();

        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 12; // massive boost for title match
          const count = contentLower.split(token).length - 1;
          score += count * 2; // term frequency boost
        }

        if (score > 0) {
          scoredItems.push({
            title: m.title,
            content: m.content,
            source: m.source,
            score: score
          });
        }
      }

      // Score cached historical chats
      for (const c of localConvs) {
        if (c.id === activeId) continue; // Skip active conversation content
        for (const msg of c.messages) {
          if (msg.role !== "assistant") continue;
          let score = 0;
          const contentLower = msg.content.toLowerCase();

          for (const token of queryTokens) {
            const count = contentLower.split(token).length - 1;
            score += count * 1.5; // score boost for chat matching
          }

          if (score > 0) {
            scoredItems.push({
              title: `Historical Chat: ${c.title}`,
              content: msg.content,
              source: "chat_history",
              score: score
            });
          }
        }
      }

      // Sort by score descending
      scoredItems.sort((a, b) => b.score - a.score);

      if (scoredItems.length === 0) {
        return "No matching offline documents or historical chats were found in your local database cache.\n\nPlease connect to the campus Wi-Fi network to query the complete knowledge base!";
      }

      let responseText = "📶 **[Offline Retrieval]** You are currently disconnected from the campus network. SNUGPT searched your browser's offline IndexedDB cache and retrieved the most relevant matching sections:\n\n";

      // Select top 3 items
      const topItems = scoredItems.slice(0, 3);
      for (const item of topItems) {
        responseText += `### 📚 ${item.title}\n`;
        responseText += `*Cached from: ${item.source}*\n\n`;
        responseText += `${item.content}\n\n---\n\n`;
      }

      return responseText;
    } catch (e) {
      console.error("Local search failed:", e);
      return "I encountered an error searching the local database cache. Please check your connection and try again.";
    }
  };

  const handleSubmit = async (
    e?: React.FormEvent,
    customQuery?: string,
    historyOverride?: MessageProps[],
    isRegenerate?: boolean,
    previousResponse?: string,
    isWebSearch: boolean = false
  ) => {
    e?.preventDefault();
    const queryText = (customQuery || "").trim();
    if (!queryText || isLoading) return;

    let convId = activeId;
    if (!convId) convId = createNew();

    const userMsg: MessageProps = { role: "user", content: queryText };
    const placeholderMsg: MessageProps = { role: "assistant", content: "", sources: [] };
    const baseMessages = historyOverride !== undefined ? historyOverride : messages;
    const nextMessages: MessageProps[] = [...baseMessages, userMsg, placeholderMsg];

    updateMessages(convId, nextMessages);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // ── Local Interceptor for Offline Mode ──
    if (!isOnline) {
      try {
        const offlineMsg = await performOfflineSearch(queryText);
        const words = offlineMsg.split(" ");
        let currentContent = "";
        
        for (let i = 0; i < words.length; i++) {
          if (abortController.signal.aborted) {
            currentContent += " *[stopped]*";
            break;
          }
          currentContent += words[i] + " ";
          const updated = [...nextMessages];
          updated[updated.length - 1] = {
            role: "assistant",
            content: currentContent.trim(),
            sources: []
          };
          updateMessages(convId, updated);
          await new Promise((r) => setTimeout(r, 12)); // smooth local typing simulation (12ms)
        }
      } catch (offlineErr) {
        console.error("Offline execution failure:", offlineErr);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
      return;
    }

    let current = [...nextMessages];
    try {
      // Bypass Next.js Edge proxy to prevent "Network connection lost" timeouts on slow LLM TTFB.
      // Connect directly to the FastAPI backend (local or production).
      let endpoint = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`
        : "/_/backend/api/chat";
        
      let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          query: queryText,
          session_id: convId,
          history: baseMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          regenerate: !!isRegenerate,
          previous_response: previousResponse || undefined,
          web_search: isWebSearch,
          user_email: session?.user?.email || undefined,
        }),
      });

      if (!res.ok) {
        const rawText = await res.text();
        console.error("DEBUG: Raw Backend Response:", rawText);
        let errorData;
        try {
          errorData = JSON.parse(rawText);
        } catch (e) {
          errorData = { error: rawText };
        }
        const isHtml = rawText.trimStart().startsWith("<!");
        throw new Error(
          isHtml
            ? "Chat API is unavailable. Redeploy the latest version and try again."
            : errorData.error || errorData.detail || `Backend error: ${res.status}`
        );
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;
      current = [...nextMessages];

      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "done") { streamDone = true; break; }

              const updated = [...current];
              const last = updated[updated.length - 1];
              if (!last || last.role !== "assistant") continue;

              if (data.type === "message_id") last.id = data.id;
              else if (data.type === "sources") last.sources = data.data;
              else if (data.type === "chunk" && data.text) last.content += data.text;

              current = updated;
              updateMessages(convId!, current);
            } catch { /* skip malformed */ }
          }
        }
      }

      // Fallback if no content streamed
      const finalMsgs = [...current];
      const last = finalMsgs[finalMsgs.length - 1];
      if (last?.role === "assistant" && !last.content.trim()) {
        last.content = "I'm having trouble generating a response right now. Please try again.";
        updateMessages(convId!, finalMsgs);
      }

      // ── Auto-Caching Retrieved Sources into Offline Library ──
      if (last && last.role === "assistant" && last.sources && last.sources.length > 0) {
        try {
          const { saveMaterial } = await import("@/lib/db");
          for (const src of last.sources) {
            const title = src.metadata?.source?.split("/")?.pop()?.split("\\")?.pop() || "Handbook Document";
            const id = src.metadata?.id || `${Date.now()}-${Math.random()}`;
            await saveMaterial({
              id: String(id),
              title: title,
              content: src.content || "",
              source: src.metadata?.source || "snu_knowledge",
              timestamp: Date.now()
            });
          }
          console.info(`Auto-cached ${last.sources.length} sources to IndexedDB offline storage.`);
        } catch (cacheErr) {
          console.error("Auto-caching failed:", cacheErr);
        }
      }

    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Generation stopped by user.");
        const updated = [...current];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant") {
          last.content = "This response was stopped.";
        }
        updateMessages(convId!, updated);
      } else {
        console.error("Chat error:", err);
        const errMsgs = [...messages, userMsg, {
          role: "assistant" as const,
          content: "I encountered a connection error. Please try again.",
        }];
        updateMessages(convId!, errMsgs);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNew = () => {
    createNew();
    setSidebarOpen(false);
  };

  const handleSendMessage = ({ input: queryText, webSearch: isWebSearch }: { input: string; webSearch: boolean }) => {
    handleSubmit(undefined, queryText, undefined, false, undefined, isWebSearch);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0 border-r" style={{ borderColor: "var(--color-border)" }}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={deleteConversation}
        />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-72"
            >
              <Sidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={deleteConversation}
                mobile
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-color-surface-hover transition-all active:scale-90 text-color-muted hover:text-color-text"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile logo (visible when sidebar hidden) */}
          <Link href="/" className="md:hidden flex items-center gap-2 hover:opacity-85 transition-opacity">
            <div className="w-6 h-6 rounded-full overflow-hidden border" style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.svg" alt="SNUGPT" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-color-text">SNUGPT</span>
          </Link>

          {/* Offline Pill Indicator */}
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border shadow-sm select-none"
              style={{
                background: "rgba(242, 169, 0, 0.08)",
                borderColor: "rgba(242, 169, 0, 0.3)",
                color: "var(--color-text-warning, #f2a900)"
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#f2a900" }}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#f2a900" }}></span>
              </span>
              Offline Mode • Local DB
            </motion.div>
          )}

          <div className="flex-1" />

          <button
            onClick={handleNew}
            title="New chat"
            className="p-1.5 rounded-lg transition-all active:scale-90 hover:bg-color-surface-hover text-color-muted hover:text-color-text"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-3 md:px-4 pb-8 md:pb-12">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 text-center px-4 py-8 pt-10 md:pt-20"
                >
                  {/* SNU Logo large */}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mb-4 md:mb-6 border-2 shadow-xl"
                    style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/avatar.svg"
                      alt="SNUGPT logo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h2 className="text-xl md:text-3xl font-bold text-color-text mb-1 md:mb-2">
                    How can I assist your SNU journey today?
                  </h2>
                  <p className="text-xs md:text-sm mb-6 md:mb-10" style={{ color: "var(--color-muted)" }}>
                    Query university student handbooks, policy manuals, and ERP guides in real-time.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={i}
                      message={msg}
                      chatId={activeId || undefined}
                      isLast={i === messages.length - 1}
                      isTyping={isLoading && i === messages.length - 1}
                      onRegenerate={
                        msg.role === "assistant" && i > 0
                          ? () => {
                              const userPrompt = messages[i - 1];
                              if (userPrompt && userPrompt.role === "user") {
                                const baseHistory = messages.slice(0, i - 1);
                                handleSubmit(undefined, userPrompt.content, baseHistory, true, msg.content, webSearchActive);
                              }
                            }
                          : undefined
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Admin Knowledge Portal Panel */}
        {isAdmin && (
          <div className="max-w-3xl mx-auto w-full px-2 sm:px-4 z-20 pb-2">
            <div className="rounded-2xl border transition-all duration-300 backdrop-blur-xl overflow-hidden shadow-2xl"
              style={{
                borderColor: showAdminPanel ? "rgba(242, 169, 0, 0.4)" : "var(--color-border)",
                background: showAdminPanel ? "rgba(10, 10, 10, 0.95)" : "rgba(255, 255, 255, 0.02)"
              }}>
              
              {/* Header Toggle */}
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.02]"
                style={{ color: showAdminPanel ? "var(--color-snu-yellow)" : "var(--color-muted)" }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${showAdminPanel ? "text-amber-500 animate-pulse" : "text-color-muted"}`} />
                  <span>🛡️ Admin Knowledge Portal (ChromaDB Cloud)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {showAdminPanel ? "Collapse" : "Expand"}
                </span>
              </button>

              {/* Collapsible Form */}
              <AnimatePresence>
                {showAdminPanel && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleAdminUpload}
                    className="p-4 border-t space-y-3.5"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-color-muted">Document Title or Section</label>
                      <input
                        type="text"
                        placeholder="e.g. SNU Sports Complex Timings Expansion"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        required
                        disabled={isAdminUploading}
                        className="w-full text-sm rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 focus:outline-none focus:border-amber-500/50 text-color-text placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-color-muted">Knowledge Content / Policy Details</label>
                      <textarea
                        placeholder="Paste or write university rules, campus guidelines, or handbook sections here..."
                        value={adminContent}
                        onChange={(e) => setAdminContent(e.target.value)}
                        required
                        rows={4}
                        disabled={isAdminUploading}
                        className="w-full text-sm rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 focus:outline-none focus:border-amber-500/50 text-color-text placeholder:text-white/20 resize-none"
                      />
                    </div>

                    {/* Status Alert */}
                    {uploadStatus.type && (
                      <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-semibold ${
                        uploadStatus.type === "success" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                        {uploadStatus.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <span>{uploadStatus.msg}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-1.5">
                      <button
                        type="submit"
                        disabled={isAdminUploading || !adminTitle.trim() || !adminContent.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 bg-[#f2a900] text-[#002e5b] hover:bg-[#cc8e00] disabled:bg-white/5 disabled:text-white/20 disabled:border-transparent active:scale-95 cursor-pointer shadow-lg border-none"
                      >
                        {isAdminUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Indexing...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Ingest to ChromaDB
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-2 sm:px-4 pb-3 sm:pb-4 pt-1.5 sm:pt-2 relative"
          style={{ background: "linear-gradient(to top, var(--color-bg) 70%, transparent)" }}>
          <div className="max-w-3xl mx-auto relative">
            <PureMultimodalInput
              chatId={activeId || "new-chat"}
              messages={messages.map((m, i) => ({ id: `${i}`, content: m.content, role: m.role }))}
              webSearchActive={webSearchActive}
              setWebSearchActive={setWebSearchActive}
              onSendMessage={handleSendMessage}
              onStopGenerating={handleStop}
              isGenerating={isLoading}
              canSend={!isLoading}
              selectedVisibilityType="private"
            />
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--color-muted)" }}>
              SNUGPT is an unofficial student assistant and can make mistakes. Verify critical info on{" "}
              <a href="https://snu.edu.in" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-color-text transition-colors">
                snu.edu.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
