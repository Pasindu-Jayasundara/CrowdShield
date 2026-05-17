import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AnalystTopNav } from './AnalystTopNav';
import { DemoBanner } from './DemoBanner';
import { Sidebar } from './Sidebar';
import { motion } from 'motion/react';

function AnalystLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />
      <motion.div className="flex min-h-screen flex-1 flex-col">
        <AnalystTopNav />
        <DemoBanner variant="analyst" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoBanner variant="admin" />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ProtectedLayout({ allowedRoles }: { allowedRoles: string[] }) {
  const { role, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  if (role === 'admin') {
    return <AdminLayout />;
  }

  if (role === 'analyst') {
    return <AnalystLayout />;
  }

  return <Navigate to="/signin" replace />;
}