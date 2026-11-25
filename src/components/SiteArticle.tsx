import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "./SiteNav";

export function SiteArticle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#050505] font-jakarta text-[#ededed] selection:bg-amber-500/30">
      <SiteNav />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(242,169,0,0.10),transparent_68%)]" />
      <main className="relative mx-auto max-w-4xl px-5 pb-14 pt-32 sm:px-8 sm:pt-40">
        <p className="font-mono text-xs font-semibold text-amber-400">v1.5 · <time dateTime="2026-11-24">24 November 2026</time></p>
        <h1 className="mt-3 border-b border-white/10 pb-6 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
        <div className="mt-7 space-y-4 text-sm leading-7 text-neutral-300 sm:text-base [&_a]:text-amber-300 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-50 [&_section]:rounded-2xl [&_section]:border [&_section]:border-white/10 [&_section]:bg-white/[0.025] [&_section]:p-5 sm:[&_section]:p-7">
          {children}
        </div>
        <nav aria-label="Site information" className="mt-10 flex flex-wrap gap-5 border-t border-white/10 pt-5 text-sm text-neutral-300 [&_a:hover]:text-amber-300">
          <Link href="/about">About</Link><Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-service">Terms</Link><Link href="/license">License</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </main>
    </div>
  );
}
