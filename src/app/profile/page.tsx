'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfileSettings } from '@/components/providers';
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
  Lock,
  Bell,
  CreditCard,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  Camera,
  AlertCircle
} from 'lucide-react';

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  website: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: boolean;
}

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Expose global settings context
  const { settings: globalSettings, updateSettings } = useProfileSettings();
  
  // Tabs: 'profile' | 'preferences' | 'security' | 'billing'
  const initialTab = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);
  
  // Local Settings States
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [preloader, setPreloader] = React.useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);

  // Profile Data State
  const [profileData, setProfileData] = React.useState<ProfileData>({
    name: "",
    username: "",
    bio: "",
    avatar: "",
    phone: "",
    location: "",
    website: "",
  });

  // Notifications State
  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
  });

  // Security State
  const [security, setSecurity] = React.useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: false,
  });

  // Password States
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Sync active tab with search parameter changes
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load configuration from the global context provider instead of direct localStorage
  React.useEffect(() => {
    if (globalSettings) {
      if (globalSettings.theme) setTheme(globalSettings.theme);
      if (globalSettings.preloader !== undefined) setPreloader(globalSettings.preloader);
      if (globalSettings.profileData) {
        setProfileData({
          name: globalSettings.profileData.name || "",
          username: globalSettings.profileData.username || "",
          bio: globalSettings.profileData.bio || "Shiv Nadar University student exploring SNUGPT AI workspace.",
          avatar: globalSettings.profileData.avatar || "",
          phone: globalSettings.profileData.phone || "",
          location: globalSettings.profileData.location || "Chhachhrauli, Greater Noida, UP",
          website: globalSettings.profileData.website || "",
        });
      }
      if (globalSettings.notifications) {
        setNotifications({
          emailNotifications: globalSettings.notifications.emailNotifications !== undefined ? globalSettings.notifications.emailNotifications : true,
          pushNotifications: globalSettings.notifications.pushNotifications !== undefined ? globalSettings.notifications.pushNotifications : true,
          securityAlerts: globalSettings.notifications.securityAlerts !== undefined ? globalSettings.notifications.securityAlerts : true,
        });
      }
      if (globalSettings.security) {
        setSecurity({
          twoFactorEnabled: globalSettings.security.twoFactorEnabled !== undefined ? globalSettings.security.twoFactorEnabled : false,
          sessionTimeout: globalSettings.security.sessionTimeout !== undefined ? globalSettings.security.sessionTimeout : false,
        });
      }
    }
  }, [globalSettings]);

  // Global Save Handler saving directly to context
  const handleSaveAll = (
    customSuccessMsg?: string,
    overrides?: {
      theme?: 'dark' | 'light';
      preloader?: boolean;
      profileData?: ProfileData;
      notifications?: NotificationSettings;
      security?: SecuritySettings;
    }
  ) => {
    if (!session?.user?.email) return;

    // Mutate state inside the unified ProfileSettingsProvider context
    updateSettings({
      theme: overrides?.theme !== undefined ? overrides.theme : theme,
      preloader: overrides?.preloader !== undefined ? overrides.preloader : preloader,
      profileData: overrides?.profileData !== undefined ? overrides.profileData : profileData,
      notifications: overrides?.notifications !== undefined ? overrides.notifications : notifications,
      security: overrides?.security !== undefined ? overrides.security : security,
    });

    // Trigger visual success notification
    setSaveSuccess(customSuccessMsg || "Profile settings saved successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleProfileUpdate = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [field]: !prev[field] };
      // Save instantly by passing direct overrides to prevent closure stale state bugs
      handleSaveAll("Notification preference updated!", { notifications: updated });
      return updated;
    });
  };

  const handleSecurityToggle = (field: keyof SecuritySettings) => {
    setSecurity((prev) => {
      const updated = { ...prev, [field]: !prev[field] };
      // Save instantly by passing direct overrides to prevent closure stale state bugs
      handleSaveAll("Security state updated!", { security: updated });
      return updated;
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setSaveSuccess("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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

  // Session guard
  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#ededed] flex items-center justify-center p-4 font-jakarta relative overflow-hidden">
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

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Breadcrumb Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-color-muted hover:text-amber-500 transition-colors group mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to landing</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Account Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-mono font-bold tracking-wider uppercase">v1.2 (+74)</span>
              </div>
              <p className="text-sm text-color-muted mt-1 leading-relaxed">
                Update SNUGPT preferences, notification settings, credential details, and account telemetry.
              </p>
            </div>
            <button
              onClick={() => handleSaveAll("All changes persisted successfully!")}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 duration-200"
            >
              Save All Changes
            </button>
          </div>
        </div>

        {/* Tab & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 border-b lg:border-b-0 lg:border-r border-color-border pb-4 lg:pb-0 lg:pr-4 no-scrollbar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-none sm:flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'profile' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-none sm:flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'preferences' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-none sm:flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'security' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-none sm:flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'billing' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-color-muted hover:bg-color-surface-hover hover:text-color-text border border-transparent'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Account Summary Card */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center overflow-hidden text-amber-500 font-extrabold text-3xl relative group">
                      {profileData.avatar ? (
                        <img 
                          src={profileData.avatar} 
                          alt={profileData.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S'}</span>
                      )}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest mb-0.5">Verified Profile</p>
                      <h2 className="text-xl font-extrabold text-color-text font-jakarta">{profileData.name || session.user?.name}</h2>
                      <p className="text-xs text-color-muted font-inter">{session.user?.email}</p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                      SNUGPT Academic Pro
                    </div>
                  </div>

                  {/* Profile Edit Card */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3 flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Profile Information</h3>
                      <p className="text-xs text-color-muted">Public details across workspace</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveAll("Profile updated!"); }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-name">Full Name</label>
                          <input
                            id="profile-name"
                            type="text"
                            value={profileData.name}
                            onChange={(e) => handleProfileUpdate("name", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-username">Username</label>
                          <input
                            id="profile-username"
                            type="text"
                            value={profileData.username}
                            onChange={(e) => handleProfileUpdate("username", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-bio">Bio</label>
                        <textarea
                          id="profile-bio"
                          value={profileData.bio}
                          onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                          className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-phone">Phone Number</label>
                          <input
                            id="profile-phone"
                            type="tel"
                            placeholder="+91 99999 99999"
                            value={profileData.phone}
                            onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-location">Location</label>
                          <input
                            id="profile-location"
                            type="text"
                            value={profileData.location}
                            onChange={(e) => handleProfileUpdate("location", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="profile-website">Website</label>
                        <input
                          id="profile-website"
                          type="url"
                          placeholder="https://example.com"
                          value={profileData.website}
                          onChange={(e) => handleProfileUpdate("website", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all"
                        >
                          Save Profile Info
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Preferences Card */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Preferences Configuration</h3>
                      <p className="text-xs text-color-muted mt-0.5">Control visual state rendering and application interfaces.</p>
                    </div>

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
                          onClick={() => {
                            const newTheme = theme === 'dark' ? 'light' : 'dark';
                            setTheme(newTheme);
                            handleSaveAll(`Theme changed to ${newTheme}!`, { theme: newTheme });
                          }}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: theme === 'light' ? 'var(--color-border)' : '#f2a900'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
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
                          onClick={() => {
                            const newPreloader = !preloader;
                            setPreloader(newPreloader);
                            handleSaveAll(`Landing preloader ${newPreloader ? 'enabled' : 'disabled'}!`, { preloader: newPreloader });
                          }}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: preloader ? '#f2a900' : 'var(--color-border)'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: preloader ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Preferences */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Notifications Toggles</h3>
                      <p className="text-xs text-color-muted mt-0.5">Control how and when you receive SNUGPT alerts.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Email alerts */}
                      <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-color-text">Email Notifications</span>
                          <span className="text-[10px] text-color-muted">Receive weekly digests, campus updates, and generation counts.</span>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle('emailNotifications')}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: notifications.emailNotifications ? '#f2a900' : 'var(--color-border)'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: notifications.emailNotifications ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
                        </button>
                      </div>

                      {/* Push notifications */}
                      <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-color-text">Push Notifications</span>
                          <span className="text-[10px] text-color-muted">Receive real-time workspace alerts directly on your devices.</span>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle('pushNotifications')}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: notifications.pushNotifications ? '#f2a900' : 'var(--color-border)'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: notifications.pushNotifications ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
                        </button>
                      </div>

                      {/* Security alerts */}
                      <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-color-text">Security Alerts</span>
                          <span className="text-[10px] text-color-muted">Critical updates on account access, password edits, and sessions.</span>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle('securityAlerts')}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: notifications.securityAlerts ? '#f2a900' : 'var(--color-border)'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: notifications.securityAlerts ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Password update */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Change Password</h3>
                      <p className="text-xs text-color-muted mt-0.5">Update credentials linked to SNUGPT platform.</p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="curr-pass">Current Password</label>
                        <div className="relative">
                          <input
                            id="curr-pass"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-color-muted hover:text-color-text transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="new-pass">New Password</label>
                          <input
                            id="new-pass"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted" htmlFor="conf-pass">Confirm New Password</label>
                          <input
                            id="conf-pass"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-color-border bg-[var(--color-bg)] text-color-text focus:outline-none focus:border-amber-500/60 font-medium text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Account Security options */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Advanced Security</h3>
                      <p className="text-xs text-color-muted mt-0.5">Control session persistence and multi-factor authorization.</p>
                    </div>

                    <div className="space-y-4">
                      {/* MFA */}
                      <div className="flex items-center justify-between p-4 bg-color-surface-hover/30 border border-color-border rounded-2xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-color-text">Two-Factor Authentication</span>
                          <span className="text-[10px] text-color-muted">Request secondary OTP code during credentials check.</span>
                        </div>
                        <button
                          onClick={() => handleSecurityToggle('twoFactorEnabled')}
                          className="w-12 h-6 rounded-full bg-color-border p-1 transition-colors relative cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: security.twoFactorEnabled ? '#f2a900' : 'var(--color-border)'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform"
                            style={{
                              transform: security.twoFactorEnabled ? 'translateX(24px)' : 'translateX(0)'
                            }}
                          />
                        </button>
                      </div>

                      {/* Active Sessions */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-color-muted">Active Campus Sessions</label>
                        <div className="border border-color-border rounded-2xl p-4 bg-color-surface-hover/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-color-text">MacBook Pro & Mobile Auth</p>
                              <p className="text-[9px] text-color-muted font-mono uppercase tracking-wider">Greater Noida, India • Current Active Session</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold tracking-wider uppercase">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Log Out Portal */}
                  <div className="p-5 border border-red-500/10 bg-red-500/5 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-400">Exit active portal session?</p>
                      <p className="text-[10px] text-color-muted">You will be redirected back to the home landing page.</p>
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

              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Subscription card */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-color-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-color-text">Academic Plan</h3>
                      <p className="text-xs text-color-muted mt-0.5 font-inter">Premium workspace resources allocated to your university email.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-color-surface-hover/30 border border-color-border relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-mono font-bold tracking-wider uppercase">Active Allocation</span>
                          <h4 className="text-lg font-black text-color-text mt-2 font-jakarta">SNUGPT Campus Pro (Unlimited)</h4>
                          <p className="text-xs text-color-muted font-inter">Billed via campus IT subsidy</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Free Allocation</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 my-4">
                        <span className="text-3xl font-extrabold text-color-text">₹0</span>
                        <span className="text-xs text-color-muted font-inter">/ semester</span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs">
                          <Check className="h-4 w-4 text-amber-500" />
                          <span>Unlimited high-speed vector RAG pipelines</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Check className="h-4 w-4 text-amber-500" />
                          <span>Priority inference routing & streaming LLM</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Check className="h-4 w-4 text-amber-500" />
                          <span>Unlimited PDF indexing & custom database queries</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => alert("Your subscription is fully subsidized by Shiv Nadar University.")}
                          className="flex-1 px-4 py-2.5 border border-color-border hover:bg-color-surface-hover/40 text-color-text font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                        >
                          Request Support
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("You are already on the highest tier!")}
                          className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                        >
                          Tier Verified
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Masked Card Details */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-color-text">Payment Gateway Method</h3>
                    <div className="border border-color-border rounded-2xl p-4 bg-color-surface-hover/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-color-text">•••• •••• •••• 4242</p>
                          <p className="text-[10px] text-color-muted font-mono uppercase">Student ID Linked Card • Expires 12/2028</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 font-mono text-[9px] font-bold uppercase">Subsidized</span>
                    </div>
                  </div>

                  {/* Billing Invoices history */}
                  <div className="border border-color-border bg-color-surface/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-color-text">Academic Semester History</h3>
                    <div className="space-y-2">
                      {[
                        { term: "Spring 2026", charge: "₹0.00 (Subsidy)", badge: "Allocated" },
                        { term: "Fall 2025", charge: "₹0.00 (Subsidy)", badge: "Allocated" }
                      ].map((item, idx) => (
                        <div key={idx} className="border border-color-border rounded-2xl p-4 flex items-center justify-between bg-color-surface-hover/10">
                          <div>
                            <p className="text-xs font-bold text-color-text">{item.term}</p>
                            <p className="text-[10px] text-color-muted font-mono uppercase">{item.charge}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">{item.badge}</span>
                        </div>
                      ))}
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
