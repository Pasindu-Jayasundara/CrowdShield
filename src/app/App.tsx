import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminSidebar } from './components/AdminSidebar';
import { AnalystTopNav } from './components/AnalystTopNav';
import { ProtectedRoute } from './components/ProtectedRoute';
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
    <ProtectedRoute allowedRoles={['analyst', 'admin']}>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AnalystTopNav />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { role } = useApp();

  return (
    <Routes>
      <Route path="/" element={<PublicLayout><PublicLanding /></PublicLayout>} />
      <Route path="/feed" element={<PublicLayout><PublicFeed /></PublicLayout>} />
      <Route path="/submit" element={<PublicLayout><PublicSubmitReport /></PublicLayout>} />
      <Route path="/near-me" element={<PublicLayout><MyLocationThreats /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />

      <Route path="/analyst" element={<AnalystLayout><Dashboard /></AnalystLayout>} />
      <Route path="/analyst/feed" element={<AnalystLayout><LiveFeed /></AnalystLayout>} />
      <Route path="/analyst/geo" element={<AnalystLayout><GeoMap /></AnalystLayout>} />
      <Route path="/analyst/campaigns" element={<AnalystLayout><Campaigns /></AnalystLayout>} />
      <Route path="/analyst/analytics" element={<AnalystLayout><Analytics /></AnalystLayout>} />
      <Route path="/analyst/alerts" element={<AnalystLayout><Alerts /></AnalystLayout>} />
      <Route path="/analyst/submit" element={<AnalystLayout><SubmitReport /></AnalystLayout>} />

      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
      <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
      <Route path="/admin/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
      <Route path="/admin/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />
      <Route path="/admin/announcements" element={<AdminLayout><AdminAnnouncements /></AdminLayout>} />
      <Route path="/admin/newsletter" element={<AdminLayout><AdminNewsletter /></AdminLayout>} />

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
