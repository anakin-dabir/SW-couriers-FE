export type TeamRole = 'ACCOUNT_OWNER' | 'BILLING' | 'OPERATIONS' | 'TECHNICAL' | 'OTHER';
export type TeamStatus = 'Active' | 'Invited' | 'Suspended';
export type TeamPermissionLevel = 'none' | 'read' | 'write';

export interface TeamMemberRecord {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: TeamRole;
  status: TeamStatus;
  lastActive: string;
  invitedOn: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  permissions: Record<string, TeamPermissionLevel>;
}

export const TEAM_PERMISSION_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  ORDERS: 'Orders / Bookings',
  CARD_PAYMENT: 'Card Payment Access',
  BILLING: 'Billing',
  NOTIFICATIONS: 'Notifications',
  REQUEST_CREDIT: 'Request Credit Account',
  DOCUMENTS: 'Documents',
  CONTACTS: 'Team Management',
  AUDIT_LOG: 'Activity Logs',
};

export const MOCK_TEAM_MEMBERS: TeamMemberRecord[] = [
  {
    id: 'tm-001',
    memberCode: 'TM-1001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@fyskub.com',
    phone: '+44 7700 900123',
    role: 'ACCOUNT_OWNER',
    status: 'Active',
    lastActive: 'Today, 09:14 AM',
    invitedOn: '2026-04-18',
    addressLine1: "8 King's Road",
    addressLine2: '',
    city: 'Leeds',
    postcode: 'LS1 3AD',
    permissions: {
      DASHBOARD: 'write',
      ORDERS: 'write',
      CARD_PAYMENT: 'write',
      BILLING: 'write',
      NOTIFICATIONS: 'read',
      REQUEST_CREDIT: 'read',
      DOCUMENTS: 'write',
      CONTACTS: 'write',
      AUDIT_LOG: 'write',
    },
  },
  {
    id: 'tm-002',
    memberCode: 'TM-1002',
    firstName: 'Hannah',
    lastName: 'Cole',
    email: 'hannah.cole@fyskub.com',
    phone: '+44 7700 900124',
    role: 'OPERATIONS',
    status: 'Active',
    lastActive: 'Today, 08:03 AM',
    invitedOn: '2026-04-20',
    addressLine1: '21 Bridge End',
    addressLine2: '',
    city: 'Cardiff',
    postcode: 'CF10 2BN',
    permissions: {
      DASHBOARD: 'read',
      ORDERS: 'write',
      CARD_PAYMENT: 'read',
      BILLING: 'read',
      NOTIFICATIONS: 'write',
      REQUEST_CREDIT: 'read',
      DOCUMENTS: 'read',
      CONTACTS: 'read',
      AUDIT_LOG: 'read',
    },
  },
  {
    id: 'tm-003',
    memberCode: 'TM-1003',
    firstName: 'Marcus',
    lastName: 'Reed',
    email: 'marcus.reed@fyskub.com',
    phone: '+44 7700 900125',
    role: 'OTHER',
    status: 'Invited',
    lastActive: 'Pending acceptance',
    invitedOn: '2026-05-02',
    addressLine1: '44 Queen Street',
    addressLine2: 'Unit 2',
    city: 'Manchester',
    postcode: 'M2 5DB',
    permissions: {
      DASHBOARD: 'read',
      ORDERS: 'read',
      CARD_PAYMENT: 'none',
      BILLING: 'none',
      NOTIFICATIONS: 'read',
      REQUEST_CREDIT: 'none',
      DOCUMENTS: 'none',
      CONTACTS: 'none',
      AUDIT_LOG: 'none',
    },
  },
  {
    id: 'tm-004',
    memberCode: 'TM-1004',
    firstName: 'Aisha',
    lastName: 'Khan',
    email: 'aisha.khan@fyskub.com',
    phone: '+44 7700 900126',
    role: 'OPERATIONS',
    status: 'Active',
    lastActive: 'Yesterday, 05:41 PM',
    invitedOn: '2026-03-15',
    addressLine1: '12 Central Avenue',
    addressLine2: '',
    city: 'Birmingham',
    postcode: 'B1 2AA',
    permissions: {
      DASHBOARD: 'read',
      ORDERS: 'write',
      CARD_PAYMENT: 'read',
      BILLING: 'read',
      NOTIFICATIONS: 'write',
      REQUEST_CREDIT: 'read',
      DOCUMENTS: 'read',
      CONTACTS: 'read',
      AUDIT_LOG: 'read',
    },
  },
  {
    id: 'tm-005',
    memberCode: 'TM-1005',
    firstName: 'Liam',
    lastName: 'Parker',
    email: 'liam.parker@fyskub.com',
    phone: '+44 7700 900127',
    role: 'TECHNICAL',
    status: 'Suspended',
    lastActive: 'Apr 24, 2026',
    invitedOn: '2026-05-04',
    addressLine1: '9 Station Road',
    addressLine2: '',
    city: 'Bristol',
    postcode: 'BS1 5TR',
    permissions: {
      DASHBOARD: 'none',
      ORDERS: 'none',
      CARD_PAYMENT: 'none',
      BILLING: 'none',
      NOTIFICATIONS: 'none',
      REQUEST_CREDIT: 'none',
      DOCUMENTS: 'none',
      CONTACTS: 'none',
      AUDIT_LOG: 'none',
    },
  },
];
