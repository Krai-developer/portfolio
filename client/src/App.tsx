import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Eagerly loaded Public Home Route
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/public/HomePage';

// Lazy-loaded Layouts
const ClientLayout = lazy(() =>
  import('./layouts/ClientLayout').then((m) => ({ default: m.ClientLayout }))
);
const AdminLayout = lazy(() =>
  import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);

// Lazy-loaded Public & Auth Pages
const ProjectDetailPage = lazy(() =>
  import('./pages/public/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const ClientLoginPage = lazy(() =>
  import('./pages/client/ClientLoginPage').then((m) => ({ default: m.ClientLoginPage }))
);
const ClientRegisterPage = lazy(() =>
  import('./pages/client/ClientRegisterPage').then((m) => ({ default: m.ClientRegisterPage }))
);
const ClientForgotPasswordPage = lazy(() =>
  import('./pages/client/ClientForgotPasswordPage').then((m) => ({ default: m.ClientForgotPasswordPage }))
);
const ClientResetPasswordPage = lazy(() =>
  import('./pages/client/ClientResetPasswordPage').then((m) => ({ default: m.ClientResetPasswordPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

// Lazy-loaded Client Portal Pages
const ClientDashboardPage = lazy(() =>
  import('./pages/client/ClientDashboardPage').then((m) => ({ default: m.ClientDashboardPage }))
);
const ClientProjectsPage = lazy(() =>
  import('./pages/client/ClientProjectsPage').then((m) => ({ default: m.ClientProjectsPage }))
);
const ClientProjectDetailPage = lazy(() =>
  import('./pages/client/ClientProjectDetailPage').then((m) => ({ default: m.ClientProjectDetailPage }))
);
const ClientFilesPage = lazy(() =>
  import('./pages/client/ClientFilesPage').then((m) => ({ default: m.ClientFilesPage }))
);
const ClientMessagesPage = lazy(() =>
  import('./pages/client/ClientMessagesPage').then((m) => ({ default: m.ClientMessagesPage }))
);
const ClientProfilePage = lazy(() =>
  import('./pages/client/ClientProfilePage').then((m) => ({ default: m.ClientProfilePage }))
);
const ClientProjectRequestPage = lazy(() =>
  import('./pages/client/ClientProjectRequestPage').then((m) => ({ default: m.ClientProjectRequestPage }))
);

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProjectsPage = lazy(() =>
  import('./pages/admin/AdminProjectsPage').then((m) => ({ default: m.AdminProjectsPage }))
);
const AdminClientsPage = lazy(() =>
  import('./pages/admin/AdminClientsPage').then((m) => ({ default: m.AdminClientsPage }))
);
const AdminServicesPage = lazy(() =>
  import('./pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage }))
);
const AdminSkillsPage = lazy(() =>
  import('./pages/admin/AdminSkillsPage').then((m) => ({ default: m.AdminSkillsPage }))
);
const AdminMessagesPage = lazy(() =>
  import('./pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-label="Loading page" />
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/client/login" element={<ClientLoginPage />} />
              <Route path="/client/register" element={<ClientRegisterPage />} />
              <Route path="/client/forgot-password" element={<ClientForgotPasswordPage />} />
              <Route path="/client/reset-password" element={<ClientResetPasswordPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Client Portal Routes (Protected by ClientLayout) */}
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<Navigate to="/client/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="projects" element={<ClientProjectsPage />} />
              <Route path="projects/:id" element={<ClientProjectDetailPage />} />
              <Route path="request-project" element={<ClientProjectRequestPage />} />
              <Route path="files" element={<ClientFilesPage />} />
              <Route path="messages" element={<ClientMessagesPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
            </Route>

            {/* Admin Dashboard Routes (Protected by AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="clients" element={<AdminClientsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="skills" element={<AdminSkillsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 text-center">
                  <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-4">
                    <h1 className="text-4xl font-extrabold text-accent font-mono">404</h1>
                    <h2 className="text-xl font-bold text-white">Page Not Found</h2>
                    <p className="text-content-secondary text-sm">
                      The requested page or route does not exist.
                    </p>
                    <a
                      href="/"
                      className="inline-block px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm"
                    >
                      Return to Homepage
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
