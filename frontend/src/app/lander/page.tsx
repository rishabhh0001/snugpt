"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { Search, Sparkles, Command, Database, Zap, Share2, MessageSquare, ChevronRight, Layers, LayoutDashboard, Globe, Download, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

// ── Components ──

const MouseFollowGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 opacity-40"
      style={{
        background: useTransform(
          [mouseX, mouseY],
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(79, 70, 229, 0.15), transparent 80%)`
        ),
      }}
    />
  );
};

const BentoCard = ({ children, className = "", title, description, icon: Icon, delay = 0 }: any) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ delay }}
      className={`relative group rounded-3xl border border-white/10 bg-white/[0.02] p-8 overflow-hidden hover:border-indigo-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 h-full flex flex-col">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20">
            <Icon className="w-6 h-6 text-white/80 group-hover:text-indigo-400 transition-colors" />
          </div>
        )}
        <h3 className="text-2xl font-semibold mb-3 text-white/90 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-white/40 leading-relaxed mb-6 group-hover:text-white/60 transition-colors">{description}</p>
        <div className="mt-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default function Lander() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans overflow-x-hidden selection:bg-indigo-500/30">
      <MouseFollowGlow />

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 font-bold text-xl tracking-tighter"
          >
            <div className="relative">
              <Image src="/avatar.png" alt="SNUGPT Logo" width={32} height={32} className="rounded-xl border border-white/10 shadow-2xl" />
              <div className="absolute -inset-1 bg-indigo-500/20 blur-md rounded-full -z-10" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">SNUGPT</span>
            <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">Beta</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-8 text-sm font-medium"
          >
            <div className="hidden md:flex items-center gap-8 text-white/40">
              <Link href="#" className="hover:text-white transition-all hover:scale-105">Features</Link>
              <Link href="#" className="hover:text-white transition-all hover:scale-105">Pricing</Link>
              <Link href="#" className="hover:text-white transition-all hover:scale-105">Blog</Link>
            </div>
            <Link href="/" className="px-6 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 group font-semibold uppercase tracking-wider text-[10px]">
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              Download
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          style={{ scale, opacity }}
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative max-w-4xl"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-12 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="uppercase tracking-[0.15em]">Introducing SNUGPT 2.0</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-6xl md:text-[5.5rem] font-bold tracking-tight mb-8 leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 pb-6">
            Your university<br />knowledge assistant
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Get ready-to-use answers from all your knowledge<br className="hidden md:block" /> and quit manual organization for good.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-8">
            <Link href="/" className="relative group p-[2px] rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl blur-sm group-hover:blur-md opacity-70 transition-all duration-500 animate-gradient-x" />
              <div className="relative px-12 py-5 rounded-2xl bg-[#050505] text-white font-bold text-lg flex items-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                GET STARTED FOR FREE
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-gray-800 overflow-hidden ring-1 ring-white/10">
                    <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="user" width={32} height={32} className="grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/30 font-medium">Join <span className="text-white/60">20,000+</span> others</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="relative mt-32 w-full max-w-6xl rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] perspective-1000 p-1"
        >
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
            </div>
            <div className="text-[11px] font-mono text-white/20 uppercase tracking-[0.3em]">SNUGPT_SYSTEM_V2</div>
            <div className="w-20" />
          </div>

          <div className="aspect-[16/10] bg-black/40 relative group">
            {/* Dynamic Grid Background in Mockup */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative p-12 h-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl relative"
              >
                <div className="flex gap-6 items-start mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <Database className="w-6 h-6 text-indigo-400/80" />
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="h-5 w-48 bg-white/10 rounded-full" />
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                    <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-6 items-start flex-row-reverse">
                  <div className="relative shrink-0">
                    <Image src="/avatar.png" alt="AI" width={48} height={48} className="rounded-2xl border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#111]" />
                  </div>
                  <div className="space-y-3 w-full flex flex-col items-end">
                    <div className="h-10 w-3/4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center px-4">
                      <div className="h-2 w-full bg-indigo-400/30 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="absolute inset-0 bg-indigo-400"
                        />
                      </div>
                    </div>
                    <div className="h-3 w-1/2 bg-white/5 rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-40 px-6 max-w-7xl mx-auto relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-40 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

        <div className="text-center mb-32">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            More answers.<br /><span className="text-white/40">No more organization.</span>
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-white/30 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            A single source of truth for every department and club on campus. Quit manual sorting and start finding.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BentoCard
            title="Semantic Search"
            description="Stop digging through folders. Just type in plain English and find exactly what you need instantly."
            icon={Search}
            className="md:col-span-2"
          >
            <div className="relative mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 flex items-center gap-4 group/search overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/search:opacity-100 transition-opacity" />
              <Search className="w-5 h-5 text-indigo-400" />
              <span className="text-white/20 font-mono text-sm tracking-tight">"Where can I find the AI course syllabus?"</span>
              <div className="ml-auto flex items-center gap-1.5 opacity-40">
                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px]">⌘</kbd>
                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px]">K</kbd>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            title="Instant Answers"
            description="Powered by LLaMA 3.3 for blazingly fast, accurate responses."
            icon={Zap}
            delay={0.1}
          >
            <div className="mt-8 flex flex-col gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="h-1.5 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                <motion.div animate={{ width: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-indigo-500" />
              </div>
              <div className="h-1.5 w-3/4 bg-white/5 rounded-full" />
            </div>
          </BentoCard>

          <BentoCard
            title="Data Privacy"
            description="Your university credentials and data are encrypted and handled with bank-grade security."
            icon={Database}
            delay={0.2}
          >
            <div className="mt-6 flex justify-center py-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-full border border-green-500/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            title="Connected Context"
            description="SNUGPT indexes ERP, Outlook, Blackboard, and local storage to build a total knowledge map."
            icon={Layers}
            className="md:col-span-2"
            delay={0.3}
          >
            <div className="mt-8 grid grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <div className="w-5 h-5 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-40 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20 relative">
        <div className="flex-1 space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Share and document.<br /><span className="text-white/40 text-[0.8em]">Zero writing required.</span></h2>
            <p className="text-xl text-white/40 leading-relaxed max-w-lg font-medium">
              Turn chat insights into production-ready documentation or shareable links for your study group in one click.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex flex-col gap-4">
            {[
              { icon: Share2, text: "One-click study group sharing", color: "indigo" },
              { icon: Download, text: "Export as professional PDF/Markdown", color: "white" },
              { icon: Globe, text: "Cloud sync across all devices", color: "indigo" }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-center gap-4 group cursor-default">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 text-${item.color === 'indigo' ? 'indigo-400' : 'white/60'}`} />
                </div>
                <span className="text-white/50 group-hover:text-white transition-colors font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex-1 w-full relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl overflow-hidden aspect-square flex flex-col gap-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="h-12 flex items-center justify-between border-b border-white/5 px-2">
              <span className="text-xs font-mono text-indigo-400">SESSION_EXPORT_001.PDF</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex-1 space-y-4 pt-4">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.random() * 50 + 40}%` }}
                  className="h-2 bg-white/5 rounded-full"
                />
              ))}
            </div>
            <div className="mt-auto h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white/20 animate-spin-slow" />
            </div>
          </motion.div>
          {/* Decorative Element */}
          <div className="absolute -z-10 -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-60 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="w-32 h-32 mb-16 relative"
          >
            <div className="absolute -inset-8 bg-indigo-600/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-full h-full rounded-[2.5rem] bg-indigo-600 flex items-center justify-center border border-indigo-400 shadow-2xl overflow-hidden group">
              <Image src="/avatar.png" alt="SNUGPT" width={128} height={128} className="transition-transform duration-700 group-hover:scale-110" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-[5rem] font-bold tracking-tight mb-12 leading-none"
          >
            Start scooping out<br /><span className="text-indigo-400">gems today.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="px-12 py-6 rounded-2xl bg-white text-black font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] inline-flex items-center gap-3 group">
              LAUNCH SNUGPT
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Image src="/avatar.png" alt="SNUGPT" width={24} height={24} className="rounded-lg border border-white/10" />
            <span className="font-bold tracking-tight text-white/80">SNUGPT</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/20 font-medium">
            <Link href="https://www.linkedin.com/in/rishabhh0001/" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> LinkedIn
            </Link>
            <Link href="https://github.com/rishabhh0001" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> GitHub
            </Link>
            <Link href="mailto:rj910@snu.edu.in" className="hover:text-white/60 transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Link>
          </div>

          <div className="text-xs text-white/10 font-mono">
            BUILD_ID: V1.0.2_LATEST
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
