import { useMutation, useQuery } from 'convex/react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from '../../../convex/_generated/api';
import type { UserRole } from '../types';
import { clearSessionToken, getSessionToken, setSessionToken } from '../utils/sessionToken';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  subscriptionPlan: string;
  isActive: boolean;
}

interface AppContextValue {
  user: AuthUser | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getSessionToken());
  const currentUser = useQuery(api.auth.me, token ? { sessionToken: token } : 'skip');
  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const isLoading = token !== null && currentUser === undefined;
  const user = currentUser ?? null;
  const role: UserRole = user?.role ?? 'public';

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password });
      setSessionToken(result.token);
      setToken(result.token);
      return result.user as AuthUser;
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutMutation({ sessionToken: token });
      } catch {
        // Session may already be expired
      }
    }
    clearSessionToken();
    setToken(null);
  }, [logoutMutation, token]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      role,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, role, isLoading, login, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
