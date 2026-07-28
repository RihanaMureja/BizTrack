import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Allows access only if the logged-in user's role is in allowedRoles.
 * Redirects to /login on mismatch.
 *
 * Usage:
 *   <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin/*" element={<AdminLayout />} />
 *   </Route>
 */
export default function RoleBasedRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard instead of login
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
