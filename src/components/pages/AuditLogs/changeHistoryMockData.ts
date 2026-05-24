/** Frontend-only mock types until Change History APIs are wired */

export interface ChangeHistoryFieldDelta {
  fieldName: string;
  before: string;
  after: string;
}

export interface ChangeLogMockRow {
  id: string;
  /** ISO-ish datetime for toolbar date-range filtering (FE mock only). */
  loggedAt: string;
  timestamp: string;
  category: string;
  entityType: string;
  entityReference: string;
  action: 'Update' | 'Create' | 'Delete';
  email: string;
  actor: 'Admin' | 'Client';
  fieldsCount: number | null;
  changeSummary: string;
  fieldChanges: ChangeHistoryFieldDelta[];
  reason: string | null;
}

export interface FieldHistoryMockRow {
  id: string;
  loggedAt: string;
  timestamp: string;
  previousValue: string;
  newValue: string;
  actor: string;
  reason: string | null;
  /** Matches grouped field keys */
  fieldKey: string;
  eventType: 'Create' | 'Update' | 'Delete';
}

export const CHANGE_HISTORY_EVENT_CATEGORIES = [
  'Account',
  'Contact',
  'Order',
  'Billing',
  'System',
  'Credit',
  'Document',
  'Access',
  'Security',
] as const;

export const CHANGE_HISTORY_ENTITY_TYPES = [
  'Client',
  'Invoice',
  'Payment',
  'Contact',
  'Order',
  'Credit Account',
] as const;

export const CHANGE_HISTORY_ACTIONS = ['Create', 'Update', 'Delete'] as const;

export const CHANGE_HISTORY_ACTORS = ['Admin', 'Client'] as const;

export const CHANGE_HISTORY_CATEGORY_PILL: Record<string, string> = {
  Credit: 'bg-[#EA580C]',
  Contact: 'bg-[#06B6D4]',
  Billing: 'bg-[#EC4899]',
  Order: 'bg-[#16A34A]',
  Account: 'bg-[#7C3AED]',
  System: 'bg-[#64748B]',
  Document: 'bg-[#0D9488]',
  Access: 'bg-[#2563EB]',
  Security: 'bg-[#DC2626]',
};

