'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  Sun, 
  Moon, 
  Check, 
  Shield, 
  Mail, 
  Clock, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine active tab from URL search parameters, default to 'info'
  const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'info';
  const [activeTab, setActiveTab] = React.useState<'info' | 'settings'>(initialTab);
  
  // Local Settings States
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [preloader, setPreloader] = React.useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);

  // Sync active tab with search parameter changes
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings' || tabParam === 'info') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load configuration from localStorage keyed per user
  React.useEffect(() => {
    if (session?.user?.email) {
      const userKey = `snugpt-settings-${session.user.email}`;
      const stored = localStorage.getItem(userKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.preloader !== undefined) setPreloader(parsed.preloader);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [session]);

  const updateSetting = (key: 'theme' | 'preloader', value: any) => {
    if (!session?.user?.email) return;

    const userKey = `snugpt-settings-${session.user.email}`;
    const newTheme = key === 'theme' ? value : theme;
    const newPreloader = key === 'preloader' ? value : preloader;

    // Update state
    if (key === 'theme') setTheme(value);
    if (key === 'preloader') setPreloader(value);

    // Save to localStorage
    const settings = { theme: newTheme, preloader: newPreloader };
    localStorage.setItem(userKey, JSON.stringify(settings));

    // Instantly apply theme to DOM
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Trigger visual success notification
    setSaveSuccess(`${key === 'theme' ? 'Theme' : 'Preloader'} updated successfully!`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] text-[#ededed] flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-t-2 border-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-widest text-amber-500 uppercase">Loading Account Profile...</p>
        </div>
      </div>
    );
  }

  // Session guard: show beautiful restriction screen
  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#ededed] flex items-center justify-center p-4 font-jakarta relative overflow-hidden">
        {/* Background Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full border border-white/10 bg-neutral-950/80 backdrop-blur-xl p-8 rounded-3xl text-center shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-jakarta">Access Restricted</h2>
          <p className="text-sm text-white/50 mb-8 leading-relaxed font-inter">
            Please log in with your SNU university credentials to view your personalized profile details, adjust theme settings, or configure visual loading preloaders.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              className="w-full py-3.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-98 shadow-lg shadow-white/5"
            >
              Go to Login
            </Link>
            <Link 
              href="/" 
              className="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/[0.02] text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-bg text-color-text font-jakarta relative overflow-x-hidden selection:bg-amber-500/30">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:14px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Save Success Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-medium text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {saveSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Breadcrumb Header */}
        <div className="mb-8 md:mb-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-color-muted hover:text-amber-500 transition-colors group mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to landing</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Account Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-mono font-bold tracking-wider uppercase">User Portal</span>
          </div>
        </div>

        {/* Tab & Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 flex flex-row md:flex-col gap-1.5 border-b md:border-b-0 md:border-r border-color-border pb-4 md:pb-0 md:pr-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'info' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Info</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'settings' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Account Summary Card */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-extrabold text-3xl font-jakarta">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest mb-0.5">Active Account</p>
                      <h2 className="text-xl font-extrabold text-color-text font-jakarta">{session.user?.name}</h2>
                      <p className="text-xs text-color-muted font-inter">{session.user?.email}</p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                      Student Session
                    </div>
                  </div>

                  {/* Profile Details List */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-color-text pb-3 border-b border-color-border">Profile Metadata</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-color-muted uppercase tracking-wider mb-1">
                          <User className="w-3.5 h-3.5 text-amber-500" />
                          <span>Full Name</span>
                        </div>
                        <p className="text-sm font-bold text-color-text font-jakarta">{session.user?.name || 'Not Available'}</p>
                      </div>

                      <div className="p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-color-muted uppercase tracking-wider mb-1">
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span>University Email</span>
                        </div>
                        <p className="text-sm font-bold text-color-text font-jakarta truncate">{session.user?.email || 'Not Available'}</p>
                      </div>

                      <div className="p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-color-muted uppercase tracking-wider mb-1">
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                          <span>Account ID</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-color-text truncate">{(session.user as any).id || 'N/A'}</p>
                      </div>

                      <div className="p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-color-muted uppercase tracking-wider mb-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Authentication Provider</span>
                        </div>
                        <p className="text-xs font-bold text-color-text font-jakarta uppercase tracking-wider">Credentials Provider</p>
                      </div>
                    </div>
                  </div>

                  {/* Log Out CTA */}
                  <div className="p-4 border border-red-500/10 bg-red-500/5 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-400">Exit active portal session?</p>
                      <p className="text-[10px] text-color-muted">You will be redirected back to the home page.</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 duration-200 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-color-text pb-3 border-b border-color-border">Preferences Configuration</h3>

                    {/* Dark/Light Mode Row */}
                    <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                      <div className="flex flex-col gap-0.5 max-w-[70%]">
                        <span className="text-xs font-bold text-color-text inline-flex items-center gap-2">
                          {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> : <Moon className="w-4 h-4 text-amber-400" />}
                          Theme Selection
                        </span>
                        <span className="text-[10px] text-color-muted leading-tight font-inter">
                          Toggle between dark mode (deep space black) and light mode (modern crisp grey).
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSetting('theme', theme === 'dark' ? 'light' : 'dark')}
                          className="p-1 rounded-xl hover:bg-white/5 transition-all active:scale-90 cursor-pointer"
                        >
                          {theme === 'dark' ? (
                            <ToggleLeft className="w-10 h-10 text-color-muted" />
                          ) : (
                            <ToggleRight className="w-10 h-10 text-amber-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Preloader On/Off Row */}
                    <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                      <div className="flex flex-col gap-0.5 max-w-[70%]">
                        <span className="text-xs font-bold text-color-text inline-flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Landing Preloader Screen
                        </span>
                        <span className="text-[10px] text-color-muted leading-tight font-inter">
                          Turn on or off the animated welcome greeting screen upon loading the SNUGPT website.
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSetting('preloader', !preloader)}
                          className="p-1 rounded-xl hover:bg-white/5 transition-all active:scale-90 cursor-pointer"
                        >
                          {preloader ? (
                            <ToggleRight className="w-10 h-10 text-amber-500" />
                          ) : (
                            <ToggleLeft className="w-10 h-10 text-color-muted" />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-[#ededed] flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-t-2 border-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-widest text-amber-500 uppercase">Loading Account Profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </React.Suspense>
  );
}
