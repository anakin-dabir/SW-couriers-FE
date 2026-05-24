import { Link } from 'react-router-dom';
import { SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/organisms/sidebar';
import type { SubNavItem } from '@/types/navitems';

interface NavSubMenuItemProps {
  /** Sub-navigation item data */
  subItem: SubNavItem;
  /** Whether the sub-item is active */
  isActive: boolean;
  /** Handler to close mobile sidebar */
  onCloseMobileSidebar?: () => void;
}

/**
 * Molecule component for sub-navigation menu items
 */
export default function NavSubMenuItem({
  subItem,
  isActive,
  onCloseMobileSidebar,
}: NavSubMenuItemProps): React.JSX.Element {
  const handleClick = (): void => {
    onCloseMobileSidebar?.();
  };

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} className="pl-0 pr-2.5">
        <Link to={subItem.url} className="flex items-center" onClick={handleClick}>
          <span>{subItem.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
