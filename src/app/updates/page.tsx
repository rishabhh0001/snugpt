"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Cpu,
  Database,
  Lock,
  Clock,
  Calendar,
  ArrowLeft,
  GitBranch,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
  ArrowUpRight,
  Shield,
  BookOpen,
  Search,
  Star,
  GitFork,
  RotateCcw,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/ui/header-2';

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
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
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(242, 169, 0, 0.07), transparent 80%)`
        ),
      }}
    />
  );
};

interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  author?: {
    avatar_url: string;
    html_url: string;
    login: string;
  };
  html_url: string;
}

// Milestone representation
interface MilestoneFeature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface Milestone {
  version: string;
  title: string;
  date: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: MilestoneFeature[];
}

export default function UpdatesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'milestones'>('commits');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Dynamic repository states
  const [activeRepo, setActiveRepo] = useState<string>('rishabhh0001/snugpt');
  const [repoInput, setRepoInput] = useState<string>('');
  const [repoDetails, setRepoDetails] = useState<any>(null);
  const [isLoadingRepoDetails, setIsLoadingRepoDetails] = useState(false);

  // Progressive timeline drawing
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 15,
    restDelta: 0.001
  });

  const milestones: Milestone[] = [
    {
      version: "v1.2.0",
      title: "Neural Chat & Branding Alignment",
      date: "May 21, 2026",
      badge: "Latest Release",
      badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      description: "A major step forward in conversation logic, query streaming, and project branding consistency. Introducing lightning-fast semantic queries and persistent multi-turn chat memory structures.",
      features: [
        {
          title: "Multi-Turn Dialogue Memory Engine",
          description: "Optimized context window tokenization rules to support seamless, long-context academic discussions with SNUGPT without losing previous turn context.",
          icon: Cpu
        },
        {
          title: "Streaming Text & Speed Boost",
          description: "Integrated server-sent events (SSE) for sub-100ms response times and smooth letter-by-letter rendering during campus knowledge inquiries.",
          icon: Zap
        },
        {
          title: "Standardized SNUGPT Casing Alignments",
          description: "Systematically aligned all user-facing interface copy, quotes, and profile pages to utilize all-caps SNUGPT, ensuring premium identity across the platform.",
          icon: Sparkles
        }
      ]
    },
    {
      version: "v1.1.6",
      title: "SNU Knowledge Map Integration",
      date: "April 15, 2026",
      badge: "Feature Drop",
      badgeColor: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      description: "Deep indexing of campus policies, department directories, hostel timings, and mess menus. SNUGPT now parses and visualizes intricate campus data structures.",
      features: [
        {
          title: "Campus Directory & Map Search",
          description: "Full-text and semantic searching across administrative contact lists, academic block placements, and departmental offices.",
          icon: GitBranch
        },
        {
          title: "Vector Student Handbook Indexing",
          description: "Ingested and split the 150-page student handbook into semantic chunk vector layers to resolve policy inquiries in under a second.",
          icon: Database
        },
        {
          title: "Mess & Hostel Timings Dashboard",
          description: "Specialized context tools that parse dynamic dining hall schedules and gate timings directly from the sidebar preferences.",
          icon: Terminal
        }
      ]
    },
    {
      version: "v1.1.0",
      title: "Platform Launch",
      date: "May 01, 2026",
      badge: "Major",
      badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      description: "The official launch of the SNUGPT campus intelligence portal. Equipping students with robust OAuth entry points, a customized dashboard, and localized vector support.",
      features: [
        {
          title: "Academic Portal Dashboard",
          description: "Custom built, premium dark-mode dashboard panel utilizing Neon PostgreSQL to persist individual student workspace parameters safely.",
          icon: CheckCircle2
        },
        {
          title: "Secure Google & GitHub OAuth",
          description: "Standardized secure university single-sign-on credentials integration through NextAuth.js layers.",
          icon: Lock
        },
        {
          title: "High-Aesthetic Grid & Glow System",
          description: "Immersive landing page experience leveraging smooth scroll bindings, glassmorphic timeline cards, and dynamic grid overlays.",
          icon: Sparkles
        }
      ]
    }
  ];

  const fetchCommitsAndDetails = async (repo: string) => {
    setIsLoading(true);
    setIsLoadingRepoDetails(true);
    setError(null);
    setRateLimited(false);

    // Clean and parse repo name
    let cleanRepo = repo.trim();
    if (cleanRepo.includes('github.com/')) {
      const parts = cleanRepo.split('github.com/');
      if (parts.length > 1) {
        cleanRepo = parts[1].split('?')[0].split('#')[0];
      }
    }
    
    // Strip leading or trailing slashes
    cleanRepo = cleanRepo.replace(/^\/+|\/+$/g, '');

    if (!cleanRepo) {
      setError("Please enter a repository name.");
      setIsLoading(false);
      setIsLoadingRepoDetails(false);
      return;
    }

    const repoRegex = /^[^/]+\/[^/]+$/;
    if (!repoRegex.test(cleanRepo)) {
      setError("Invalid repository format. Please enter 'owner/repo' or a full GitHub repository URL.");
      setIsLoading(false);
      setIsLoadingRepoDetails(false);
      return;
    }

    try {
      // Fetch commits and details in parallel
      const [commitsRes, detailsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${cleanRepo}/commits?per_page=30`),
        fetch(`https://api.github.com/repos/${cleanRepo}`)
      ]);

      if (commitsRes.status === 403 || detailsRes.status === 403) {
        setRateLimited(true);
        setError("GitHub API rate limit exceeded. Displaying curated official milestones.");
        setActiveTab('milestones');
        setIsLoading(false);
        setIsLoadingRepoDetails(false);
        return;
      }

      if (commitsRes.status === 404 || detailsRes.status === 404) {
        setError(`Repository '${cleanRepo}' not found or is private. Please verify the path and try again.`);
        setIsLoading(false);
        setIsLoadingRepoDetails(false);
        return;
      }

      if (!commitsRes.ok) {
        throw new Error(`Failed to fetch commits: ${commitsRes.statusText}`);
      }
      if (!detailsRes.ok) {
        throw new Error(`Failed to fetch repository details: ${detailsRes.statusText}`);
      }

      const commitsData = await commitsRes.json();
      const detailsData = await detailsRes.json();

      setCommits(commitsData);
      setRepoDetails(detailsData);
      setActiveRepo(cleanRepo);
      localStorage.setItem('snugpt-updates-repo', cleanRepo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to connect to GitHub repository feed.");
      // Switch to milestones only if we don't have commits
      if (commits.length === 0) {
        setActiveTab('milestones');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingRepoDetails(false);
    }
  };

  useEffect(() => {
    const savedRepo = typeof window !== 'undefined' ? localStorage.getItem('snugpt-updates-repo') || 'rishabhh0001/snugpt' : 'rishabhh0001/snugpt';
    setActiveRepo(savedRepo);
    setRepoInput(savedRepo);
    fetchCommitsAndDetails(savedRepo);
  }, []);

  // Parse conventional commit format
  const parseCommit = (message: string) => {
    const lines = message.split('\n');
    const header = lines[0].trim();
    const body = lines.slice(1).filter(l => l.trim().length > 0).join('\n');

    // Parse tag prefix e.g. "feat(chat): added memory" -> type: "feat", scope: "chat", subject: "added memory"
    const match = header.match(/^([a-z]+)(?:\(([^)]+)\))?(!?):\s*(.*)$/i);

    if (match) {
      const [_, type, scope, isBreaking, subject] = match;
      const typeLower = type.toLowerCase();
      
      let badge = "Update";
      let icon = GitBranch;
      let color = "bg-white/5 border-white/10 text-white/60";

      if (typeLower === 'feat' || typeLower === 'feature') {
        badge = scope ? `Feat (${scope})` : "Feature";
        icon = Sparkles;
        color = "bg-amber-500/10 border-amber-500/30 text-amber-400";
      } else if (typeLower === 'fix') {
        badge = scope ? `Fix (${scope})` : "Fix";
        icon = Shield;
        color = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      } else if (typeLower === 'docs') {
        badge = "Docs";
        icon = BookOpen;
        color = "bg-sky-500/10 border-sky-500/30 text-sky-400";
      } else if (typeLower === 'perf') {
        badge = "Performance";
        icon = Cpu;
        color = "bg-purple-500/10 border-purple-500/30 text-purple-400";
      } else if (typeLower === 'refactor') {
        badge = "Refactor";
        icon = Terminal;
        color = "bg-orange-500/10 border-orange-500/30 text-orange-400";
      } else if (typeLower === 'chore' || typeLower === 'test' || typeLower === 'style') {
        badge = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);
        icon = Clock;
        color = "bg-zinc-500/10 border-zinc-500/30 text-zinc-400";
      }

      if (isBreaking) {
        badge = `Breaking: ${badge}`;
        color = "bg-rose-500/10 border-rose-500/30 text-rose-400";
      }

      return {
        title: subject || header,
        badge,
        icon,
        color,
        body: body || null
      };
    }

    // Default return
    return {
      title: header,
      badge: "Update",
      icon: GitBranch,
      color: "bg-white/5 border-white/10 text-white/50",
      body: body || null
    };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight relative flex flex-col justify-between">
      <MouseFollowGlow />

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[15%] w-[700px] h-[400px] rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute top-[15%] right-[5%] w-[500px] h-[300px] rounded-full bg-gradient-to-br from-amber-500/5 via-amber-600/5 to-transparent blur-[110px] pointer-events-none animate-pulse-slow" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Header Integration */}
      <Header />

      <main className="relative max-w-[75rem] mx-auto w-full px-6 pt-24 pb-20 z-10 flex-grow">

        {/* Breadcrumb back navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-white/40 hover:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
          </Link>
        </div>

        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 text-[9px] font-black text-amber-400 mb-6 uppercase tracking-widest"
          >
            <Clock className="w-3 h-3 text-amber-400" /> PLATFORM UPDATES
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none"
          >
            SNUGPT Updates
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-white/40 leading-relaxed font-medium"
          >
            Real-time deployment streams and curated release notes detailing the progressive growth of SNUGPT university workspace algorithms.
          </motion.p>
        </motion.div>

        {/* Dynamic Warning Alert for Rate Limiting / Errors */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-xl flex items-center justify-between gap-4 z-40 relative"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">GitHub API Notice</h4>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed font-medium">
                    {rateLimited 
                      ? "Unauthenticated rate limits reached. Falling back to offline official milestones." 
                      : error}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => fetchCommitsAndDetails(activeRepo)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[9px] font-black uppercase text-white/80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Toggle Pill */}
        <div className="flex justify-center mb-16 relative z-40">
          <div className="p-1 rounded-full bg-white/[0.02] border border-white/5 flex gap-1 relative overflow-hidden backdrop-blur-lg">
            <button
              onClick={() => setActiveTab('commits')}
              disabled={rateLimited}
              className={`relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 z-10 flex items-center gap-1.5 ${
                activeTab === 'commits' 
                  ? 'text-black shadow-lg' 
                  : 'text-white/40 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              {activeTab === 'commits' && (
                <motion.div
                  layoutId="active-tab-glow"
                  className="absolute inset-0 bg-white rounded-full z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <GitBranch className="w-3.5 h-3.5" /> Live Commits
            </button>
            
            <button
              onClick={() => setActiveTab('milestones')}
              className={`relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 z-10 flex items-center gap-1.5 ${
                activeTab === 'milestones' 
                  ? 'text-black shadow-lg' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {activeTab === 'milestones' && (
                <motion.div
                  layoutId="active-tab-glow"
                  className="absolute inset-0 bg-white rounded-full z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Sparkles className="w-3.5 h-3.5" /> Curated Milestones
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto mt-12 mb-16">

          {/* Central Vertical animated timeline bar (Desktop) */}
          <div className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-[1px] bg-white/5 -translate-x-1/2 hidden sm:block z-0" />

          {/* Framer-Motion Animated Progress Line overlay */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-500 via-indigo-500 to-indigo-600 origin-top -translate-x-1/2 hidden sm:block z-10"
          />

          {/* 1. GitHub Commits Timeline */}
          {activeTab === 'commits' && (
            <div className="space-y-16">
              {/* Repository Selector Input Bar */}
              <div className="max-w-xl mx-auto mb-10 p-2 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-2 relative z-40">
                <div className="flex-grow relative flex items-center">
                  <Search className="w-4 h-4 text-white/30 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="Enter owner/repo or full GitHub URL..."
                    className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-white/30 pl-10 pr-3 py-2.5 focus:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchCommitsAndDetails(repoInput);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => fetchCommitsAndDetails(repoInput)}
                  disabled={isLoading || !repoInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 select-none cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Fetch"}
                </button>
                {activeRepo !== 'rishabhh0001/snugpt' && (
                  <button
                    onClick={() => {
                      setRepoInput('rishabhh0001/snugpt');
                      fetchCommitsAndDetails('rishabhh0001/snugpt');
                    }}
                    title="Reset to default SNUGPT repo"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 hover:border-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Repository Metadata Card */}
              {repoDetails && !isLoadingRepoDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto p-6 rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-xl relative overflow-hidden shadow-xl mb-12 text-left"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {repoDetails.owner?.avatar_url && (
                        <img 
                          src={repoDetails.owner.avatar_url} 
                          alt={repoDetails.owner.login} 
                          className="w-12 h-12 rounded-xl border border-white/10 shadow-lg object-cover shrink-0" 
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg font-black tracking-tight text-white font-jakarta">
                            {repoDetails.full_name}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/60 uppercase tracking-widest">
                            {repoDetails.visibility || "Public"}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed font-medium mt-1 font-inter">
                          {repoDetails.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <a
                      href={repoDetails.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[9px] font-black uppercase text-white/80 transition-all shrink-0 active:scale-95 group cursor-pointer"
                    >
                      View GitHub <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  {/* Metadata Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01]">
                      <Star className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Stars</span>
                        <span className="text-xs font-black text-white mt-0.5">{repoDetails.stargazers_count?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01]">
                      <GitFork className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Forks</span>
                        <span className="text-xs font-black text-white mt-0.5">{repoDetails.forks_count?.toLocaleString()}</span>
                      </div>
                    </div>

                    {repoDetails.language && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01]">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" style={{ backgroundColor: repoDetails.language === 'TypeScript' ? '#3178c6' : repoDetails.language === 'JavaScript' ? '#f1e05a' : '#f2a900' }} />
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Language</span>
                          <span className="text-xs font-black text-white mt-0.5">{repoDetails.language}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01]">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Issues</span>
                        <span className="text-xs font-black text-white mt-0.5">{repoDetails.open_issues_count?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoading ? (
                // Premium Skeleton Shimmer State
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start animate-pulse">
                    <div className="md:col-span-5 text-left md:text-right flex flex-col md:pr-10 shrink-0">
                      <div className="w-24 h-6 bg-white/5 rounded-lg md:ml-auto mb-2" />
                      <div className="w-16 h-3 bg-white/5 rounded-lg md:ml-auto" />
                    </div>
                    <div className="md:col-span-2 relative flex justify-start sm:justify-center items-center h-10 sm:h-auto shrink-0">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5" />
                    </div>
                    <div className="md:col-span-5 rounded-3xl border border-white/5 bg-white/[0.01] p-6 sm:p-8 h-44 flex flex-col gap-4">
                      <div className="w-2/3 h-5 bg-white/5 rounded-lg" />
                      <div className="w-full h-12 bg-white/5 rounded-lg" />
                      <div className="w-1/3 h-4 bg-white/5 rounded-lg mt-auto" />
                    </div>
                  </div>
                ))
              ) : (
                commits.map((commitItem, index) => {
                  const parsed = parseCommit(commitItem.commit.message);
                  const IconComponent = parsed.icon;
                  const commitDate = formatDate(commitItem.commit.author.date);

                  return (
                    <div key={commitItem.sha} className="relative grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start group">
                      
                      {/* Left Block: Committer Profile, Date, and Ref */}
                      <div className="md:col-span-5 text-left md:text-right flex flex-col md:pr-10 shrink-0 relative z-20">
                        <div className="flex items-center md:justify-end gap-3 mb-1">
                          <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
                            {commitItem.sha.substring(0, 7)}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${parsed.color}`}>
                            {parsed.badge}
                          </span>
                        </div>
                        
                        <div className="flex items-center md:justify-end gap-2.5 mt-1.5">
                          <div className="flex flex-col -space-y-0.5 text-left md:text-right">
                            <span className="text-[10px] font-bold text-white/50">{commitItem.commit.author.name}</span>
                            <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest">{commitDate}</span>
                          </div>
                          
                          {commitItem.author?.avatar_url ? (
                            <a 
                              href={commitItem.author.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-lg shrink-0 hover:scale-105 transition-transform"
                            >
                              <Image src={commitItem.author.avatar_url} alt={commitItem.commit.author.name} width={32} height={32} className="object-cover" />
                            </a>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline Center Bullet Dot */}
                      <div className="md:col-span-2 relative flex justify-start sm:justify-center items-center h-10 sm:h-auto shrink-0 z-20">
                        <div className="relative w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 transition-colors duration-500">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-amber-400 group-hover:scale-125 transition-all duration-500 shadow-[0_0_10px_rgba(242,169,0,0)] group-hover:shadow-[0_0_12px_rgba(242,169,0,0.8)]" />
                        </div>
                      </div>

                      {/* Right Block: Commit Content Card */}
                      <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="md:col-span-5 relative rounded-3xl border border-white/5 bg-white/[0.01] hover:border-amber-500/20 hover:bg-white/[0.02] p-6 sm:p-8 transition-all duration-500 flex flex-col z-20 overflow-hidden shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="flex gap-4 items-start mb-4">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 text-white/50 group-hover:text-amber-400 group-hover:scale-110 group-hover:border-amber-500/20 transition-all duration-300">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="text-left flex-grow">
                            <h3 className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300 leading-snug">
                              {parsed.title}
                            </h3>
                          </div>
                        </div>

                        {parsed.body && (
                          <div className="text-[11px] text-white/40 leading-relaxed font-medium font-inter border-l border-white/5 pl-3 mt-1 mb-5 text-left italic whitespace-pre-wrap">
                            {parsed.body}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <a 
                            href={commitItem.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-indigo-400 hover:text-indigo-300 transition-colors group/link"
                          >
                            GitHub Diff <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      </motion.div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. Curated Milestones Timeline */}
          {activeTab === 'milestones' && (
            <div className="space-y-16">
              {milestones.map((item, index) => (
                <div key={index} className="relative grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start group">

                  {/* Left: Version & Release Date */}
                  <div className="md:col-span-5 text-left md:text-right flex flex-col md:pr-10 shrink-0 relative z-20">
                    <div className="flex items-center md:justify-end gap-3 mb-1">
                      <span className="text-3xl font-black tracking-tighter text-white font-jakarta">
                        {item.version}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-xs uppercase tracking-widest font-black text-white/30 flex items-center md:justify-end gap-1.5">
                      <Calendar className="w-3 h-3 text-white/20" /> {item.date}
                    </span>
                  </div>

                  {/* Middle Dot Column */}
                  <div className="md:col-span-2 relative flex justify-start sm:justify-center items-center h-10 sm:h-auto shrink-0 z-20">
                    <div className="relative w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 transition-colors duration-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-amber-400 group-hover:scale-125 transition-all duration-500 shadow-[0_0_10px_rgba(242,169,0,0)] group-hover:shadow-[0_0_12px_rgba(242,169,0,0.8)]" />
                    </div>
                  </div>

                  {/* Right Content Card */}
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="md:col-span-5 relative rounded-3xl border border-white/5 bg-white/[0.01] hover:border-amber-500/20 hover:bg-white/[0.02] p-6 sm:p-8 transition-all duration-500 flex flex-col z-20 overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <h3 className="text-xl sm:text-2xl font-black mb-3 tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300 text-left">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-medium font-inter mb-6 text-left">
                      {item.description}
                    </p>

                    {/* Feature Lists */}
                    <div className="space-y-4">
                      {item.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all group/feat">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 text-white/50 group-hover/feat:text-amber-400 group-hover/feat:scale-110 group-hover/feat:border-amber-500/20 transition-all duration-300">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-white tracking-tight group-hover/feat:text-amber-400 transition-colors duration-300">
                                {feature.title}
                              </span>
                              <span className="text-[10px] text-white/30 font-medium font-inter mt-0.5 leading-relaxed">
                                {feature.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* Footer credits block */}
      <footer className="relative w-full border-t border-white/5 py-8 mt-12 bg-black/20 backdrop-blur-md z-10">
        <div className="max-w-[75rem] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/10">
              <Image src="/avatar.svg" alt="SNUGPT" width={28} height={28} className="object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-[10px] font-black tracking-tighter uppercase leading-tight text-white">SNUGPT</span>
              <span className="text-[6px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase">Delhi-NCR</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-white/20 font-medium">
            <Link href="/about" className="hover:text-amber-400 transition-colors">About</Link>
            <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy</Link>
            <Link href="/license" className="hover:text-amber-400 transition-colors">License</Link>
            <Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
              © {new Date().getFullYear()} Rishabh Joshi. Apache License 2.0.
            </span>
            <span className="text-[8px] font-mono tracking-widest text-white/10 uppercase">
              BUILD_ID: V1.0.4(+58) &bull; Delhi-NCR
            </span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
