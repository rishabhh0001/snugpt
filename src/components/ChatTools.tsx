"use client";

import { useState } from "react";
import { CalendarDays, Download, Printer, SlidersHorizontal } from "lucide-react";
import type { MessageProps } from "./MessageBubble";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { getAllConversations } from "@/lib/db";

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function printChat(messages: MessageProps[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  printWindow.opener = null;
  const doc = printWindow.document;
  doc.title = "SNUGPT conversation";
  doc.documentElement.lang = "en";
  const style = doc.createElement("style");
  style.textContent = "body{max-width:44rem;margin:2rem auto;padding:0 1rem;font:15px/1.65 system-ui;color:#201b13} h1,h2{font-family:Georgia,serif} section{border-top:1px solid #c7bfae;padding:1rem 0} p{white-space:pre-wrap;overflow-wrap:anywhere} small{display:block;color:#5c5240}";
  doc.head.append(style);
  const heading = doc.createElement("h1");
  heading.textContent = doc.title;
  doc.body.append(heading);
  for (const message of messages) {
    const section = doc.createElement("section");
    const label = doc.createElement("h2");
    label.textContent = message.role === "user" ? "You" : "SNUGPT";
    const paragraph = doc.createElement("p");
    paragraph.textContent = message.content;
    section.append(label, paragraph);
    for (const source of message.sources ?? []) {
      const note = doc.createElement("small");
      const { title, page, source: filename } = source.metadata;
      const name = typeof title === "string" ? title : filename || "Source";
      note.textContent = typeof page === "number" ? name + " · PDF p. " + page : name;
      section.append(note);
    }
    doc.body.append(section);
  }
  printWindow.focus();
  printWindow.print();
  return true;
}

export function ChatTools({ messages }: { messages: MessageProps[] }) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const actionClass = "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-color-surface-hover disabled:opacity-40";
  const fieldClass = "w-full rounded-lg border border-color-border bg-color-bg px-2.5 py-2 text-sm text-color-text";
  const printable = messages.filter(message => ["user", "assistant"].includes(message.role) && message.content.trim());

  async function exportHistory() {
    try {
      const history = await getAllConversations();
      if (!history.some(chat => chat.messages.length)) {
        setStatus("No saved conversations yet.");
        return;
      }
      download("snugpt-history.json", JSON.stringify(history, null, 2), "application/json");
      setStatus("Chat history downloaded.");
    } catch {
      setStatus("Could not read saved conversations.");
    }
  }

  function saveDeadline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !title.trim()) return;
    const summary = title.trim().replace(/[\\,;]/g, character => "\\" + character);
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const eventLines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SNUGPT//Campus//EN",
      "BEGIN:VEVENT", "UID:" + crypto.randomUUID() + "@snugpt", "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + date.replaceAll("-", ""), "SUMMARY:" + summary,
      "END:VEVENT", "END:VCALENDAR", "",
    ];
    download("snugpt-deadline.ics", eventLines.join("\r\n"), "text/calendar;charset=utf-8");
    setStatus("Calendar file downloaded. Open it in your calendar app.");
  }

  return (
    <Popover onOpenChange={() => setStatus("")}>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Chat tools" className="flex items-center gap-2 rounded-lg border border-color-border px-2.5 py-2 text-xs font-semibold hover:bg-color-surface-hover">
          <SlidersHorizontal className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Chat tools</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={9} aria-label="Chat tools" className="max-h-[var(--radix-popover-content-available-height)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border-color-border bg-color-surface p-3.5 text-color-text">
        <h2 className="px-2 text-sm font-bold">Chat tools</h2>
        <div className="mt-2 grid gap-0.5">
          <button type="button" className={actionClass} onClick={exportHistory}><Download className="size-4 text-color-muted" aria-hidden="true" /> Export browser history</button>
          <button type="button" className={actionClass} disabled={!printable.length}
            onClick={() => setStatus(printChat(printable) ? "Print view opened." : "Allow pop-ups to print this chat.")}>
            <Printer className="size-4 text-color-muted" aria-hidden="true" /> Print current chat / save PDF
          </button>
        </div>
        <form onSubmit={saveDeadline} className="mt-3 grid gap-2 border-t border-color-border pt-3">
          <h3 className="text-xs font-bold">Calendar deadline</h3>
          <label className="grid gap-1 text-xs text-color-muted">Event title
            <input className={fieldClass} value={title} maxLength={100} onChange={event => setTitle(event.target.value)} placeholder="Application deadline" required />
          </label>
          <label className="grid gap-1 text-xs text-color-muted">Date
            <input className={fieldClass} type="date" value={date} onChange={event => setDate(event.target.value)} required />
          </label>
          <button type="submit" disabled={!date || !title.trim()} className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#f3cc55] px-3 py-2 text-xs font-bold text-[#211b0d] disabled:opacity-45">
            <CalendarDays className="size-4" aria-hidden="true" /> Download calendar event
          </button>
        </form>
        {status && <p role="status" className="mt-2 text-xs leading-5 text-color-muted">{status}</p>}
      </PopoverContent>
    </Popover>
  );
}
