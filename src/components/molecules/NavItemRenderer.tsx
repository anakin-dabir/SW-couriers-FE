import { SidebarMenuItem } from '@/components/organisms/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import NavMenuItemLink from './NavMenuItemLink';
import NavMenuCollapsible from './NavMenuCollapsible';
import type { NavItem } from '@/types/navitems';

interface NavItemRendererProps {
  /** Navigation item data */
  item: NavItem;
  /** Function to check if a URL is active */
  isActive: (url: string) => boolean;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Handler to expand sidebar when collapsed */
  onExpandSidebar: () => void;
  /** Handler to close mobile sidebar */
  onCloseMobileSidebar: () => void;
}

/**
 * Molecule component that renders navigation items (either simple or collapsible)
 */
export default function NavItemRenderer({
  item,
  isActive,
  isCollapsed,
  onExpandSidebar,
  onCloseMobileSidebar,
}: NavItemRendererProps): React.JSX.Element {
  const hasSubItems = item.items && item.items.length > 0;
  const itemIsActive = isActive(item.url);

  // Collapsible menu item with sub-items
  if (hasSubItems) {
    return (
      <NavMenuCollapsible
        item={item}
        isActive={isActive}
        isCollapsed={isCollapsed}
        onExpandSidebar={onExpandSidebar}
        onCloseMobileSidebar={onCloseMobileSidebar}
      />
    );
  }

  // Simple menu item without sub-items
  return (
    <SidebarMenuItem>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <NavMenuItemLink
              url={item.url}
              icon={item.icon}
              title={item.title}
              isActive={itemIsActive}
              iconOnly
              onCloseMobileSidebar={onCloseMobileSidebar}
            />
          </TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      ) : (
        <NavMenuItemLink
          url={item.url}
          icon={item.icon}
          title={item.title}
          isActive={itemIsActive}
          onCloseMobileSidebar={onCloseMobileSidebar}
        />
      )}
    </SidebarMenuItem>
  );
}
