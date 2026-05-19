'use client';

import * as React from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

function ThemeInitializer() {
  const { data: session } = useSession();

  React.useEffect(() => {
    const userEmail = session?.user?.email || 'guest';
    const storedSettings = localStorage.getItem(`snugpt-settings-${userEmail}`);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default to dark mode
      document.documentElement.classList.remove('light');
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeInitializer />
      {children}
    </SessionProvider>
  );
}
