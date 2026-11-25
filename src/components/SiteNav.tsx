"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, ChevronDown, FileText, LogOut, Scale, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useProfileSettings } from "@/components/providers";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll as useNavbarScroll } from "@/components/ui/use-scroll";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const { data: session } = useSession();
  const { settings: profileSettings } = useProfileSettings();
  const firstName = (profileSettings?.profileData?.name || session?.user?.name || "User").split(" ")[0];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const infoLinks = [
    {
      title: "About SNUGPT",
      description: "How SNUGPT finds and cites campus sources",
      href: "/about",
      icon: BookOpen,
    },
    {
      title: "Privacy Policy",
      description: "What the app stores and how it uses data",
      href: "/privacy-policy",
      icon: Shield,
    },
    {
      title: "Terms of Service",
      description: "Using SNUGPT for campus information",
      href: "/terms-of-service",
      icon: Scale,
    },
    {
      title: "Apache License",
      description: "Open-source permissions and terms",
      href: "/license",
      icon: FileText,
    }
  ];

  const scrolled = useNavbarScroll(10);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
        <header
          className={cn(
            'fixed z-50 mx-auto w-[calc(100%-2rem)] max-w-[75rem] border border-transparent transition-all duration-300 ease-out left-1/2 -translate-x-1/2 md:rounded-2xl',
            mobileMenuOpen ? 'overflow-hidden' : 'overflow-visible',
            scrolled && !mobileMenuOpen
              ? 'top-4 bg-black/80 border-white/10 backdrop-blur-lg max-w-6xl shadow-[0_0_50px_rgba(0,0,0,0.8)]'
              : 'top-0 border-b border-white/5 bg-transparent'
          )}
        >

          <nav aria-label="Main navigation"
            className={cn(
              'flex h-16 w-full items-center justify-between px-4 transition-all ease-out duration-300',
              scrolled ? 'h-14 px-6' : 'h-20 px-8'
            )}
          >
            <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Image src="/avatar.svg" alt="SNUGPT" width={44} height={44} className="object-cover" priority />
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-base md:text-lg font-black tracking-tighter uppercase leading-tight">SNUGPT</span>
                <span className="text-[6px] md:text-[8px] font-bold text-indigo-400/60 tracking-[0.4em] uppercase">University Intel</span>
              </div>
            </Link>

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                href="/#features"
                className="relative inline-block group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
              >
                {/* Link text */}
                <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                  Features
                </span>
                {/* Top & bottom border animation */}
                <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                {/* Background fill animation */}
                <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
              </Link>

              {/* Info Dropdown wrapper */}
              <div
                className="relative py-2"
                onMouseEnter={() => setInfoDropdownOpen(true)}
                onKeyDown={event => { if (event.key === "Escape") setInfoDropdownOpen(false); }}
                onMouseLeave={() => setInfoDropdownOpen(false)}
              >
                <button
                  type="button" aria-expanded={infoDropdownOpen} onClick={() => setInfoDropdownOpen(open => !open)}
                  className="relative inline-flex items-center gap-1 group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
                >
                  <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                    Info
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/40 relative z-10 group-hover:text-black transition-colors duration-300 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                  <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                </button>

                <AnimatePresence>
                  {infoDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-[calc(100%-4px)] left-1/2 -translate-x-1/2 w-72 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-1 before:content-[''] before:absolute before:inset-x-0 before:-top-6 before:h-6"
                    >
                      {infoLinks.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={i}
                            href={item.href}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60 group-hover:scale-105 group-hover:border-amber-500/20 group-hover:text-amber-400 transition-all duration-300 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors duration-300 font-jakarta">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-white/30 font-medium font-inter leading-tight mt-0.5">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/updates"
                className="relative inline-block group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
              >
                <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                  Updates
                </span>
                <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
              </Link>

              <Link
                href="/contact"
                className="relative inline-block group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
              >
                <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                  Contact Us
                </span>
                <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {session ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 text-white font-bold text-[8px] md:text-[9px] uppercase tracking-widest transition-all active:scale-95 duration-200 cursor-pointer shadow-lg group font-jakarta"
                    >
                      <span>HI, {firstName.toUpperCase()}!</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-amber-400 group-hover:rotate-180 transition-all duration-300" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={8} className="w-64 bg-neutral-950/98 border border-white/10 backdrop-blur-2xl p-2 rounded-2xl shadow-2xl z-50">
                    <div className="px-3 py-2.5 border-b border-white/5 flex flex-col gap-0.5">
                      <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest">Active Session</p>
                      <p className="text-sm font-bold text-white font-jakarta truncate">{profileSettings?.profileData?.name || session.user?.name}</p>
                      <p className="text-[10px] text-white/40 font-inter truncate">{session.user?.email}</p>
                    </div>

                    <div className="p-1 flex flex-col gap-0.5">
                      <Link
                        href="/profile?tab=info"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-amber-400 hover:bg-white/[0.03] transition-all group font-jakarta text-xs font-semibold"
                      >
                        <User className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors" />
                        <span>Profile Info</span>
                      </Link>

                      <button
                        onClick={() => alert("No new notifications")}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-amber-400 hover:bg-white/[0.03] transition-all group font-jakarta text-xs font-semibold w-full text-left cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors" />
                        <span className="flex-1">Notifications</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-mono font-bold tracking-tight">0</span>
                      </button>

                      <Link
                        href="/profile?tab=settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-amber-400 hover:bg-white/[0.03] transition-all group font-jakarta text-xs font-semibold"
                      >
                        <Settings className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="h-px bg-white/5 my-1" />

                    <div className="p-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all group font-jakarta text-xs font-semibold w-full text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl bg-white text-black font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                >
                  Login
                </Link>
              )}

              {/* Mobile menu toggle button */}
              <button
                type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
              >
                <MenuToggleIcon open={mobileMenuOpen} className="w-5 h-5" duration={300} />
              </button>
            </div>
          </nav>



          {/* Mobile menu drawer overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-black/95 border-t border-white/10 overflow-hidden flex flex-col p-6 gap-6 lg:hidden backdrop-blur-3xl"
              >
                <div className="flex flex-col gap-2">
                  {/* Mobile Features */}
                  <Link
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300"
                  >
                    <span className="relative z-10 block text-xs uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                      Features
                    </span>
                    <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                    <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                  </Link>

                  {/* Mobile Updates */}
                  <Link
                    href="/updates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300 font-jakarta"
                  >
                    <span className="relative z-10 block text-xs uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-black transition-colors duration-300">
                      Updates
                    </span>
                    <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                    <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                  </Link>

                  {/* Mobile Contact Us */}
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300 font-jakarta"
                  >
                    <span className="relative z-10 block text-xs uppercase tracking-[0.2em] font-black text-white/40 group-hover:text-black transition-colors duration-300">
                      Contact Us
                    </span>
                    <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                    <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                  </Link>

                  {/* Mobile Info Header */}
                  <div className="px-4 pt-4 pb-2 border-t border-white/5 mt-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20">University Info</span>
                  </div>

                  {/* Mobile Info links */}
                  {infoLinks.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/45 group-hover:text-amber-400 transition-colors shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors font-jakarta">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-white/20 font-medium font-inter mt-0.5 leading-tight">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {session ? (
                  <div className="flex flex-col gap-2 w-full mt-2 pt-4 border-t border-white/5">
                    <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white font-jakarta">{profileSettings?.profileData?.name || session.user?.name}</span>
                        <span className="text-[9px] text-white/40 font-inter mt-0.5 truncate max-w-[200px]">{session.user?.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold tracking-tight uppercase">Online</span>
                    </div>

                    <Link
                      href="/profile?tab=info"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 px-4 rounded-xl hover:bg-white/[0.03] border border-white/5 hover:border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center gap-3"
                    >
                      <User className="w-4 h-4 text-white/40" />
                      Profile Info
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        alert("No new notifications");
                      }}
                      className="w-full py-3.5 px-4 rounded-xl hover:bg-white/[0.03] border border-white/5 hover:border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center gap-3 cursor-pointer text-left font-jakarta"
                    >
                      <Bell className="w-4 h-4 text-white/40" />
                      Notifications (0)
                    </button>

                    <Link
                      href="/profile?tab=settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 px-4 rounded-xl hover:bg-white/[0.03] border border-white/5 hover:border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-white/40" />
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 hover:text-red-300 font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-4 text-center block rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-amber-50 active:scale-95 transition-all"
                  >
                    Login
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </header>
  );
}
