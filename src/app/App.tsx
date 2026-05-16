import { motion } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminSidebar } from './components/AdminSidebar';
import { AnalystTopNav } from './components/AnalystTopNav';
import { DemoBanner } from './components/DemoBanner';
import { PublicNav } from './components/PublicNav';
import { Sidebar } from './components/Sidebar';
import { AppProvider, useApp } from './context/AppContext';
import { AdminAnnouncements } from './screens/admin/AdminAnnouncements';
import { AdminDashboard } from './screens/admin/AdminDashboard';
import { AdminMessages } from './screens/admin/AdminMessages';
import { AdminNewsletter } from './screens/admin/AdminNewsletter';
import { AdminReports } from './screens/admin/AdminReports';
import { AdminSubscriptions } from './screens/admin/AdminSubscriptions';
import { AdminUsers } from './screens/admin/AdminUsers';
import { Alerts } from './screens/Alerts';
import { Analytics } from './screens/Analytics';
import { Campaigns } from './screens/Campaigns';
import { Dashboard } from './screens/Dashboard';
import { GeoMap } from './screens/GeoMap';
import { LiveFeed } from './screens/LiveFeed';
import { MyLocationThreats } from './screens/MyLocationThreats';
import { Pricing } from './screens/Pricing';
import { PublicFeed } from './screens/PublicFeed';
import { PublicLanding } from './screens/PublicLanding';
import { PublicSubmitReport } from './screens/PublicSubmitReport';
import { SubmitReport } from './screens/SubmitReport';
import SignInPage from './screens/auth/SignInPage';
import { AuthRedirect } from '../components/AuthRedirect';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}

function AnalystLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />
      <motion.div className="flex min-h-screen flex-1 flex-col">
        <AnalystTopNav />
        <DemoBanner variant="analyst" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </motion.div>
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoBanner variant="admin" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { role, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public home — redirects logged-in users to their dashboard */}
      <Route 
        path="/" 
        element={
          role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : role === 'analyst' ? (
            <Navigate to="/analyst" replace />
          ) : (
            <PublicLayout><PublicLanding /></PublicLayout>
          )
        } 
      />

      {/* Always-public routes */}
      <Route path="/feed" element={<PublicLayout><PublicFeed /></PublicLayout>} />
      <Route path="/submit" element={<PublicLayout><PublicSubmitReport /></PublicLayout>} />
      <Route path="/near-me" element={<PublicLayout><MyLocationThreats /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />

      {/* Sign-in — redirects already-logged-in users to their dashboard */}
      <Route 
        path="/signin" 
        element={
          role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : role === 'analyst' ? (
            <Navigate to="/analyst" replace />
          ) : (
            <SignInPage />
          )
        } 
      />

      {/* Protected Analyst Routes — accessible by 'analyst' and 'admin' roles */}
      <Route path="/analyst/*" element={
        <AuthRedirect mode="requireAuth">
          {role === 'analyst' || role === 'admin' ? (
            <Routes>
              <Route path="/" element={<AnalystLayout><Dashboard /></AnalystLayout>} />
              <Route path="/feed" element={<AnalystLayout><LiveFeed /></AnalystLayout>} />
              <Route path="/geo" element={<AnalystLayout><GeoMap /></AnalystLayout>} />
              <Route path="/campaigns" element={<AnalystLayout><Campaigns /></AnalystLayout>} />
              <Route path="/analytics" element={<AnalystLayout><Analytics /></AnalystLayout>} />
              <Route path="/alerts" element={<AnalystLayout><Alerts /></AnalystLayout>} />
              <Route path="/submit" element={<AnalystLayout><SubmitReport /></AnalystLayout>} />
            </Routes>
          ) : (
            /* Authenticated but wrong role (e.g. 'public') — back to home */
            <Navigate to="/" replace />
          )}
        </AuthRedirect>
      } />

      {/* Protected Admin Routes — accessible by 'admin' role only */}
      <Route path="/admin/*" element={
        <AuthRedirect mode="requireAuth">
          {role === 'admin' ? (
            <Routes>
              <Route path="/" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
              <Route path="/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
              <Route path="/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />
              <Route path="/announcements" element={<AdminLayout><AdminAnnouncements /></AdminLayout>} />
              <Route path="/newsletter" element={<AdminLayout><AdminNewsletter /></AdminLayout>} />
            </Routes>
          ) : (
            /* Authenticated but not admin — redirect to appropriate dashboard */
            role === 'analyst' ? (
              <Navigate to="/analyst" replace />
            ) : (
              <Navigate to="/" replace />
            )
          )}
        </AuthRedirect>
      } />

      {/* Catch-all: redirect based on role */}
      <Route
        path="*"
        element={
          role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : role === 'analyst' ? (
            <Navigate to="/analyst" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
