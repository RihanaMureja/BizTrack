import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps public pages (login, register, etc.).
 * If the user is already authenticated, redirects to their dashboard.
 */
export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    const homePaths = {
      admin:    '/admin/dashboard',
      owner:    '/business/dashboard',
      cashier:  '/cashier/dashboard',
      customer: '/customer/dashboard',
    };
    return <Navigate to={homePaths[user.role] || '/login'} replace />;
  }

  return <Outlet />;
}
