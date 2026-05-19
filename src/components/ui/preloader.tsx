"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Liquid Morphing Text Configuration ---
const morphTime = 0.4;
const cooldownTime = 0.15;

const words = [
  "Hello",          // English
  "नमस्ते",         // Hindi
  "வணக்கம்",        // Tamil
  "Bonjour",        // French
  "Guten Tag",      // German
  "Hola",           // Spanish
  "Ciao",           // Italian
  "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ"   // Punjabi
];

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2 || !texts || texts.length === 0) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full text-center text-white"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full text-center text-white"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg id="filters" className="hidden" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => (
  <div
    className={cn(
      "relative mx-auto h-24 w-full max-w-screen-md text-center font-sans text-[28pt] sm:text-[36pt] md:text-[48pt] font-bold leading-none [filter:url(#threshold)_blur(0.6px)] md:h-32 lg:text-[5.5rem] text-white flex items-center justify-center select-none",
      className,
    )}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
);

// --- Main Preloader Component ---
const slideUp: any = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
  },
};

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Preload cycle timer to trigger transition to the initialized card
  useEffect(() => {
    if (isLoaded) return;

    // Calculate total duration for one full cycle through the words array
    const totalDuration = words.length * (morphTime + cooldownTime) * 1000 - 200;
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  const handleAccess = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 1100);
  };

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;

  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const curve: any = {
    initial: {
      d: initialPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#050505] z-[99999999999] overflow-hidden"
    >
      {/* Subtle moving abstract radial background light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_60%)] animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <motion.div
              key="greeting-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Premium micro status light */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500/80 text-xs font-mono tracking-widest uppercase select-none animate-pulse">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                Initializing
              </div>
              
              {/* Liquid Morphing Text Animation */}
              <MorphingText texts={words} className="w-full" />
            </motion.div>
          ) : (
            <motion.div
              key="access-screen"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
              className="flex flex-col items-center gap-6"
            >
              {/* Glowing Icon Container */}
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-2">
                <CheckCircle2 className="w-8 h-8" />
                <span className="absolute inset-0 rounded-full border border-amber-500/40 animate-ping opacity-25" />
              </div>

              <div className="space-y-2">
                <h2 className="text-white text-2xl md:text-3xl font-semibold tracking-tight">
                  System Initialized
                </h2>
                <p className="text-zinc-400 text-sm md:text-base max-w-sm">
                  Your content has successfully loaded. Click below to access.
                </p>
              </div>

              {/* Premium glowing access button */}
              <motion.button
                onClick={handleAccess}
                initial="initial"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-white text-black font-semibold text-sm md:text-base tracking-wide overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-300"
              >
                {/* Background amber glow gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer light sweep reflection */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                  variants={{
                    initial: { left: "-100%" },
                    hover: { left: "100%" }
                  }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                />

                {/* Button Content */}
                <span className="relative z-10 flex items-center gap-2 font-bold tracking-wider">
                  <span>ACCESS SNUGPT</span>
                  <motion.span
                    variants={{
                      initial: { x: 0 },
                      hover: { x: 5 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>

                {/* Ambient glowing outer halo */}
                <motion.span
                  className="absolute inset-0 rounded-full border border-amber-400/0 opacity-0"
                  variants={{
                    initial: { scale: 0.95, opacity: 0 },
                    hover: { scale: 1.05, opacity: 1, borderColor: "rgba(245,158,11,0.5)" }
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Curved slide up transition SVG */}
      {dimension.width > 0 && (
        <svg className="absolute top-0 w-full h-[calc(100%+300px)] pointer-events-none">
          <motion.path
            variants={curve}
            initial="initial"
            animate={isExiting ? "exit" : "initial"}
            fill="#050505"
          />
        </svg>
      )}
    </motion.div>
  );
}