export const MOCK_CHANGE_LOG_ROWS: ChangeLogMockRow[] = [
  {
    id: 'cl-1',
    loggedAt: '2026-10-23T08:12:34.000Z',
    timestamp: '23/10/26, 08:12:34.000',
    category: 'Credit',
    entityType: 'Credit Account',
    entityReference: 'SWC-ORG-2026-50917',
    action: 'Update',
    email: 'david.lee@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 2,
    changeSummary: 'Credit limit changed from £10,000 to £15,000',
    fieldChanges: [
      { fieldName: 'Credit Limit', before: '£10,000', after: '£15,000' },
      { fieldName: 'Payment Terms', before: 'Net 20', after: 'Net 30' },
    ],
    reason: 'Credit limit increased following manual risk review.',
  },
  {
    id: 'cl-2',
    loggedAt: '2026-10-23T09:05:11.000Z',
    timestamp: '23/10/26, 09:05:11.000',
    category: 'Contact',
    entityType: 'Contact',
    entityReference: 'SWC-ORG-2026-44102',
    action: 'Create',
    email: 'sarah.chen@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 3,
    changeSummary: 'New contact added to Emily Davis',
    fieldChanges: [
      { fieldName: 'Name', before: '—', after: 'James Porter' },
      { fieldName: 'Email', before: '—', after: 'james.porter@example.com' },
    ],
    reason: null,
  },
  {
    id: 'cl-3',
    loggedAt: '2026-10-23T09:42:00.000Z',
    timestamp: '23/10/26, 09:42:00.000',
    category: 'Billing',
    entityType: 'Invoice',
    entityReference: 'INV-2026-08811',
    action: 'Update',
    email: 'finance.admin@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 1,
    changeSummary: 'Invoice totals adjusted after reconciliation.',
    fieldChanges: [{ fieldName: 'Amount', before: '£2,400.00', after: '£2,180.00' }],
    reason: null,
  },
  {
    id: 'cl-4',
    loggedAt: '2026-10-23T10:18:22.000Z',
    timestamp: '23/10/26, 10:18:22.000',
    category: 'Order',
    entityType: 'Order',
    entityReference: 'ORD-2026-12009',
    action: 'Delete',
    email: 'john.smith@swcouriers.com',
    actor: 'Client',
    fieldsCount: null,
    changeSummary: 'Draft order deleted.',
    fieldChanges: [],
    reason: 'User cancelled draft checkout.',
  },
  {
    id: 'cl-5',
    loggedAt: '2026-10-23T11:02:45.000Z',
    timestamp: '23/10/26, 11:02:45.000',
    category: 'Account',
    entityType: 'Client',
    entityReference: 'SWC-ORG-2026-88001',
    action: 'Update',
    email: 'ops.manager@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 2,
    changeSummary: 'Service tier configuration updated.',
    fieldChanges: [
      {
        fieldName: 'Service Tier',
        before: 'Fastest, Standard',
        after: 'Fastest, Standard, Economic',
      },
    ],
    reason: null,
  },
  {
    id: 'cl-6',
    loggedAt: '2026-10-23T11:55:03.000Z',
    timestamp: '23/10/26, 11:55:03.000',
    category: 'Document',
    entityType: 'Invoice',
    entityReference: 'INV-2026-09001',
    action: 'Create',
    email: 'billing.bot@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 1,
    changeSummary: 'Invoice generated from shipment batch.',
    fieldChanges: [{ fieldName: 'Status', before: '—', after: 'Draft' }],
    reason: null,
  },
  {
    id: 'cl-7',
    loggedAt: '2026-10-23T12:30:18.000Z',
    timestamp: '23/10/26, 12:30:18.000',
    category: 'Access',
    entityType: 'Credit Account',
    entityReference: 'SWC-ORG-2026-50917',
    action: 'Update',
    email: 'risk@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 1,
    changeSummary: 'Discount schedule amended.',
    fieldChanges: [
      { fieldName: 'Discounts', before: 'Fixed, Percentage', after: 'Fixed, Percentage, Volume' },
    ],
    reason: 'Annual credit review.',
  },
  {
    id: 'cl-8',
    loggedAt: '2026-10-23T13:44:59.000Z',
    timestamp: '23/10/26, 13:44:59.000',
    category: 'Security',
    entityType: 'Client',
    entityReference: 'SWC-ORG-2026-77221',
    action: 'Update',
    email: 'security@swcouriers.com',
    actor: 'Admin',
    fieldsCount: 1,
    changeSummary: 'MFA requirement toggled for organisation admins.',
    fieldChanges: [{ fieldName: 'MFA Policy', before: 'Optional', after: 'Required' }],
    reason: null,
  },
];

/** Grouped options for “Select Field” (Field History) */
export const FIELD_HISTORY_FIELD_GROUPS: {
  label: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    label: 'Credit',
    fields: [{ key: 'credit_limit', label: 'Credit Limit' }],
  },
  {
    label: 'Account Configuration',
    fields: [{ key: 'service_tier', label: 'Service Tier' }],
  },
  {
    label: 'Billing',
    fields: [
      { key: 'payment_terms', label: 'Payment Terms' },
      { key: 'discounts', label: 'Discounts' },
    ],
  },
];

/** Sent on compare POST `fields` — must match field-history path keys. */
export const DEFAULT_COMPARE_FIELD_KEYS: string[] = FIELD_HISTORY_FIELD_GROUPS.flatMap((g) =>
  g.fields.map((f) => f.key)
);

