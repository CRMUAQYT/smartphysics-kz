import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  role?: Role;
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
