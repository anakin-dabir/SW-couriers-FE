import { Link } from 'react-router-dom';
import { SidebarMenuButton } from '@/components/organisms/sidebar';
import NavItemIcon from '@/components/atoms/NavItemIcon';
import NavItemTitle from '@/components/atoms/NavItemTitle';
import type { LucideIcon } from 'lucide-react';

interface NavMenuItemLinkProps {
  /** URL path for the navigation item */
  url: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Whether the item is active */
  isActive: boolean;
  /** Whether to show only icon (for collapsed state) */
  iconOnly?: boolean;
  /** Additional className */
  className?: string;
  /** Handler to close mobile sidebar */
  onCloseMobileSidebar?: () => void;
}

/**
 * Molecule component for simple navigation menu items with icon and title
 */
export default function NavMenuItemLink({
  url,
  icon,
  title,
  isActive,
  iconOnly = false,
  className,
  onCloseMobileSidebar,
}: NavMenuItemLinkProps): React.JSX.Element {
  const handleClick = (): void => {
    onCloseMobileSidebar?.();
  };

  return (
    <SidebarMenuButton asChild isActive={isActive} className={className}>
      <Link to={url} onClick={handleClick}>
        <NavItemIcon icon={icon} />
        {!iconOnly && <NavItemTitle title={title} />}
      </Link>
    </SidebarMenuButton>
  );
}
