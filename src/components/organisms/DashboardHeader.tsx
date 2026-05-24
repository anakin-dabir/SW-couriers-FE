import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getBreadcrumbItems } from '@/lib/utils';
import HeaderContent from '@/components/molecules/HeaderContent';
import HeaderDivider from '@/components/atoms/HeaderDivider';

interface DashboardHeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
}

function DashboardHeader({ user, onLogout, className }: DashboardHeaderProps): React.JSX.Element {
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  return (
    <header className={cn('flex flex-col bg-white pt-2', className)}>
      <HeaderContent breadcrumbItems={breadcrumbItems} user={user} onLogout={onLogout} />
      <HeaderDivider />
    </header>
  );
}

export default DashboardHeader;
