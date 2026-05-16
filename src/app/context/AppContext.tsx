import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../types';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type DemoType = 'analyst' | 'admin' | null;

interface AppContextValue {
  role: UserRole;
  demoMode: boolean;
  demoType: DemoType;
  user: any;
  isLoading: boolean;
  enterAnalystDemo: () => void;
  enterAdminDemo: () => void;
  exitDemo: () => void;
  setRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const viewer = useQuery(api.users.viewerRole);
  const isAuthLoading = viewer === undefined;
  const user = viewer?.user ?? null;

  const [role, setRole] = useState<UserRole>('public');
  const [demoMode, setDemoMode] = useState(false);
  const [demoType, setDemoType] = useState<DemoType>(null);

  useEffect(() => {
    if (!isAuthLoading && !demoMode) {
      // viewer.role can be null when unauthenticated — default to 'public'
      setRole((viewer?.role as UserRole) ?? 'public');
    }
  }, [isAuthLoading, viewer, demoMode]);

  const enterAnalystDemo = () => {
    setDemoMode(true);
    setDemoType('analyst');
    setRole('analyst');
  };

  const enterAdminDemo = () => {
    setDemoMode(true);
    setDemoType('admin');
    setRole('admin');
  };

  const exitDemo = () => {
    setDemoMode(false);
    setDemoType(null);
    // Restore the real role from Convex (or fall back to 'public')
    setRole((viewer?.role as UserRole) ?? 'public');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        demoMode,
        demoType,
        user,
        isLoading: isAuthLoading,
        enterAnalystDemo,
        enterAdminDemo,
        exitDemo,
        setRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
