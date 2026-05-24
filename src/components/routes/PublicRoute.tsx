import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type React from 'react';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import PublicLayout from '@/components/organisms/PublicLayout';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean; // If true, redirects authenticated users away
}

/**
 * PublicRoute Component
 *
 * Handles public routes that may or may not be accessible to authenticated users.
 * Wraps content with PublicLayout.
 *
 * @param restricted - If true, authenticated users will be redirected to dashboard
 *                     (useful for login/register pages)
 */
export default function PublicRoute({
  children,
  restricted = false,
}: PublicRouteProps): React.JSX.Element {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If route is restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
