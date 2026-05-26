import { memo } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/organisms/sidebar';
import AppSidebar from '@/components/organisms/AppSidebar';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import { clearCredentials, selectUser } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  /** `flush` removes main padding so full-bleed shells own spacing and background. */
  mainVariant?: 'default' | 'flush';
  /** Background for flush main (e.g. credit application grey canvas). */
  flushMainClassName?: string;
}

const DashboardLayout = memo(function DashboardLayout({
  children,
  mainVariant = 'default',
  flushMainClassName,
}: DashboardLayoutProps) {
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
        <main
          id="main-content"
          role="main"
          className={cn(
            mainVariant === 'flush'
              ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-0'
              : 'flex-1 overflow-auto bg-background p-6',
            mainVariant === 'flush' && (flushMainClassName ?? 'bg-[#F9FAFB]')
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
});

export default DashboardLayout;
