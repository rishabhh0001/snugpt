"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";

// --- Retro Web Audio Synthesizer (Zero External Dependencies) ---
class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  jump() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // AudioContext policy safe catch
    }
  }

  score() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch {}
  }

  bonus() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.18, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.1);
      });
    } catch {}
  }

  crash() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // White noise burst for 8-bit crash
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.25);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(now);
    } catch {}
  }
}

// Particle explosion
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

// Campus Obstacle Pipe
interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
  hasToken?: boolean;
  tokenY?: number;
  tokenType?: "attendance" | "maggi" | "a_grade";
  tokenCollected?: boolean;
}

const SNU_QUOTES = [
  "Don't worry, attendance is guaranteed till September 7!",
  "Take a breather and grab a 2 AM Maggi at D-Block.",
  "The 3rd floor Central Library silence will heal this run.",
  "LASC doubt-clearing tutorial is now available for Paper Plane physics.",
  "Stay focused — Dean's List ceremony is on February 13!",
  "Drop that 1st-half CCC course and try again!",
  "Even with a crash, Breeze 2027 stage lights still shine on you.",
  "Lost your ID card again? Go check at the library desk.",
  "You missed the shuttle to City Centre! Run!",
  "Surviving on Nescafe and pending assignments.",
  "Did you check Blackboard? Deadline is in 5 minutes!",
  "Winging the mid-sems like this paper plane."
];

