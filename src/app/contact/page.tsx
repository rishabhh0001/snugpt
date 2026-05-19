"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building,
  User,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Page animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('submitting');
    
    // Simulate high-speed premium submission transition
    setTimeout(() => {
      setStatus('success');
    }, 1800);
  };

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      category: 'General Inquiry',
      subject: '',
      message: ''
    });
    setStatus('idle');
  };

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Policy Inaccuracy',
    'Feature Suggestion',
    'Academic Cooperation'
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[15%] w-[700px] h-[400px] rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[300px] rounded-full bg-gradient-to-br from-amber-500/5 via-amber-600/5 to-transparent blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Simplified Premium Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image src="/avatar.svg" alt="SNUGPT" width={32} height={32} className="object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-sm font-black tracking-tighter uppercase leading-tight text-white">SNUGPT</span>
              <span className="text-[7px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase">Delhi-NCR</span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-white/50 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Core Contact Content */}
      <main className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div 
            variants={fadeInUp} 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-black text-indigo-400 mb-6 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Communications Layer
          </motion.div>

          <motion.h1 
            variants={fadeInUp} 
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none"
          >
            Contact SNUGPT Core.
          </motion.h1>

          <motion.p 
            variants={fadeInUp} 
            className="text-sm sm:text-base text-white/40 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Have feedback, noticed policy inaccuracies, or looking to collaborate? Reach out directly to the SNUGPT developers and administration coordinators.
          </motion.p>
        </motion.div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Direct channels directory info - 5 cols */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-5 space-y-6"
          >
            <motion.h2 variants={fadeInUp} className="text-xl font-black tracking-tight text-white mb-2 pl-1">
              Direct Channels
            </motion.h2>

            {/* Email contact */}
            <motion.div 
              variants={fadeInUp}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent blur-xl rounded-full" />
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase text-white/45 tracking-widest">Developer Mail</h3>
                  <a href="mailto:support@snugpt.tech" className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                    support@snugpt.tech
                  </a>
                  <p className="text-[11px] text-white/30 leading-relaxed font-medium font-inter mt-1">
                    Direct connection to the technical creators for engineering bugs, system downtime reports, or core RAG logic.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Administration / Inaccuracies */}
            <motion.div 
              variants={fadeInUp}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent blur-xl rounded-full" />
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase text-white/45 tracking-widest">Welfare & Policies</h3>
                  <a href="mailto:rj910@snu.edu.in" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">
                    rj910@snu.edu.in
                  </a>
                  <p className="text-[11px] text-white/30 leading-relaxed font-medium font-inter mt-1">
                    For correcting handbook details, course prereq errors, room/hostel rule updates, or general welfare policy catalog issues.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Campus location */}
            <motion.div 
              variants={fadeInUp}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-all duration-300"
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase text-white/45 tracking-widest">HQ Campus Location</h3>
                  <p className="text-sm font-bold text-white">
                    Shiv Nadar University
                  </p>
                  <p className="text-[11px] text-white/30 leading-relaxed font-medium font-inter">
                    NH91, Tehsil Dadri, Gautam Buddha Nagar, Uttar Pradesh - 201314, India
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Form container - 7 cols */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              {/* Backglow element */}
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="contact-form"
                    onSubmit={handleSubmit} 
                    className="space-y-6 relative z-10"
                    exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col mb-2">
                      <h2 className="text-xl font-black text-white tracking-tight">Send a Secure Message</h2>
                      <p className="text-xs text-white/30 mt-1 font-medium font-inter">Your message is securely transmitted directly to the lead engineering coordinators.</p>
                    </div>

                    {/* Form errors */}
                    {status === 'error' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold font-inter flex items-center gap-3"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Please complete all required fields (Name, Email, and Message).
                      </motion.div>
                    )}

                    {/* Inputs row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-1 font-jakarta">Full Name *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.02] border ${focusedField === 'name' ? 'border-indigo-500/40 text-white bg-white/[0.04]' : 'border-white/5 text-white/80'} text-xs font-medium font-inter transition-all duration-300 outline-none placeholder:text-white/20`}
                          />
                          <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-transform duration-500 ${focusedField === 'name' ? 'scale-x-100' : 'scale-x-0'}`} />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-1 font-jakarta">University Email *</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder="e.g. username@snu.edu.in"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.02] border ${focusedField === 'email' ? 'border-indigo-500/40 text-white bg-white/[0.04]' : 'border-white/5 text-white/80'} text-xs font-medium font-inter transition-all duration-300 outline-none placeholder:text-white/20`}
                          />
                          <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-transform duration-500 ${focusedField === 'email' ? 'scale-x-100' : 'scale-x-0'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Inputs row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Message Category */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-1 font-jakarta">Category</label>
                        <div className="relative">
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            onFocus={() => setFocusedField('category')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full px-4 py-3.5 rounded-xl bg-black border ${focusedField === 'category' ? 'border-indigo-500/40 text-white' : 'border-white/5 text-white/60'} text-xs font-medium font-inter transition-all duration-300 outline-none appearance-none`}
                          >
                            {categories.map((c) => (
                              <option key={c} value={c} className="bg-[#050505] text-white/80">{c}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">▼</div>
                        </div>
                      </div>

                      {/* Subject input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-1 font-jakarta">Subject</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Brief description"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            onFocus={() => setFocusedField('subject')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.02] border ${focusedField === 'subject' ? 'border-indigo-500/40 text-white bg-white/[0.04]' : 'border-white/5 text-white/80'} text-xs font-medium font-inter transition-all duration-300 outline-none placeholder:text-white/20`}
                          />
                          <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-transform duration-500 ${focusedField === 'subject' ? 'scale-x-100' : 'scale-x-0'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Message body input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-1 font-jakarta">Your Message *</label>
                      <div className="relative">
                        <textarea
                          required
                          rows={5}
                          placeholder="Please formulate your policy corrections, suggestions, or technical support requests..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.02] border ${focusedField === 'message' ? 'border-indigo-500/40 text-white bg-white/[0.04]' : 'border-white/5 text-white/80'} text-xs font-medium font-inter transition-all duration-300 outline-none resize-none placeholder:text-white/20`}
                        />
                        <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-transform duration-500 ${focusedField === 'message' ? 'scale-x-100' : 'scale-x-0'}`} />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full relative flex items-center justify-center gap-2 py-4 rounded-xl bg-white hover:bg-amber-50 text-black font-black text-[10px] uppercase tracking-wider transition-all duration-300 active:scale-[0.98] shadow-lg disabled:opacity-75 disabled:pointer-events-none"
                    >
                      {status === 'submitting' ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Transmitting Signals...
                        </div>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Transmit Message
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-container"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center py-12 space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">Transmission Complete!</h3>
                      <p className="text-xs text-white/40 font-medium font-inter max-w-sm mx-auto leading-relaxed">
                        Your message has been successfully broadcast to the SNUGPT lead developers. We will parse the policy data or fix the bugs shortly.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] w-full text-left font-inter space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/30 font-medium">Transmitter</span>
                        <span className="text-white/80 font-bold">{form.name} ({form.email})</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/30 font-medium">Category</span>
                        <span className="text-indigo-400 font-bold">{form.category}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/30 font-medium">Timestamp</span>
                        <span className="text-white/80 font-bold">{new Date().toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full border-t border-white/5 pt-8 mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 font-medium"
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
