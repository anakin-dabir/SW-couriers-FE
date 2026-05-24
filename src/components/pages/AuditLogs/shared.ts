import type { LucideIcon } from 'lucide-react';
import { Database, Layers3, SlidersHorizontal, TriangleAlert, User } from 'lucide-react';

export type AuditTabKey = 'overview' | 'activity-log' | 'data-access-log' | 'change-history';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type DeviceType = 'Desktop' | 'Laptop' | 'Mobile';

export interface AuditLogRow {
  id: string;
  timestamp: string;
  ipAddress: string;
  browser: string;
  device: DeviceType;
  os: string;
  emails: string;
  event: string;
  action: 'View';
  category: string;
  severity: Severity;
  status: 'Resolved' | 'Open';
  actor: string;
}

export interface AuditStatCard {
  id: string;
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
}

export const AUDIT_TAB_ITEMS: Array<{ value: AuditTabKey; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity-log', label: 'Activity Log' },
  { value: 'data-access-log', label: 'Data Access Log' },
  { value: 'change-history', label: 'Change History' },
];

const BASE_ROWS: AuditLogRow[] = [
  {
    id: '1',
    timestamp: '2026-05-05 14:26',
    ipAddress: '52.18.234.10',
    browser: 'Chrome',
    device: 'Desktop',
    os: 'Windows',
    emails: 'finance.admin@swiftway.com',
    event: 'MFA Disabled',
    action: 'View',
    category: 'Auth',
    severity: 'Critical',
    status: 'Open',
    actor: 'Finance Admin',
  },
  {
    id: '2',
    timestamp: '2026-05-05 13:57',
    ipAddress: '34.245.102.77',
    browser: 'Microsoft Edge',
    device: 'Desktop',
    os: 'Windows',
    emails: 'ops.manager@swiftway.com',
    event: 'API Key Regenerated',
    action: 'View',
    category: 'Config',
    severity: 'High',
    status: 'Resolved',
    actor: 'Ops Manager',
  },
  {
    id: '3',
    timestamp: '2026-05-05 12:31',
    ipAddress: '18.132.93.44',
    browser: 'Safari',
    device: 'Mobile',
    os: 'iOS',
    emails: 'support.agent@swiftway.com',
    event: 'Restricted Record Access',
    action: 'View',
    category: 'Access',
    severity: 'Medium',
    status: 'Open',
    actor: 'Support Agent',
  },
  {
    id: '4',
    timestamp: '2026-05-05 11:12',
    ipAddress: '3.11.79.201',
    browser: 'Firefox',
    device: 'Laptop',
    os: 'macOS',
    emails: 'billing.admin@swiftway.com',
    event: 'Credit Limit Updated',
    action: 'View',
    category: 'Billing',
    severity: 'High',
    status: 'Resolved',
    actor: 'Billing Admin',
  },
  {
    id: '5',
    timestamp: '2026-05-05 09:47',
    ipAddress: '63.34.192.58',
    browser: 'Chrome',
    device: 'Laptop',
    os: 'Linux',
    emails: 'system@swiftway.com',
    event: 'Password Policy Updated',
    action: 'View',
    category: 'Security',
    severity: 'Low',
    status: 'Resolved',
    actor: 'System',
  },
  {
    id: '6',
    timestamp: '2026-05-05 08:22',
    ipAddress: '18.202.115.94',
    browser: 'Chrome',
    device: 'Laptop',
    os: 'macOS',
    emails: 'unknown@swiftway.com',
    event: 'Suspicious Login Attempt',
    action: 'View',
    category: 'Auth',
    severity: 'Critical',
    status: 'Open',
    actor: 'Unknown',
  },
];

