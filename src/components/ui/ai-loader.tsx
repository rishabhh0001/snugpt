"use client";

import { cn } from "@/lib/utils";

interface AILoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function AILoader({ className, fullScreen = false }: AILoaderProps) {
  const text = "Initializing\u00A0SNUGPT";
  const letters = Array.from(text);

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background text-foreground select-none",
        fullScreen ? "fixed inset-0 z-50 w-screen h-screen" : "w-full h-full min-h-[250px]",
        className
      )}
    >
      <div className="loader-wrapper">
        {letters.map((letter, idx) => (
          <span key={idx} className="loader-letter">
            {letter}
          </span>
        ))}
        {/* Glow rotate circular loader element */}
        <div className="loader" />
      </div>
    </div>
  );
}

// Named alias matching "Component" inside the user prompt
export const Component = AILoader;
