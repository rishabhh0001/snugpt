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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Custom imports from our integrated shadcn path
import { ContactCard } from '@/components/ui/contact-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
  subject: string;
  message: string;
};

// --- Complete Background Grid Components from Homepage ---
type BGVariantType = 'dots' | 'diagonal-stripes' | 'grid' | 'horizontal-lines' | 'vertical-lines' | 'checkerboard';
type BGMaskType =
  | 'fade-center'
  | 'fade-edges'
  | 'fade-top'
  | 'fade-bottom'
  | 'fade-left'
  | 'fade-right'
  | 'fade-x'
  | 'fade-y'
  | 'none';

type BGPatternProps = React.ComponentProps<'div'> & {
  variant?: BGVariantType;
  mask?: BGMaskType;
  size?: number;
  fill?: string;
};

const maskStyles: Record<BGMaskType, React.CSSProperties> = {
  'fade-edges': {
    WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent)',
    maskImage: 'radial-gradient(ellipse at center, black, transparent)',
  },
  'fade-center': {
    WebkitMaskImage: 'radial-gradient(ellipse at center, transparent, black)',
    maskImage: 'radial-gradient(ellipse at center, transparent, black)',
  },
  'fade-top': {
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
    maskImage: 'linear-gradient(to bottom, transparent, black)',
  },
  'fade-bottom': {
    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
    maskImage: 'linear-gradient(to bottom, black, transparent)',
  },
  'fade-left': {
    WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
    maskImage: 'linear-gradient(to right, transparent, black)',
  },
  'fade-right': {
    WebkitMaskImage: 'linear-gradient(to right, black, transparent)',
    maskImage: 'linear-gradient(to right, black, transparent)',
  },
  'fade-x': {
    WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
    maskImage: 'linear-gradient(to right, transparent, black, transparent)',
  },
  'fade-y': {
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
  },
  none: {},
};