export const ITEMS_PER_PAGE = 6;
export const TREND_Y_AXIS = [400, 320, 240, 160, 80, 0] as const;
export const TREND_X_AXIS = ['Feb 3', 'Feb 8', 'Feb 13', 'Feb 18', 'Feb 23', 'Feb 28'] as const;
export const TREND_STACKED_DATA = [
  { info: 44, notice: 36, warning: 92, critical: 14 },
  { info: 52, notice: 22, warning: 80, critical: 20 },
  { info: 76, notice: 66, warning: 76, critical: 94 },
  { info: 68, notice: 18, warning: 74, critical: 36 },
  { info: 40, notice: 26, warning: 60, critical: 72 },
  { info: 86, notice: 60, warning: 74, critical: 98 },
  { info: 66, notice: 20, warning: 88, critical: 52 },
  { info: 74, notice: 26, warning: 106, critical: 22 },
  { info: 102, notice: 30, warning: 98, critical: 64 },
  { info: 96, notice: 54, warning: 48, critical: 92 },
  { info: 84, notice: 40, warning: 70, critical: 56 },
  { info: 78, notice: 66, warning: 92, critical: 74 },
  { info: 58, notice: 16, warning: 90, critical: 78 },
  { info: 82, notice: 62, warning: 64, critical: 54 },
  { info: 76, notice: 48, warning: 88, critical: 46 },
  { info: 84, notice: 24, warning: 76, critical: 90 },
  { info: 88, notice: 72, warning: 68, critical: 38 },
  { info: 50, notice: 30, warning: 24, critical: 88 },
  { info: 44, notice: 34, warning: 58, critical: 92 },
  { info: 78, notice: 18, warning: 90, critical: 24 },
  { info: 56, notice: 20, warning: 84, critical: 30 },
  { info: 68, notice: 24, warning: 96, critical: 42 },
  { info: 34, notice: 30, warning: 114, critical: 66 },
  { info: 78, notice: 62, warning: 74, critical: 64 },
  { info: 70, notice: 24, warning: 84, critical: 36 },
  { info: 96, notice: 44, warning: 102, critical: 58 },
  { info: 50, notice: 30, warning: 96, critical: 44 },
  { info: 66, notice: 68, warning: 78, critical: 52 },
  { info: 86, notice: 78, warning: 66, critical: 94 },
  { info: 70, notice: 40, warning: 92, critical: 34 },
] as const;

export const OVERVIEW_STATS: AuditStatCard[] = [
  {
    id: 'security-events',
    title: 'Security Events',
    value: '342',
    note: '18% above 24h average',
    icon: Layers3,
  },
  {
    id: 'critical-alerts',
    title: 'Critical Alerts',
    value: '8',
    note: 'Latest: Unauthorised API access attempt detected.',
    icon: TriangleAlert,
  },
  {
    id: 'rate-limit-hits',
    title: 'Rate Limit Hits',
    value: '31',
    note: 'Top Category: Rate Limits',
    icon: TriangleAlert,
  },
  {
    id: 'data-export-events',
    title: 'Data Export Events',
    value: '46',
    note: '15 Unique Admins',
    icon: Database,
  },
  {
    id: 'settings-changes',
    title: 'Settings Changes',
    value: '27',
    note: 'Latest: Credit limit adjusted by Finance Admin.',
    icon: SlidersHorizontal,
  },
  { id: 'actor-count', title: 'Actor Count', value: '15', note: '15 Unique Actors', icon: User },
];

export const ACTIVITY_LOG_STATS: AuditStatCard[] = [
  {
    id: 'txn-volume',
    title: 'Transaction Events',
    value: '284',
    note: '12% above 24h average',
    icon: Layers3,
  },
  {
    id: 'txn-failed',
    title: 'Failed Transactions',
    value: '12',
    note: 'Latest: payment capture failed.',
    icon: TriangleAlert,
  },
  {
    id: 'txn-retries',
    title: 'Retry Attempts',
    value: '43',
    note: 'Top Category: Card retries',
    icon: TriangleAlert,
  },
  {
    id: 'txn-refunds',
    title: 'Refund Events',
    value: '38',
    note: '9 Unique Admins',
    icon: Database,
  },
  {
    id: 'txn-manual',
    title: 'Manual Adjustments',
    value: '21',
    note: 'Latest: invoice amount adjusted.',
    icon: SlidersHorizontal,
  },
  { id: 'txn-actors', title: 'Actor Count', value: '12', note: '12 Unique Actors', icon: User },
];

export const DATA_ACCESS_LOG_STATS: AuditStatCard[] = [
  {
    id: 'data-access-events',
    title: 'Data Access Events',
    value: '198',
    note: '7% above 24h average',
    icon: Layers3,
  },
  {
    id: 'sensitive-access',
    title: 'Sensitive Access',
    value: '5',
    note: 'Latest: restricted export attempted.',
    icon: TriangleAlert,
  },
  {
    id: 'download-spikes',
    title: 'Download Spikes',
    value: '19',
    note: 'Top Category: CSV Exports',
    icon: TriangleAlert,
  },
  {
    id: 'export-events',
    title: 'Export Events',
    value: '32',
    note: '11 Unique Admins',
    icon: Database,
  },
  {
    id: 'permission-changes',
    title: 'Permission Changes',
    value: '14',
    note: 'Latest: role scope updated.',
    icon: SlidersHorizontal,
  },
  { id: 'data-actors', title: 'Actor Count', value: '11', note: '11 Unique Actors', icon: User },
];

