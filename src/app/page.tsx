"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, useReducedMotion } from 'framer-motion';
import { Search, Sparkles, Command, Database, Zap, Share2, MessageSquare, ChevronRight, Layers, LayoutDashboard, Globe, Download, Mail, ExternalLink, X, Shield, Lock, CheckCircle2, Cpu, BookOpen, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll as useNavbarScroll } from '@/components/ui/use-scroll';
import { cn } from '@/lib/utils';
import Preloader from '@/components/ui/preloader';
import { Banner } from '@/components/ui/banner';

const fadeInUp: any = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const charVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const CharReveal = ({ text, className }: { text: string; className?: string }) => {
  return (
    <motion.span className={`inline-block ${className}`}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

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
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(242, 169, 0, 0.08), transparent 80%)`
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
      className={`relative group rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 md:p-10 overflow-hidden transition-all duration-500 hover:border-amber-500/30 hover:bg-white/[0.02] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-700" />

      <div className="relative z-10 h-full flex flex-col">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="font-inter text-white/40 text-sm md:text-base leading-relaxed mb-6 max-w-md font-medium tracking-tight">{description}</p>
        <div className="mt-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const WaitlistModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [firstName, setFirstName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const endpoint = '/api/waitlist';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          mobile_number: mobileNumber,
          email_address: emailAddress,
        }),
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
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 p-4 md:p-6">
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-2">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-6 md:py-10 space-y-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">You're in!</h3>
                <p className="text-white/40 leading-relaxed text-sm md:text-base">
                  Thanks for joining the SNUGPT waitlist. We'll reach out to you at <span className="text-white/60 font-medium">{emailAddress}</span> soon.
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
                <div className="mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">Join the Waitlist</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-xs md:text-sm">Be the first to experience the future of university intelligence.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">First Name</label>
                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Elon"
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Mobile Number</label>
                    <input
                      required
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="elon@snu.edu.in"
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

