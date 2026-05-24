import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { getPresetRange } from '@/lib/utils';
import type { OrdersSummaryPeriod } from '@/store/api/ordersApi';

export const DEFAULT_ORDER_QUICK_RANGE_LABEL = 'Last 7 Days';

/** Mon–Sun of the calendar week before the current week (matches API `LAST_WEEK`). */
export function getLastWeekRange(): DateRange {
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const priorWeekMonday = subWeeks(startOfThisWeek, 1);
  return {
    from: startOfDay(priorWeekMonday),
    to: endOfDay(endOfWeek(priorWeekMonday, { weekStartsOn: 1 })),
  };
}

/** Full previous calendar month (first day through last day). */
export function getLastMonthRange(): DateRange {
  const previousMonth = subMonths(new Date(), 1);
  return {
    from: startOfDay(startOfMonth(previousMonth)),
    to: endOfDay(endOfMonth(previousMonth)),
  };
}

export function getLast7DaysRange(): DateRange {
  const t = new Date();
  return { from: startOfDay(subDays(t, 6)), to: endOfDay(t) };
}

export function getLast30DaysRange(): DateRange {
  const t = new Date();
  return { from: startOfDay(subDays(t, 29)), to: endOfDay(t) };
}

/** Full previous calendar year (1 Jan – 31 Dec). */
export function getLastYearRange(): DateRange {
  const previousYear = subYears(new Date(), 1);
  return {
    from: startOfDay(startOfYear(previousYear)),
    to: endOfDay(endOfYear(previousYear)),
  };
}

export const ORDER_QUICK_RANGE_OPTIONS: Array<{
  label: string;
  period?: OrdersSummaryPeriod;
  resolve: () => DateRange | undefined;
}> = [
  { label: 'Any Date', resolve: () => undefined },
  { label: 'Today', period: 'TODAY', resolve: () => getPresetRange('today') },
  {
    label: 'Last 7 Days',
    period: 'LAST_7_DAYS',
    resolve: getLast7DaysRange,
  },
  {
    label: 'Last 30 Days',
    period: 'LAST_30_DAYS',
    resolve: getLast30DaysRange,
  },
  { label: 'Last week', period: 'LAST_WEEK', resolve: getLastWeekRange },
  { label: 'Last month', period: 'LAST_MONTH', resolve: getLastMonthRange },
  { label: 'Last year', resolve: getLastYearRange },
];

export function getDefaultOrderDateRangeState(): {
  orderDateRange: DateRange | undefined;
  quickRangeLabel: string;
  quickRangePeriod: OrdersSummaryPeriod | undefined;
} {
  const option =
    ORDER_QUICK_RANGE_OPTIONS.find((o) => o.label === DEFAULT_ORDER_QUICK_RANGE_LABEL) ??
    ORDER_QUICK_RANGE_OPTIONS[2];
  return {
    orderDateRange: option.resolve(),
    quickRangeLabel: option.label,
    quickRangePeriod: option.period,
  };
}

export function toOrderDateString(value: Date | undefined): string | undefined {
  if (!value) return undefined;
  return format(value, 'yyyy-MM-dd');
}

/**
 * Summary endpoints accept `period` or both `date_from` and `date_to`.
 * When the picker has a range, we always send the same dates as the list API.
 */
export function resolveSummaryDateQuery(args: {
  quickRangeLabel: string;
  dateFrom?: string;
  dateTo?: string;
}): {
  period?: OrdersSummaryPeriod;
  date_from?: string;
  date_to?: string;
  hasRequiredParams: boolean;
} {
  if (args.dateFrom && args.dateTo) {
    return {
      date_from: args.dateFrom,
      date_to: args.dateTo,
      hasRequiredParams: true,
    };
  }

  // Orders list "Any Date": KPIs still default to last 7 days; list has no date filter.
  if (args.quickRangeLabel === 'Any Date') {
    return { period: 'LAST_7_DAYS', hasRequiredParams: true };
  }

  return { hasRequiredParams: false };
}

/** List endpoints use `date_from` / `date_to` only (no `period`). */
export function resolveListDateQuery(args: {
  quickRangeLabel: string;
  dateFrom?: string;
  dateTo?: string;
}): { date_from?: string; date_to?: string } {
  if (args.quickRangeLabel === 'Any Date') {
    return {};
  }
  if (args.dateFrom && args.dateTo) {
    return { date_from: args.dateFrom, date_to: args.dateTo };
  }
  return {};
}

/** Stable key for resetting pagination when the reporting window changes. */
export function buildOrdersDateQueryKey(
  summaryQuery: ReturnType<typeof resolveSummaryDateQuery>,
  listQuery: ReturnType<typeof resolveListDateQuery>
): string {
  return [
    summaryQuery.period ?? '',
    summaryQuery.date_from ?? '',
    summaryQuery.date_to ?? '',
    listQuery.date_from ?? '',
    listQuery.date_to ?? '',
  ].join('|');
}

export function formatSummaryComparisonLabel(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return 'vs previous period';
  return trimmed.toLowerCase().startsWith('vs ') ? trimmed : `vs ${trimmed}`;
}
