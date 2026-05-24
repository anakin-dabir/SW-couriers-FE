'use client';

import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  Laptop,
  Monitor,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { DataTable } from '@/components/molecules';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { DeleteSavedViewIllustration } from '@/assets/svg';
import type { AuditLogItemDto } from '@/store/api/auditLogsApi';
import {
  useCreateAuditSavedViewMutation,
  useDeleteAuditSavedViewMutation,
  useGetAuditLogsQuery,
  useGetAuditSavedViewsQuery,
} from '@/store/api/auditLogsApi';
import { getErrorMessage } from '@/store/api/utils';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import type { Column } from '@/types/datatable';
import {
  ACTIVITY_ACTOR_OPTIONS,
  ACTIVITY_CATEGORY_OPTIONS,
  ACTIVITY_SEVERITY_OPTIONS,
  AUDIT_EVENT_TYPES,
  severityChipLabel,
} from './auditActivityConstants';
import {
  MAX_SAVED_AUDIT_VIEWS,
  type AuditActivitySavedSnapshot,
  snapshotToSavedViewFiltersPayload,
  savedViewFiltersToSnapshot,
} from './auditSavedViewFilters';
import AuditLogsEmptyState from './AuditLogsEmptyState';
import AuditLogDetailDialog from './AuditLogDetailDialog';
import { AUDIT_LOG_TABLE_SECTION_CLASSNAME } from './auditTableStyles';

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

function formatActivityTimestamp(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, 'dd/MM/yy, HH:mm:ss.SSS');
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

/** Activity Log category pills — palette aligned with design mocks */
function activityCategoryBadgeClass(categoryRaw: string): string {
  const c = categoryRaw.trim();
  const map: Record<string, string> = {
    System: 'bg-[#71717A] text-white',
    Account: 'bg-[#9333EA] text-white',
    Contact: 'bg-[#06B6D4] text-white',
    Order: 'bg-[#16A34A] text-white',
    Billing: 'bg-[#EC4899] text-white',
    Credit: 'bg-[#EA580C] text-white',
    Document: 'bg-[#2563EB] text-white',
    Access: 'bg-[#18181B] text-white',
    Security: 'bg-[#DC2626] text-white',
    Fleet: 'bg-[#4F46E5] text-white',
    Configuration: 'bg-[#A855F7] text-white',
  };
  return map[c] ?? 'bg-[#A1A1AA] text-white';
}

function severityTextClass(severityRaw: string): string {
  const v = severityRaw.toUpperCase();
  if (v === 'CRITICAL') return 'text-[#DC2626] font-normal';
  if (v === 'WARNING') return 'text-[#EA580C] font-normal';
  if (v === 'NOTICE') return 'text-[#2563EB] font-normal';
  if (v === 'INFO') return 'text-[#71717A] font-normal';
  return 'text-[#52525B]';
}

function narrowedArrayParam(selected: string[], all: readonly string[]): string[] | undefined {
  if (selected.length === 0 || selected.length >= all.length) return undefined;
  return selected;
}

function snapshotFromApplied(args: {
  appliedCategories: string[];
  appliedSeverities: string[];
  appliedActors: string[];
  appliedEventTypes: string[];
  sortBy: 'asc' | 'desc';
  searchInput: string;
  fromDateIso: string | null;
  toDateIso: string | null;
}): AuditActivitySavedSnapshot {
  return {
    categories: [...args.appliedCategories],
    severities: [...args.appliedSeverities],
    actors: [...args.appliedActors],
    eventTypes: [...args.appliedEventTypes],
    sortBy: args.sortBy,
    search: args.searchInput,
    fromIso: args.fromDateIso,
    toIso: args.toDateIso,
  };
}

