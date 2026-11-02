import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  requireSchool = false,
  requireUser = false,
  allowedRoles = []
}) {
  const { school, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Validating session authorization...</p>
        </div>
      </div>
    );
  }

  // 1. Check School context
  if (requireSchool && !school) {
    return <Navigate to="/school-login" state={{ from: location }} replace />;
  }

  // 2. Check if School requires forced password change
  if (school?.mustChangePassword && location.pathname !== '/school-change-password') {
    return <Navigate to="/school-change-password" replace />;
  }

  // 3. Check User context
  if (requireUser && !user) {
    return <Navigate to="/user-login" state={{ from: location }} replace />;
  }

  // 4. Check if User requires forced password change
  if (user?.mustChangePassword && location.pathname !== '/user-change-password') {
    return <Navigate to="/user-change-password" replace />;
  }

  // 5. Check role authorization
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md border border-red-200 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600">Access Restricted</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your assigned role ({user.role}) is not authorized to view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
