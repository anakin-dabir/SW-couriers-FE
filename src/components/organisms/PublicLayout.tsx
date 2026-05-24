import { memo } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PublicLayoutContent from '@/components/molecules/PublicLayoutContent';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout with side switching based on route
 * Login page: gradient on left, form on right
 * Register page: gradient on right, form on left
 */
const PublicLayout = memo(function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col bg-white p-2">
      <div className="flex h-full flex-1 flex-col gap-2 md:flex-row">
        <PublicLayoutContent pathname={location.pathname}>{children}</PublicLayoutContent>
      </div>
    </div>
  );
});

export default PublicLayout;