export const MOCK_FIELD_HISTORY_ROWS: FieldHistoryMockRow[] = [
  {
    id: 'fh-1',
    loggedAt: '2026-10-23T08:12:34.000Z',
    timestamp: '23/10/26, 08:12:34',
    previousValue: '£10,000',
    newValue: '£15,000',
    actor: 'Admin',
    reason: 'Credit limit increased following manual risk review.',
    fieldKey: 'credit_limit',
    eventType: 'Update',
  },
  {
    id: 'fh-2',
    loggedAt: '2026-10-22T14:30:00.000Z',
    timestamp: '22/10/26, 14:30:00',
    previousValue: '£9,500',
    newValue: '£10,000',
    actor: 'Admin',
    reason: 'Annual credit adjustment.',
    fieldKey: 'credit_limit',
    eventType: 'Update',
  },
  {
    id: 'fh-3',
    loggedAt: '2026-09-15T09:00:00.000Z',
    timestamp: '15/09/26, 09:00:00',
    previousValue: '£8,200',
    newValue: '£9,500',
    actor: 'Admin',
    reason: '—',
    fieldKey: 'credit_limit',
    eventType: 'Update',
  },
  {
    id: 'fh-4',
    loggedAt: '2026-08-01T11:15:22.000Z',
    timestamp: '01/08/26, 11:15:22',
    previousValue: '£7,000',
    newValue: '£8,200',
    actor: 'Admin',
    reason: 'Promotional uplift.',
    fieldKey: 'credit_limit',
    eventType: 'Update',
  },
  {
    id: 'fh-5',
    loggedAt: '2026-10-20T10:00:00.000Z',
    timestamp: '20/10/26, 10:00:00',
    previousValue: '—',
    newValue: '£10,000',
    actor: 'Admin',
    reason: 'Initial credit limit established.',
    fieldKey: 'credit_limit',
    eventType: 'Create',
  },
  {
    id: 'fh-pt-1',
    loggedAt: '2026-10-23T09:00:00.000Z',
    timestamp: '23/10/26, 09:00:00',
    previousValue: 'Net 20',
    newValue: 'Net 30',
    actor: 'Admin',
    reason: 'Aligned with credit review.',
    fieldKey: 'payment_terms',
    eventType: 'Update',
  },
  {
    id: 'fh-st-1',
    loggedAt: '2026-10-23T11:02:45.000Z',
    timestamp: '23/10/26, 11:02:45',
    previousValue: 'Fastest, Standard',
    newValue: 'Fastest, Standard, Economic',
    actor: 'Admin',
    reason: '—',
    fieldKey: 'service_tier',
    eventType: 'Update',
  },
];

export const MOCK_FIELD_HISTORY_CHART_CREDIT = [
  { month: 'Oct 2025', value: 7000 },
  { month: 'Nov 2025', value: 7200 },
  { month: 'Dec 2025', value: 7800 },
  { month: 'Jan 2026', value: 8200 },
  { month: 'Feb 2026', value: 10000 },
  { month: 'Mar 2026', value: 15000 },
];

/** Placeholder series for non-numeric fields (mock FE only). */
export const MOCK_FIELD_HISTORY_CHART_GENERIC = [
  { month: 'Oct 2025', value: 1 },
  { month: 'Nov 2025', value: 1 },
  { month: 'Dec 2025', value: 2 },
  { month: 'Jan 2026', value: 2 },
  { month: 'Feb 2026', value: 3 },
  { month: 'Mar 2026', value: 3 },
];

export interface CompareSnapshotRowMock {
  fieldName: string;
  valueA: string;
  valueB: string;
  changes: number;
  /** Rich rows: bold title + optional grey/green subtitle per block */
  valueALines?: { title: string; subtitle?: string }[];
  valueBLines?: { title: string; subtitle?: string }[];
}

export const MOCK_COMPARE_ROWS: CompareSnapshotRowMock[] = [
  {
    fieldName: 'Credit Limit',
    valueA: '£10,000',
    valueB: '£10,000',
    changes: 3,
  },
  {
    fieldName: 'Service Tier',
    valueA: 'Fastest, Standard',
    valueB: 'Fastest, Standard, Economic',
    changes: 2,
  },
  {
    fieldName: 'Payment Terms',
    valueA: 'Net 20',
    valueB: 'Net 30',
    changes: 2,
  },
  {
    fieldName: 'Discounts',
    valueA: '',
    valueB: '',
    changes: 2,
    valueALines: [
      {
        title: 'Fixed Discount',
        subtitle: 'Fastest (£25), Standard (£15), Economic (£10) per shipment.',
      },
      {
        title: 'Percentage Discount',
        subtitle: 'Tiered corridor rates by lane.',
      },
    ],
    valueBLines: [
      {
        title: 'Fixed Discount',
        subtitle: 'Fastest (£25), Standard (£15), Economic (£10) per shipment.',
      },
      {
        title: 'Percentage Discount',
        subtitle: 'Tiered % by corridor.',
      },
      {
        title: 'Volume Discount',
        subtitle: 'Volume tiers from £50k annual spend.',
      },
    ],
  },
];
