import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProactiveAlert from './components/Notifications/ProactiveAlert';
import LoginPage from './pages/LoginPage';
import IntroPage from './pages/IntroPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import QuickPickPage from './pages/QuickPickPage';
import DashboardPage from './pages/DashboardPage';
import DashboardV2 from './pages/DashboardV2';

function AuthGuard({ children, requireMbti = false }) {
  const { isAuthenticated, hasCompletedMbti, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireMbti && !hasCompletedMbti) return <Navigate to="/intro" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, hasCompletedMbti, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={hasCompletedMbti ? '/dashboard' : '/intro'} replace />
            : <LoginPage />
        }
      />
      <Route path="/intro" element={<AuthGuard><IntroPage /></AuthGuard>} />
      <Route path="/quiz" element={<AuthGuard><QuizPage /></AuthGuard>} />
      <Route path="/result" element={<AuthGuard><ResultPage /></AuthGuard>} />
      <Route path="/quickpick" element={<AuthGuard><QuickPickPage /></AuthGuard>} />
      <Route
        path="/dashboard"
        element={<AuthGuard requireMbti><DashboardPage /></AuthGuard>}
      />
      <Route
        path="/dashboard-v2"
        element={<AuthGuard requireMbti><DashboardV2 /></AuthGuard>}
      />
      <Route
        path="*"
        element={
          <Navigate to={
            !isAuthenticated ? '/login' :
            !hasCompletedMbti ? '/intro' :
            '/dashboard'
          } replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ProactiveAlert />
    </AuthProvider>
  );
}
