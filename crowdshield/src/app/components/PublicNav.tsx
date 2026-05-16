import { Crown, FileText, Home, MapPin, Radio, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Live Feed', icon: Radio },
  { to: '/near-me', label: 'Near Me', icon: MapPin },
  { to: '/submit', label: 'Report', icon: FileText },
];

export function PublicNav() {
  const { pathname } = useLocation();

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

        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 rounded-full btn-gradient px-4 py-2 text-sm font-semibold"
        >
          <Crown className="h-4 w-4" />
          Upgrade
        </Link>
      </div>
    </header>
  );
}