export const CHANGE_HISTORY_STATS: AuditStatCard[] = [
  {
    id: 'account-actions',
    title: 'Account Actions',
    value: '164',
    note: '5% above 24h average',
    icon: Layers3,
  },
  {
    id: 'risk-actions',
    title: 'Risk Actions',
    value: '4',
    note: 'Latest: unusual password reset burst.',
    icon: TriangleAlert,
  },
  {
    id: 'auth-hits',
    title: 'Auth Rule Hits',
    value: '26',
    note: 'Top Category: Login Policy',
    icon: TriangleAlert,
  },
  {
    id: 'profile-updates',
    title: 'Profile Updates',
    value: '41',
    note: '8 Unique Admins',
    icon: Database,
  },
  {
    id: 'setting-updates',
    title: 'Settings Changes',
    value: '17',
    note: 'Latest: notification policy updated.',
    icon: SlidersHorizontal,
  },
  { id: 'account-actors', title: 'Actor Count', value: '10', note: '10 Unique Actors', icon: User },
];

export const TAB_STATS: Record<AuditTabKey, AuditStatCard[]> = {
  overview: OVERVIEW_STATS,
  'activity-log': ACTIVITY_LOG_STATS,
  'data-access-log': DATA_ACCESS_LOG_STATS,
  'change-history': CHANGE_HISTORY_STATS,
};

export const OVERVIEW_ROWS: AuditLogRow[] = BASE_ROWS;
export const ACTIVITY_LOG_ROWS: AuditLogRow[] = [
  {
    id: 'al-1',
    timestamp: '2026-05-06 15:14',
    ipAddress: '51.89.244.18',
    browser: 'Chrome',
    device: 'Desktop',
    os: 'Windows',
    emails: 'accounts.ops@swiftway.com',
    event: 'Invoice Status Updated',
    action: 'View',
    category: 'Transaction',
    severity: 'High',
    status: 'Open',
    actor: 'Accounts Ops',
  },
  {
    id: 'al-2',
    timestamp: '2026-05-06 14:39',
    ipAddress: '34.91.120.65',
    browser: 'Microsoft Edge',
    device: 'Laptop',
    os: 'Windows',
    emails: 'billing.supervisor@swiftway.com',
    event: 'Payment Retry Triggered',
    action: 'View',
    category: 'Transaction',
    severity: 'Medium',
    status: 'Resolved',
    actor: 'Billing Supervisor',
  },
  {
    id: 'al-3',
    timestamp: '2026-05-06 13:52',
    ipAddress: '18.170.77.140',
    browser: 'Safari',
    device: 'Mobile',
    os: 'iOS',
    emails: 'finance.controller@swiftway.com',
    event: 'Credit Note Issued',
    action: 'View',
    category: 'Billing',
    severity: 'Low',
    status: 'Resolved',
    actor: 'Finance Controller',
  },
  {
    id: 'al-4',
    timestamp: '2026-05-06 12:18',
    ipAddress: '3.248.188.31',
    browser: 'Firefox',
    device: 'Desktop',
    os: 'Linux',
    emails: 'collections.agent@swiftway.com',
    event: 'Overdue Reminder Sent',
    action: 'View',
    category: 'Collections',
    severity: 'Low',
    status: 'Open',
    actor: 'Collections Agent',
  },
  {
    id: 'al-5',
    timestamp: '2026-05-06 10:41',
    ipAddress: '35.176.201.29',
    browser: 'Chrome',
    device: 'Laptop',
    os: 'macOS',
    emails: 'ops.admin@swiftway.com',
    event: 'Manual Charge Reversal',
    action: 'View',
    category: 'Transaction',
    severity: 'Critical',
    status: 'Open',
    actor: 'Ops Admin',
  },
  {
    id: 'al-6',
    timestamp: '2026-05-06 09:27',
    ipAddress: '52.213.98.72',
    browser: 'Chrome',
    device: 'Desktop',
    os: 'Windows',
    emails: 'reconciliation@swiftway.com',
    event: 'Batch Settlement Completed',
    action: 'View',
    category: 'Reconciliation',
    severity: 'Medium',
    status: 'Resolved',
    actor: 'Reconciliation Bot',
  },
];
export const DATA_ACCESS_LOG_ROWS: AuditLogRow[] = BASE_ROWS.map((row) => ({
  ...row,
  id: `d-${row.id}`,
  category: 'Data Access',
}));
export const CHANGE_HISTORY_ROWS: AuditLogRow[] = BASE_ROWS.map((row) => ({
  ...row,
  id: `a-${row.id}`,
  category: 'Account Action',
}));

export const TAB_ROWS: Record<AuditTabKey, AuditLogRow[]> = {
  overview: OVERVIEW_ROWS,
  'activity-log': ACTIVITY_LOG_ROWS,
  'data-access-log': DATA_ACCESS_LOG_ROWS,
  'change-history': CHANGE_HISTORY_ROWS,
};
