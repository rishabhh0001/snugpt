"use client";
import { useState } from "react";
import type { MessageProps } from "./MessageBubble";
import { getAllConversations } from "@/lib/db";

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ChatTools({messages}: {messages: MessageProps[]}) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  return <details className="relative text-sm"><summary className="cursor-pointer">Chat tools</summary>
    <div className="absolute right-0 z-30 grid w-64 gap-3 rounded-xl border bg-[var(--color-bg)] p-4">
      <button onClick={async () => {try {download("snugpt-history.json", JSON.stringify(await getAllConversations(), null, 2), "application/json")} catch {setStatus("Could not read saved chats.")}}}>Export saved chats</button>
      <button disabled={!messages.length} onClick={()=>{
        const w = window.open("", "_blank");
        if (!w) {setStatus("Allow pop-ups to print this chat."); return}
        w.opener = null;
        w.document.title = "SNU chat";
        for (const m of messages) {
          const p = w.document.createElement("p");
          p.style.whiteSpace = "pre-wrap";
          p.textContent = [m.role, m.content, ...(m.sources ?? []).map(s=>s.metadata.source)].filter(Boolean).join("\n");
          w.document.body.append(p);
        }
        w.print();
      }}>Print chat / save PDF</button>
      <label>Deadline<input className="w-full border" value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} placeholder="Application deadline"/></label>
      <input type="date" aria-label="Deadline date" value={date} onChange={e=>setDate(e.target.value)}/>
      <button disabled={!date || !title.trim()} onClick={()=>{
        const summary=title.trim().replace(/[\\,;]/g, c=>"\\"+c);
        download("deadline.ics", ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SNUGPT//Campus//EN","BEGIN:VEVENT","UID:"+crypto.randomUUID()+"@snugpt","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z","DTSTART;VALUE=DATE:"+date.replaceAll("-",""),"SUMMARY:"+summary,"END:VEVENT","END:VCALENDAR",""].join("\r\n"), "text/calendar");
      }}>Download calendar event</button>
      <small role="status">{status}</small>
    </div></details>
}
