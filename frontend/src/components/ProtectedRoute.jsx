import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard that protects dashboard pages from unauthenticated users.
 * Uses AuthContext instead of localStorage — this is the single source
 * of truth for auth state across the entire app.
 *
 * IMPORTANT: While isLoading is true, we show a skeleton instead of redirecting.
 * Without this check, the redirect fires before the /me API call completes,
 * causing a flash-to-login on every page refresh even for logged-in users.
 *
 * @param {{ roleRequired?: string }} props - Optional role check (e.g. 'admin')
 */
const ProtectedRoute = ({ roleRequired }) => {
  const { user, isLoading } = useAuth();

  // Wait for the /me call to finish before making any routing decisions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
          />
          <p className="text-text-muted text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // No user after /me resolved → not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check: redirect users trying to access admin routes and vice versa
  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;