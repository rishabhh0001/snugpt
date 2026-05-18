"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, Sparkles, BookOpen, Layers, Shield, User, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
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

export default function AboutPage() {
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
            <Sparkles className="w-3 h-3 text-indigo-400" /> Neural Core Engine
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none">
            The Student Brain Engine.
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            SNUGPT is the institutional intelligence layer built explicitly for the Shiv Nadar University (SNU, Delhi-NCR) ecosystem, empowering students with immediate, unified knowledge retrieval.
          </motion.p>
        </motion.div>

        {/* Section 1: The Core Vision */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent blur-2xl rounded-full" />
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-400" /> Institutional Vision
            </h2>
            <div className="text-sm md:text-base text-white/40 leading-relaxed space-y-4 font-medium font-inter">
              <p>
                University campuses are complex, highly regulated micro-ecosystems. Between fragmented ERP portal pages, institutional handbooks, hostel rules, exam procedures, and academic pre-requisites, students are often forced to manually hunt through dozens of PDFs and web pages to find simple answers.
              </p>
              <p>
                <strong>SNUGPT</strong> was engineered by students, for students, to serve as a unified, conversational knowledge layer. By merging highly structured institutional context with cutting-edge Large Language Models, SNUGPT acts as an instantaneous, neural query center that answers questions with extreme precision in seconds.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 2: Technical Architecture Specification Grid */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <h2 className="text-2xl font-black text-white tracking-tight mb-8">
            Technical Architecture & RAG Specs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Spec Card 1: LLM Engine */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col justify-between h-full group hover:border-white/10 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Inference Layer</h3>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                  Powered by <strong>Meta Llama 3.3 70B Instruct</strong> running over high-speed NVIDIA AI Foundation endpoints, streaming answers token-by-token for commercial-grade speed.
                </p>
              </div>
            </motion.div>

            {/* Spec Card 2: Vector Intelligence */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col justify-between h-full group hover:border-white/10 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Vector Database</h3>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                  Semantic lookup uses highly advanced <strong>nv-embedqa-e5-v5</strong> embeddings indexed inside a secure Chroma vector store to fetch exact policies from scanned documentation.
                </p>
              </div>
            </motion.div>

            {/* Spec Card 3: Backend Gateway */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col justify-between h-full group hover:border-white/10 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Asynchronous Gateway</h3>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                  Asynchronous python architecture built on <strong>FastAPI (Python 3.12+)</strong> with optimized middleware pipelines to handle high-throughput query requests without lag.
                </p>
              </div>
            </motion.div>

            {/* Spec Card 4: Memory Storage */}
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col justify-between h-full group hover:border-white/10 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Persistent Memory</h3>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                  Uses highly resilient serverless <strong>Neon PostgreSQL</strong> connected via asyncpg client pools for secure, private user session history management.
                </p>
              </div>
            </motion.div>

          </div>
        </motion.section>

        {/* Section 3: Ingestion Pipeline details */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <Layers className="w-5 h-5 text-indigo-400" /> Integrated Ingestion Pipeline
            </h2>
            <div className="text-sm md:text-base text-white/40 leading-relaxed space-y-4 font-medium font-inter">
              <p>
                To provide accurate, context-grounded answers without hallucination, SNUGPT integrates multiple knowledge pipelines:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/40 font-medium">
                <li><strong className="text-white/70">ERP Academic Catalogs:</strong> Detailed course credits, departmental codes, prerequisites, and registration procedures.</li>
                <li><strong className="text-white/70">SNU Student Handbooks:</strong> Essential legal regulations, grading curves, CGPA thresholds, and disciplinary policies.</li>
                <li><strong className="text-white/70">Student Welfare Guidelines:</strong> On-campus hostel rules, curfews, medical support directories, and event protocol guides.</li>
              </ul>
              <p>
                Every source is cleaned, chunked into overlap-aware passages, converted into vector representations, and safely cached to ensure retrieval queries respond with exact-match citations.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 4: Creator Spotlight */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Rishabh Joshi <span className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Creator</span>
              </h2>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                SNUGPT was conceived, designed, and fully engineered by **Rishabh Joshi** as an open-source contribution to the Shiv Nadar University community. It aims to showcase the power of localized, retrieval-augmented intelligence interfaces in solving everyday institutional friction.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://github.com/rishabhh0001" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Globe className="w-3.5 h-3.5" /> GitHub Profile <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
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
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/license" className="hover:text-white transition-colors">Apache License</Link>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
