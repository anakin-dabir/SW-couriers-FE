/**
 * Platform access modules shown on invite / edit flows and member detail views.
 * Keys align with {@link PERMISSION_KEY_TO_RESOURCE} for org contacts.
 */
export interface TeamPlatformAccessItem {
  key: string;
  label: string;
  description: string;
}

export const TEAM_PLATFORM_ACCESS_ITEMS: TeamPlatformAccessItem[] = [
  {
    key: 'DASHBOARD',
    label: 'Dashboard',
    description: 'Access the main dashboard with shipment summaries and account activity.',
  },
  {
    key: 'ORDERS',
    label: 'Orders / Bookings',
    description: 'Create and manage Booking orders and delivery requests.',
  },
  {
    key: 'CARD_PAYMENT',
    label: 'Card Payment Access',
    description: 'Create and manage card payments and transaction access.',
  },
  {
    key: 'BILLING',
    label: 'Billing',
    description: 'View invoices, payment history, and billing information.',
  },
  {
    key: 'NOTIFICATIONS',
    label: 'Notifications',
    description: 'View system notifications related to shipments, invoices, and account updates.',
  },
  {
    key: 'REQUEST_CREDIT',
    label: 'Request Credit Account',
    description: 'Allow the client to submit a request for a credit account from the dashboard.',
  },
  {
    key: 'DOCUMENTS',
    label: 'Documents',
    description:
      'Access Booking-related documents such as labels, invoices, and delivery confirmations.',
  },
  {
    key: 'CONTACTS',
    label: 'Team Management',
    description:
      'Users can send invitations, assign roles, and control permission levels for new or existing members within the account.',
  },
  {
    key: 'AUDIT_LOG',
    label: 'Audit Logs',
    description: 'Users can view and read audit logs for account activities and system changes.',
  },
];
