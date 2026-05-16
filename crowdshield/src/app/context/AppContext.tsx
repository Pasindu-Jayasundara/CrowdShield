import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../types';

type DemoType = 'analyst' | 'admin' | null;

interface AppContextValue {
  role: UserRole;
  demoMode: boolean;
  demoType: DemoType;
  enterAnalystDemo: () => void;
  enterAdminDemo: () => void;
  exitDemo: () => void;
  setRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('public');
  const [demoMode, setDemoMode] = useState(false);
  const [demoType, setDemoType] = useState<DemoType>(null);

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
      value={{ role, demoMode, demoType, enterAnalystDemo, enterAdminDemo, exitDemo, setRole }}
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
