import { Menu } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useSidebarOptional } from '@/components/organisms/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import HeaderBreadcrumb from '@/components/atoms/HeaderBreadcrumb';
import HeaderSearchBar from './HeaderSearchBar';
import HeaderActions from './HeaderActions';
import type { BreadcrumbItem } from '@/lib/utils';

interface HeaderContentProps {
  /** Breadcrumb items */
  breadcrumbItems: BreadcrumbItem[];
  /** User data */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Logout handler */
  onLogout?: () => void;
}

/**
 * Molecule component for header main content section
 */
export default function HeaderContent({
  breadcrumbItems,
  user,
  onLogout,
}: HeaderContentProps): React.JSX.Element {
  const isMobileViewport = useIsMobile();
  const sidebar = useSidebarOptional();
  const showMobileNavToggle = isMobileViewport && sidebar !== null;

  const handleMenuClick = (): void => {
    sidebar?.setOpenMobile(true);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        {showMobileNavToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <HeaderBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex items-center gap-4 md:gap-11">
        <div className="hidden md:block">
          <HeaderSearchBar />
        </div>
        <HeaderActions user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}
