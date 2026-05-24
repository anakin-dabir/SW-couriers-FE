import {
  LayoutGrid,
  ClipboardList,
  CheckSquare,
  Bell,
  BookAudio,
  Settings,
  List,
  SlidersHorizontal,
  CircleDollarSign,
  Users2,
  UserPlus,
} from 'lucide-react';
import type { NavItem } from '@/types/navitems';

/**
 * Main navigation items (displayed above separator in sidebar)
 */
export const mainNavItems: NavItem[] = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Team Management',
    url: '/invite-team',
    icon: Users2,
    items: [
      { title: 'All Team Members', url: '/invite-team', icon: List },
      { title: 'Invite Team Member', url: '/invite-team/create', icon: UserPlus },
    ],
  },
  {
    title: 'Orders',
    url: '/orders',
    icon: ClipboardList,
    items: [
      { title: 'Orders List', url: '/orders/list' },
      { title: 'Draft Orders', url: '/orders/drafts' },
      { title: 'Failed Deliveries', url: '/orders/failed-deliveries' },
      { title: 'Returned Deliveries', url: '/orders/returned-deliveries' },
    ],
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CheckSquare,
    items: [
      { title: 'Invoices', url: '/billing/invoices', icon: List },
      { title: 'Payment Details', url: '/billing/payment-details', icon: List },
      { title: 'Statements', url: '/billing/statements', icon: List },
      { title: 'Credit Notes', url: '/billing/credit-notes', icon: List },
      { title: 'Refunds', url: '/billing/refunds', icon: List },
    ],
  },
  {
    title: 'Audit Logs',
    url: '/audit-logs',
    icon: BookAudio,
  },
  {
    title: 'Credit Management',
    url: '/credit-request',
    icon: CircleDollarSign,
    items: [
      { title: 'Overview', url: '/credit-request', icon: List },
      { title: 'Draft Credit Applications', url: '/credit-request/drafts', icon: List },
    ],
  },
  {
    title: 'Notification',
    url: '/notifications',
    icon: Bell,
    items: [
      { title: 'Notifications', url: '/notifications', icon: List },
      { title: 'Preference Settings', url: '/notifications/preferences', icon: SlidersHorizontal },
    ],
  },
];

/**
 * Secondary navigation items (displayed below separator in sidebar)
 */
export const secondaryNavItems: NavItem[] = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];
