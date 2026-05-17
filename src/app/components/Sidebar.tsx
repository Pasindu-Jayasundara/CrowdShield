import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Globe,
  LayoutDashboard,
  LogOut,
  Radio,
  Shield,
  Target,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSignOut } from '../../hooks/useSignOut';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const analystLinks = [
  { to: '/analyst', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyst/feed', label: 'Live Feed', icon: Radio, live: true },
  { to: '/analyst/geo', label: 'Geo Map', icon: Globe },
  { to: '/analyst/campaigns', label: 'Campaigns', icon: Target },
  { to: '/analyst/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/analyst/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/analyst/submit', label: 'Submit Report', icon: Upload },
];

const publicLinks = [
    { to: '/', label: 'Public Feed', icon: Radio },
    { to: '/submit', label: 'Submit Report', icon: Upload },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { demoMode, exitDemo } = useApp();
  const { isAuthenticated } = useConvexAuth();
  const { signOut, isSigningOut } = useSignOut();
  const viewer = useQuery(api.users.viewerRole);
  const role = viewer?.role;

  const links = role === 'analyst' ? analystLinks : publicLinks;

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <Link to="/analyst" className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Shield className="h-6 w-6 text-accent" />
        <span className="font-bold text-text">
          Crowd<span className="text-accent">Shield</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-0.5 p-3">
        {links.map(({ to, label, icon: Icon, live }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-l-[3px] border-accent bg-accent/8 pl-[9px] text-accent'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {live && !active && <span className="ml-auto h-2 w-2 rounded-full bg-accent" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-critical" />
          Simulation Mode
        </div>
        {isAuthenticated && (
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => void signOut()}
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
        {demoMode ? (
          <button
            type="button"
            onClick={exitDemo}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Exit Demo
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-gray-50">
            <LogOut className="h-4 w-4" />
            Back to Public
          </Link>
        )}
      </div>
    </aside>
  );
}
