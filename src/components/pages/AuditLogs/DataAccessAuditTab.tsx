'use client';

import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  CalendarDays,
  Check,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TriangleAlert,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { DataTable } from '@/components/molecules';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { env } from '@/config/env';
import type { AuditLogItemDto } from '@/store/api/auditLogsApi';
import { useGetDataAccessLogsQuery } from '@/store/api/auditLogsApi';
import { getErrorMessage } from '@/store/api/utils';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import type { Column } from '@/types/datatable';
import AuditLogsEmptyState from './AuditLogsEmptyState';
import { AUDIT_LOG_TABLE_SECTION_CLASSNAME } from './auditTableStyles';
import {
  DATA_ACCESS_ACTOR_OPTIONS,
  DATA_ACCESS_EVENT_TYPE_FILTERS,
  dataAccessCategoryPillClass,
  dataAccessEventTypeLabel,
  isDataAccessUnusualRow,
  narrowedDataAccessEventTypes,
  rowMatchesDataAccessDurationRange,
} from './dataAccessConstants';

const AUDIT_TABLE_HDR_PAD = '!px-2.5 !py-2';
const AUDIT_TABLE_CELL_PAD =
  '!h-auto min-h-[40px] !rounded-none !px-2.5 !py-2 align-middle bg-white';
const AUDIT_CELL_BODY = 'text-[13px] font-normal leading-snug text-[#52525B]';

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

function formatAccessTimestamp(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, 'dd/MM/yy, HH:mm:ss.SSS');
  } catch {
    return iso;
  }
}

