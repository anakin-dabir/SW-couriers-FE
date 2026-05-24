import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export const CREDIT_ACTIVITY_TIME_PRESETS = [
  'All Time',
  'Today',
  'Yesterday',
  'Last 7 Days',
  'Last 30 Days',
] as const;

export type CreditActivityTimePreset = (typeof CREDIT_ACTIVITY_TIME_PRESETS)[number];

/** Event types shown in the full-log filter dropdown (Figma) */
export const CREDIT_ACTIVITY_PAGE_EVENT_FILTERS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: 'CREDIT_APPLICATION_SUBMITTED', label: 'Credit Application Submit' },
  { value: 'CREDIT_APPLICATION_APPROVED', label: 'Credit Application Approved' },
  { value: 'CREDIT_APPLICATION_REJECTED', label: 'Credit Application Rejected' },
  { value: 'CREDIT_LIMIT_ADJUSTED', label: 'Credit Limit Adjusted' },
  { value: 'CREDIT_TERMS_MODIFIED', label: 'Credit Terms Modified' },
  { value: 'CREDIT_HOLD_TRIGGERED', label: 'Credit Hold Triggered' },
  { value: 'CREDIT_HOLD_REINSTATED', label: 'Credit Hold Reinstated' },
];

/** Matches billing filter triggers (Figma credit activity toolbar) */
export const CREDIT_ACTIVITY_TOOLBAR_TRIGGER_CLASS =
  'h-10 shrink-0 justify-between gap-2 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm font-normal text-[#52525B] shadow-none hover:bg-[#FAFAFA]';

export const CREDIT_ACTIVITY_DROPDOWN_PANEL_CLASS =
  'rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-md';

export const CREDIT_ACTIVITY_APPLY_BUTTON_CLASS =
  'h-9 rounded-md bg-[#8B1538] px-5 text-sm font-semibold text-white hover:bg-[#73122E]';

export function formatCreditActivityEventFilterLabel(eventType: string): string {
  const match = CREDIT_ACTIVITY_PAGE_EVENT_FILTERS.find((o) => o.value === eventType);
  if (match) return match.label;
  return eventType
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatCreditActivityDateRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return 'Date Range';
  if (!range.to) return format(range.from, 'dd MMM yyyy');
  return `${format(range.from, 'dd MMM yyyy')} - ${format(range.to, 'dd MMM yyyy')}`;
}

export function formatCreditActivityWindowLabel(
  windowIso: { fromIso: string; toIso: string } | undefined,
  customRange: DateRange | undefined,
  timePreset?: CreditActivityTimePreset
): string {
  if (customRange?.from) return formatCreditActivityDateRangeLabel(customRange);
  if (timePreset === 'All Time' || !windowIso) return 'All Time';
  try {
    const from = format(parseISO(windowIso.fromIso), 'dd MMM yyyy');
    const to = format(parseISO(windowIso.toIso), 'dd MMM yyyy');
    return `${from} - ${to}`;
  } catch {
    return 'Date Range';
  }
}
