import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type React from 'react';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps): React.JSX.Element {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
