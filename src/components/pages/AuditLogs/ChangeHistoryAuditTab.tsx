'use client';

import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  ChevronRight,
  FileSearch,
  GitCompare,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { NoChangesRecordIllustration } from '@/assets/svg';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Calendar } from '@/components/molecules/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Card, CardContent } from '@/components/molecules/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import Pagination from '@/components/molecules/Pagination';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import {
  useCompareAuditSnapshotsMutation,
  useGetChangeHistoryLogsQuery,
  useGetFieldHistoryQuery,
} from '@/store/api';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { AUDIT_LOG_TABLE_SECTION_CLASSNAME } from './auditTableStyles';
import {
  buildFieldHistoryChartRows,
  formatFieldHistoryTableTimestamp,
  mapChangeHistoryItemToRow,
  snapshotDateToIso,
  type NormalizedAuditAction,
} from './changeHistoryMappers';
import {
  CHANGE_HISTORY_ACTIONS,
  CHANGE_HISTORY_ACTORS,
  CHANGE_HISTORY_CATEGORY_PILL,
  CHANGE_HISTORY_ENTITY_TYPES,
  CHANGE_HISTORY_EVENT_CATEGORIES,
  DEFAULT_COMPARE_FIELD_KEYS,
  FIELD_HISTORY_FIELD_GROUPS,
} from './changeHistoryMockData';

type SubView = 'change-log' | 'field-history';

function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = window.atob(paddedBase64);
    const payload = JSON.parse(payloadJson) as { org_id?: string };
    return payload.org_id ?? null;
  } catch {
    return null;
  }
}

function toggleListValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function fieldLabelForKey(key: string): string {
  for (const g of FIELD_HISTORY_FIELD_GROUPS) {
    const f = g.fields.find((x) => x.key === key);
    if (f) return f.label;
  }
  return key;
}

function rowInLoggedRange(loggedAtIso: string, range: DateRange | undefined): boolean {
  if (!range?.from) return true;
  try {
    const t = parseISO(loggedAtIso).getTime();
    const from = startOfDay(range.from).getTime();
    const to = endOfDay(range.to ?? range.from).getTime();
    return t >= from && t <= to;
  } catch {
    return true;
  }
}

function CategoryPill({ category }: { category: string }): React.JSX.Element {
  const bg = CHANGE_HISTORY_CATEGORY_PILL[category] ?? 'bg-[#71717A]';
  return (
    <span
      className={cn(
        'inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium text-white',
        bg
      )}
    >
      {category}
    </span>
  );
}

function ActionPill({ action }: { action: NormalizedAuditAction }): React.JSX.Element {
  const map = {
    Update: 'bg-[#E6F4FF] text-[#0958D9]',
    Create: 'bg-[#F6FFED] text-[#52C41A]',
    Delete: 'bg-[#FFF1F0] text-[#FF4D4F]',
  } as const;
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', map[action])}>
      {action}
    </span>
  );
}

