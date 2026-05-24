import { memo } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/organisms/sidebar';
import AppSidebar from '@/components/organisms/AppSidebar';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import { clearCredentials, selectUser } from '@/store/slices/authSlice';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = memo(function DashboardLayout({ children }: DashboardLayoutProps) {
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
    <SidebarProvider className="flex h-svh w-full overflow-hidden">
      <AppSidebar user={USER_DATA} />
      <SidebarInset className="flex flex-col min-w-0 flex-1 h-full overflow-hidden">
        <DashboardHeader user={USER_DATA} onLogout={handleLogout} />
        <main id="main-content" role="main" className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
});

export default DashboardLayout;
