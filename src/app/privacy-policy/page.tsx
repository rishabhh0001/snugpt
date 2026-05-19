"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowLeft, Lock, Eye, Trash2, Database, Key } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight relative">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[250px] rounded-full bg-gradient-to-br from-amber-500/5 via-amber-600/5 to-transparent blur-[100px] pointer-events-none" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Top Header navbar simplified */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image src="/avatar.svg" alt="SNUGPT" width={32} height={32} className="object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-sm font-black tracking-tighter uppercase leading-tight text-white">SNUGPT</span>
              <span className="text-[7px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase">Delhi-NCR</span>
            </div>
          </Link>

          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Page Body content container */}
      <main className="relative max-w-4xl mx-auto px-6 pt-32 pb-24 z-10 flex flex-col items-center">
        
        {/* Page Hero Introduction */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="w-full text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-black text-indigo-400 mb-6 uppercase tracking-widest">
            <Lock className="w-3 h-3 text-indigo-400" /> Security & Privacy
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none">
            Privacy Policy
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            At SNUGPT, we prioritize student confidentiality. Read our exhaustive disclosures regarding data collection, vector embeddings, database encryption, and academic alignment.
          </motion.p>
        </motion.div>

        {/* Section 1: Core Privacy Philosophy */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <Eye className="w-5 h-5 text-indigo-400" /> Data Privacy Philosophy
            </h2>
            <p className="text-sm md:text-base text-white/40 leading-relaxed font-medium font-inter">
              SNUGPT is an educational, student-aligned intelligence utility designed specifically for the Shiv Nadar University community. We do not monetize student data, run ads, or sell information to third-party data aggregators. Every design decision—from utilizing localized serverless databases to adopting secure open-source models—is guided by a strict mission to respect academic confidentiality and student welfare.
            </p>
          </motion.div>
        </motion.section>

        {/* Section 2: Data Collection Declarations */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <h2 className="text-2xl font-black text-white tracking-tight">Data Collection & Disclosures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Waitlist Data */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Waitlist Declarations</h3>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter mb-4">
                When you sign up to get early access, we collect:
              </p>
              <ul className="text-xs text-white/40 space-y-1.5 font-medium font-inter">
                <li>• <strong className="text-white/70">Full Name:</strong> For personalized portal access.</li>
                <li>• <strong className="text-white/70">Email Address:</strong> Strictly matching university or private domains.</li>
                <li>• <strong className="text-white/70">Mobile Number:</strong> For secure authentication checks.</li>
              </ul>
            </motion.div>

            {/* Card 2: Query Logs */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Query & Response Ingestion</h3>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter mb-4">
                To fulfill conversational queries, our gateway processes:
              </p>
              <ul className="text-xs text-white/40 space-y-1.5 font-medium font-inter">
                <li>• <strong className="text-white/70">Input Query Text:</strong> To retrieve academic policies.</li>
                <li>• <strong className="text-white/70">Vector Cache Tokens:</strong> Used to track real-time context.</li>
                <li>• <strong className="text-white/70">Feedback Metrics:</strong> Upvote/downvote signals to refine prompt matches.</li>
              </ul>
            </motion.div>

          </div>
        </motion.section>

        {/* Section 3: Technical Processing & Encryption Flow */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <Database className="w-5 h-5 text-amber-400" /> Processing & Security Framework
            </h2>
            <div className="text-sm md:text-base text-white/40 leading-relaxed font-medium font-inter space-y-4">
              <p>
                Student information undergoes standard encryption workflows at every stage of the query lifecycle:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white/70">Transit Security (HTTPS/TLS 1.3):</strong> All requests between your browser and the FastAPI gateway are encrypted using transport-layer security protocols.
                </li>
                <li>
                  <strong className="text-white/70">Rest Encryption (AES-256):</strong> Saved sessions, waitlist records, and configuration logs inside our serverless **Neon PostgreSQL** database use standard enterprise-grade AES-256 resting encryption schemas.
                </li>
                <li>
                  <strong className="text-white/70">Secure Vector Pipeline:</strong> Conversational questions are converted into vector representations locally and stored in a private **Chroma** instance. Embeddings are sent only to secure, enterprise-hardened AI endpoints (NVIDIA AI Endpoints) and are never used to train global public base models.
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 4: Data Erasure & Student Rights */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 animate-pulse">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-white tracking-tight">Data Erasure & Rights</h2>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                We respect your right to control your digital footprint. Any waitlist signee or beta tester can request immediate, complete removal of their personal profile, query records, and authenticated database tables by reaching out to the administrator. Data is completely wiped from active Postgres storage pools within 48 hours of verification.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 5: Cookies and Session Storage */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <Key className="w-5 h-5 text-indigo-400" /> Cookies & Local Browser Storage
            </h2>
            <p className="text-sm md:text-base text-white/40 leading-relaxed font-medium font-inter">
              We use standard browser `localStorage` and `sessionStorage` purely to optimize user experience and maintain active session state. This includes caching your dark theme preferences, conserving active scroll configurations, and storing anonymous navigation drawer parameters. We do not use third-party tracking pixels or persistent advertising beacons.
            </p>
          </motion.div>
        </motion.section>

        {/* Legal links footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 font-medium"
        >
          <span>&copy; {new Date().getFullYear()} Rishabh Joshi. Apache License 2.0.</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About SNUGPT</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/license" className="hover:text-white transition-colors">Apache License</Link>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