function applySnapshot(snapshot: AuditActivitySavedSnapshot): {
  categories: string[];
  severities: string[];
  actors: string[];
  eventTypes: string[];
  sortBy: 'asc' | 'desc';
  search: string;
  dateRange: DateRange | undefined;
} {
  let dateRange: DateRange | undefined;
  if (snapshot.fromIso) {
    try {
      const from = parseISO(snapshot.fromIso);
      const to = snapshot.toIso ? parseISO(snapshot.toIso) : from;
      dateRange = { from, to };
    } catch {
      dateRange = undefined;
    }
  }
  return {
    categories: [...snapshot.categories],
    severities: [...snapshot.severities],
    actors: [...snapshot.actors],
    eventTypes: [...snapshot.eventTypes],
    sortBy: snapshot.sortBy,
    search: snapshot.search,
    dateRange,
  };
}

const AUDIT_TABLE_HDR_PAD = '!px-2.5 !py-2';
const AUDIT_TABLE_CELL_PAD =
  '!h-auto min-h-[40px] !rounded-none !px-2.5 !py-2 align-middle bg-white';
const AUDIT_CELL_BODY = 'text-[13px] font-normal leading-snug text-[#52525B]';
const AUDIT_CELL_TS = 'text-[13px] font-normal leading-snug text-[#52525B]';

