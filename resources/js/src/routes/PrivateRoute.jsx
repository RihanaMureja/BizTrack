import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🔒 PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('🔒 PrivateRoute - user:', user);
  console.log('🔒 PrivateRoute - roles required:', roles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    console.log('🔒 Role not authorized, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 Authorized, rendering children');
  return children;
};

export default PrivateRoute;