function ChangeHistoryFilterChipSection(props: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <Typography variant="caption" className="text-base font-semibold text-[#18181B]">
        {props.title}
      </Typography>
      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
        {props.options.map((opt) => {
          const active = props.selected.includes(opt);
          return (
            <Button
              key={opt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => props.onToggle(opt)}
              className={cn(
                'h-8 rounded-full border-[#E5E7EB] bg-white px-3 text-xs font-normal text-[#18181B] hover:bg-white',
                active ? 'border-[#BE1E2D]' : 'border-[#E5E7EB]'
              )}
            >
              {active ? (
                <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#BE1E2D] text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="mr-2 inline-block h-4 w-4 shrink-0 rounded-full border border-[#D4D4D8]" />
              )}
              {opt}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function TableFooter(props: {
  pageSize: number;
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}): React.JSX.Element | null {
  if (props.totalEntries === 0) return null;
  const start = (props.currentPage - 1) * props.pageSize + 1;
  const end = Math.min(props.totalEntries, props.currentPage * props.pageSize);
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200/70 pt-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Typography variant="caption" className="font-medium text-form-title">
          Show
        </Typography>
        <select
          value={String(props.pageSize)}
          onChange={(e) => props.onPageSizeChange(Number.parseInt(e.target.value, 10))}
          className="h-8 rounded-md border border-form-border-light bg-form-surface px-2.5 text-sm text-form-title focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Typography variant="caption" className="text-form-subtitle">
          {`${start}-${end} entries out of ${props.totalEntries}`}
        </Typography>
      </div>
      <Pagination
        currentPage={props.currentPage}
        totalPages={Math.max(1, props.totalPages)}
        onPageChange={props.onPageChange}
        className="justify-center md:justify-end"
      />
    </div>
  );
}

export default function ChangeHistoryAuditTab(): React.JSX.Element {
  const organizationIdFromUser = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationIdFromEnv =
    env.VITE_ORGANIZATION_ID.length > 0 ? env.VITE_ORGANIZATION_ID : null;
  const organizationId = React.useMemo(
    () =>
      organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken) ?? organizationIdFromEnv,
    [organizationIdFromUser, accessToken, organizationIdFromEnv]
  );

  const [subView, setSubView] = React.useState<SubView>('change-log');

  const [logSearch, setLogSearch] = React.useState('');
  const [debouncedLogSearch, setDebouncedLogSearch] = React.useState('');
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedLogSearch(logSearch), 350);
    return () => window.clearTimeout(t);
  }, [logSearch]);

  const [logDateRange, setLogDateRange] = React.useState<DateRange | undefined>(undefined);
  const [logPage, setLogPage] = React.useState(1);
  const [logPageSize, setLogPageSize] = React.useState(50);

  const [appliedCats, setAppliedCats] = React.useState<string[]>([]);
  const [appliedEntities, setAppliedEntities] = React.useState<string[]>([]);
  const [appliedActs, setAppliedActs] = React.useState<string[]>([]);
  const [appliedActors, setAppliedActors] = React.useState<string[]>([]);

  const [filterOpen, setFilterOpen] = React.useState(false);
  const [draftCats, setDraftCats] = React.useState<string[]>([]);
  const [draftEntities, setDraftEntities] = React.useState<string[]>([]);
  const [draftActs, setDraftActs] = React.useState<string[]>([]);
  const [draftActors, setDraftActors] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!filterOpen) return;
    setDraftCats([...appliedCats]);
    setDraftEntities([...appliedEntities]);
    setDraftActs([...appliedActs]);
    setDraftActors([...appliedActors]);
  }, [filterOpen, appliedCats, appliedEntities, appliedActs, appliedActors]);

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const toggleExpand = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [compareOpen, setCompareOpen] = React.useState(false);
  const [snapA, setSnapA] = React.useState<Date | undefined>(() => new Date());
  const [snapB, setSnapB] = React.useState<Date | undefined>(() => new Date());

  const [
    triggerCompare,
    { data: compareRes, isLoading: compareLoading, isError: compareError, reset: resetCompare },
  ] = useCompareAuditSnapshotsMutation();

  const triggerCompareRef = React.useRef(triggerCompare);
  React.useEffect(() => {
    triggerCompareRef.current = triggerCompare;
  }, [triggerCompare]);

  const resetCompareRef = React.useRef(resetCompare);
  React.useEffect(() => {
    resetCompareRef.current = resetCompare;
  }, [resetCompare]);

  const handleCompareOpenChange = React.useCallback((open: boolean) => {
    setCompareOpen(open);
    if (!open) resetCompareRef.current();
  }, []);

  const snapAKey = snapA?.getTime() ?? null;
  const snapBKey = snapB?.getTime() ?? null;

  const snapARef = React.useRef(snapA);
  const snapBRef = React.useRef(snapB);
  React.useEffect(() => {
    snapARef.current = snapA;
    snapBRef.current = snapB;
  }, [snapA, snapB]);

  React.useEffect(() => {
    if (!compareOpen || !organizationId || !accessToken || snapAKey == null || snapBKey == null)
      return;
    const a = snapARef.current;
    const b = snapBRef.current;
    if (a == null || b == null) return;
    const t = window.setTimeout(() => {
      void triggerCompareRef.current({
        organizationId,
        body: {
          snapshot_a: snapshotDateToIso(a),
          snapshot_b: snapshotDateToIso(b),
          fields: DEFAULT_COMPARE_FIELD_KEYS,
        },
      });
    }, 280);
    return () => window.clearTimeout(t);
  }, [compareOpen, organizationId, accessToken, snapAKey, snapBKey]);

  const compareRows = React.useMemo(() => {
    if (!compareRes?.success || !compareRes.data?.items) return [];
    return compareRes.data.items;
  }, [compareRes]);

  const logDateLabel = React.useMemo(() => {
    if (!logDateRange?.from) return 'Date Range';
    if (!logDateRange.to) return format(logDateRange.from, 'd MMM yyyy');
    return `${format(logDateRange.from, 'd MMM yyyy')} - ${format(logDateRange.to, 'd MMM yyyy')}`;
  }, [logDateRange]);

  const fromDateIso =
    logDateRange?.from != null ? startOfDay(logDateRange.from).toISOString() : null;
  const toDateIso =
    logDateRange?.from != null
      ? endOfDay(logDateRange.to ?? logDateRange.from).toISOString()
      : null;

  const actorParam =
    appliedActors.length === 1 && (appliedActors[0] === 'Admin' || appliedActors[0] === 'Client')
      ? appliedActors[0]
      : null;

  const changeHistoryArg =
    organizationId && accessToken
      ? {
          organizationId,
          page: logPage,
          size: Math.min(logPageSize, 100),
          search: debouncedLogSearch.trim() || null,
          from_date: fromDateIso,
          to_date: toDateIso,
          category: appliedCats.length > 0 ? appliedCats : undefined,
          entity_type: appliedEntities.length > 0 ? appliedEntities : undefined,
          action_type: appliedActs.length > 0 ? appliedActs : undefined,
          actor: actorParam,
        }
      : skipToken;

  const {
    data: changeHistoryRes,
    isLoading: changeHistoryLoading,
    isFetching: changeHistoryFetching,
    isError: changeHistoryListError,
    refetch: refetchChangeHistory,
  } = useGetChangeHistoryLogsQuery(changeHistoryArg);

  React.useEffect(() => {
    setLogPage(1);
  }, [
    debouncedLogSearch,
    fromDateIso,
    toDateIso,
    appliedCats,
    appliedEntities,
    appliedActs,
    appliedActors,
    logPageSize,
  ]);

  const listData = changeHistoryRes?.success ? changeHistoryRes.data : undefined;
  const changeLogRows = React.useMemo(
    () => (listData?.items ?? []).map(mapChangeHistoryItemToRow),
    [listData]
  );
  const changeHistoryTotal = listData?.total ?? 0;
  const logTotalPages = Math.max(1, Math.ceil(changeHistoryTotal / Math.min(logPageSize, 100)));
  React.useEffect(() => {
    if (logPage > logTotalPages) setLogPage(1);
  }, [logPage, logTotalPages]);

  const logSlice = changeLogRows;

  const filterBadge =
    appliedCats.length + appliedEntities.length + appliedActs.length + appliedActors.length;

  const logHasToolbarFilters =
    Boolean(debouncedLogSearch.trim()) || logDateRange?.from != null || filterBadge > 0;

  const resetLogToolbar = (): void => {
    setLogSearch('');
    setDebouncedLogSearch('');
    setLogDateRange(undefined);
    setAppliedCats([]);
    setAppliedEntities([]);
    setAppliedActs([]);
    setAppliedActors([]);
    setLogPage(1);
  };

  const applyFilters = (): void => {
    setAppliedCats([...draftCats]);
    setAppliedEntities([...draftEntities]);
    setAppliedActs([...draftActs]);
    setAppliedActors([...draftActors]);
    setFilterOpen(false);
    setLogPage(1);
  };

  const resetFilterDraft = (): void => {
    setDraftCats([]);
    setDraftEntities([]);
    setDraftActs([]);
    setDraftActors([]);
  };

  const [fhSearch, setFhSearch] = React.useState('');
  const [debouncedFhSearch, setDebouncedFhSearch] = React.useState('');
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedFhSearch(fhSearch), 350);
    return () => window.clearTimeout(t);
  }, [fhSearch]);

  const [fhDateRange, setFhDateRange] = React.useState<DateRange | undefined>(undefined);
  const [appliedFieldKey, setAppliedFieldKey] = React.useState('credit_limit');
  const [draftFieldKey, setDraftFieldKey] = React.useState('credit_limit');
  const [fieldSelectOpen, setFieldSelectOpen] = React.useState(false);

  const fieldHistoryArg =
    organizationId && accessToken && subView === 'field-history'
      ? { organizationId, field: appliedFieldKey }
      : skipToken;

  const {
    data: fieldHistoryRes,
    isLoading: fieldHistoryLoading,
    isFetching: fieldHistoryFetching,
  } = useGetFieldHistoryQuery(fieldHistoryArg);

  React.useEffect(() => {
    if (!fieldSelectOpen) return;
    setDraftFieldKey(appliedFieldKey);
  }, [fieldSelectOpen, appliedFieldKey]);

  const [fhPage, setFhPage] = React.useState(1);
  const [fhPageSize, setFhPageSize] = React.useState(50);

  const fhDateLabel = React.useMemo(() => {
    if (!fhDateRange?.from) return 'Date Range';
    if (!fhDateRange.to) return format(fhDateRange.from, 'd MMM yyyy');
    return `${format(fhDateRange.from, 'd MMM yyyy')} - ${format(fhDateRange.to, 'd MMM yyyy')}`;
  }, [fhDateRange]);

  const fhData = fieldHistoryRes?.success ? fieldHistoryRes.data : undefined;
  const fieldHistoryItems = React.useMemo(() => fhData?.items ?? [], [fhData]);
  const fieldHistoryPoints = React.useMemo(() => fhData?.points, [fhData]);

  const filteredFh = React.useMemo(() => {
    const q = debouncedFhSearch.trim().toLowerCase();
    return fieldHistoryItems.filter((row) => {
      if (!rowInLoggedRange(row.timestamp, fhDateRange)) return false;
      if (!q) return true;
      const hay = [row.before, row.after, row.actor, row.reason ?? ''].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [fieldHistoryItems, fhDateRange, debouncedFhSearch]);

  const fhTotalPages = Math.max(1, Math.ceil(filteredFh.length / fhPageSize));
  React.useEffect(() => {
    setFhPage(1);
  }, [debouncedFhSearch, fhDateRange, appliedFieldKey, fhPageSize]);
  React.useEffect(() => {
    if (fhPage > fhTotalPages) setFhPage(1);
  }, [fhPage, fhTotalPages]);

  const fhSlice = React.useMemo(() => {
    const start = (fhPage - 1) * fhPageSize;
    return filteredFh.slice(start, start + fhPageSize);
  }, [filteredFh, fhPage, fhPageSize]);

  const chartRows = React.useMemo(
    () => buildFieldHistoryChartRows(fieldHistoryPoints, fieldHistoryItems),
    [fieldHistoryPoints, fieldHistoryItems]
  );
  const yFormatter =
    appliedFieldKey === 'credit_limit'
      ? (v: number) => (v >= 1000 ? `£${Math.round(v / 1000)}k` : `£${v}`)
      : (v: number) => String(v);

  const fhHasToolbarFilters = Boolean(debouncedFhSearch.trim()) || fhDateRange?.from != null;

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-10 gap-2 bg-[#BE1E2D] px-4 text-white hover:bg-[#A21926]"
        onClick={() => setCompareOpen(true)}
      >
        <GitCompare className="size-4 shrink-0" aria-hidden />
        Compare Points in Time
      </Button>
      <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F4F4F5] p-1">
        <button
          type="button"
          onClick={() => setSubView('change-log')}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            subView === 'change-log'
              ? 'bg-white text-[#18181B] shadow-sm'
              : 'text-[#71717A] hover:text-[#18181B]'
          )}
        >
          Change Log
        </button>
        <button
          type="button"
          onClick={() => setSubView('field-history')}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            subView === 'field-history'
              ? 'bg-white text-[#18181B] shadow-sm'
              : 'text-[#71717A] hover:text-[#18181B]'
          )}
        >
          Field History
        </button>
      </div>
    </div>
  );

  const tableWrapClass = cn(
    'w-full overflow-x-auto rounded-lg border border-[#E5E7EB] [&_table]:w-full [&_table]:border-collapse [&_table]:text-left',
    AUDIT_LOG_TABLE_SECTION_CLASSNAME
  );

  if (!organizationId) {
    return (
      <Typography
        variant="body"
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"
      >
        No organization is linked to this session. Change history cannot be loaded.
      </Typography>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-1">
          <Typography variant="h6" className="text-xl font-semibold text-[#18181B] md:text-[28px]">
            Change History
          </Typography>
          <Typography variant="caption" className="text-sm text-[#71717A]">
            Track all data modifications made to your account, including field-level before and
            after values.
          </Typography>
        </div>
        {headerActions}
      </div>

      {subView === 'change-log' ? (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-4 md:p-5">
            <div className="space-y-1">
              <Typography variant="h6" className="text-base font-semibold text-[#18181B]">
                Change Log
              </Typography>
              <Typography variant="caption" className="text-sm text-[#71717A]">
                Complete history of all create, update, and delete actions.
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[240px] flex-1 basis-[280px]">
                <Input
                  type="search"
                  value={logSearch}
                  leftIcon={Search}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search by actor, resource, or IP address..."
                  className="h-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 border-gray-200 bg-white">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="text-sm">{logDateLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={logDateRange}
                    onSelect={setLogDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                type="button"
                className="h-10 gap-2 border-[#E2E8F0] bg-white"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Filter
                {filterBadge > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BE1E2D] px-1.5 text-[11px] text-white">
                    {filterBadge}
                  </span>
                ) : null}
              </Button>
            </div>

            {changeHistoryListError ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4">
                <Typography variant="body" className="text-red-900">
                  Failed to load change history.
                </Typography>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchChangeHistory()}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {!changeHistoryListError && changeHistoryLoading && changeHistoryTotal === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-[#FAFAFA] px-6 py-10">
                <Typography variant="caption" className="text-sm text-[#71717A]">
                  Loading change history…
                </Typography>
              </div>
            ) : null}

            {!changeHistoryListError &&
            !changeHistoryLoading &&
            !changeHistoryFetching &&
            changeHistoryTotal === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-[#FAFAFA] px-6 py-14 text-center">
                <img src={NoChangesRecordIllustration} alt="" width={100} height={100} />
                <Typography variant="h6" className="mt-6 text-lg font-semibold text-[#18181B]">
                  {logHasToolbarFilters ? 'No records match your filters' : 'No Changes Recorded'}
                </Typography>
                <Typography variant="caption" className="mt-2 max-w-md text-sm text-[#71717A]">
                  {logHasToolbarFilters
                    ? 'Try adjusting search, date range, or filters.'
                    : 'No data modification events have been logged for this client yet. Any updates or edits will appear here once available.'}
                </Typography>
                {logHasToolbarFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-8 border-[#E5E7EB] bg-white"
                    onClick={resetLogToolbar}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
            ) : !changeHistoryListError && changeHistoryTotal > 0 ? (
              <>
                <div className={tableWrapClass}>
                  <table className="min-w-[1200px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="w-10 px-2 py-2" aria-hidden />
                        {[
                          'Timestamp',
                          'Category',
                          'Entity Type',
                          'Entity Reference',
                          'Action',
                          'Email',
                          'Actor',
                          'Fields',
                        ].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#52525B]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logSlice.map((row) => {
                        const expandable = row.fieldChanges.length > 0 || row.reason != null;
                        const open = expandedIds.has(row.id);
                        return (
                          <React.Fragment key={row.id}>
                            <tr
                              className={cn(
                                'border-b border-[#E5E7EB] bg-white transition-colors hover:bg-[#FAFAFA]',
                                expandable ? 'cursor-pointer' : ''
                              )}
                              onClick={() => {
                                if (!expandable) return;
                                toggleExpand(row.id);
                              }}
                            >
                              <td className="px-2 py-3 align-middle">
                                {expandable ? (
                                  <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded-md hover:bg-[#F4F4F5]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(row.id);
                                    }}
                                    aria-expanded={open}
                                    aria-label={open ? 'Collapse row' : 'Expand row'}
                                  >
                                    <ChevronRight
                                      className={cn(
                                        'size-4 text-[#52525B] transition-transform',
                                        open && 'rotate-90'
                                      )}
                                    />
                                  </button>
                                ) : null}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#18181B]">
                                {row.timestamp}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3">
                                <CategoryPill category={row.category} />
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                                {row.entityType}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] font-normal text-[#18181B]">
                                {row.entityReference}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3">
                                <ActionPill action={row.action} />
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                                {row.email}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                                {row.actor}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                                {row.fieldsCount != null ? row.fieldsCount : '—'}
                              </td>
                            </tr>
                            {open && expandable ? (
                              <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                                <td colSpan={9} className="px-4 py-4">
                                  {row.fieldChanges.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white">
                                      <table className="min-w-[520px] w-full">
                                        <thead className="bg-[#F4F4F5]">
                                          <tr className="border-b border-[#E5E7EB]">
                                            {['Field Name', 'Before Value', 'After Value'].map(
                                              (h) => (
                                                <th
                                                  key={h}
                                                  className="px-3 py-2 text-left text-xs font-semibold text-[#71717A]"
                                                >
                                                  {h}
                                                </th>
                                              )
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {row.fieldChanges.map((fc) => (
                                            <tr
                                              key={`${row.id}-${fc.fieldName}`}
                                              className="border-b border-[#E5E7EB] last:border-b-0"
                                            >
                                              <td className="px-3 py-2 text-sm font-medium text-[#18181B]">
                                                {fc.fieldName}
                                              </td>
                                              <td className="px-3 py-2 text-sm text-[#DC2626] line-through">
                                                {fc.before}
                                              </td>
                                              <td className="px-3 py-2 text-sm font-medium text-[#16A34A]">
                                                {fc.after}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : null}
                                  {row.reason ? (
                                    <Typography
                                      variant="caption"
                                      className={cn(
                                        'mt-3 block text-sm text-[#52525B]',
                                        row.fieldChanges.length === 0 ? 'mt-0' : ''
                                      )}
                                    >
                                      Reason: &apos;{row.reason}&apos;
                                    </Typography>
                                  ) : null}
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TableFooter
                  pageSize={logPageSize}
                  totalEntries={changeHistoryTotal}
                  currentPage={logPage}
                  totalPages={logTotalPages}
                  onPageChange={setLogPage}
                  onPageSizeChange={(s) => {
                    setLogPageSize(s);
                    setLogPage(1);
                  }}
                />
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="space-y-1">
                <Typography variant="h6" className="text-base font-semibold text-[#18181B]">
                  Field History
                </Typography>
                <Typography variant="caption" className="text-sm text-[#71717A]">
                  Audit the historical changes of a field across time with before/after values and
                  actor details.
                </Typography>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-[200px] flex-1 basis-[260px]">
                  <Input
                    type="search"
                    value={fhSearch}
                    leftIcon={Search}
                    onChange={(e) => setFhSearch(e.target.value)}
                    placeholder="Search by previous value, new value, actor or..."
                    className="h-10"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 gap-2 border-gray-200 bg-white">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <span className="max-w-[140px] truncate text-sm">{fhDateLabel}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={fhDateRange}
                      onSelect={setFhDateRange}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={fieldSelectOpen} onOpenChange={setFieldSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 border-gray-200 bg-white">
                      Select Field:{' '}
                      <span className="font-medium">{fieldLabelForKey(appliedFieldKey)}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(100vw-2rem,320px)] p-0" align="end">
                    <div className="max-h-[min(60vh,420px)] overflow-y-auto p-3">
                      {FIELD_HISTORY_FIELD_GROUPS.map((g) => (
                        <div key={g.label} className="mb-3 last:mb-0">
                          <Typography
                            variant="caption"
                            className="mb-2 block text-xs font-semibold text-[#18181B]"
                          >
                            {g.label}
                          </Typography>
                          <div className="flex flex-col gap-1">
                            {g.fields.map((f) => (
                              <button
                                key={f.key}
                                type="button"
                                onClick={() => setDraftFieldKey(f.key)}
                                className={cn(
                                  'rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#F4F4F5]',
                                  draftFieldKey === f.key ? 'bg-[#F4F4F5] font-medium' : ''
                                )}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 border-t border-[#E5E7EB] p-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-[#52525B]"
                        onClick={() => setDraftFieldKey(appliedFieldKey)}
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                        onClick={() => {
                          setAppliedFieldKey(draftFieldKey);
                          setFieldSelectOpen(false);
                          setFhPage(1);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {(fieldHistoryLoading || fieldHistoryFetching) && fieldHistoryItems.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-[#FAFAFA] px-6 py-10">
                  <Typography variant="caption" className="text-sm text-[#71717A]">
                    Loading field history…
                  </Typography>
                </div>
              ) : filteredFh.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg bg-[#FAFAFA] px-6 py-10 text-center">
                  <Typography variant="h6" className="text-base font-semibold text-[#18181B]">
                    {fhHasToolbarFilters
                      ? 'No rows match your filters'
                      : 'No history for this field'}
                  </Typography>
                  <Typography variant="caption" className="mt-2 max-w-md text-sm text-[#71717A]">
                    {fhHasToolbarFilters
                      ? 'Adjust search or date range.'
                      : 'Try another field or wait for audit events.'}
                  </Typography>
                </div>
              ) : (
                <>
                  <div className={tableWrapClass}>
                    <table className="min-w-[900px]">
                      <thead>
                        <tr className="border-b border-[#E5E7EB]">
                          {['Timestamp', 'Previous Value', 'New Value', 'Actor', 'Reason'].map(
                            (h) => (
                              <th
                                key={h}
                                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#52525B]"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {fhSlice.map((row, idx) => (
                          <tr
                            key={`${row.timestamp}-${idx}`}
                            className="border-b border-[#E5E7EB] bg-white hover:bg-[#FAFAFA]"
                          >
                            <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                              {formatFieldHistoryTableTimestamp(row.timestamp)}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#18181B]">{row.before}</td>
                            <td className="px-3 py-3 text-[13px] font-medium text-[#16A34A]">
                              {row.after}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#52525B]">
                              {row.actor}
                            </td>
                            <td className="max-w-[280px] truncate px-3 py-3 text-[13px] text-[#52525B]">
                              {row.reason && row.reason.trim() !== '' ? row.reason : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TableFooter
                    pageSize={fhPageSize}
                    totalEntries={filteredFh.length}
                    currentPage={fhPage}
                    totalPages={fhTotalPages}
                    onPageChange={setFhPage}
                    onPageSizeChange={(s) => {
                      setFhPageSize(s);
                      setFhPage(1);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="space-y-1">
                <Typography variant="h6" className="text-base font-semibold text-[#18181B]">
                  Field History Analysis
                </Typography>
                <Typography variant="caption" className="text-sm text-[#71717A]">
                  Track how a selected field changes over time.
                </Typography>
              </div>
              <div className="h-[280px] w-full">
                {chartRows.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient
                          id={`chFill-${appliedFieldKey}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717A' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#71717A' }} tickFormatter={yFormatter} />
                      <Tooltip
                        formatter={(value) => {
                          const num =
                            typeof value === 'number'
                              ? value
                              : value == null || value === ''
                                ? NaN
                                : Number(value);
                          const formatted = Number.isFinite(num) ? yFormatter(num) : '—';
                          return [formatted, fieldLabelForKey(appliedFieldKey)];
                        }}
                        labelStyle={{ color: '#52525B' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22C55E"
                        strokeWidth={2}
                        fill={`url(#chFill-${appliedFieldKey})`}
                        name={fieldLabelForKey(appliedFieldKey)}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
                    <Typography variant="caption" className="text-sm text-[#71717A]">
                      No chart data for this field yet.
                    </Typography>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52525B]">
                <span className="inline-block h-0.5 w-6 bg-[#22C55E]" aria-hidden />
                {fieldLabelForKey(appliedFieldKey)}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
          <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
            <DialogTitle className="text-xl font-semibold text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Narrow change events by category, entity type, action, and actor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-6 overflow-y-auto px-6 pb-5 pt-4">
            <ChangeHistoryFilterChipSection
              title="Select Event Category:"
              options={CHANGE_HISTORY_EVENT_CATEGORIES}
              selected={draftCats}
              onToggle={(v) => setDraftCats((p) => toggleListValue(p, v))}
            />
            <ChangeHistoryFilterChipSection
              title="Select Entity Type:"
              options={CHANGE_HISTORY_ENTITY_TYPES}
              selected={draftEntities}
              onToggle={(v) => setDraftEntities((p) => toggleListValue(p, v))}
            />
            <ChangeHistoryFilterChipSection
              title="Select Action Type:"
              options={CHANGE_HISTORY_ACTIONS}
              selected={draftActs}
              onToggle={(v) => setDraftActs((p) => toggleListValue(p, v))}
            />
            <ChangeHistoryFilterChipSection
              title="Select Actor:"
              options={CHANGE_HISTORY_ACTORS}
              selected={draftActors}
              onToggle={(v) => setDraftActors((p) => toggleListValue(p, v))}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4EA] pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white"
                onClick={resetFilterDraft}
              >
                Reset Filters
              </Button>
              <Button
                type="button"
                className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                onClick={applyFilters}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={handleCompareOpenChange}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[560px] gap-0 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-lg sm:max-w-[560px] sm:p-7">
          <div className="flex flex-col items-center pb-8 pt-1 text-center">
            <div
              className="mb-4 flex size-[64px] shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF]"
              aria-hidden
            >
              <FileSearch className="size-8 text-[#6366F1]" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-[#18181B]">
              Point-in-Time Comparison
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-md px-2 text-sm leading-relaxed text-[#71717A]">
              Compare client data at two different points in time
            </DialogDescription>
          </div>

          <div className="mb-8 flex w-full flex-row flex-nowrap items-end gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <PointInTimeSnapshotField
                label={
                  <>
                    Snapshot A<span className="text-[#BE1E2D]">*</span>
                  </>
                }
                value={snapA}
                onChange={setSnapA}
                placeholder="Select date"
              />
            </div>
            <div className="flex shrink-0 justify-center pb-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-full border-[#E5E7EB] bg-white shadow-sm hover:bg-[#FAFAFA]"
                onClick={() => {
                  const a = snapA;
                  setSnapA(snapB);
                  setSnapB(a);
                }}
                aria-label="Swap snapshot A and snapshot B"
              >
                <ArrowLeftRight className="size-4 text-[#52525B]" />
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <PointInTimeSnapshotField
                label={
                  <>
                    Snapshot B<span className="text-[#BE1E2D]">*</span>
                  </>
                }
                value={snapB}
                onChange={setSnapB}
                placeholder="Select date"
              />
            </div>
          </div>

          <Typography
            variant="h6"
            className="mb-3 text-left text-base font-semibold tracking-tight text-[#18181B]"
          >
            Comparison Results
          </Typography>

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="bg-[#F4F4F5]">
                <tr className="border-b border-[#E5E7EB]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                    Field Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                    Value A
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                    Value B
                  </th>
                  <th className="border-l border-[#E5E7EB] px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareLoading && compareRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#71717A]">
                      Loading comparison…
                    </td>
                  </tr>
                ) : compareError ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center">
                      <Typography variant="caption" className="mb-3 block text-sm text-red-700">
                        Could not load comparison.
                      </Typography>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!organizationId || !snapA || !snapB) return;
                          void triggerCompare({
                            organizationId,
                            body: {
                              snapshot_a: snapshotDateToIso(snapA),
                              snapshot_b: snapshotDateToIso(snapB),
                              fields: DEFAULT_COMPARE_FIELD_KEYS,
                            },
                          });
                        }}
                      >
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : compareRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#71717A]">
                      No comparison rows returned.
                    </td>
                  </tr>
                ) : (
                  compareRows.map((r, rowIndex) => (
                    <tr key={r.field}>
                      <td
                        className={cn(
                          'border-[#E5E7EB] px-4 py-3.5 align-top text-sm font-semibold leading-snug text-[#18181B]',
                          rowIndex < compareRows.length - 1 ? 'border-b' : ''
                        )}
                      >
                        {r.field}
                      </td>
                      <td
                        className={cn(
                          'border-[#E5E7EB] px-4 py-3.5 align-top text-sm font-normal leading-relaxed text-[#18181B]',
                          rowIndex < compareRows.length - 1 ? 'border-b' : ''
                        )}
                      >
                        <div className="min-w-0">
                          <ComparePlainLines text={displayCompareCell(r.value_a)} variant="a" />
                        </div>
                      </td>
                      <td
                        className={cn(
                          'border-[#E5E7EB] px-4 py-3.5 align-top text-sm font-normal leading-relaxed text-[#2E7D32]',
                          rowIndex < compareRows.length - 1 ? 'border-b' : ''
                        )}
                      >
                        <div className="min-w-0">
                          <ComparePlainLines text={displayCompareCell(r.value_b)} variant="b" />
                        </div>
                      </td>
                      <td
                        className={cn(
                          'border-l border-[#E5E7EB] px-4 py-3.5 text-right align-top text-sm font-normal tabular-nums text-[#52525B]',
                          rowIndex < compareRows.length - 1 ? 'border-b' : ''
                        )}
                      >
                        {r.changes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PointInTimeSnapshotField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: React.ReactNode;
  value: Date | undefined;
  onChange: (next: Date | undefined) => void;
  placeholder: string;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <Typography variant="caption" className="text-left text-sm font-medium text-[#3F3F46]">
        {label}
      </Typography>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="h-12 w-full justify-between gap-3 rounded-lg border-[#E5E7EB] bg-white px-4 text-left text-sm font-normal text-[#18181B] shadow-sm hover:bg-[#FAFAFA]"
          >
            <span className="min-w-0 flex-1 truncate">
              {value ? format(value, 'dd/MM/yyyy') : placeholder}
            </span>
            <CalendarDays className="size-4 shrink-0 text-[#71717A]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Map API placeholders (`N/A`, empty) to the same dash used elsewhere in change history. */
function displayCompareCell(raw: string | undefined | null): string {
  const s = (raw ?? '').trim();
  if (s.length === 0) return '—';
  if (s.toUpperCase() === 'N/A') return '—';
  return s;
}

function ComparePlainLines({
  text,
  variant,
}: {
  text: string;
  variant: 'a' | 'b';
}): React.JSX.Element {
  const lines = text.split('\n').filter(Boolean);
  const color = variant === 'a' ? 'text-[#18181B]' : 'text-[#2E7D32]';
  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className={cn('block text-sm font-normal leading-snug', color)}>
          {line}
        </span>
      ))}
    </div>
  );
}
