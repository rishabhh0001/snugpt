"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { cn } from "@/lib/utils";

const DEFAULT_CONFIG: Omit<COBEOptions, "width" | "height"> = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.2, 0.2, 0.25],
  markerColor: [1, 0.45, 0.1], // SNU vibrant orange
  glowColor: [0.2, 0.2, 0.3],
  markers: [
    { location: [28.5244, 77.5755], size: 0.12 }, // Shiv Nadar University (Delhi-NCR)
    { location: [40.7128, -74.006], size: 0.08 },
    { location: [51.5074, -0.1278], size: 0.08 },
    { location: [35.6762, 139.6503], size: 0.08 },
    { location: [1.3521, 103.8198], size: 0.07 },
    { location: [-33.8688, 151.2093], size: 0.07 },
    { location: [25.2048, 55.2708], size: 0.08 },
    { location: [37.7749, -122.4194], size: 0.08 },
  ],
};

export interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

export function Globe({ className, config }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<boolean>(false);
  const lastClientX = useRef<number>(0);
  const phiOffset = useRef<number>(0);
  const phiBase = useRef<number>(0);
  const velocity = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 300;
    if (width < 50) width = 300;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animFrameId: number;

    const onResize = () => {
      if (!canvas) return;
      const newWidth = canvas.offsetWidth || canvas.parentElement?.offsetWidth || width;
      if (newWidth > 0 && globe) {
        width = newWidth;
        globe.update({
          width: width * 2,
          height: width * 2,
        });
      }
    };

    window.addEventListener("resize", onResize);

    try {
      globe = createGlobe(canvas, {
        ...DEFAULT_CONFIG,
        ...config,
        width: width * 2,
        height: width * 2,
        phi: 0,
      });

      setIsLoaded(true);

      const renderLoop = () => {
        if (!pointerInteracting.current) {
          phiBase.current += 0.005; // auto-spin
          if (Math.abs(velocity.current) > 0.0001) {
            phiOffset.current += velocity.current;
            velocity.current *= 0.95; // momentum dampening
          }
        }

        if (globe) {
          globe.update({
            phi: phiBase.current + phiOffset.current,
          });
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);
    } catch (err) {
      console.warn("Failed to initialize cobe WebGL globe:", err);
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", onResize);
      if (globe) {
        globe.destroy();
      }
    };
  }, [config]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = true;
    lastClientX.current = e.clientX;
    velocity.current = 0;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerInteracting.current) return;
    const delta = e.clientX - lastClientX.current;
    lastClientX.current = e.clientX;
    const phiDelta = delta * 0.007;
    phiOffset.current += phiDelta;
    velocity.current = phiDelta; // record momentum
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch if pointer was lost
      }
      canvas.style.cursor = "grab";
    }
  };

  return (
    <div className={cn("relative aspect-square w-full flex items-center justify-center select-none", className)}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "none",
        }}
        className={cn(
          "size-full rounded-full transition-opacity duration-700",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}

export default Globe;
