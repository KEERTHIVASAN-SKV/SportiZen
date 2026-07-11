import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/layout/Navigation';
import AnimatedBackground from './components/AnimatedBackground';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const PublicProfileRouter = lazy(() => import('./components/profile/PublicProfileRouter'));
const SearchPage = lazy(() => import('./components/search/SearchPage'));
const Feed = lazy(() => import('./components/feed/Feed'));
const EventsPage = lazy(() => import('./components/events/EventsPage'));
const ManageEvents = lazy(() => import('./components/events/ManageEvents'));
const VerificationPage = lazy(() => import('./components/verification/VerificationPage'));
const NotificationsList = lazy(() => import('./components/layout/NotificationsList'));

// -------------------------------------------------------
// ROUTE GUARDS
// -------------------------------------------------------
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const OrgOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'organization') return <Navigate to="/events" replace />;
  return <>{children}</>;
};

// -------------------------------------------------------
// APP SHELL (with navigation)
// -------------------------------------------------------
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <AnimatedBackground />
    <Navigation />
    <main className="relative z-10">
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        {children}
      </Suspense>
    </main>
  </div>
);

// -------------------------------------------------------
// MAIN ROUTES
// -------------------------------------------------------
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public: landing / auth */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <LandingPage />
            </Suspense>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AuthPage />
            </Suspense>
          </PublicOnlyRoute>
        }
      />

      {/* Protected routes (use AppShell with nav) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <AppShell>
              <Feed />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppShell>
              <SearchPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <AppShell>
              {user?.role === 'organization' ? <ManageEvents /> : <EventsPage />}
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-events"
        element={
          <OrgOnlyRoute>
            <AppShell>
              <ManageEvents />
            </AppShell>
          </OrgOnlyRoute>
        }
      />
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <AppShell>
              <VerificationPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppShell>
              <NotificationsList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Public profile routes */}
      <Route
        path="/player/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <PublicProfileRouter role="player" />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <PublicProfileRouter role="coach" />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <PublicProfileRouter role="organization" />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
};

// -------------------------------------------------------
// ROOT APP
// -------------------------------------------------------
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;