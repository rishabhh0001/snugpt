"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowLeft, FileText, CheckCircle2, Scale, AlertTriangle, HelpCircle } from 'lucide-react';
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

export default function TermsOfServicePage() {
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
            <Scale className="w-3 h-3 text-indigo-400" /> Usage Guidelines
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none">
            Terms of Service
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Please read these Terms of Service carefully before utilizing the SNUGPT platform. By accessing or using our services, you agree to comply with our campus usage guidelines.
          </motion.p>
        </motion.div>

        {/* Section 1: Core Terms Overview */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eligibility
              </h3>
              <p className="text-xs text-white/40 leading-relaxed font-medium font-inter">
                Intended strictly for student, faculty, and administrative members of the Shiv Nadar University community.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-amber-500 uppercase mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Non-hallucination
              </h3>
              <p className="text-xs text-white/40 leading-relaxed font-medium font-inter">
                Always verify answers against primary university documents. AI answers do not override official registrar rulings.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Fair Use
              </h3>
              <p className="text-xs text-white/40 leading-relaxed font-medium font-inter">
                We operate under the Apache 2.0 open-source framework, protecting fair academic research and developer integrity.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Section 2: Core Provisions */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" /> Platform Usage & Accountability
            </h2>
            <div className="text-sm md:text-base text-white/40 leading-relaxed space-y-6 font-medium font-inter">
              <div>
                <h4 className="text-white font-bold mb-1">1. Acceptable Academic Use</h4>
                <p>
                  SNUGPT is created to aid students with administrative queries, syllabus matching, hostel timings, and general campus rules. Users must not utilize the chat interface for plagiarism, cheating, or circumventing legitimate university evaluation protocols.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">2. Zero Commercial Warranties</h4>
                <p>
                  As an open-source tool, SNUGPT is provided "AS IS". The platform, database, and vector pipeline operate on a best-effort basis without warranties of any kind. Under no circumstances will the creators be liable for academic status adjustments or registration outcomes.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">3. System & API Limits</h4>
                <p>
                  To protect server performance and ensure absolute responsiveness for the whole student body, rate limits are applied to active chat sequences. Exploiting system resources, attempting to scraping context pipelines, or attacking API endpoints is strictly prohibited.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 3: Legal Disclosures */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-white tracking-tight">Need Official Assistance?</h2>
              <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium font-inter">
                If you encounter a policy conflict or require official, binding institutional approvals, please reach out directly to the Shiv Nadar University Dean of Student Welfare (DSW) or the respective departmental office.
              </p>
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
            <Link href="/about" className="hover:text-white transition-colors">About SNUGPT</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/license" className="hover:text-white transition-colors">Apache License</Link>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
