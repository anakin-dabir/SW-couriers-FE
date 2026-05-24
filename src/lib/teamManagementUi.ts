import { cn } from '@/lib/utils';

export type TeamListTimePreset = 'last_7_days' | 'last_30_days' | 'all_time' | 'custom';

export const TEAM_LIST_TIME_PRESET_LABELS: Record<TeamListTimePreset, string> = {
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  all_time: 'All Time',
  custom: 'Custom',
};

/** Shared toolbar field — search, period select, date range (All Team Members spec) */
export const TEAM_TOOLBAR_FIELD_CLASS =
  'h-10 rounded-lg border border-[#E5E7EB] bg-white text-sm shadow-none transition-colors hover:border-[#D1D5DB] focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20';

/** @deprecated Use TEAM_TOOLBAR_FIELD_CLASS */
export const TEAM_TOOLBAR_TRIGGER_CLASS = cn(
  TEAM_TOOLBAR_FIELD_CLASS,
  'gap-2 px-3 font-medium text-[#18181B] hover:bg-[#FAFAFA]'
);

export const TEAM_TOOLBAR_SEARCH_CLASS = cn(
  TEAM_TOOLBAR_FIELD_CLASS,
  'w-full pl-10 pr-3 font-normal text-[#18181B] placeholder:text-[#9CA3AF]'
);

export const TEAM_TOOLBAR_SEARCH_ICON_CLASS = 'size-4 text-[#9CA3AF]';

/** Desktop list columns — header + row cards stay aligned */
export const TEAM_LIST_GRID_CLASS =
  'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_48px] items-center gap-x-5';

export const TEAM_PRIMARY_BUTTON_CLASS =
  'h-10 gap-2 rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600';

export function formatContactRoleLabel(role: string): string {
  const r = role.toUpperCase();
  const labels: Record<string, string> = {
    ACCOUNT_OWNER: 'Owner Account',
    OPERATIONS: 'Operations Manager',
    BILLING: 'Finance Manager',
    TECHNICAL: 'Logistics Manager',
    OTHER: 'Warehouse Manager',
  };
  return labels[r] ?? r.replace(/_/g, ' ');
}

/** Solid pill badges — spec hex (white label text). */
export function contactRoleBadgeClass(role: string): string {
  const r = role.toUpperCase();
  const map: Record<string, string> = {
    ACCOUNT_OWNER: 'bg-[#000000] text-white',
    OPERATIONS: 'bg-[#FD7E14] text-white',
    BILLING: 'bg-[#28C76F] text-white',
    TECHNICAL: 'bg-[#2E5BFF] text-white',
    OTHER: 'bg-[#826AF9] text-white',
  };
  return map[r] ?? 'bg-[#6B7280] text-white';
}

export function permissionLevelBadge(level: 'none' | 'read' | 'write'): {
  label: string;
  className: string;
} {
  if (level === 'write')
    return { label: 'Write', className: 'bg-[#2563EB] text-white shadow-none' };
  if (level === 'read') return { label: 'Read', className: 'bg-[#EA580F] text-white shadow-none' };
  return { label: 'None', className: 'bg-[#4B5563] text-white shadow-none' };
}
