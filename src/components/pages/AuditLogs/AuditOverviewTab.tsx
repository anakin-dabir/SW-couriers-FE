'use client';

import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  CalendarDays,
  Check,
  Database,
  Eye,
  Laptop,
  Layers3,
  Monitor,
  Search,
  SlidersHorizontal,
  Smartphone,
  TriangleAlert,
  User,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Calendar } from '@/components/molecules/calendar';
import { Input } from '@/components/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Card, CardContent } from '@/components/molecules/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { DataTable } from '@/components/molecules';
import { cn } from '@/lib/utils';
import { env } from '@/config/env';
import type { AuditLogItemDto } from '@/store/api/auditLogsApi';
import {
  useGetAuditLogsQuery,
  useGetAuditLogsSummaryQuery,
  useGetAuditLogsTrendQuery,
} from '@/store/api/auditLogsApi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import type { Column } from '@/types/datatable';
import AuditLogsEmptyState from './AuditLogsEmptyState';
import AuditLogDetailDialog from './AuditLogDetailDialog';
import { AUDIT_LOG_TABLE_SECTION_CLASSNAME } from './auditTableStyles';

const nf = new Intl.NumberFormat('en-GB');

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

function formatAuditTimestamp(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, 'dd/MM/yy, HH:mm:ss');
  } catch {
    return iso;
  }
}

function normalizeDevice(raw: string): 'Desktop' | 'Laptop' | 'Mobile' {
  const v = raw.toLowerCase();
  if (v.includes('mobile') || v.includes('phone') || v.includes('android') || v.includes('ios'))
    return 'Mobile';
  if (v.includes('laptop') || v.includes('tablet')) return 'Laptop';
  return 'Desktop';
}

function normalizeBrowserKey(browser: string): string {
  const b = browser.toLowerCase();
  if ((b.includes('chrome') || b.includes('chromium')) && !b.includes('edg'))
    return 'Google Chrome';
  if (b.includes('firefox')) return 'Firefox';
  if (b.includes('safari') && !b.includes('chrome')) return 'Safari';
  if (b.includes('edg')) return 'Microsoft Edge';
  return browser.trim() || '—';
}

function browserEmojiForLabel(label: string): string {
  if (label === 'Google Chrome') return '🌐';
  if (label === 'Firefox') return '🦊';
  if (label === 'Microsoft Edge') return '🔷';
  if (label === 'Safari') return '🧭';
  return '◯';
}

function categoryBadgeClass(categoryRaw: string): string {
  const c = categoryRaw.trim();
  const map: Record<string, string> = {
    Security: 'bg-[#DC2626] text-white',
    Billing: 'bg-[#14B8A6] text-white',
    Account: 'bg-[#2563EB] text-white',
    System: 'bg-[#71717A] text-white',
    Contact: 'bg-[#8B5CF6] text-white',
    Order: 'bg-[#059669] text-white',
    Credit: 'bg-[#D97706] text-white',
    Document: 'bg-[#64748B] text-white',
    Access: 'bg-[#0EA5E9] text-white',
    Fleet: 'bg-[#4F46E5] text-white',
    Configuration: 'bg-[#7C3AED] text-white',
  };
  return map[c] ?? 'bg-[#A1A1AA] text-white';
}

const CATEGORY_OPTIONS = [
  'Account',
  'Contact',
  'Order',
  'Billing',
  'System',
  'Credit',
  'Document',
  'Access',
  'Security',
  'Fleet',
] as const;

/** Values sent as `browser` query params — align with backend / user-agent parsing */
const BROWSER_OPTIONS = [
  { key: 'Google Chrome', label: 'Google Chrome', emoji: '🌐' },
  { key: 'Firefox', label: 'Firefox', emoji: '🦊' },
  { key: 'Microsoft Edge', label: 'Microsoft Edge', emoji: '🔷' },
  { key: 'Safari', label: 'Safari', emoji: '🧭' },
] as const;

