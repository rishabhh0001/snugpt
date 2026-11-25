"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/#features", label: "Explore topics" },
  { href: "/about", label: "About" },
  { href: "/updates", label: "Updates" },
];

export function SiteNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#171713] text-[#faf6e9]">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight">
          <Image src="/avatar.svg" width={30} height={30} alt="" className="rounded-md bg-white" />
          <span>SNUGPT</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-white/75 md:flex">
          {links.map(link => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          {status !== "loading" && (
            session ? (
              <details className="relative hidden text-sm md:block">
                <summary className="cursor-pointer text-white/80">Account</summary>
                <div className="absolute right-0 mt-3 grid min-w-36 gap-3 rounded-lg border border-white/15 bg-[#23231d] p-3">
                  <Link href="/profile">Profile</Link>
                  <button type="button" className="text-left" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
                </div>
              </details>
            ) : <Link href="/login" className="hidden text-sm text-white/80 hover:text-white md:block">Sign in</Link>
          )}
          <Link href="/chat" className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3cc55] px-3 py-2 text-sm font-bold text-[#211b0d] hover:bg-[#ffe18b] sm:px-4">
            Open chat <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <button ref={toggle} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}
            aria-controls="mobile-site-nav" className="grid size-9 place-items-center rounded-lg border border-white/20 md:hidden"
            onClick={() => setOpen(value => !value)}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-site-nav" className="absolute inset-x-0 top-full grid gap-1 border-b border-white/15 bg-[#171713] px-5 py-3 md:hidden">
          {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 hover:bg-white/10">{link.label}</Link>)}
          <Link href={session ? "/profile" : "/login"} onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 hover:bg-white/10">{session ? "Profile" : "Sign in"}</Link>
          {session && <button className="px-2 py-2.5 text-left" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>}
        </div>
      )}
    </header>
  );
}
