import { ChevronDown, Crown, FileText, Home, LogIn, LogOut, MapPin, Radio, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LoginModal } from './LoginModal';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Live Feed', icon: Radio },
  { to: '/near-me', label: 'Near Me', icon: MapPin },
  { to: '/submit', label: 'Report', icon: FileText },
];

export function PublicNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as { openLogin?: boolean } | null;
    if (state?.openLogin) {
      setLoginOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
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
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-medium"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-primary">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline capitalize">{user.role}</span>
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface py-1 shadow-lg">
                    <p className="border-b border-border px-3 py-2 text-xs text-text-muted">{user.email}</p>
                    {(user.role === 'analyst' || user.role === 'admin') && (
                      <Link
                        to="/analyst"
                        className="block px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Analyst dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-critical hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}

            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full btn-gradient px-4 py-2 text-sm font-semibold"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Upgrade</span>
            </Link>
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