export default function EasterEggPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundRef = useRef<SoundController>(new SoundController());

  // Game States
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [campusQuote, setCampusQuote] = useState<string>("");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Physics & Logic Refs
  const birdY = useRef<number>(250);
  const birdVelocity = useRef<number>(0);
  const obstacles = useRef<Obstacle[]>([]);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<{ x: number; y: number; speed: number; size: number }[]>([]);
  const frameId = useRef<number>(0);
  const lastSpawn = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const bannerTimer = useRef<NodeJS.Timeout | null>(null);

  // Load high score from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("snugpt_easter_highscore");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) setHighScore(val);
      }
    } catch {}
  }, []);

  // Sync audio toggle
  const toggleAudio = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundRef.current.enabled = next;
  };

  // Trigger floating campus banner
  const triggerBanner = (msg: string) => {
    setBannerMessage(msg);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => {
      setBannerMessage(null);
    }, 2800);
  };

  // Jump Action
  const jump = useCallback(() => {
    if (gameState === "ready") {
      setGameState("playing");
      birdVelocity.current = -5.5;
      soundRef.current.jump();
      return;
    }
    if (gameState === "gameover") {
      restartGame();
      return;
    }
    // Playing
    birdVelocity.current = -5.0;
    soundRef.current.jump();

    // Spawn tiny paper trails
    for (let i = 0; i < 4; i++) {
      particles.current.push({
        x: 80 - 16,
        y: birdY.current + (Math.random() * 8 - 4),
        vx: -(Math.random() * 3 + 2),
        vy: Math.random() * 2 - 1,
        color: Math.random() > 0.5 ? "#ffffff" : "#e2e8f0",
        size: Math.random() * 3 + 2,
        alpha: 1,
        life: 1,
      });
    }
  }, [gameState]);

  // Restart Game
  const restartGame = () => {
    birdY.current = 240;
    birdVelocity.current = -5.5;
    obstacles.current = [];
    particles.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState("playing");
    setBannerMessage(null);
  };

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = 420;
    const logicalHeight = 560;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    ctx.scale(dpr, dpr);

    // Initialize starry backdrop
    if (stars.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        stars.current.push({
          x: Math.random() * logicalWidth,
          y: Math.random() * logicalHeight,
          speed: Math.random() * 0.4 + 0.1,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      // 1. CLEAR & BACKGROUND
      const gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
      gradient.addColorStop(0, "#090d16");
      gradient.addColorStop(0.5, "#0d1322");
      gradient.addColorStop(1, "#111827");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Stars parallax
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      stars.current.forEach((star) => {
        if (gameState === "playing") {
          star.x -= star.speed * 1.2;
          if (star.x < 0) star.x = logicalWidth;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant campus silhouettes at bottom
      ctx.fillStyle = "rgba(249, 115, 22, 0.05)";
      ctx.fillRect(0, logicalHeight - 40, logicalWidth, 40);
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(0, logicalHeight - 35, logicalWidth, 35);

      // Glowing grid lines on ground
      ctx.strokeStyle = "rgba(249, 115, 22, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, logicalHeight - 35);
      ctx.lineTo(logicalWidth, logicalHeight - 35);
      ctx.stroke();

      // 2. GAME STATE: PLAYING
      if (gameState === "playing") {
        // Apply Gravity
        birdVelocity.current += 0.25;
        birdY.current += birdVelocity.current;

        // Ground / Ceiling bounds
        if (birdY.current < 15) {
          birdY.current = 15;
          birdVelocity.current = 0;
        }
        if (birdY.current > logicalHeight - 50) {
          // Crash on ground
          soundRef.current.crash();
          handleGameOver();
        }

        // Spawn obstacles
        const now = Date.now();
        if (now - lastSpawn.current > 1500) {
          lastSpawn.current = now;
          const gap = 145; // generous opening for fun play
          const minH = 60;
          const maxH = logicalHeight - 35 - gap - minH;
          const topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
          const bottomH = logicalHeight - 35 - gap - topH;

          // Optional bonus token in the center of gap
          const spawnToken = Math.random() < 0.65;
          let tokenType: "attendance" | "maggi" | "a_grade" = "attendance";
          const r = Math.random();
          if (r < 0.33) tokenType = "maggi";
          else if (r < 0.66) tokenType = "a_grade";

          obstacles.current.push({
            x: logicalWidth + 20,
            width: 54,
            topHeight: topH,
            bottomHeight: bottomH,
            passed: false,
            hasToken: spawnToken,
            tokenY: topH + gap / 2,
            tokenType: tokenType,
            tokenCollected: false,
          });
        }

        // Update & Render Obstacles
        const speed = 2.4;
        const birdX = 80;
        const birdRadius = 14;

        for (let i = obstacles.current.length - 1; i >= 0; i--) {
          const obs = obstacles.current[i];
          obs.x -= speed;

          // Draw Top Pillar (Cyber Campus Architecture)
          const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
          topGrad.addColorStop(0, "#1e293b");
          topGrad.addColorStop(0.5, "#334155");
          topGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = topGrad;
          ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);

          // Top pillar neon rim
          ctx.fillStyle = "#f97316";
          ctx.fillRect(obs.x - 2, obs.topHeight - 8, obs.width + 4, 8);
          ctx.fillStyle = "rgba(249, 115, 22, 0.4)";
          ctx.fillRect(obs.x + 4, 0, 4, obs.topHeight - 8);

          // Draw Bottom Pillar
          const bottomY = logicalHeight - 35 - obs.bottomHeight;
          const botGrad = ctx.createLinearGradient(obs.x, bottomY, obs.x + obs.width, bottomY);
          botGrad.addColorStop(0, "#1e293b");
          botGrad.addColorStop(0.5, "#334155");
          botGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = botGrad;
          ctx.fillRect(obs.x, bottomY, obs.width, obs.bottomHeight);

          // Bottom pillar neon rim
          ctx.fillStyle = "#f97316";
          ctx.fillRect(obs.x - 2, bottomY, obs.width + 4, 8);
          ctx.fillStyle = "rgba(249, 115, 22, 0.4)";
          ctx.fillRect(obs.x + 4, bottomY + 8, 4, obs.bottomHeight);

          // Draw Floating SNU Campus Token
          if (obs.hasToken && !obs.tokenCollected && obs.tokenY) {
            const tokenX = obs.x + obs.width / 2;
            const tokenY = obs.tokenY + Math.sin(now / 180) * 5;

            ctx.save();
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 10;

            if (obs.tokenType === "maggi") {
              // Warm yellow Maggi bowl
              ctx.fillStyle = "#eab308";
              ctx.beginPath();
              ctx.arc(tokenX, tokenY, 11, 0, Math.PI);
              ctx.fill();
              ctx.fillStyle = "#fef08a";
              ctx.font = "bold 9px sans-serif";
              ctx.fillText("🍜", tokenX - 7, tokenY - 1);
            } else if (obs.tokenType === "a_grade") {
              // Emerald Grade Token
              ctx.fillStyle = "#10b981";
              ctx.beginPath();
              ctx.arc(tokenX, tokenY, 11, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 10px monospace";
              ctx.textAlign = "center";
              ctx.fillText("A+", tokenX, tokenY + 3.5);
            } else {
              // Attendance Pass
              ctx.fillStyle = "#f97316";
              ctx.beginPath();
              ctx.arc(tokenX, tokenY, 11, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 9px monospace";
              ctx.textAlign = "center";
              ctx.fillText("ATT", tokenX, tokenY + 3.5);
            }
            ctx.restore();

            // Collision with Token
            const dist = Math.hypot(tokenX - birdX, tokenY - birdY.current);
            if (dist < birdRadius + 11) {
              obs.tokenCollected = true;
              soundRef.current.bonus();
              const bonusPts = obs.tokenType === "maggi" ? 5 : obs.tokenType === "a_grade" ? 4 : 3;
              scoreRef.current += bonusPts;
              setScore(scoreRef.current);

              // Burst particles
              const pColor = obs.tokenType === "maggi" ? "#eab308" : obs.tokenType === "a_grade" ? "#10b981" : "#f97316";
              for (let p = 0; p < 12; p++) {
                const angle = Math.random() * Math.PI * 2;
                const sp = Math.random() * 4 + 2;
                particles.current.push({
                  x: tokenX,
                  y: tokenY,
                  vx: Math.cos(angle) * sp,
                  vy: Math.sin(angle) * sp,
                  color: pColor,
                  size: Math.random() * 3 + 2,
                  alpha: 1,
                  life: 1,
                });
              }

              // Easter egg toasts
              if (obs.tokenType === "maggi") triggerBanner("🍜 +5 2AM Maggi Energy Boost!");
              else if (obs.tokenType === "a_grade") triggerBanner("🎓 +4 Dean's List Grade Buff!");
              else triggerBanner("✅ +3 Attendance Guaranteed!");
            }
          }

          // Check Collision with Pillars
          const inHorizontalBounds = birdX + birdRadius > obs.x && birdX - birdRadius < obs.x + obs.width;
          const hitTop = birdY.current - birdRadius < obs.topHeight;
          const hitBottom = birdY.current + birdRadius > bottomY;

          if (inHorizontalBounds && (hitTop || hitBottom)) {
            soundRef.current.crash();
            handleGameOver();
          }

          // Score when passed
          if (!obs.passed && obs.x + obs.width < birdX) {
            obs.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            soundRef.current.score();

            // Milestones
            if (scoreRef.current === 10) triggerBanner("🔥 10 Streak: Paper Plane Activated!");
            if (scoreRef.current === 25) triggerBanner("⚡ 25 Streak: Breeze '27 All-Access!");
            if (scoreRef.current === 50) triggerBanner("👑 50 Score: SNUGPT Supreme Master!");
          }

          // Cleanup off-screen
          if (obs.x + obs.width < -30) {
            obstacles.current.splice(i, 1);
          }
        }
      }

      // 3. RENDER PARTICLES
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        p.alpha = Math.max(0, p.life);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        }
      }

      // 4. DRAW PAPER PLANE (Bird)
      const bX = 80;
      const bY = gameState === "ready" ? 240 + Math.sin(Date.now() / 250) * 8 : birdY.current;
      const tilt = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (birdVelocity.current * 3.5 * Math.PI) / 180));

      ctx.save();
      ctx.translate(bX, bY);
      ctx.rotate(tilt);

      // Paper Plane Shadow
      ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
      ctx.shadowBlur = 10;

      // Paper Plane Body (Triangle)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(16, 0); // Nose
      ctx.lineTo(-12, -10); // Top tail
      ctx.lineTo(-8, 0); // Inner center
      ctx.lineTo(-12, 10); // Bottom tail
      ctx.closePath();
      ctx.fill();

      // Wing Fold
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      frameId.current = requestAnimationFrame(gameLoop);
    };

    const handleGameOver = () => {
      setGameState("gameover");
      // Choose random SNU campus quote
      const q = SNU_QUOTES[Math.floor(Math.random() * SNU_QUOTES.length)];
      setCampusQuote(q);

      // Save high score
      setHighScore((prev) => {
        const next = Math.max(prev, scoreRef.current);
        try {
          localStorage.setItem("snugpt_easter_highscore", next.toString());
        } catch {}
        return next;
      });

      // Big explosion particles
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * 6 + 1;
        particles.current.push({
          x: 80,
          y: birdY.current,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          color: i % 2 === 0 ? "#f97316" : "#38bdf8",
          size: Math.random() * 4 + 2,
          alpha: 1,
          life: 1.2,
        });
      }
    };

    frameId.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(frameId.current);
    };
  }, [gameState]);

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-4 selection:bg-orange-500/30 font-sans overflow-x-hidden">
      {/* Top Header / Nav */}
      <header className="w-full max-w-xl flex items-center justify-between py-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] transition border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chat</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-sm font-semibold tracking-wide flex items-center gap-1.5 text-neutral-200">
              <Gamepad2 className="w-4 h-4 text-orange-400" />
              SNU Paper Plane
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* High Score Pill */}
          <div className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>BEST: {highScore}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="p-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-neutral-300 hover:text-white transition"
            title={soundEnabled ? "Mute audio" : "Unmute audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Frame */}
      <main className="relative flex flex-col items-center my-auto w-full max-w-md select-none">
        {/* Banner Toast Notification */}
        {bannerMessage && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-orange-600/90 text-white font-mono text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur border border-orange-400/40 z-30 animate-in fade-in slide-in-from-top-2 duration-200 whitespace-nowrap">
            {bannerMessage}
          </div>
        )}

        {/* Arcade Cabinet Container */}
        <div className="relative rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl shadow-orange-500/5 bg-neutral-900 w-full aspect-[420/560] max-w-[420px] max-h-[560px]">
          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            onClick={jump}
            className="w-full h-full block cursor-pointer touch-none"
            style={{ touchAction: "none" }}
          />

          {/* In-Game Real-Time Score Badge */}
          {gameState === "playing" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono">
                {score}
              </span>
            </div>
          )}

          {/* READY OVERLAY */}
          {gameState === "ready" && (
            <div
              onClick={jump}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center cursor-pointer z-20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 animate-bounce">
                <Sparkles className="w-7 h-7 text-neutral-950" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                SNU Paper Plane
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mb-6 font-mono">
                Pilot through D-Block & Library pillars. Collect Attendance passes & 2 AM Maggi!
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-sm shadow-md active:scale-95 transition">
                <Flame className="w-4 h-4" />
                <span>TAP / PRESS SPACE TO FLY</span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs text-left text-[11px] font-mono text-neutral-400 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">SPACE</span>
                  <span>PC Jump</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">TAP</span>
                  <span>Mobile Jump</span>
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 mb-1">
                Simulation Finished
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                {score > highScore ? "🎉 NEW CAMPUS RECORD!" : "GLIDER DOWN"}
              </h2>

              {/* Scorecard */}
              <div className="w-full max-w-xs bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Score</div>
                  <div className="text-3xl font-bold text-white font-mono">{score}</div>
                </div>
                <div className="border-l border-white/10">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Best</div>
                  <div className="text-3xl font-bold text-orange-400 font-mono">{highScore}</div>
                </div>
              </div>

              {/* Campus Quote */}
              <p className="text-xs text-neutral-300 italic max-w-xs mb-6 px-2 font-mono leading-relaxed bg-neutral-800/40 py-2 rounded border border-white/5">
                "{campusQuote}"
              </p>

              {/* Restart Button */}
              <button
                onClick={restartGame}
                className="w-full max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN (SPACE / TAP)</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Fast-Tap Button for touch devices */}
        <div className="w-full max-w-[420px] mt-3 md:hidden">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              jump();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              jump();
            }}
            className="w-full py-3.5 rounded-xl bg-white/[0.05] active:bg-orange-500/30 border border-white/10 text-neutral-300 active:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 select-none touch-manipulation"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Tap to Glide</span>
          </button>
        </div>
      </main>

      {/* Footer Easter Egg Credit */}
      <footer className="w-full max-w-xl text-center py-2 text-neutral-500 text-xs font-mono">
        <p>
          Shiv Nadar University Sandbox • Secret Easter Egg //{" "}
          <Link href="/" className="hover:text-orange-400 transition underline underline-offset-4">
            SNUGPT Home
          </Link>
        </p>
      </footer>
    </div>
  );
}
