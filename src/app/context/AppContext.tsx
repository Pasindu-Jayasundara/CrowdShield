import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../types';
import { useConvexAuth, useQuery } from 'convex/react';
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
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const user = useQuery(api.users.me) ?? null;
  const [role, setRole] = useState<UserRole>('public');
  const [demoMode, setDemoMode] = useState(false);
  const [demoType, setDemoType] = useState<DemoType>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      // In a real app, you'd get the role from the user object in Convex
      // For now, we'll default to 'analyst' for authenticated users unless in demo mode
      if (!demoMode) {
        setRole((user as any).role || 'analyst');
      }
    } else if (!isAuthLoading && !isAuthenticated && !demoMode) {
      setRole('public');
    }
  }, [isAuthenticated, isAuthLoading, user, demoMode]);

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
    setRole('public');
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
