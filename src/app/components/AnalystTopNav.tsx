import { Bell, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LivePulseDot } from './LivePulseDot';
import { useSignOut } from '../../hooks/useSignOut';
import { useConvexAuth } from 'convex/react';

export function AnalystTopNav() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut, isSigningOut } = useSignOut();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <Link to="/analyst" className="flex items-center gap-2 lg:hidden">
          <Shield className="h-6 w-6 text-accent" />
          <span className="font-bold text-text">CrowdShield</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-high/30 bg-high/10 px-4 py-1.5 text-sm">
            <span className="text-text-muted">GLOBAL THREAT LEVEL:</span>
            <span className="font-bold text-high">HIGH</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 text-sm text-text-muted sm:flex">
            <LivePulseDot />
            <span>
              <strong className="text-text">1,247</strong> reports today
            </span>
          </div>
          <button type="button" className="relative rounded-lg p-2 hover:bg-gray-50" aria-label="Notifications">
            <Bell className="h-5 w-5 text-text-muted" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-on-primary">
              3
            </span>
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-on-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-on-primary/20">A</span>
            ANALYST
          </div>
          {isAuthenticated ? (
            <button 
              type="button"
              disabled={isSigningOut}
              onClick={() => void signOut()}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-red-600 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Logout</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
