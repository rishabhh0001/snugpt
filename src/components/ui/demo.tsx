"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/cosmic-404";

// 🎞️ Animation Variants
const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const globeVariants: any = {
  hidden: { scale: 0.85, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
  floating: {
    y: [-4, 4],
    transition: {
      duration: 5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export interface NotFoundProps {
  title?: string;
  description?: string;
  backText?: string;
  onBack?: () => void;
}

export default function NotFound({
  title = "Oops! Lost in space",
  description = "We couldn’t find the page you’re looking for. It might have been moved or deleted.",
  backText = "Go Back",
  onBack,
}: NotFoundProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          className="text-center flex flex-col items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeUp}
        >
          {/* Animated 4[Globe]4 */}
          <div className="flex items-center justify-center gap-6 mb-8 select-none">
            <motion.span
              className="text-7xl md:text-9xl font-extrabold text-foreground/90 selection:bg-transparent"
              variants={fadeUp}
            >
              4
            </motion.span>

            <motion.div
              className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center"
              variants={globeVariants}
              animate={["visible", "floating"]}
            >
              <Globe className="w-full h-full" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
            </motion.div>

            <motion.span
              className="text-7xl md:text-9xl font-extrabold text-foreground/90 selection:bg-transparent"
              variants={fadeUp}
            >
              4
            </motion.span>
          </div>

          <motion.h1
            className="mb-4 text-3xl md:text-5xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent"
            variants={fadeUp}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-md text-base md:text-lg text-muted-foreground/80 leading-relaxed"
            variants={fadeUp}
          >
            {description}
          </motion.p>

          <motion.div variants={fadeUp}>
            <Button
              onClick={handleBack}
              className="gap-2 cursor-pointer transition-all duration-300 font-medium px-6 py-5 active:scale-95 text-base shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {backText}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