/** Recent Activity — compact rows; muted headers + regular-weight cells */
const AUDIT_TABLE_HDR_PAD = '!px-2.5 !py-2';
const AUDIT_TABLE_CELL_PAD =
  '!h-auto min-h-[40px] !rounded-none !px-2.5 !py-2 align-middle bg-white';

const AUDIT_CELL_BODY = 'text-[13px] font-normal leading-snug text-[#52525B]';
const AUDIT_CELL_TS = 'text-[13px] font-normal leading-snug text-[#52525B]';

export default function AuditOverviewTab(): React.JSX.Element {
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

  const summaryArg = organizationId && accessToken ? { organizationId } : skipToken;
  const trendArg = summaryArg;
  const {
    data: summaryRes,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetAuditLogsSummaryQuery(summaryArg);
  const {
    data: trendRes,
    isLoading: trendLoading,
    isError: trendError,
    refetch: refetchTrend,
  } = useGetAuditLogsTrendQuery(trendArg);

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const [sortBy, setSortBy] = React.useState<'desc' | 'asc'>('desc');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  const [appliedCategories, setAppliedCategories] = React.useState<string[]>([]);
  const [appliedBrowsers, setAppliedBrowsers] = React.useState<string[]>([]);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [draftCategories, setDraftCategories] = React.useState<string[]>([]);
  const [draftBrowsers, setDraftBrowsers] = React.useState<string[]>([]);
  const [selectedAuditLogId, setSelectedAuditLogId] = React.useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isFilterDialogOpen) return;
    setDraftCategories([...appliedCategories]);
    setDraftBrowsers([...appliedBrowsers]);
  }, [isFilterDialogOpen, appliedCategories, appliedBrowsers]);

  const fromDateIso = dateRange?.from != null ? startOfDay(dateRange.from).toISOString() : null;
  const toDateIso =
    dateRange?.from != null ? endOfDay(dateRange.to ?? dateRange.from).toISOString() : null;

  const listsArg =
    organizationId && accessToken
      ? {
          organizationId,
          page: currentPage,
          size: Math.min(pageSize, 100),
          search: debouncedSearch.trim() || null,
          sort_by: sortBy,
          from_date: fromDateIso,
          to_date: toDateIso,
          category: appliedCategories.length > 0 ? appliedCategories : undefined,
          browser: appliedBrowsers.length > 0 ? appliedBrowsers : undefined,
        }
      : skipToken;

  const {
    data: listRes,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listError,
    refetch: refetchList,
  } = useGetAuditLogsQuery(listsArg);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    sortBy,
    fromDateIso,
    toDateIso,
    appliedCategories,
    appliedBrowsers,
    pageSize,
  ]);

  const listData = listRes?.success ? listRes.data : undefined;
  const items = listData?.items ?? [];
  const totalEntries = listData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / Math.min(pageSize, 100)));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const summary = summaryRes?.success ? summaryRes.data : undefined;

  const filterBadgeCount =
    (appliedCategories.length > 0 ? 1 : 0) +
    (appliedBrowsers.length > 0 ? 1 : 0) +
    (dateRange?.from ? 1 : 0);

  const dateRangeLabel = React.useMemo(() => {
    if (!dateRange?.from) return 'Date range';
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy');
    return `${format(dateRange.from, 'd MMM yyyy')} - ${format(dateRange.to, 'd MMM yyyy')}`;
  }, [dateRange]);

  const columns = React.useMemo<Column<AuditLogItemDto>[]>(
    () => [
      {
        key: 'created_at',
        header: 'Timestamp',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[158px]'),
        cell: (row) => (
          <Typography variant="caption" className={cn(AUDIT_CELL_TS, 'whitespace-nowrap')}>
            {formatAuditTimestamp(row.created_at)}
          </Typography>
        ),
      },
      {
        key: 'ip_address',
        header: 'IP Address',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[128px]'),
        cell: (row) => (
          <Typography variant="caption" className={cn('font-mono', AUDIT_CELL_BODY)}>
            {row.ip_address || '—'}
          </Typography>
        ),
      },
      {
        key: 'browser',
        header: 'Browser',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[170px]'),
        cell: (row) => {
          const label = normalizeBrowserKey(row.browser || '');
          return (
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-base leading-none" aria-hidden>
                {browserEmojiForLabel(label)}
              </span>
              <Typography variant="caption" className={AUDIT_CELL_BODY}>
                {label}
              </Typography>
            </div>
          );
        },
      },
      {
        key: 'device',
        header: 'Device',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[118px]'),
        cell: (row) => {
          const dev = normalizeDevice(row.device || '');
          return (
            <div className="flex items-center gap-2">
              {dev === 'Desktop' ? (
                <Monitor className="h-4 w-4 shrink-0 text-[#71717A]" strokeWidth={1.5} />
              ) : dev === 'Mobile' ? (
                <Smartphone className="h-4 w-4 shrink-0 text-[#71717A]" strokeWidth={1.5} />
              ) : (
                <Laptop className="h-4 w-4 shrink-0 text-[#71717A]" strokeWidth={1.5} />
              )}
              <Typography variant="caption" className={AUDIT_CELL_BODY}>
                {row.device || dev}
              </Typography>
            </div>
          );
        },
      },
      {
        key: 'os',
        header: 'OS',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[132px]'),
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.os || '—'}
          </Typography>
        ),
      },
      {
        key: 'email',
        header: 'Emails',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[216px]'),
        cell: (row) => (
          <Typography variant="caption" className={cn('break-all', AUDIT_CELL_BODY)}>
            {row.email || '—'}
          </Typography>
        ),
      },
      {
        key: 'actor',
        header: 'Actor',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[76px] max-w-[100px]'),
        cell: (row) => (
          <Typography
            variant="caption"
            className={cn(AUDIT_CELL_BODY, 'truncate whitespace-nowrap')}
            title={row.actor || undefined}
          >
            {row.actor || '—'}
          </Typography>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[112px]'),
        cell: (row) => {
          const cat = (row.display_category || row.category || '').trim() || '—';
          return (
            <span
              className={cn(
                'inline-block max-w-[158px] truncate rounded-full px-2 py-px text-[11px] font-normal leading-tight',
                categoryBadgeClass(cat)
              )}
              title={cat}
            >
              {cat}
            </span>
          );
        },
      },
      {
        key: 'event',
        header: 'Event',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[212px]'),
        cell: (row) => (
          <Typography
            variant="caption"
            className={cn('max-w-[272px] line-clamp-2', AUDIT_CELL_BODY)}
          >
            {row.event || row.event_type || '—'}
          </Typography>
        ),
      },
      {
        key: 'action_label',
        header: 'Action',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[96px]'),
        cell: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-[#E2E8F0] bg-white px-2.5 text-[13px] font-normal leading-none text-[#18181B] shadow-none hover:bg-slate-50"
            onClick={() => {
              setSelectedAuditLogId(row.id);
              setDetailDialogOpen(true);
            }}
          >
            <Eye className="h-3.5 w-3.5 shrink-0 text-[#18181B]" strokeWidth={1.75} aria-hidden />
            <span>{row.action_label?.trim() || 'View'}</span>
          </Button>
        ),
      },
    ],
    []
  );

  const toggleDraft = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const trendPoints = React.useMemo(
    () => (trendRes?.success ? trendRes.data.points : []),
    [trendRes]
  );
  const trendMax = React.useMemo(() => {
    let max = 1;
    for (const p of trendPoints) {
      const t = p.info + p.notice + p.warning + p.critical;
      if (t > max) max = t;
    }
    return max;
  }, [trendPoints]);
  const yTicks = React.useMemo(() => {
    const steps = 5;
    const step = Math.max(1, Math.ceil(trendMax / steps));
    const roundedMax = Math.ceil(trendMax / step) * step;
    const ticks: number[] = [];
    for (let i = steps; i >= 0; i -= 1) {
      ticks.push(Math.round((roundedMax * i) / steps));
    }
    return ticks;
  }, [trendMax]);

  const applyFilters = (): void => {
    setAppliedCategories([...draftCategories]);
    setAppliedBrowsers([...draftBrowsers]);
    setIsFilterDialogOpen(false);
  };

  const resetFilters = (): void => {
    setDraftCategories([]);
    setDraftBrowsers([]);
    setAppliedCategories([]);
    setAppliedBrowsers([]);
  };

  const resetRecentActivityFilters = (): void => {
    setSearchInput('');
    setDebouncedSearch('');
    setDateRange(undefined);
    resetFilters();
  };

  const overviewHasActiveFilters =
    debouncedSearch.trim() !== '' ||
    Boolean(dateRange?.from) ||
    appliedCategories.length > 0 ||
    appliedBrowsers.length > 0;

  if (!organizationId) {
    return (
      <Typography
        variant="body"
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"
      >
        No organization is linked to this session. Audit logs cannot be loaded.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row — matches design: icon, label, value only; critical card always highlighted */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`sk-${i}`} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="h-5 w-5 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-3.5 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : summaryError ? (
          <Card className="col-span-full border-red-200 bg-red-50/80">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <Typography variant="body" className="text-red-900">
                Could not load audit summary.
              </Typography>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetchSummary()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <KpiCard
              icon={Layers3}
              iconClassName="text-[#2563EB]"
              label="Total Events (24h)"
              value={nf.format(summary?.total_events_24h ?? 0)}
            />
            <KpiCard
              variant="critical"
              icon={TriangleAlert}
              iconClassName="text-[#DC2626]"
              label="Critical Events (7d)"
              value={nf.format(summary?.critical_events_7d ?? 0)}
            />
            <KpiCard
              icon={TriangleAlert}
              iconClassName="text-[#F59E0B]"
              label="Warning Events (7d)"
              value={nf.format(summary?.warning_events_7d ?? 0)}
            />
            <KpiCard
              icon={Database}
              iconClassName="text-[#7C3AED]"
              label="Data Access Events (7d)"
              value={nf.format(summary?.data_access_events_7d ?? 0)}
            />
            <KpiCard
              icon={SlidersHorizontal}
              iconClassName="text-[#14B8A6]"
              label="Configuration Changes (7d)"
              value={nf.format(summary?.configuration_changes_7d ?? 0)}
            />
            <KpiCard
              icon={User}
              iconClassName="text-[#22C55E]"
              label="Unique Actors (30d)"
              value={nf.format(summary?.unique_actors_30d ?? 0)}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <Typography variant="h6" className="text-lg font-normal text-[#18181B]">
                Recent Activity
              </Typography>
              <Typography variant="caption" className="text-sm text-[#71717A]">
                Review the most recent high-severity events requiring attention.
              </Typography>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="min-w-[240px] flex-1 basis-[280px]">
              <Input
                type="search"
                value={searchInput}
                leftIcon={Search}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by time, IP address, browser, email, act..."
                className="h-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'desc' | 'asc')}>
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 border-gray-200 bg-white">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{dateRangeLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="h-10 gap-2 border-[#E2E8F0] bg-white px-3 text-sm font-normal text-[#18181B] hover:bg-white"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4 text-[#18181B]" strokeWidth={1.75} />
              <span>Filter</span>
              {filterBadgeCount > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#BE1E2D] px-1.5 text-[11px] font-normal leading-none text-white">
                  {filterBadgeCount}
                </span>
              ) : null}
            </Button>
          </div>

          {listError ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4">
              <Typography variant="body" className="text-red-900">
                Failed to load activity logs.
              </Typography>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetchList()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!listError && !listLoading && !listFetching && totalEntries === 0 ? (
            <AuditLogsEmptyState
              hasActiveFilters={overviewHasActiveFilters}
              onResetFilters={resetRecentActivityFilters}
            />
          ) : (
            <DataTable
              columns={columns}
              data={items}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={Math.min(pageSize, 100)}
              totalEntries={totalEntries}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              isLoading={listLoading || listFetching}
              skeletonRowCount={Math.min(pageSize, 12)}
              getRowKey={(row) => row.id}
              className="space-y-3"
              tableHorizontalScrollClassName="audit-recent-activity-scroll w-full rounded-lg"
              tableScrollMinWidthClassName="md:min-w-[1540px]"
              tableSectionClassName={AUDIT_LOG_TABLE_SECTION_CLASSNAME}
            />
          )}
        </CardContent>
      </Card>

      {/* Trend */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-5 md:p-6">
          <Typography variant="h6" className="text-lg font-semibold text-[#18181B]">
            Activity trend (last 30 days)
          </Typography>
          <Typography variant="caption" className="mt-1 text-sm text-[#71717A]">
            Track patterns and spikes in audit events by severity level.
          </Typography>

          {trendLoading ? (
            <div className="mt-6 h-[260px] animate-pulse rounded-lg bg-muted/40" />
          ) : trendError ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/80 p-4">
              <Typography variant="body" className="text-red-900">
                Could not load trend data.
              </Typography>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetchTrend()}>
                Retry
              </Button>
            </div>
          ) : trendPoints.length === 0 ? (
            <Typography variant="caption" className="mt-6 block text-muted-foreground">
              No trend data available.
            </Typography>
          ) : (
            <div className="mt-6 rounded-lg border border-gray-100 bg-white p-4">
              <div className="relative h-[260px]">
                <div className="absolute inset-0 left-10">
                  {yTicks.map((tick, index) => (
                    <div
                      key={tick}
                      className={cn(
                        'absolute left-0 right-0 border-t border-dashed border-[#E4E4E7]',
                        index === yTicks.length - 1 && 'border-solid'
                      )}
                      style={{
                        top: `${yTicks.length <= 1 ? 0 : (index / (yTicks.length - 1)) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="absolute inset-y-0 left-0 flex w-10 flex-col justify-between pr-1">
                  {yTicks.map((tick) => (
                    <Typography
                      key={`y-${tick}`}
                      variant="caption"
                      className="text-right text-[11px] leading-tight text-[#71717A]"
                    >
                      {nf.format(tick)}
                    </Typography>
                  ))}
                </div>

                <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-px sm:gap-0.5">
                  {trendPoints.map((entry, index) => {
                    const total = entry.info + entry.notice + entry.warning + entry.critical;
                    const pct = trendMax > 0 ? (total / trendMax) * 100 : 0;
                    const infoH = total > 0 ? (entry.info / total) * 100 : 0;
                    const noticeH = total > 0 ? (entry.notice / total) * 100 : 0;
                    const warningH = total > 0 ? (entry.warning / total) * 100 : 0;
                    const criticalH = total > 0 ? (entry.critical / total) * 100 : 0;

                    return (
                      <div
                        key={`bar-${entry.date}-${index}`}
                        className="flex h-full min-w-0 flex-1 items-end"
                      >
                        <div
                          className="flex w-full flex-col-reverse overflow-hidden rounded-t-[3px]"
                          style={{ height: `${pct}%`, minHeight: total > 0 ? 4 : 0 }}
                        >
                          <div className="w-full bg-[#D4D7E4]" style={{ height: `${infoH}%` }} />
                          <div className="w-full bg-[#4A90FF]" style={{ height: `${noticeH}%` }} />
                          <div className="w-full bg-[#F5AE2F]" style={{ height: `${warningH}%` }} />
                          <div
                            className="w-full bg-[#F16862]"
                            style={{ height: `${criticalH}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ml-12 mt-2 flex justify-between gap-1 overflow-x-auto">
                {trendPoints.map((p) => {
                  let label = p.date;
                  try {
                    label = format(
                      parseISO(p.date.includes('T') ? p.date : `${p.date}T00:00:00`),
                      'd MMM'
                    );
                  } catch {
                    /* keep raw */
                  }
                  return (
                    <Typography
                      key={`x-${p.date}`}
                      variant="caption"
                      className="min-w-0 flex-1 truncate text-center text-[10px] text-[#71717A] sm:text-[11px]"
                    >
                      {label}
                    </Typography>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 pt-4">
                {[
                  { label: 'Info', color: 'bg-[#D4D7E4]' },
                  { label: 'Notice', color: 'bg-[#4A90FF]' },
                  { label: 'Warning', color: 'bg-[#F5AE2F]' },
                  { label: 'Critical', color: 'bg-[#F16862]' },
                ].map((legend) => (
                  <div key={legend.label} className="flex items-center gap-1.5">
                    <span className={cn('h-3 w-3 rounded-sm', legend.color)} />
                    <Typography variant="caption" className="text-xs text-[#52525B]">
                      {legend.label}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
          <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
            <DialogTitle className="text-xl font-normal text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="text-sm leading-snug text-muted-foreground">
              Choose categories and browsers to narrow the activity list. Selected values are sent
              as repeated query params.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-5 overflow-y-auto px-6 pb-5 pt-4">
            <FilterChipSection
              title="Select Category:"
              options={CATEGORY_OPTIONS}
              selected={draftCategories}
              onToggle={(v) => toggleDraft(v, setDraftCategories)}
            />
            <FilterChipSection
              title="Select Browser:"
              options={BROWSER_OPTIONS.map((b) => b.key)}
              selected={draftBrowsers}
              onToggle={(v) => toggleDraft(v, setDraftBrowsers)}
              renderLabel={(v) => BROWSER_OPTIONS.find((b) => b.key === v)?.label ?? v}
              renderLeading={(v) => (
                <span className="text-sm leading-none" aria-hidden>
                  {BROWSER_OPTIONS.find((b) => b.key === v)?.emoji ?? '◯'}
                </span>
              )}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4EA] pt-4">
              <Button type="button" variant="outline" className="bg-white" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button
                type="button"
                className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuditLogDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        organizationId={organizationId}
        auditLogId={selectedAuditLogId}
      />
    </div>
  );
}

function KpiCard(props: {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  label: string;
  value: string;
  /** Critical Events card: light red surface + red border per design */
  variant?: 'default' | 'critical';
}): React.JSX.Element {
  const Icon = props.icon;
  const isCritical = props.variant === 'critical';
  return (
    <div
      className={cn(
        'flex flex-col items-start rounded-lg border bg-white p-4 text-left',
        isCritical ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
      )}
    >
      <Icon
        className={cn('h-5 w-5 shrink-0 stroke-[1.75]', props.iconClassName ?? 'text-[#71717A]')}
      />
      <Typography
        variant="caption"
        className="mt-3 text-[13px] font-normal leading-snug text-[#52525B]"
      >
        {props.label}
      </Typography>
      <Typography
        component="p"
        variant="h6"
        className="mt-2 text-[26px] font-bold leading-none tracking-tight text-[#18181B]"
      >
        {props.value}
      </Typography>
    </div>
  );
}

function FilterChipSection(props: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
  renderLeading?: (value: string) => React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5 border-b border-[#E4E4EA] pb-4 last:border-0">
      <Typography variant="caption" className="text-base font-normal leading-snug text-[#252525]">
        {props.title}
      </Typography>
      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
        {props.options.map((opt) => {
          const active = props.selected.includes(opt);
          const label = props.renderLabel ? props.renderLabel(opt) : opt;
          const leading = props.renderLeading?.(opt);
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
              {leading ? (
                <span className="mr-1.5 inline-flex shrink-0 items-center">{leading}</span>
              ) : null}
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