export default function AuditActivityLogTab(): React.JSX.Element {
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

  const [sortBy, setSortBy] = React.useState<'desc' | 'asc'>('desc');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  const [appliedCategories, setAppliedCategories] = React.useState<string[]>([]);
  const [appliedSeverities, setAppliedSeverities] = React.useState<string[]>([]);
  const [appliedActors, setAppliedActors] = React.useState<string[]>([]);
  const [appliedEventTypes, setAppliedEventTypes] = React.useState<string[]>([]);

  const [eventTypeOpen, setEventTypeOpen] = React.useState(false);
  const [draftEventTypes, setDraftEventTypes] = React.useState<string[]>([]);
  const [eventTypeQuery, setEventTypeQuery] = React.useState('');

  const [savedViewsOpen, setSavedViewsOpen] = React.useState(false);
  const [savedViewsHighlightId, setSavedViewsHighlightId] = React.useState<string | null>(null);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [draftCategories, setDraftCategories] = React.useState<string[]>([]);
  const [draftSeverities, setDraftSeverities] = React.useState<string[]>([]);
  const [draftActors, setDraftActors] = React.useState<string[]>([]);

  /** Name for saving current filters — shown after clicking “Save Current Filters as a View” */
  const [saveViewName, setSaveViewName] = React.useState('');
  const [saveViewPanelOpen, setSaveViewPanelOpen] = React.useState(false);

  /** Opens delete confirmation modal from Saved Views menu */
  const [savedViewPendingDelete, setSavedViewPendingDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedAuditLogId, setSelectedAuditLogId] = React.useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  const savedViewsArg = organizationId && accessToken ? { organizationId } : skipToken;
  const { data: savedViewsRes, isFetching: savedViewsFetching } =
    useGetAuditSavedViewsQuery(savedViewsArg);
  const savedViewsList =
    savedViewsRes?.success === true && Array.isArray(savedViewsRes.data) ? savedViewsRes.data : [];

  const [createSavedView, { isLoading: creatingSavedView }] = useCreateAuditSavedViewMutation();
  const [deleteSavedViewMutation, { isLoading: deletingSavedView }] =
    useDeleteAuditSavedViewMutation();

  React.useEffect(() => {
    if (!isFilterDialogOpen) return;
    setDraftCategories([...appliedCategories]);
    setDraftSeverities([...appliedSeverities]);
    setDraftActors([...appliedActors]);
    setSaveViewName('');
    setSaveViewPanelOpen(false);
  }, [isFilterDialogOpen, appliedCategories, appliedSeverities, appliedActors]);

  const fromDateIso = dateRange?.from != null ? startOfDay(dateRange.from).toISOString() : null;
  const toDateIso =
    dateRange?.from != null ? endOfDay(dateRange.to ?? dateRange.from).toISOString() : null;

  const categoryParam = narrowedArrayParam(appliedCategories, ACTIVITY_CATEGORY_OPTIONS);
  const severityParam = narrowedArrayParam(appliedSeverities, ACTIVITY_SEVERITY_OPTIONS);
  const eventTypeParam = narrowedArrayParam(appliedEventTypes, AUDIT_EVENT_TYPES);
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
          sort_by: sortBy,
          from_date: fromDateIso,
          to_date: toDateIso,
          category: categoryParam,
          severity: severityParam,
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
  } = useGetAuditLogsQuery(listsArg);

  const refreshActivityLogs = React.useCallback((): void => {
    void refetchList().then((result) => {
      if (result.error) {
        toast.error(getErrorMessage(result.error));
        return;
      }
      toast.success('Activity log refreshed.');
    });
  }, [refetchList]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    sortBy,
    fromDateIso,
    toDateIso,
    appliedCategories,
    appliedSeverities,
    appliedActors,
    appliedEventTypes,
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

  const filterBadgeCount = React.useMemo(() => {
    let n = 0;
    if (dateRange?.from) n += 1;
    if (narrowedArrayParam(appliedCategories, ACTIVITY_CATEGORY_OPTIONS)) n += 1;
    if (narrowedArrayParam(appliedSeverities, ACTIVITY_SEVERITY_OPTIONS)) n += 1;
    if (appliedActors.length === 1) n += 1;
    if (narrowedArrayParam(appliedEventTypes, AUDIT_EVENT_TYPES)) n += 1;
    return n;
  }, [dateRange?.from, appliedCategories, appliedSeverities, appliedActors, appliedEventTypes]);

  const activityLogHasActiveFilters =
    debouncedSearch.trim() !== '' ||
    Boolean(dateRange?.from) ||
    appliedCategories.length > 0 ||
    appliedSeverities.length > 0 ||
    appliedActors.length > 0 ||
    appliedEventTypes.length > 0;

  const dateRangeLabel = React.useMemo(() => {
    if (!dateRange?.from) return 'Date range';
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy');
    return `${format(dateRange.from, 'd MMM yyyy')} - ${format(dateRange.to, 'd MMM yyyy')}`;
  }, [dateRange]);

  const eventTypesFiltered = React.useMemo(() => {
    const q = eventTypeQuery.trim().toLowerCase();
    if (!q) return [...AUDIT_EVENT_TYPES];
    return AUDIT_EVENT_TYPES.filter((t) => t.toLowerCase().includes(q));
  }, [eventTypeQuery]);

  const eventTypeBadgeCount = narrowedArrayParam(appliedEventTypes, AUDIT_EVENT_TYPES)?.length ?? 0;

  const columns = React.useMemo<Column<AuditLogItemDto>[]>(
    () => [
      {
        key: 'audit_ref',
        header: 'Audit Ref',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[168px]'),
        cell: (row) => (
          <Typography variant="caption" className={cn('text-left font-mono', AUDIT_CELL_BODY)}>
            {row.audit_ref || '—'}
          </Typography>
        ),
      },
      {
        key: 'created_at',
        header: 'Timestamp',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[168px]'),
        cell: (row) => (
          <Typography
            variant="caption"
            className={cn(AUDIT_CELL_TS, 'whitespace-nowrap font-mono')}
          >
            {formatActivityTimestamp(row.created_at)}
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
                activityCategoryBadgeClass(cat)
              )}
              title={cat}
            >
              {cat}
            </span>
          );
        },
      },
      {
        key: 'severity',
        header: 'Severity',
        headerMuted: true,
        headerAlign: 'left',
        cellAlign: 'left',
        headerClassName: AUDIT_TABLE_HDR_PAD,
        className: cn(AUDIT_TABLE_CELL_PAD, 'min-w-[96px]'),
        cell: (row) => (
          <Typography
            variant="caption"
            className={cn(AUDIT_CELL_BODY, severityTextClass(row.severity || ''))}
          >
            {severityChipLabel(row.severity || '')}
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

  const toggleDraftEventType = (code: string): void => {
    setDraftEventTypes((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const applyModalFilters = (): void => {
    setAppliedCategories([...draftCategories]);
    setAppliedSeverities([...draftSeverities]);
    setAppliedActors([...draftActors]);
    setIsFilterDialogOpen(false);
    toast.success('Filters applied.');
  };

  const resetModalDraft = (): void => {
    setDraftCategories([]);
    setDraftSeverities([]);
    setDraftActors([]);
    setAppliedCategories([]);
    setAppliedSeverities([]);
    setAppliedActors([]);
    toast.success('Filters cleared.');
  };

  const resetActivityLogToolbarFilters = (): void => {
    setSearchInput('');
    setDebouncedSearch('');
    setDateRange(undefined);
    setAppliedCategories([]);
    setAppliedSeverities([]);
    setAppliedActors([]);
    setAppliedEventTypes([]);
    setDraftCategories([]);
    setDraftSeverities([]);
    setDraftActors([]);
    setDraftEventTypes([]);
    toast.success('Filters cleared.');
  };

  const handleSaveViewConfirm = async (): Promise<void> => {
    if (!organizationId) return;
    const name = saveViewName.trim();
    if (!name) return;
    const categoriesForSave = isFilterDialogOpen ? draftCategories : appliedCategories;
    const severitiesForSave = isFilterDialogOpen ? draftSeverities : appliedSeverities;
    const actorsForSave = isFilterDialogOpen ? draftActors : appliedActors;
    const snapshot = snapshotFromApplied({
      appliedCategories: categoriesForSave,
      appliedSeverities: severitiesForSave,
      appliedActors: actorsForSave,
      appliedEventTypes,
      sortBy,
      searchInput,
      fromDateIso,
      toDateIso,
    });
    try {
      await createSavedView({
        organizationId,
        body: {
          name,
          filters: snapshotToSavedViewFiltersPayload(snapshot),
          is_default: false,
        },
      }).unwrap();
      setSaveViewName('');
      setSaveViewPanelOpen(false);
      toast.success(`Saved view "${name}".`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDeleteSavedView = async (): Promise<void> => {
    if (!organizationId || !savedViewPendingDelete) return;
    const { id, name } = savedViewPendingDelete;
    try {
      await deleteSavedViewMutation({ organizationId, viewId: id }).unwrap();
      setSavedViewPendingDelete(null);
      if (savedViewsHighlightId === id) setSavedViewsHighlightId(null);
      toast.success(`Removed saved view "${name}".`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const applySelectedSavedView = (): void => {
    if (!savedViewsHighlightId) return;
    const view = savedViewsList.find((v) => v.id === savedViewsHighlightId);
    if (!view) return;
    const snapshot = savedViewFiltersToSnapshot(view.filters);
    const next = applySnapshot(snapshot);
    setAppliedCategories(next.categories);
    setAppliedSeverities(next.severities);
    setAppliedActors(next.actors);
    setAppliedEventTypes(next.eventTypes);
    setSortBy(next.sortBy);
    setSearchInput(next.search);
    setDebouncedSearch(next.search);
    setDateRange(next.dateRange);
    setSavedViewsOpen(false);
    toast.success(`Applied saved view "${view.name}".`);
  };

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

  const atSavedViewCap = savedViewsList.length >= MAX_SAVED_AUDIT_VIEWS;

  return (
    <div className="flex flex-col">
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-3 md:p-4">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-1.5">
            <div className="space-y-0.5">
              <Typography variant="h6" className="text-lg font-normal text-[#18181B]">
                Activity Log
              </Typography>
              <Typography variant="caption" className="text-sm text-[#71717A]">
                Search, filter, and review all audit events recorded.
              </Typography>
            </div>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <div className="min-w-[220px] flex-1 basis-[260px]">
              <Input
                type="search"
                value={searchInput}
                leftIcon={Search}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search events, entity references, or reasons..."
                className="h-10"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'desc' | 'asc')}>
              <SelectTrigger className="h-10 w-[160px] border-gray-200 bg-white">
                <SelectValue placeholder="Sort by Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>

            <Popover
              open={eventTypeOpen}
              onOpenChange={(open) => {
                setEventTypeOpen(open);
                if (open) {
                  setDraftEventTypes([...appliedEventTypes]);
                  setEventTypeQuery('');
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-10 gap-1.5 border-gray-200 bg-white px-2.5 text-sm font-normal text-[#18181B]'
                  )}
                >
                  <span>Event Type</span>
                  {eventTypeBadgeCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BE1E2D] px-1.5 text-[11px] font-normal text-white">
                      {eventTypeBadgeCount}
                    </span>
                  ) : null}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0" align="start">
                <div className="border-b border-[#E5E7EB] p-3">
                  <Input
                    type="search"
                    value={eventTypeQuery}
                    leftIcon={Search}
                    onChange={(e) => setEventTypeQuery(e.target.value)}
                    placeholder="Search event type"
                    className="h-9"
                  />
                </div>
                <div className="max-h-[280px] overflow-y-auto p-2">
                  {eventTypesFiltered.map((t) => {
                    const active = draftEventTypes.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleDraftEventType(t)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                            active
                              ? 'border-[#BE1E2D] bg-[#BE1E2D] text-white'
                              : 'border-[#D4D4D8] bg-white'
                          )}
                          aria-hidden
                        >
                          {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="font-mono text-[12px] text-[#18181B]">{t}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 border-t border-[#E5E7EB] p-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white"
                    onClick={() => setDraftEventTypes([])}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                    onClick={() => {
                      setAppliedEventTypes([...draftEventTypes]);
                      setEventTypeOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

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

            <Popover
              open={savedViewsOpen}
              onOpenChange={(open) => {
                setSavedViewsOpen(open);
                if (open) setSavedViewsHighlightId(null);
              }}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-1.5 border-gray-200 bg-white px-2.5">
                  <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-normal">Saved Views</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0" align="end">
                <div className="border-b border-[#E5E7EB] px-3 py-2">
                  <Typography variant="caption" className="text-xs text-muted-foreground">
                    Select from Saved Views
                  </Typography>
                </div>
                <div className="max-h-[260px] overflow-y-auto p-1">
                  {savedViewsFetching && savedViewsList.length === 0 ? (
                    <Typography
                      variant="caption"
                      className="block px-3 py-6 text-center text-muted-foreground"
                    >
                      Loading saved views…
                    </Typography>
                  ) : savedViewsList.length === 0 ? (
                    <Typography
                      variant="caption"
                      className="block px-3 py-6 text-center text-muted-foreground"
                    >
                      No saved views yet. Save filters from the Filters dialog.
                    </Typography>
                  ) : (
                    savedViewsList.map((v) => {
                      const selected = savedViewsHighlightId === v.id;
                      return (
                        <div
                          key={v.id}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-2',
                            selected ? 'bg-muted/60' : 'hover:bg-muted/40'
                          )}
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 truncate text-left text-[13px] font-normal text-[#18181B]"
                            onClick={() => setSavedViewsHighlightId(v.id)}
                          >
                            {v.name}
                          </button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 border-[#FECACA] text-[#BE1E2D] hover:bg-[#FEF2F2]"
                            aria-label={`Delete saved view ${v.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSavedViewPendingDelete({ id: v.id, name: v.name });
                            }}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex gap-2 border-t border-[#E5E7EB] p-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white"
                    onClick={() => setSavedViewsHighlightId(null)}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                    disabled={!savedViewsHighlightId}
                    onClick={() => applySelectedSavedView()}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 border-gray-200 bg-white"
              onClick={refreshActivityLogs}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-normal">Refresh</span>
            </Button>
          </div>

          {listError ? (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50/90 p-3">
              <Typography variant="body" className="text-red-900">
                Failed to load activity logs.
              </Typography>
              <Button type="button" variant="outline" size="sm" onClick={refreshActivityLogs}>
                Retry
              </Button>
            </div>
          ) : null}

          {!listError && !listLoading && !listFetching && totalEntries === 0 ? (
            <AuditLogsEmptyState
              hasActiveFilters={activityLogHasActiveFilters}
              onResetFilters={resetActivityLogToolbarFilters}
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

      <Dialog
        open={savedViewPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setSavedViewPendingDelete(null);
        }}
      >
        <DialogContent className="block h-auto max-h-[90vh] w-full max-w-md gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-white p-0 shadow-xl sm:[&>button.absolute]:hidden">
          <div className="flex flex-col items-center p-8 text-center">
            <img
              src={DeleteSavedViewIllustration}
              alt=""
              className="mx-auto h-[100px] w-[100px] shrink-0"
              width={100}
              height={100}
            />
            <DialogHeader className="mt-6 space-y-2 text-center sm:text-center">
              <DialogTitle className="text-lg font-semibold leading-snug text-[#18181B]">
                Delete &ldquo;{savedViewPendingDelete?.name ?? ''}&rdquo; View?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-[#71717A]">
                You&rsquo;re about to delete the saved view &ldquo;
                {savedViewPendingDelete?.name ?? ''}&rdquo;. Once deleted, this view cannot be
                recovered.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-10 flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#E5E7EB] bg-white px-4 py-2.5 font-medium text-[#30303B] hover:bg-[#F9FAFB] md:text-base"
                disabled={deletingSavedView}
                onClick={() => setSavedViewPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#BE1E2D] px-4 py-2.5 font-medium text-white hover:bg-[#A21926] md:text-base"
                disabled={deletingSavedView}
                onClick={() => void confirmDeleteSavedView()}
              >
                {deletingSavedView ? 'Deleting…' : 'Delete View'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
          <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
            <DialogTitle className="text-xl font-normal text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="sr-only">
              Filter activity by category, severity, and actor role.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-5 overflow-y-auto px-6 pb-5 pt-4">
            <ActivityFilterChipSection
              title="Select Event Category:"
              options={ACTIVITY_CATEGORY_OPTIONS}
              selected={draftCategories}
              onToggle={(v) => toggleDraft(v, setDraftCategories)}
            />
            <ActivityFilterChipSection
              title="Select Event Severity:"
              options={[...ACTIVITY_SEVERITY_OPTIONS]}
              selected={draftSeverities}
              onToggle={(v) => toggleDraft(v, setDraftSeverities)}
              renderLabel={(code) => severityChipLabel(code)}
            />
            <ActivityFilterChipSection
              title="Select Actor:"
              options={[...ACTIVITY_ACTOR_OPTIONS]}
              selected={draftActors}
              onToggle={(v) => toggleDraft(v, setDraftActors)}
              showDivider={false}
            />

            <div>
              {atSavedViewCap ? (
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F4F4F5] px-4 py-5 text-center">
                  <Typography variant="caption" className="text-sm text-[#71717A]">
                    Max {MAX_SAVED_AUDIT_VIEWS} saved views reached
                  </Typography>
                </div>
              ) : saveViewPanelOpen ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <Input
                    value={saveViewName}
                    onChange={(e) => setSaveViewName(e.target.value)}
                    placeholder="e.g. Billing events"
                    className="h-10 flex-1 rounded-lg border-[#E5E7EB] bg-white text-sm placeholder:text-[#A1A1AA]"
                    aria-label="Saved view name"
                  />
                  <div className="flex shrink-0 justify-end gap-2 sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-10 border-[#E5E7EB] bg-white px-4 text-[#30303B] hover:bg-[#F9FAFB]"
                      onClick={() => {
                        setSaveViewName('');
                        setSaveViewPanelOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="min-h-10 min-w-[88px] bg-[#BE1E2D] px-4 text-white hover:bg-[#A21926]"
                      disabled={!saveViewName.trim() || creatingSavedView || atSavedViewCap}
                      onClick={() => void handleSaveViewConfirm()}
                    >
                      {creatingSavedView ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3.5 text-center text-sm font-normal text-[#18181B] transition-colors hover:bg-[#F9FAFB]"
                  onClick={() => setSaveViewPanelOpen(true)}
                >
                  Save Current Filters as a View
                </button>
              )}
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

      <AuditLogDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        organizationId={organizationId}
        auditLogId={selectedAuditLogId}
      />
    </div>
  );
}

function ActivityFilterChipSection(props: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
  renderLeading?: (value: string) => React.ReactNode;
  showDivider?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 pb-4',
        props.showDivider === false ? '' : 'border-b border-[#E4E4EA]'
      )}
    >
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
