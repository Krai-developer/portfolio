import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ClientLoginPage } from './pages/client/ClientLoginPage';
import { ClientRegisterPage } from './pages/client/ClientRegisterPage';
import { ClientForgotPasswordPage } from './pages/client/ClientForgotPasswordPage';
import { ClientResetPasswordPage } from './pages/client/ClientResetPasswordPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Client Portal Pages
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientProjectsPage } from './pages/client/ClientProjectsPage';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage';
import { ClientFilesPage } from './pages/client/ClientFilesPage';
import { ClientMessagesPage } from './pages/client/ClientMessagesPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { ClientProjectRequestPage } from './pages/client/ClientProjectRequestPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminSkillsPage } from './pages/admin/AdminSkillsPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
