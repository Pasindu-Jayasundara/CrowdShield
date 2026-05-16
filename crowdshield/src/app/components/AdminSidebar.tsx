import {
  Bell,
  CreditCard,
  Crown,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/announcements', label: 'Announcements', icon: Bell },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { demoMode, exitDemo } = useApp();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-admin text-sm font-bold text-on-primary">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Admin User</p>
            <p className="text-xs text-text-muted">admin@crowdshield.com</p>
          </div>
        </div>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-admin" />
          <div>
            <p className="text-sm font-bold text-admin">Admin Panel</p>
            <p className="text-xs text-text-muted">System Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-l-[3px] border-admin bg-admin/8 pl-[9px] text-admin'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <Link
          to="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        <div className="rounded-lg bg-admin/10 py-2 text-center text-xs font-bold uppercase tracking-wide text-admin">
          Admin Mode
        </div>
        {demoMode ? (
          <button
            type="button"
            onClick={exitDemo}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm text-text-muted hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Exit Demo
          </button>
        ) : (
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm text-text-muted hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Back to Public
          </Link>
        )}
      </div>
    </aside>
  );
}
