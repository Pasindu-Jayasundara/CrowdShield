import { motion } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicNav } from './components/PublicNav';
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
import { ProtectedLayout } from './components/ProtectedLayout';


function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
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
            <PublicLayout>
              <PublicLanding />
            </PublicLayout>
          )
        }
      />

      {/* Always-public routes */}
      <Route
        path="/feed"
        element={
          <PublicLayout>
            <PublicFeed />
          </PublicLayout>
        }
      />
      <Route
        path="/submit"
        element={
          <PublicLayout>
            <PublicSubmitReport />
          </PublicLayout>
        }
      />
      <Route
        path="/near-me"
        element={
          <PublicLayout>
            <MyLocationThreats />
          </PublicLayout>
        }
      />
      <Route
        path="/pricing"
        element={
          <PublicLayout>
            <Pricing />
          </PublicLayout>
        }
      />

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

      {/* Protected Analyst Routes */}
      <Route element={<ProtectedLayout allowedRoles={['analyst', 'admin']} />}>
        <Route path="/analyst" element={<Dashboard />} />
        <Route path="/analyst/feed" element={<LiveFeed />} />
        <Route path="/analyst/geo" element={<GeoMap />} />
        <Route path="/analyst/campaigns" element={<Campaigns />} />
        <Route path="/analyst/analytics" element={<Analytics />} />
        <Route path="/analyst/alerts" element={<Alerts />} />
        <Route path="/analyst/submit" element={<SubmitReport />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
      </Route>

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