const HeroMockupWindow = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Smooth buttery springs for Jhey's 3D tilt
  const rotateX = useSpring(0, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 20 });
  const tiltX = useSpring(0, { stiffness: 100, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    rotateX.set(-(mouseY / height) * 10);
    rotateY.set((mouseX / width) * 10);
    tiltX.set((mouseX / width) * 10);
    tiltY.set((mouseY / height) * 10);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    tiltX.set(0);
    tiltY.set(0);
  };

  // Simulated Chat Cycle States
  const [qaIndex, setQaIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0: query typing, 1: scanning, 2: response streaming
  const [typedQuery, setTypedQuery] = useState("");
  const [typedResponse, setTypedResponse] = useState("");
  const [visibleSources, setVisibleSources] = useState<string[]>([]);

  const qaPairs = [
    {
      q: "Who is the Vice-Chancellor of SNU?",
      a: "Professor Ananya Mukherjee is the Vice-Chancellor of Shiv Nadar University."
    },
    {
      q: "Who is the Dean of the School of Engineering?",
      a: "Professor Suneet Tuli is the Dean of the School of Engineering."
    },
    {
      q: "Who is the Dean of Students?",
      a: "Brigadier Steve Ismail (Retd.) is the Dean of Students at Shiv Nadar University."
    },
    {
      q: "Who is the Founder of the university?",
      a: "Mr. Shiv Nadar is the Founder of the university."
    },
    {
      q: "Who is the Dean of Academics?",
      a: "Professor Partha Chatterjee is the Dean of Academics."
    },
    {
      q: "Who is the Chancellor of SNU?",
      a: "Mr. Shikhar Malhotra is the Chancellor of Shiv Nadar University."
    }
  ];

  useEffect(() => {
    let isMounted = true;

    const runCycle = async () => {
      if (!isMounted) return;

      const currentQA = qaPairs[qaIndex];
      const queryText = currentQA.q;
      const responseText = currentQA.a;

      // Phase 0: Reset and start typing query
      setCurrentStep(0);
      setTypedQuery("");
      setTypedResponse("");
      setVisibleSources([]);

      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Type query Snappy
      for (let i = 0; i <= queryText.length; i++) {
        if (!isMounted) return;
        setTypedQuery(queryText.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 10 : 35));
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isMounted) return;

      // Phase 1: Scanning databases
      setCurrentStep(1);
      const sources = ["ERP Portal (Academics)", "SNU Policy Handbook v2.0", "Student Welfare Guidelines"];
      for (let i = 0; i < sources.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 500));
        if (!isMounted) return;
        setVisibleSources((prev) => [...prev, sources[i]]);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isMounted) return;

      // Phase 2: Typing response
      setCurrentStep(2);
      const words = responseText.split(" ");
      for (let i = 0; i <= words.length; i++) {
        if (!isMounted) return;
        setTypedResponse(words.slice(0, i).join(" "));
        await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 10 : 25));
      }

      // Hold at end
      await new Promise((resolve) => setTimeout(resolve, 6000));
      
      if (isMounted) {
        setQaIndex((prev) => (prev + 1) % qaPairs.length);
      }
    };

    runCycle();

    return () => {
      isMounted = false;
    };
  }, [shouldReduceMotion, qaIndex]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40, filter: "blur(6px)", rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
      transition={{ type: "spring", duration: 0.85, bounce: 0.05 }}
      viewport={{ once: true }}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        x: shouldReduceMotion ? 0 : tiltX,
        y: shouldReduceMotion ? 0 : tiltY,
        transformStyle: "preserve-3d",
      }}
      className="relative mt-16 md:mt-24 w-full max-w-5xl rounded-[2rem] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] perspective-1000 p-1 group will-change-transform"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* OS Titlebar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
        <div className="flex gap-2.5">
          <button className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-90 transition-transform" />
          <button className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] active:scale-90 transition-transform" />
          <button className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)] active:scale-90 transition-transform" />
        </div>
        <div className="text-[11px] font-mono text-white/20 uppercase tracking-[0.3em]">SNUGPT_V1</div>
        <div className="w-20" />
      </div>

      <div className="aspect-auto min-h-[380px] md:aspect-[16/10] bg-black/40 relative overflow-hidden flex flex-col justify-center items-center p-3 sm:p-6 md:p-12">
        {/* Dynamic Grid Background in Mockup */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="w-full max-w-3xl rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10 flex flex-col justify-between min-h-[85%] sm:min-h-[75%]">
          
          {/* Simulated Messaging Area */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* Step 0: User Query Bubble */}
            {typedQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                className="flex gap-4 items-start mb-6 justify-end w-full"
              >
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo-600/90 text-white px-5 py-3 shadow-lg relative border border-indigo-500/20">
                  <span className="text-xs md:text-sm font-medium tracking-tight block">
                    {typedQuery}
                    {currentStep === 0 && <span className="animate-pulse ml-0.5 font-bold">|</span>}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0 text-indigo-300">
                  <Search className="w-4 h-4" />
                </div>
              </motion.div>
            )}

            {/* Step 1: Matching and Indexing Sources */}
            {currentStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:p-5 mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/80">Retrieving Policy Context...</span>
                    <span className="text-[10px] text-white/40 font-medium">Neural Core active</span>
                  </div>
                  {/* Scanning progress animation */}
                  <div className="ml-auto w-24 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute h-full w-12 bg-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {["ERP Portal (Academics)", "SNU Policy Handbook v2.0", "Student Welfare Guidelines"].map((src) => {
                    const isVisible = visibleSources.includes(src);
                    return (
                      <div
                        key={src}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                          isVisible 
                            ? "border-indigo-500/20 bg-indigo-500/5 text-white/80" 
                            : "border-white/5 bg-white/[0.01] text-white/20"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          isVisible 
                            ? "border-indigo-400 bg-indigo-500/10 text-indigo-400" 
                            : "border-white/10 text-white/10"
                        }`}>
                          {isVisible && <CheckCircle2 className="w-2.5 h-2.5" />}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight truncate">{src}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: SNUGPT Intelligent Response */}
            {currentStep === 2 && typedResponse && (
              <motion.div
                initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.6, bounce: 0 }}
                className="flex gap-4 items-start w-full"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                    <Image src="/avatar.svg" alt="AI" width={32} height={32} className="rounded-lg" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
                </div>
                
                <div className="flex-1 space-y-3.5">
                  <div className="rounded-2xl rounded-tl-sm border border-indigo-500/10 bg-indigo-500/5 p-4 md:p-5 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-50" />
                    <span className="text-xs md:text-sm text-white/90 leading-relaxed font-medium tracking-tight block relative z-10 font-inter">
                      {typedResponse}
                      {typedResponse.length < qaPairs[qaIndex].a.length && <span className="animate-pulse text-indigo-400 font-black ml-0.5">▋</span>}
                    </span>
                  </div>

                  {typedResponse.length === qaPairs[qaIndex].a.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest font-black"
                    >
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" /> Checked against 3 sources
                      </span>
                      <span>•</span>
                      <span>Confidence: 99.8%</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Lander() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const infoLinks = [
    {
      title: "About SNUGPT",
      description: "Learn more about our RAG architecture & vision",
      href: "/about",
      icon: BookOpen,
    },
    {
      title: "Privacy Policy",
      description: "University data compliance & encryption safety",
      href: "/privacy-policy",
      icon: Shield,
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

  if (!mounted) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#050505] z-[99999999999]" />
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      </AnimatePresence>
      <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight">
        <MouseFollowGlow />
        <GridBackground />
        <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

      {/* Navigation */}
      <header
        className={cn(
          'fixed z-50 mx-auto w-[calc(100%-2rem)] max-w-5xl border border-transparent transition-all duration-300 ease-out left-1/2 -translate-x-1/2 md:rounded-2xl overflow-hidden',
          scrolled && !mobileMenuOpen
            ? 'top-4 bg-black/80 border-white/10 backdrop-blur-lg max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            : 'top-0 border-b border-white/5 bg-transparent'
        )}
      >
        {/* Release Announcement Banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full overflow-hidden border-b border-white/[0.06] bg-black/40"
            >
              <div className="p-1.5 md:p-2">
                <Banner
                  show={showBanner}
                  onHide={() => setShowBanner(false)}
                  variant="premium"
                  size="sm"
                  showShade={true}
                  closable={true}
                  title="SnuGPT Chat is Now Live!"
                  description="Experience ultra-fast, contextual university intelligence with real-time semantic query processing."
                  icon={<Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />}
                  action={
                    <Link
                      href="/chat"
                      className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap"
                    >
                      Chat Now
                    </Link>
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          className={cn(
            'flex h-16 w-full items-center justify-between px-4 transition-all ease-out duration-300',
            scrolled ? 'h-14 px-6' : 'h-20 px-8'
          )}
        >
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Image src="/avatar.svg" alt="SNUGPT" width={44} height={44} className="object-cover" priority />
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-base md:text-lg font-black tracking-tighter uppercase leading-tight">SNUGPT</span>
              <span className="text-[6px] md:text-[8px] font-bold text-indigo-400/60 tracking-[0.4em] uppercase">University Intel</span>
            </div>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="#features"
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
              onMouseLeave={() => setInfoDropdownOpen(false)}
            >
              <button
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-1"
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
              href="mailto:support@snugpt.tech"
              className="relative inline-block group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
            >
              <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                Contact Us
              </span>
              <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
              <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
            </Link>

            <Link
              href="/chat"
              className="relative inline-block group py-2 px-4 overflow-hidden rounded-lg transition-all duration-300"
            >
              <span className="relative z-10 block text-[9px] uppercase tracking-[0.25em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                Login
              </span>
              <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
              <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
            </Link>
          </div>
 
           <div className="flex items-center gap-2">
             <Link
                href="/chat"
                className="px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl bg-white text-black font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                Login
              </Link>
 
             {/* Mobile menu toggle button */}
             <button
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
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300"
                >
                  <span className="relative z-10 block text-xs uppercase tracking-[0.2em] font-black text-white/40 group-hover:text-black transition-colors duration-300 font-jakarta">
                    Features
                  </span>
                  <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                  <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                </Link>

                {/* Mobile Contact Us */}
                <Link
                  href="mailto:support@snugpt.tech"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300 font-jakarta"
                >
                  <span className="relative z-10 block text-xs uppercase tracking-[0.2em] font-black text-white/40 group-hover:text-black transition-colors duration-300">
                    Contact Us
                  </span>
                  <span className="absolute inset-x-0 top-0 bottom-0 border-t border-b border-white transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                  <span className="absolute inset-y-[1px] inset-x-0 bg-white transform scale-y-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-y-100 group-hover:opacity-100" />
                </Link>

                {/* Mobile Login Nav Link */}
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative inline-block group py-3 px-4 overflow-hidden rounded-lg transition-all duration-300 font-jakarta"
                >
                  <span className="relative z-10 block text-xs uppercase tracking-[0.2em] font-black text-white/40 group-hover:text-black transition-colors duration-300">
                    Login
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
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 text-center block rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-amber-50 active:scale-95 transition-all"
                >
                  Login
                </Link>
             </motion.div>
           )}
         </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          style={{ scale, opacity }}
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative max-w-5xl"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/5 border border-amber-500/20 text-[9px] font-black text-amber-500 mb-8 md:mb-10 shadow-[0_0_30px_rgba(242,169,0,0.1)] backdrop-blur-xl">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </div>
            <span className="uppercase tracking-[0.4em] text-amber-400/90">Student Built Handbook Engine</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black font-jakarta tracking-tighter mb-6 md:mb-8 leading-[0.9] md:leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30 pb-2 md:pb-4">
            <CharReveal text="The Student" /><br />
            <CharReveal text="Brain Engine." />
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/40 mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed font-medium tracking-tight px-4">
            Your personal SNU intelligence layer. Instantly retrieve policies, course data, and university knowledge with neural precision.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl mx-auto">
            {/* Mock Search Bar Centerpiece */}
            <div className="w-full relative group/hero-search cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-blue-600/30 to-amber-500/20 rounded-3xl blur-xl opacity-0 group-hover/hero-search:opacity-100 transition-opacity duration-700" />
              <div className="relative w-full px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl flex items-center gap-4 shadow-2xl transition-all duration-500 group-hover/hero-search:border-amber-500/30">
                <Search className="w-5 h-5 text-amber-400" />
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-xs font-bold text-white/60 tracking-tight">Ask Intelligence...</span>
                  <span className="text-[10px] text-white/20 font-medium truncate w-full">"Who is the Vice-Chancellor of SNU?"</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-white/30 uppercase">
                    <Command className="w-3 h-3" /> K
                  </div>
                  <Link href="/chat" className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform hover:bg-amber-400">
                    <Sparkles className="w-4 h-4 text-blue-950" />
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/chat"
              className="px-8 md:px-10 py-4 md:py-4.5 rounded-full bg-white text-black font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] inline-block"
            >
              Access Engine
            </Link>


          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <HeroMockupWindow />
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-16 md:py-24 px-6 max-w-7xl mx-auto relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-16 md:h-24 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold tracking-tight mb-4"
          >
            Any Queries?<br /><span className="text-white/40">One Single Answer.</span>
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-white/30 text-sm md:text-base font-medium max-w-lg mx-auto px-4">
            Ask anything, get accurate answers from course materials and handbooks in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Semantic Search - Large Card */}
          <BentoCard
            className="md:col-span-8"
            title="Semantic Search"
            description="Stop digging through folders. Just type in plain English and find exactly what you need instantly."
            icon={Search}
          >
            <div className="mt-8 relative group/search">
              <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 text-white/20">
                <Search className="w-5 h-5" />
                <span className="text-sm font-medium">"Where can I find the AI course syllabus?"</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold">⌘</div>
                  <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold">K</div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Instant Answers - Small Card */}
          <BentoCard
            className="md:col-span-4"
            title="Instant Answers"
            description="Powered by Llama 3.1 for blazingly fast, accurate responses."
            icon={Zap}
          >
            <div className="mt-8 space-y-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  whileInView={{ width: "65%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-amber-500 shadow-[0_0_15px_rgba(242,169,0,0.5)]"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-white/20">
                <span>Processing Neural Path</span>
                <span className="text-amber-400">65%</span>
              </div>
            </div>
          </BentoCard>

          {/* Data Privacy - Small Card */}
          <BentoCard
            className="md:col-span-4"
            title="Data Privacy"
            description="Your university credentials and data are encrypted and handled with bank-grade security."
            icon={Shield}
          >
            <div className="mt-8 relative h-24 flex items-center justify-center overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,169,0,0.05)_0%,transparent_70%)]" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-20 h-20 border border-amber-500/20 rounded-full"
              />
              <Lock className="w-8 h-8 text-amber-400/40 relative z-10" />
            </div>
          </BentoCard>

          {/* Connected Context - Large Card */}
          <BentoCard
            className="md:col-span-8"
            title="Connected Context"
            description="SNUGPT indexes ERP, snu.edu, and Handbooks to build a total knowledge map."
            icon={Layers}
          >
            <div className="mt-8 grid grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group/icon hover:border-amber-500/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-white/5 group-hover/icon:bg-amber-500/40 transition-colors" />
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative">
        <div className="flex-1 space-y-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Share and document.<br /><span className="text-white/40 text-[0.8em]">Zero writing required.</span></h2>
            <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-md font-medium">
              Turn chat insights into production-ready documentation or shareable links for your study group in one click.* (Coming soon™️)
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex flex-col gap-4">
            {[
              { icon: Share2, text: "One-click study group sharing", color: "amber" },
              { icon: Download, text: "Export as professional PDF/Markdown", color: "white" },
              { icon: Globe, text: "Cloud sync across all devices", color: "amber" }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-center gap-4 group cursor-default">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 text-${item.color === 'amber' ? 'amber-400' : 'white/60'}`} />
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
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="h-12 flex items-center justify-between border-b border-white/5 px-2">
              <span className="text-xs font-mono text-amber-400">CHAT_EXPORT_01.PDF</span>
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
          <div className="absolute -z-10 -right-20 -bottom-20 w-80 h-80 bg-amber-500/20 blur-[100px] rounded-full" />
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
            <div className="absolute -inset-12 bg-amber-600/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-blue-600 rounded-[2.5rem] opacity-20 blur-xl animate-gradient-x" />
            <div className="relative w-full h-full rounded-[2.5rem] bg-[#0A0A0A] flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden group">
              <Image src="/avatar.svg" alt="SNUGPT" width={128} height={128} className="transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-[4rem] font-black tracking-tighter mb-8 leading-none"
          >
            Start resolving queries<br /><span className="text-amber-400">today.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="px-12 py-6 rounded-[2rem] bg-white text-black font-black text-lg md:text-xl hover:bg-amber-50 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)] inline-flex items-center gap-4 group"
            >
              INITIALIZE CHAT INTERFACE
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-28 px-6 border-t border-white/5 bg-black/30 backdrop-blur-md relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 flex flex-col items-center">
          {/* Logo / Brand */}
          <Link
            href="/"
            aria-label="SNUGPT Home"
            className="flex items-center gap-3 group cursor-pointer mb-8"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image src="/avatar.svg" alt="SNUGPT" width={32} height={32} className="object-cover" />
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
            </div>
            <div className="flex flex-col -space-y-1 text-left">
              <span className="text-sm font-black tracking-tighter uppercase leading-tight text-white">SNUGPT</span>
              <span className="text-[7px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase">University Intel</span>
            </div>
          </Link>

          {/* Navigation links */}
          <div className="my-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-widest text-white/40">
            {[
              { title: 'Features', href: '#features' },
              { title: 'About SNUGPT', href: '/about' },
              { title: 'Privacy Policy', href: '/privacy-policy' },
              { title: 'Apache License', href: '/license' }
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="hover:text-amber-400 block duration-200 transition-colors"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>

          {/* Social Icons with custom styling */}
          <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
            {/* GitHub */}
            <Link
              href="https://github.com/rishabhh0001"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all hover:scale-110 active:scale-95 duration-300 shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/rishabhh0001/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all hover:scale-110 active:scale-95 duration-300 shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </Link>

            {/* Portfolio / Globe */}
            <Link
              href="https://rishabhh0001.github.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Personal Portfolio"
              className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all hover:scale-110 active:scale-95 duration-300 shadow-lg"
            >
              <Globe className="w-5 h-5" />
            </Link>

            {/* Email */}
            <Link
              href="mailto:rj910@snu.edu.in"
              aria-label="Send Email"
              className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all hover:scale-110 active:scale-95 duration-300 shadow-lg"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>

          {/* Legal / Credits */}
          <div className="flex flex-col items-center gap-2 mt-4 text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
              © {new Date().getFullYear()} Rishabh Joshi. Apache License 2.0.
            </span>
            <span className="text-[8px] font-mono tracking-widest text-white/10 uppercase">
              BUILD_ID: V1.0.4(+58) &bull; Delhi-NCR
            </span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes grid-shift {
          from { background-position: 0% 0%; }
          to { background-position: 40px 40px; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(200%); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        @keyframes pulse-slower {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.2); opacity: 0.08; }
        }
        .animate-grid-shift {
          animation: grid-shift 20s linear infinite;
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 12s ease-in-out infinite;
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
        .will-change-transform {
          will-change: transform;
        }
      `}} />

    </div>
    </>
  );
}
