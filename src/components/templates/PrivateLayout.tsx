import { memo } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/organisms/sidebar';
import AppSidebar from '@/components/organisms/AppSidebar';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import { clearCredentials, selectUser } from '@/store/slices/authSlice';

interface PrivateLayoutProps {
  children: ReactNode;
}

/**
 * PrivateLayout Template
 *
 * Layout template for authenticated routes (dashboard, etc.).
 * Uses the new shadcn/ui sidebar system with AppSidebar and DashboardHeader.
 * Optimized with React.memo for performance.
 */
const PrivateLayout = memo(function PrivateLayout({ children }: PrivateLayoutProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    void navigate('/login', { replace: true });
  };

  const USER_DATA = user
    ? {
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: undefined,
      }
    : undefined;

  return (
    <SidebarProvider>
      <AppSidebar user={USER_DATA} />
      <SidebarInset className="flex flex-col">
        <DashboardHeader user={USER_DATA} onLogout={handleLogout} />
        <main id="main-content" role="main" className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
});

export default PrivateLayout;
