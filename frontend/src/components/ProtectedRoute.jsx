import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Protected Route Component
 * Redirects to /auth if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    console.log('🔒 User not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
