import ChatInterface from "@/components/ChatInterface";
import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 max-w-5xl mx-auto w-full">
      <header className="w-full flex items-center gap-3 py-6 mb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-snu-yellow flex items-center justify-center shadow-[0_0_15px_rgba(242,169,0,0.4)]">
          <GraduationCap className="text-snu-blue w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SnuGPT</h1>
          <p className="text-sm text-slate-400">Shiv Nadar University AI Assistant</p>
        </div>
      </header>

      <div className="flex-1 w-full relative">
        <ChatInterface />
      </div>

      <footer className="w-full text-center py-4 mt-2 border-t border-white/5">
        <p className="text-xs text-slate-500">
          Built with ❤️ by{" "}
          <a
            href="https://github.com/rishabhh0001"
            target="_blank"
            rel="noopener noreferrer"
            className="text-snu-yellow hover:text-yellow-300 transition-colors font-medium"
          >
            Rishabh Joshi
          </a>
          {" · "}Not affiliated with Shiv Nadar University
        </p>
      </footer>
    </main>
  );
}