export default function DataAccessAuditTab(): React.JSX.Element {
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

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  const [appliedEventTypes, setAppliedEventTypes] = React.useState<string[]>([]);
  const [appliedActors, setAppliedActors] = React.useState<string[]>([]);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [draftEventTypes, setDraftEventTypes] = React.useState<string[]>([]);
  const [draftActors, setDraftActors] = React.useState<string[]>([]);
  const [draftDurationMin, setDraftDurationMin] = React.useState('');
  const [draftDurationMax, setDraftDurationMax] = React.useState('');
  const [appliedDurationMin, setAppliedDurationMin] = React.useState<number | null>(null);
  const [appliedDurationMax, setAppliedDurationMax] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isFilterDialogOpen) return;
    setDraftEventTypes([...appliedEventTypes]);
    setDraftActors([...appliedActors]);
    setDraftDurationMin(appliedDurationMin != null ? String(appliedDurationMin) : '');
    setDraftDurationMax(appliedDurationMax != null ? String(appliedDurationMax) : '');
  }, [
    isFilterDialogOpen,
    appliedEventTypes,
    appliedActors,
    appliedDurationMin,
    appliedDurationMax,
  ]);

  const fromDateIso = dateRange?.from != null ? startOfDay(dateRange.from).toISOString() : null;
  const toDateIso =
    dateRange?.from != null ? endOfDay(dateRange.to ?? dateRange.from).toISOString() : null;

  const eventTypeParam = narrowedDataAccessEventTypes(appliedEventTypes);
  const actorParam =
    appliedActors.length === 1 && (appliedActors[0] === 'Admin' || appliedActors[0] === 'Client')
      ? appliedActors[0]
      : undefined;

  const listsArg =
    organizationId && accessToken
      ? {
          organizationId,
          page: currentPage,
          size: Math.min(pageSize, 100),
          search: debouncedSearch.trim() || null,
          from_date: fromDateIso,
          to_date: toDateIso,
          event_type: eventTypeParam,
          actor: actorParam ?? null,
        }
      : skipToken;

  const {
    data: listRes,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listError,
    refetch: refetchList,
  } = useGetDataAccessLogsQuery(listsArg);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    fromDateIso,
    toDateIso,
    appliedEventTypes,
    appliedActors,
    appliedDurationMin,
    appliedDurationMax,
    pageSize,
  ]);

  const listData = listRes?.success ? listRes.data : undefined;
  const items = React.useMemo(() => listData?.items ?? [], [listData]);

  const durationFilterActive = appliedDurationMin != null || appliedDurationMax != null;

  const displayItems = React.useMemo(() => {
    if (!durationFilterActive) return items;
    return items.filter((row) =>
      rowMatchesDataAccessDurationRange(row, appliedDurationMin, appliedDurationMax)
    );
  }, [items, durationFilterActive, appliedDurationMin, appliedDurationMax]);

  const totalEntries = listData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / Math.min(pageSize, 100)));

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const unusualCountOnPage = React.useMemo(
    () => displayItems.reduce((n, row) => (isDataAccessUnusualRow(row) ? n + 1 : n), 0),
    [displayItems]
  );

  const filterBadgeCount = React.useMemo(() => {
    let n = 0;
    if (dateRange?.from) n += 1;
    if (narrowedDataAccessEventTypes(appliedEventTypes)) n += 1;
    if (
      appliedActors.length === 1 &&
      (appliedActors[0] === 'Admin' || appliedActors[0] === 'Client')
    )
      n += 1;
    if (appliedDurationMin != null || appliedDurationMax != null) n += 1;
    return n;
  }, [dateRange?.from, appliedEventTypes, appliedActors, appliedDurationMin, appliedDurationMax]);

  const hasActiveListFilters =
    debouncedSearch.trim() !== '' ||
    Boolean(dateRange?.from) ||
    narrowedDataAccessEventTypes(appliedEventTypes) != null ||
    actorParam != null ||
    appliedDurationMin != null ||
    appliedDurationMax != null;

  const dateRangeLabel = React.useMemo(() => {
    if (!dateRange?.from) return 'Date range';
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy');
    return `${format(dateRange.from, 'd MMM yyyy')} - ${format(dateRange.to, 'd MMM yyyy')}`;
  }, [dateRange]);

  const refreshDataAccessLogs = React.useCallback((): void => {
    void refetchList().then((result) => {
      if (result.error) {
        toast.error(getErrorMessage(result.error));
        return;
      }
      toast.success('Data access log refreshed.');
    });
  }, [refetchList]);

  const resetToolbarFilters = (): void => {
    setSearchInput('');
    setDebouncedSearch('');
    setDateRange(undefined);
    setAppliedEventTypes([]);
    setAppliedActors([]);
    setDraftEventTypes([]);
    setDraftActors([]);
    setAppliedDurationMin(null);
    setAppliedDurationMax(null);
    setDraftDurationMin('');
    setDraftDurationMax('');
  };

  const resetModalDraft = (): void => {
    setDraftEventTypes([]);
    setDraftActors([]);
    setDraftDurationMin('');
    setDraftDurationMax('');
    setAppliedEventTypes([]);
    setAppliedActors([]);
    setAppliedDurationMin(null);
    setAppliedDurationMax(null);
    toast.success('Filters cleared.');
  };

  const applyModalFilters = (): void => {
    const minParsed = parseDurationMinutesInput(draftDurationMin);
    const maxParsed = parseDurationMinutesInput(draftDurationMax);
    if (minParsed != null && maxParsed != null && minParsed > maxParsed) {
      toast.error('Duration min cannot be greater than max.');
      return;
    }
    setAppliedEventTypes([...draftEventTypes]);
    setAppliedActors([...draftActors]);
    setAppliedDurationMin(minParsed);
    setAppliedDurationMax(maxParsed);
    setIsFilterDialogOpen(false);
    toast.success('Filters applied.');
  };

  const toggleDraft = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const columns = React.useMemo<Column<AuditLogItemDto>[]>(
    () => [
      {
        key: 'created_at',
        header: 'Timestamp',
        headerMuted: true,
        headerShowSort: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[148px] whitespace-nowrap'),
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {formatAccessTimestamp(row.created_at)}
          </Typography>
        ),
      },
      {
        key: 'display_category',
        header: 'Access Category',
        headerMuted: true,
        headerShowSort: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => {
          const label =
            row.display_category?.trim() || dataAccessEventTypeLabel(row.event_type || '');
          return (
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[11px] font-normal text-white',
                dataAccessCategoryPillClass(row)
              )}
            >
              {label}
            </span>
          );
        },
      },
      {
        key: 'email',
        header: 'Email',
        headerMuted: true,
        headerShowSort: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.email?.trim() || '—'}
          </Typography>
        ),
      },
      {
        key: 'actor',
        header: 'Actor',
        headerMuted: true,
        headerShowSort: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.actor?.trim() || '—'}
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
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.ip_address?.trim() || '—'}
          </Typography>
        ),
      },
      {
        key: 'resource',
        header: 'Resource',
        headerMuted: true,
        headerShowSort: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.resource?.trim() || '—'}
          </Typography>
        ),
      },
      {
        key: 'duration',
        header: 'Duration',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: AUDIT_TABLE_CELL_PAD,
        cell: (row) => (
          <Typography variant="caption" className={AUDIT_CELL_BODY}>
            {row.duration?.trim() || '—'}
          </Typography>
        ),
      },
    ],
    []
  );

  const getRowClassName = React.useCallback((row: AuditLogItemDto): string | undefined => {
    if (!isDataAccessUnusualRow(row)) return undefined;
    return 'border-b border-[#E5E7EB] bg-[#FFF9F0] hover:bg-[#FFF3E0]';
  }, []);

  if (!organizationId) {
    return (
      <Typography
        variant="body"
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"
      >
        No organization is linked to this session. Data access logs cannot be loaded.
      </Typography>
    );
  }

  return (
    <div className="space-y-4">
      {unusualCountOnPage > 0 ? (
        <div className="rounded-md border border-[#FDE6C7] bg-[#FFF7ED] px-3 py-2">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4 shrink-0 text-[#D97706]" aria-hidden />
            <Typography variant="caption" className="text-sm font-normal text-[#C2410C]">
              {unusualCountOnPage === 1
                ? '1 unusual access pattern detected for this client.'
                : `${unusualCountOnPage} unusual access patterns detected for this client.`}{' '}
              Review the access analysis panel below.
            </Typography>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="h6" className="text-xl font-normal text-[#18181B]">
            Data Access Logs
          </Typography>
          <Typography variant="caption" className="text-sm text-[#71717A]">
            Track who accessed your data, when it was accessed, and what information was viewed,
            downloaded, or exported.
          </Typography>
        </div>
        <Button
          variant="outline"
          className="h-10 gap-2 border-gray-200 bg-white"
          type="button"
          onClick={refreshDataAccessLogs}
        >
          <RefreshCw className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-normal">Refresh</span>
        </Button>
      </div>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 space-y-2">
            <Typography variant="h6" className="text-base font-normal text-[#18181B]">
              Access Events
            </Typography>
            <Typography
              variant="caption"
              className="text-sm font-normal leading-snug text-[#71717A]"
            >
              Review detailed records of administrative access to this client&apos;s data.
            </Typography>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="min-w-[240px] flex-1 basis-[280px]">
              <Input
                type="search"
                value={searchInput}
                leftIcon={Search}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by actor, resource, or IP address..."
                className="h-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 border-gray-200 bg-white">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
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
              type="button"
              className="h-10 gap-2 border-[#E2E8F0] bg-white px-3 text-sm font-normal text-[#18181B] hover:bg-white"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal
                className="h-4 w-4 text-[#18181B]"
                strokeWidth={1.75}
                aria-hidden
              />
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
                Failed to load data access logs.
              </Typography>
              <Button type="button" variant="outline" size="sm" onClick={refreshDataAccessLogs}>
                Retry
              </Button>
            </div>
          ) : null}

          {!listError && !listLoading && !listFetching && totalEntries === 0 ? (
            <AuditLogsEmptyState
              hasActiveFilters={hasActiveListFilters}
              onResetFilters={resetToolbarFilters}
            />
          ) : !listError &&
            !listLoading &&
            !listFetching &&
            durationFilterActive &&
            items.length > 0 &&
            displayItems.length === 0 ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-10 text-center">
              <Typography variant="caption" className="text-sm text-[#52525B]">
                No events on this page match the duration range. Try another page or clear the
                duration filter.
              </Typography>
            </div>
          ) : (
            <>
              {durationFilterActive ? (
                <Typography variant="caption" className="mb-2 block text-[13px] text-[#71717A]">
                  Duration filter applies to the events loaded on this page only.
                </Typography>
              ) : null}
              <DataTable
                columns={columns}
                data={displayItems}
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
                getRowClassName={(row) => getRowClassName(row)}
                className="space-y-3"
                tableHorizontalScrollClassName="audit-recent-activity-scroll w-full rounded-lg"
                tableScrollMinWidthClassName="md:min-w-[1200px]"
                tableSectionClassName={AUDIT_LOG_TABLE_SECTION_CLASSNAME}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
          <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
            <DialogTitle className="text-xl font-semibold text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="text-sm leading-snug text-muted-foreground">
              Narrow events by access category, actor, and duration (minutes). Filters apply to the
              access events table.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-6 overflow-y-auto px-6 pb-5 pt-4">
            <DataAccessFilterChipSection
              title="Select Access Category:"
              options={[...DATA_ACCESS_EVENT_TYPE_FILTERS]}
              selected={draftEventTypes}
              onToggle={(code) => toggleDraft(code, setDraftEventTypes)}
              renderLabel={(code) => dataAccessEventTypeLabel(code)}
            />
            <DataAccessFilterChipSection
              title="Select Actor:"
              options={[...DATA_ACCESS_ACTOR_OPTIONS]}
              selected={draftActors}
              onToggle={(v) => toggleDraft(v, setDraftActors)}
            />

            <div className="flex flex-col gap-2.5">
              <Typography
                variant="caption"
                className="text-base font-semibold leading-snug text-[#18181B]"
              >
                Duration Range (Minutes):
              </Typography>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Min"
                  value={draftDurationMin}
                  onChange={(e) => setDraftDurationMin(e.target.value)}
                  className="h-10 w-[120px] rounded-lg border-[#E5E7EB] bg-white text-sm"
                  aria-label="Minimum duration in minutes"
                />
                <span className="text-sm text-[#71717A]" aria-hidden>
                  —
                </span>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Max"
                  value={draftDurationMax}
                  onChange={(e) => setDraftDurationMax(e.target.value)}
                  className="h-10 w-[120px] rounded-lg border-[#E5E7EB] bg-white text-sm"
                  aria-label="Maximum duration in minutes"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4EA] pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white"
                onClick={resetModalDraft}
              >
                Reset Filters
              </Button>
              <Button
                type="button"
                className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                onClick={applyModalFilters}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function parseDurationMinutesInput(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function DataAccessFilterChipSection(props: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <Typography variant="caption" className="text-base font-semibold leading-snug text-[#18181B]">
        {props.title}
      </Typography>
      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
        {props.options.map((opt) => {
          const active = props.selected.includes(opt);
          const label = props.renderLabel ? props.renderLabel(opt) : opt;
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
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
