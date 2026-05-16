import { Crown, FileText, Home, LogIn, LogOut, MapPin, Radio, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useSignOut } from '../../hooks/useSignOut';
import { SIGN_IN_PATH } from '../../lib/auth-routes';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Live Feed', icon: Radio },
  { to: '/near-me', label: 'Near Me', icon: MapPin },
  { to: '/submit', label: 'Report', icon: FileText },
];

export function PublicNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useConvexAuth();
  const { signOut, isSigningOut } = useSignOut();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" />
          <span className="text-lg font-bold text-text">CrowdShield</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === to ? 'nav-pill-active' : 'text-text-muted hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="hidden items-center gap-1.5 rounded-full btn-gradient px-4 py-2 text-sm font-semibold sm:inline-flex"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Link>
          
          {isAuthenticated ? (
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => void signOut()}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to={SIGN_IN_PATH}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-dim"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
