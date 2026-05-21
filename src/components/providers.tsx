'use client';

import * as React from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

export interface ProfileData {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  website: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: boolean;
}

export interface ProfileSettings {
  theme: 'dark' | 'light';
  preloader: boolean;
  profileData: ProfileData;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

interface ProfileSettingsContextType {
  settings: ProfileSettings;
  updateSettings: (newSettings: Partial<ProfileSettings>) => void;
  updateProfileData: (data: Partial<ProfileData>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  updateSecurity: (data: Partial<SecuritySettings>) => void;
  saveAll: () => void;
  isLoading: boolean;
}

const ProfileSettingsContext = React.createContext<ProfileSettingsContextType | undefined>(undefined);

export function useProfileSettings() {
  const context = React.useContext(ProfileSettingsContext);
  if (context === undefined) {
    throw new Error('useProfileSettings must be used within a ProfileSettingsProvider');
  }
  return context;
}

const defaultProfileData = (email?: string, name?: string, image?: string): ProfileData => ({
  name: name || "SNU Student",
  username: email ? email.split('@')[0] : "snustudent",
  bio: "Shiv Nadar University student exploring SNUGPT AI workspace.",
  avatar: image || (email ? `https://avatar.vercel.sh/${email}.png` : "/avatar.svg"),
  phone: "",
  location: "Chhachhrauli, Greater Noida, UP",
  website: "",
});

const defaultSettings = (email?: string, name?: string, image?: string): ProfileSettings => ({
  theme: 'dark',
  preloader: true,
  profileData: defaultProfileData(email, name, image),
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: false,
  }
});

function ProfileSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [settings, setSettings] = React.useState<ProfileSettings>(() => defaultSettings());
  const [isLoading, setIsLoading] = React.useState(true);

  const getStorageKey = React.useCallback(() => {
    const userEmail = session?.user?.email || 'guest';
    return `snugpt-settings-${userEmail}`;
  }, [session]);

  const loadSettings = React.useCallback(() => {
    if (status === 'loading') return;

    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    const email = session?.user?.email || '';
    const name = session?.user?.name || '';
    const image = session?.user?.image || '';

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged: ProfileSettings = {
          theme: parsed.theme || 'dark',
          preloader: parsed.preloader !== undefined ? parsed.preloader : true,
          profileData: {
            ...defaultProfileData(email, name, image),
            ...(parsed.profileData || {}),
          },
          notifications: {
            ...defaultSettings(email, name, image).notifications,
            ...(parsed.notifications || {}),
          },
          security: {
            ...defaultSettings(email, name, image).security,
            ...(parsed.security || {}),
          }
        };
        setSettings(merged);

        // Sync DOM theme
        if (merged.theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    } else {
      const def = defaultSettings(email, name, image);
      setSettings(def);
      if (def.theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    setIsLoading(false);
  }, [status, session, getStorageKey]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Sync across tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey()) {
        loadSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getStorageKey, loadSettings]);

  // Expose state updates
  const updateSettingsState = React.useCallback((updated: Partial<ProfileSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      window.dispatchEvent(new Event('snugpt-settings-updated'));

      if (next.theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  }, [getStorageKey]);

  const updateProfileData = React.useCallback((data: Partial<ProfileData>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        profileData: { ...prev.profileData, ...data }
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      window.dispatchEvent(new Event('snugpt-settings-updated'));
      return next;
    });
  }, [getStorageKey]);

  const updateNotifications = React.useCallback((data: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        notifications: { ...prev.notifications, ...data }
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      window.dispatchEvent(new Event('snugpt-settings-updated'));
      return next;
    });
  }, [getStorageKey]);

  const updateSecurity = React.useCallback((data: Partial<SecuritySettings>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        security: { ...prev.security, ...data }
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      window.dispatchEvent(new Event('snugpt-settings-updated'));
      return next;
    });
  }, [getStorageKey]);

  const saveAll = React.useCallback(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(settings));
    window.dispatchEvent(new Event('snugpt-settings-updated'));
  }, [getStorageKey, settings]);

  // Sync within same tab instantly
  React.useEffect(() => {
    const handleCustomUpdate = () => {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings((prev) => {
            const next = { ...prev, ...parsed };
            if (next.theme === 'light') {
              document.documentElement.classList.add('light');
            } else {
              document.documentElement.classList.remove('light');
            }
            return next;
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('snugpt-settings-updated', handleCustomUpdate);
    return () => window.removeEventListener('snugpt-settings-updated', handleCustomUpdate);
  }, [getStorageKey]);

  return (
    <ProfileSettingsContext.Provider
      value={{
        settings,
        updateSettings: updateSettingsState,
        updateProfileData,
        updateNotifications,
        updateSecurity,
        saveAll,
        isLoading
      }}
    >
      {children}
    </ProfileSettingsContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileSettingsProvider>
        {children}
      </ProfileSettingsProvider>
    </SessionProvider>
  );
}
