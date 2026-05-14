"use client";

import { Calendar, Book, Building, Wifi, ArrowRight } from "lucide-react";

interface QuickActionsProps {
  onSelect: (query: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const actions = [
    {
      title: "Admissions",
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      queries: ["What are the admission deadlines?", "What is the fee structure?"]
    },
    {
      title: "Academics",
      icon: <Book className="w-5 h-5 text-green-400" />,
      queries: ["Where can I find the course catalog?", "How do I contact my HOD?"]
    },
    {
      title: "Campus Life",
      icon: <Building className="w-5 h-5 text-purple-400" />,
      queries: ["What are the library timings?", "Tell me about hostel facilities"]
    },
    {
      title: "IT Support",
      icon: <Wifi className="w-5 h-5 text-amber-400" />,
      queries: ["How do I connect to campus Wi-Fi?", "Reset student portal password"]
    }
  ];

  return (
    <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((category, i) => (
        <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/5">
              {category.icon}
            </div>
            <h3 className="font-medium text-slate-200">{category.title}</h3>
          </div>
          <div className="space-y-2">
            {category.queries.map((q, j) => (
              <button
                key={j}
                onClick={() => onSelect(q)}
                className="w-full text-left text-sm text-slate-400 hover:text-snu-yellow bg-black/20 hover:bg-black/40 p-3 rounded-xl transition-colors flex items-center justify-between group"
              >
                <span className="truncate pr-2">{q}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
