"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { Search, Sparkles, Command, Database, Zap, Share2, MessageSquare, ChevronRight, Layers, LayoutDashboard, Globe, Download, Mail, ExternalLink, X, Shield, Lock, CheckCircle2, Cpu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const GridBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full opacity-50" />
    <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full" />
    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-yellow-500/5 blur-[100px] rounded-full" />
  </div>
);

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
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={`relative group rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-white/[0.01] p-8 md:p-14 overflow-hidden transition-all duration-500 hover:border-indigo-500/30 hover:bg-white/[0.03] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-700" />

      <div className="relative z-10 h-full flex flex-col">
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Icon className="w-7 h-7 text-indigo-400" />
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{title}</h3>
        <p className="text-white/40 text-lg leading-relaxed mb-10 max-w-md">{description}</p>
        <div className="mt-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const WaitlistModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const endpoint = window.location.hostname === 'localhost' ? '/api/waitlist' : '/_/backend/api/waitlist';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
      }

      if (!res.ok) throw new Error(data.detail || 'Failed to join waitlist');
      setStatus('success');
    } catch (err: any) {
      console.error('Waitlist error:', err);
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 p-4 md:p-6">
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-2">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-6 md:py-10 space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">You're in!</h3>
                <p className="text-white/40 leading-relaxed text-sm md:text-base">
                  Thanks for joining the SNUGPT waitlist. We'll reach out to you at <span className="text-white/60 font-medium">{email}</span> soon.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 md:mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Join the Waitlist</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-sm md:text-base">Be the first to experience the future of university intelligence.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elon Musk"
                      className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">University Email</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@snu.edu.in"
                      className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all text-sm md:text-base"
                    />
                  </div>

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-[10px] md:text-xs font-medium bg-red-400/5 border border-red-400/10 p-3 rounded-xl"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 md:py-5 rounded-2xl bg-indigo-600 text-white font-bold text-base md:text-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
                  >
                    {status === 'loading' ? (
                      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        JOIN WAITLIST
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function Lander() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans overflow-x-hidden selection:bg-indigo-500/30 tracking-tight">
      <MouseFollowGlow />
      <GridBackground />
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-6 md:py-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4 rounded-2xl md:rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <Image src="/avatar.png" alt="SNUGPT" width={44} height={44} className="object-cover" />
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg md:text-xl font-black tracking-tighter uppercase leading-tight">SNUGPT</span>
              <span className="text-[7px] md:text-[9px] font-bold text-indigo-400/60 tracking-[0.4em] uppercase">University Intel</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {['Capabilities', 'Intelligence', 'Security'].map((item) => (
              <Link key={item} href="#" className="text-[10px] uppercase tracking-[0.25em] font-black text-white/20 hover:text-white transition-all hover:translate-y-[-1px]">
                {item}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-white text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            Access Intelligence
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 md:pt-60 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          style={{ scale, opacity }}
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative max-w-5xl"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black text-indigo-300 mb-10 md:mb-14 shadow-2xl backdrop-blur-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="uppercase tracking-[0.3em]">System Version 1.0.4 Online</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter mb-8 md:mb-10 leading-[0.9] md:leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30 pb-4 md:pb-6">
            The Student<br />Brain Engine.
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl lg:text-2xl text-white/25 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-semibold tracking-normal px-4">
            Your personal SNU intelligence layer. Instantly retrieve policies, course data, and university knowledge with neural precision.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-8 md:gap-12">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="relative group p-[2px] rounded-[2rem] transition-all duration-700 hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(79,70,229,0.3)] w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 rounded-[2rem] blur-md group-hover:blur-xl opacity-80 transition-all duration-700 animate-gradient-x" />
              <div className="relative px-10 md:px-16 py-5 md:py-6 rounded-[2rem] bg-[#050505] text-white font-black text-lg md:text-xl flex items-center justify-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                INITIATE INTERFACE
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </div>
            </button>

            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border border-[#050505] bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                      SNU
                    </div>
                  ))}
                </div>
                <div className="h-3 w-px bg-white/10 mx-1" />
                <span className="text-[10px] font-medium text-white/40 tracking-wide uppercase">Trusted by 500+ Students</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="relative mt-32 w-full max-w-6xl rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.1)] perspective-1000 p-1 group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
            </div>
            <div className="text-[11px] font-mono text-white/20 uppercase tracking-[0.3em]">SNUGPT_V1</div>
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
      <section className="py-24 md:py-40 px-6 max-w-7xl mx-auto relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-24 md:h-40 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

        <div className="text-center mb-20 md:mb-32">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-3xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Any Queries?<br /><span className="text-white/40">One Single Answer.</span>
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-white/30 text-base md:text-xl font-medium max-w-2xl mx-auto px-4">
            Ask anything, get accurate answers from course materials and handbooks in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-3 py-2 px-5 rounded-full bg-white/[0.03] border border-white/10 w-fit mx-auto backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-[#F2A900] shadow-[0_0_10px_#F2A900]" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">Verified Intelligence Layer</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <BentoCard
            className="md:col-span-8"
            title="University Intelligence"
            description="Our RAG pipeline indexes every SNU policy, handbook, and course outline to provide neural-grade accuracy."
            icon={Cpu}
          >
            <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { label: 'Sources', val: '2.4k+' },
                { label: 'Latency', val: '< 1.2s' },
                { label: 'Accuracy', val: '99.8%' }
              ].map((stat) => (
                <div key={stat.label} className="group/stat">
                  <div className="text-3xl font-black text-white mb-1 group-hover/stat:text-indigo-400 transition-colors">{stat.val}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            className="md:col-span-4"
            title="Enterprise Privacy"
            description="Your queries are encrypted and processed locally. We never store personal identifiers."
            icon={Shield}
          >
            <div className="relative h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_70%)]" />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-24 h-24 border border-indigo-500/20 rounded-full"
              />
              <Lock className="w-10 h-10 text-indigo-400/40 relative z-10" />
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
              Turn chat insights into production-ready documentation or shareable links for your study group in one click.*    (Coming soon™️)
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
            Start resolving queries<br /><span className="text-indigo-400">today.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="px-12 py-6 rounded-2xl bg-white text-black font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] inline-flex items-center gap-3 group"
            >
              JOIN THE WAITLIST
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
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