function geBgImage(variant: BGVariantType, fill: string, size: number) {
  switch (variant) {
    case 'dots':
      return `radial-gradient(${fill} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case 'diagonal-stripes':
      return `repeating-linear-gradient(45deg, ${fill}, ${fill} 1px, transparent 1px, transparent ${size}px)`;
    case 'horizontal-lines':
      return `linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case 'vertical-lines':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px)`;
    case 'checkerboard':
      return `linear-gradient(45deg, ${fill} 25%, transparent 25%), linear-gradient(-45deg, ${fill} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${fill} 75%), linear-gradient(-45deg, transparent 75%, ${fill} 75%)`;
    default:
      return undefined;
  }
}

const BGPattern = ({
  variant = 'grid',
  mask = 'none',
  size = 24,
  fill = '#ffffff',
  className,
  style,
  ...props
}: BGPatternProps) => {
  const bgSize = `${size}px ${size}px`;
  const backgroundImage = geBgImage(variant, fill, size);

  return (
    <div
      className={cn('absolute inset-0 z-0 size-full', className)}
      style={{
        backgroundImage,
        backgroundSize: bgSize,
        ...maskStyles[mask],
        ...style,
      }}
      {...props}
    />
  );
};

BGPattern.displayName = 'BGPattern';

const GridBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <BGPattern variant="grid" mask="fade-edges" fill="#ffffff" size={40} className="opacity-[0.08]" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent h-40 w-full z-0 opacity-20 animate-scanline" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full opacity-50" />
    <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow" />
    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-yellow-500/10 blur-[100px] rounded-full animate-pulse-slower" />
  </div>
);

// --- Contact Page ---
export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
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
      subject: '',
      message: ''
    });
    setStatus('idle');
  };

  // Structured contact info array matching the card component requirements
  const snugptContactInfo = [
    {
      icon: Mail,
      label: 'Developer Support',
      value: 'support@snugpt.tech',
    },
    {
      icon: MessageSquare,
      label: 'Policy Corrections',
      value: 'rj910@snu.edu.in',
    },
    {
      icon: MapPin,
      label: 'Campus HQ Address',
      value: 'NH91, Dadri, Gautam Buddha Nagar, UP - 201314',
      className: 'col-span-2',
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight relative">
      {/* Background Complete Grid & Glows Overlay */}
      <GridBackground />

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

          <Link href="/" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-white/50 hover:text-white transition-colors duration-300">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Page Body content container */}
      <main className="relative max-w-5xl mx-auto px-6 pt-32 pb-24 z-10 flex flex-col items-center">
        
        {/* Page Hero Introduction */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="w-full text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-black text-indigo-400 mb-6 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Communications Gateway
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none">
            Get in touch.
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions regarding **SNUGPT** institutional intelligence or noticed handbook inaccuracies? Fill out the secure form below. We respond within 1 business day.
          </motion.p>
        </motion.div>

        {/* Integrated Grid Contact Card */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <ContactCard
            title="Secure Signal Core"
            description="Broadcast your message directly to the engineering team. Every transmission is securely verified and instantly routed to the appropriate campus coordinator."
            contactInfo={snugptContactInfo}
            className="border-white/5 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
            formSectionClassName="bg-white/[0.01] border-white/5 flex items-center justify-center p-8 md:p-10"
          >
            <div className="w-full relative z-10">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="contact-form"
                    onSubmit={handleSubmit} 
                    className="space-y-4 w-full"
                    exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Form errors */}
                    {status === 'error' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold font-inter flex items-center gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Required fields missing (Name, Email, Message).
                      </motion.div>
                    )}

                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-0.5">Name</Label>
                      <div className="relative">
                        <Input 
                          type="text" 
                          required
                          placeholder="Your Name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`px-4 py-3.5 bg-white/[0.01] ${focusedField === 'name' ? 'border-indigo-500/40 text-white bg-white/[0.03]' : 'border-white/5 text-white/70'} text-xs font-medium font-inter transition-all duration-300 outline-none`}
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-0.5">Email</Label>
                      <div className="relative">
                        <Input 
                          type="email" 
                          required
                          placeholder="username@snu.edu.in"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          className={`px-4 py-3.5 bg-white/[0.01] ${focusedField === 'email' ? 'border-indigo-500/40 text-white bg-white/[0.03]' : 'border-white/5 text-white/70'} text-xs font-medium font-inter transition-all duration-300 outline-none`}
                        />
                      </div>
                    </div>

                    {/* Subject input */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-0.5">Subject</Label>
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder="Brief topic"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          onFocus={() => setFocusedField('subject')}
                          onBlur={() => setFocusedField(null)}
                          className={`px-4 py-3.5 bg-white/[0.01] ${focusedField === 'subject' ? 'border-indigo-500/40 text-white bg-white/[0.03]' : 'border-white/5 text-white/70'} text-xs font-medium font-inter transition-all duration-300 outline-none`}
                        />
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-black text-white/50 pl-0.5">Message</Label>
                      <div className="relative">
                        <Textarea  
                          required
                          rows={4}
                          placeholder="Your message here..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          className={`px-4 py-3 bg-white/[0.01] ${focusedField === 'message' ? 'border-indigo-500/40 text-white bg-white/[0.03]' : 'border-white/5 text-white/70'} text-xs font-medium font-inter transition-all duration-300 outline-none resize-none`}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      className="w-full relative flex items-center justify-center gap-2 py-4 rounded-xl bg-white hover:bg-amber-50 text-black font-black text-[10px] uppercase tracking-wider transition-all duration-300 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none mt-2" 
                      type="submit"
                      disabled={status === 'submitting'}
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
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-container"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center py-6 space-y-6 w-full"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white tracking-tight">Transmission Complete!</h3>
                      <p className="text-[11px] text-white/40 font-medium font-inter leading-relaxed">
                        Signal verification completed. Your message has been successfully logged to the **SNUGPT** Core coordination channel.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] w-full text-left font-inter space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-white/30 font-medium">From</span>
                        <span className="text-white/80 font-bold">{form.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30 font-medium">Channel</span>
                        <span className="text-indigo-400 font-bold">{form.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30 font-medium">Timestamp</span>
                        <span className="text-white/80 font-bold">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      className="text-[9px] uppercase tracking-widest font-black text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ContactCard>
        </motion.section>

        {/* Legal links footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full border-t border-white/5 pt-8 mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 font-medium"
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
