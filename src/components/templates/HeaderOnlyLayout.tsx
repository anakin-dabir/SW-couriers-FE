import { memo } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '@/components/organisms/SimpleHeader';
import { clearCredentials, selectUser } from '@/store/slices/authSlice';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface HeaderOnlyLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
}

const HeaderOnlyLayout = memo(function HeaderOnlyLayout({
  children,
  showBackButton = true,
  breadcrumbItems,
}: HeaderOnlyLayoutProps) {
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
    <div className="flex h-screen max-h-screen min-h-0 flex-col overflow-hidden">
      <SimpleHeader
        showBackButton={showBackButton}
        user={USER_DATA}
        onLogout={handleLogout}
        breadcrumbItems={breadcrumbItems}
      />
      <main
        id="main-content"
        role="main"
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-6"
      >
        {children}
      </main>
    </div>
  );
});

export default HeaderOnlyLayout;
