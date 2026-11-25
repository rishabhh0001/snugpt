import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "./SiteNav";

export function SiteArticle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f0e4] text-[#242219]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm text-[#685018]">v1.5 · <time dateTime="2026-11-24">24 November 2026</time></p>
        <h1 className="mt-3 border-b border-[#cfc3a7] pb-6 font-serif text-5xl tracking-tight sm:text-6xl">{title}</h1>
        <div className="mt-7 space-y-7 leading-7 text-[#504a3b] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[#242219]">
          {children}
        </div>
        <nav aria-label="Site information" className="mt-10 flex flex-wrap gap-5 border-t border-[#cfc3a7] pt-5 text-sm">
          <Link href="/about">About</Link><Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-service">Terms</Link><Link href="/license">License</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </main>
    </div>
  );
}
