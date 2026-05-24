import * as React from 'react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/molecules/collapsible';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSub } from '@/components/organisms/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import NavItemIcon from '@/components/atoms/NavItemIcon';
import NavItemTitle from '@/components/atoms/NavItemTitle';
import NavItemBadge from '@/components/atoms/NavItemBadge';
import NavItemChevron from '@/components/atoms/NavItemChevron';
import NavSubMenuItem from './NavSubMenuItem';
import type { NavItem } from '@/types/navitems';

interface NavMenuCollapsibleProps {
  /** Navigation item data */
  item: NavItem;
  /** Whether the item is active */
  isActive: (url: string) => boolean;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Handler to expand sidebar when collapsed */
  onExpandSidebar: () => void;
  /** Handler to close mobile sidebar */
  onCloseMobileSidebar: () => void;
}

/**
 * Molecule component for collapsible navigation menu items with sub-items
 */
export default function NavMenuCollapsible({
  item,
  isActive,
  isCollapsed,
  onExpandSidebar,
  onCloseMobileSidebar,
}: NavMenuCollapsibleProps): React.JSX.Element {
  const hasActiveChild = item.items?.some((subItem) => isActive(subItem.url)) ?? false;
  const shouldShowAsActive = isActive(item.url) || hasActiveChild;

  // Initialize open state based on active child
  const [isOpen, setIsOpen] = useState(() => hasActiveChild && !isCollapsed);

  // Handle click on collapsed menu item with subitems
  const handleCollapsedClick = (): void => {
    onExpandSidebar();
    // After expanding, open the collapsible
    setTimeout(() => {
      setIsOpen(true);
    }, 100);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton isActive={shouldShowAsActive} onClick={handleCollapsedClick}>
                <NavItemIcon icon={item.icon} />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton isActive={shouldShowAsActive} className="w-full justify-between">
                <span className="flex items-center gap-3">
                  <NavItemIcon icon={item.icon} />
                  <NavItemTitle title={item.title} />
                </span>
                <span className="flex items-center gap-3">
                  {item.badge && <NavItemBadge badge={item.badge} />}
                  <NavItemChevron />
                </span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <NavSubMenuItem
                    key={subItem.title}
                    subItem={subItem}
                    isActive={isActive(subItem.url)}
                    onCloseMobileSidebar={onCloseMobileSidebar}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
