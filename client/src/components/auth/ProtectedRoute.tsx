import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'USER' | 'ADMIN';
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * Prevents access to protected pages for unauthenticated users
 * Supports role-based access control for admin routes
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole
}) => {
  const { isAuth, user, isLoading, initializeAuth } = useAuthStore();
  const location = useLocation();

  /**
   * Re-initialize auth state if needed
   * This handles edge cases where auth state might be lost
   */
  useEffect(() => {
    if (!isAuth && !isLoading) {
      console.log('ProtectedRoute: Re-initializing auth state...');
      initializeAuth();
    }
  }, [isAuth, isLoading, initializeAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-red-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requireRole && user?.role !== requireRole) {
    console.log(`ProtectedRoute: User role ${user?.role} does not match required role ${requireRole}`);
    
    // Redirect admin users to admin dashboard, regular users to home
    const redirectPath = user?.role === 'ADMIN' ? '/admin' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and authorized, render protected content
  return <>{children}</>;
};