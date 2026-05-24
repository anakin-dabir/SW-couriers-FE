import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
} from '@/components/organisms/sidebar';
import { Button } from '@/components/atoms/Button';
import { useSidebar } from '@/components/organisms/sidebar';
import { cn } from '@/lib/utils';
import { mainNavItems, secondaryNavItems } from '@/lib/navigation';
import { NavItemRenderer } from '@/components/molecules';
import SidebarLogo from '@/components/atoms/SidebarLogo';
import AppVersionLabel from '@/components/atoms/AppVersionLabel';
import SidebarFooterProfile from '@/components/atoms/SidebarFooterProfile';
import { useGetUnreadNotificationCountQuery } from '@/store/api/notificationsApi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

function AppSidebar({ user }: AppSidebarProps): React.JSX.Element {
  const location = useLocation();
  const { state, toggleSidebar, setOpen, isMobile, setOpenMobile } = useSidebar();
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const { data: unreadCountResponse } = useGetUnreadNotificationCountQuery(
    accessToken ? undefined : skipToken
  );

  const isActive = (url: string): boolean => {
    if (url === '/invite-team/create') {
      return location.pathname === '/invite-team' || location.pathname.startsWith('/invite-team/');
    }
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  const isCollapsed = state === 'collapsed';
  const unreadCount = unreadCountResponse?.data?.unread_count ?? 0;
  const navItemsWithUnreadBadge = React.useMemo(
    () =>
      mainNavItems.map((item) =>
        item.url === '/notifications'
          ? {
              ...item,
              badge: unreadCount > 0 ? String(unreadCount) : undefined,
            }
          : item
      ),
    [unreadCount]
  );

  // Handler to expand sidebar when clicking menu item with subitems while collapsed
  const handleExpandSidebar = (): void => {
    if (isCollapsed) {
      setOpen(true);
    }
  };

  // Handler to close mobile sidebar when menu item is clicked
  const handleCloseMobileSidebar = (): void => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header with Logo and Collapse Toggle */}
      <SidebarHeader>
        <SidebarLogo isCollapsed={isCollapsed} />

        {/* Collapse Toggle Button - positioned on the right edge */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'absolute size-7 shrink-0 rounded-md border border-gray-200 bg-white shadow-sm',
            'hover:bg-gray-50 transition-all duration-300 z-50',
            isCollapsed ? '-right-6 top-9' : '-right-6 top-9'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4 text-warning" />
          ) : (
            <ChevronsLeft className="size-4 text-warning" />
          )}
        </Button>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="mt-7-5">
        {/* Main Menu Section */}
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItemsWithUnreadBadge.map((item) => (
                <NavItemRenderer
                  key={item.title}
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onExpandSidebar={handleExpandSidebar}
                  onCloseMobileSidebar={handleCloseMobileSidebar}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <SidebarSeparator />

        {/* Secondary Menu Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <NavItemRenderer
                  key={item.title}
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onExpandSidebar={handleExpandSidebar}
                  onCloseMobileSidebar={handleCloseMobileSidebar}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="flex flex-col gap-2">
        <AppVersionLabel
          isCollapsed={isCollapsed}
          className={isCollapsed ? 'text-center' : 'px-1'}
        />
        <SidebarFooterProfile user={user} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
