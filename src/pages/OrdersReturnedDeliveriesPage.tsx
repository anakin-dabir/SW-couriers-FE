import * as React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock2,
  MoreVertical,
  Package,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker, EmptyState, ErrorState, Typography } from '@/components/atoms';
import OrderQuickDateRangePopover from '@/components/molecules/OrderQuickDateRangePopover';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import OrdersFilterModal, {
  countActiveFilterCategories,
  emptyFilterState,
  type OrdersFilterState,
} from '@/components/pages/Orders/OrdersFilterModal';
import { useOrderDateRangeFilter } from '@/hooks/useOrderDateRangeFilter';
import KpiPeriodSelector, {
  KPI_COMPARISON_LABELS,
  type KpiPeriod,
} from '@/components/common/KpiPeriodSelector';
import { formatOrdersMetricValue, formatOrdersResolutionDays } from '@/lib/ordersSummaryMetrics';
import KpiCard from '@/components/common/KpiCard';
import { cn, getVisiblePages } from '@/lib/utils';
import {
  type DeliveryPackageStatus,
  useGetOrderReturnsQuery,
  useGetOrderReturnsSummaryQuery,
} from '@/store/api/ordersApi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

type ReturnBadgeKind = 'return_initiated' | 'return_in_transit' | 'returned';

const RETURN_BADGE: Record<ReturnBadgeKind, { label: string; className: string }> = {
  return_initiated: {
    label: 'Return Initiated',
    className: 'border-0 bg-[#F59E0B] text-white hover:bg-[#F59E0B]',
  },
  return_in_transit: {
    label: 'Return in Transit',
    className: 'border-0 bg-[#0D9488] text-white hover:bg-[#0D9488]',
  },
  returned: {
    label: 'Returned',
    className: 'border-0 bg-[#1E293B] text-white hover:bg-[#1E293B]',
  },
};

interface PackageRow {
  id: string;
  packageId: string;
  reason: string;
  statusKind: ReturnBadgeKind;
}

interface ReturnedGroup {
  id: string;
  orderId: string;
  trackingId: string;
  postalCode: string;
  attemptCurrent: number;
  attemptMax: number;
  previousAttempt: string;
  nextAttempt: string;
  stopStatusKind: ReturnBadgeKind;
  packages: PackageRow[];
}

const RETURN_FILTER_STOP_STATUS_MAP: Record<string, DeliveryPackageStatus[]> = {
  return_initiated: ['RETURN_INITIATED'],
  return_in_transit: ['RETURN_IN_TRANSIT'],
  returned: ['RETURNED'],
};

const ATTEMPT_DOT_FILL = ['bg-[#EAB308]', 'bg-[#F97316]', 'bg-[#EF4444]'] as const;

function AttemptIndicator({ current, max }: { current: number; max: number }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 pt-0.5" aria-hidden>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < current;
          return (
            <span
              key={i}
              className={cn(
                'size-3 shrink-0 rounded-full border',
                filled
                  ? cn(
                      'border-transparent',
                      ATTEMPT_DOT_FILL[Math.min(i, ATTEMPT_DOT_FILL.length - 1)]
                    )
                  : 'border-[#d4d4d8] bg-transparent'
              )}
            />
          );
        })}
      </div>
      <span className="text-sm font-medium text-[#1a1a1a]">
        {current} of {max}
      </span>
    </div>
  );
}

function ReturnStatusBadge({ kind }: { kind: ReturnBadgeKind }): React.JSX.Element {
  const { label, className } = RETURN_BADGE[kind];
  return (
    <Badge className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold leading-4', className)}>
      {label}
    </Badge>
  );
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd MMM yyyy - hh:mm a');
  } catch {
    return '-';
  }
}

function mapReturnBadgeKind(status: string): ReturnBadgeKind {
  const normalized = status.toUpperCase();
  if (normalized === 'RETURNED') return 'returned';
  if (normalized === 'RETURN_IN_TRANSIT') return 'return_in_transit';
  return 'return_initiated';
}

function TableLinkButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      className="text-left text-sm font-medium underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
      onClick={onClick}
    >
      <span className="sr-only">{label}: </span>
      {children}
    </button>
  );
}

const MAIN_GRID_COLS =
  '54px minmax(160px,1.1fr) minmax(100px,0.7fr) minmax(120px,0.85fr) minmax(180px,1fr) minmax(120px,0.75fr) minmax(140px,0.9fr) 64px';

export default function OrdersReturnedDeliveriesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const organizationId = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const {
    orderDateRange,
    quickRangeLabel,
    quickRangeOpen,
    setQuickRangeOpen,
    listQuery,
    dateQueryKey,
    handleOrderDateRangeChange,
    selectQuickRange,
  } = useOrderDateRangeFilter();
  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] = React.useState<OrdersFilterState>(emptyFilterState);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const selectedPackageStatuses = React.useMemo<DeliveryPackageStatus[]>(() => {
    if (appliedFilters.packageStatusIds.length === 0) return [];
    const expandedStatuses = appliedFilters.packageStatusIds.flatMap(
      (id) => RETURN_FILTER_STOP_STATUS_MAP[id] ?? []
    );
    return Array.from(new Set(expandedStatuses));
  }, [appliedFilters.packageStatusIds]);

  const {
    data: returnsRes,
    isFetching,
    isError,
    refetch,
  } = useGetOrderReturnsQuery(
    {
      organization_id: organizationId ?? undefined,
      page: currentPage,
      size: pageSize,
      search: debouncedSearch || undefined,
      status: selectedPackageStatuses.length > 0 ? selectedPackageStatuses : undefined,
      date_from: listQuery.date_from,
      date_to: listQuery.date_to,
    },
    { skip: !organizationId }
  );

  const [kpiPeriod, setKpiPeriod] = React.useState<KpiPeriod>('LAST_30_DAYS');
  const { data: summaryRes, isFetching: isSummaryFetching } = useGetOrderReturnsSummaryQuery(
    {
      organization_id: organizationId ?? undefined,
      period: kpiPeriod,
    },
    { skip: !organizationId }
  );

  const groups = React.useMemo<ReturnedGroup[]>(() => {
    const items = returnsRes?.data?.items ?? [];
    return items.map((item, idx) => {
      const packageRows = (item.packages ?? []).map((pkg) => ({
        id: pkg.id,
        packageId: pkg.package_id || '-',
        reason: pkg.return_reason || '-',
        statusKind: mapReturnBadgeKind(pkg.status ?? ''),
      }));
      const firstPackageStatus = item.packages?.[0]?.status ?? 'RETURN_INITIATED';
      return {
        id: item.delivery_stop_id || `${item.tracking_id}-${idx}`,
        orderId: item.order_id,
        trackingId: item.tracking_id || item.order_reference || '-',
        postalCode: item.postcode || '-',
        attemptCurrent: Math.max(0, Math.min(3, item.stop_status_events?.length ?? 0)),
        attemptMax: 3,
        previousAttempt: formatDateTime(item.initiated_at),
        nextAttempt: '-',
        stopStatusKind: mapReturnBadgeKind(firstPackageStatus),
        packages: packageRows,
      };
    });
  }, [returnsRes]);

  const displayedGroups = React.useMemo(
    () =>
      groups.filter((group) =>
        appliedFilters.attemptSteps.length === 0
          ? true
          : appliedFilters.attemptSteps.includes(group.attemptCurrent)
      ),
    [appliedFilters.attemptSteps, groups]
  );

  React.useEffect(() => {
    setExpanded((prev) => {
      const next: Record<string, boolean> = {};
      displayedGroups.forEach((group, index) => {
        next[group.id] = prev[group.id] ?? index === 0;
      });
      return next;
    });
  }, [displayedGroups]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    pageSize,
    dateQueryKey,
    appliedFilters.packageStatusIds,
    appliedFilters.attemptSteps,
  ]);

  const totalEntries = returnsRes?.data?.total ?? 0;
  const totalPages = Math.max(1, returnsRes?.data?.pages ?? 1);
  const fromEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toEntry = totalEntries === 0 ? 0 : Math.min(currentPage * pageSize, totalEntries);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const summary = summaryRes?.data;
  const summaryComparisonLabel = KPI_COMPARISON_LABELS[kpiPeriod];

  const statCards = [
    {
      label: 'Total Returns',
      value: formatOrdersMetricValue(summary?.total_returns.current),
      icon: Package,
      iconClass: 'text-[#030303]',
      changePct: summary?.total_returns.change_pct,
      unit: undefined as string | undefined,
    },
    {
      label: 'Returns In Transit',
      value: formatOrdersMetricValue(summary?.returns_in_transit.current),
      icon: Package,
      iconClass: 'text-teal-500',
      changePct: summary?.returns_in_transit.change_pct,
      unit: undefined,
    },
    {
      label: 'Avg Resolution Time',
      value: formatOrdersResolutionDays(summary?.avg_resolution_days.current),
      icon: Clock2,
      iconClass: 'text-blue-500',
      changePct: summary?.avg_resolution_days.change_pct,
      unit: 'days',
    },
  ];

  const filterBadgeCount = countActiveFilterCategories(appliedFilters);

  const toggle = (id: string): void => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Typography
                variant="h1"
                className="text-[22px] font-medium leading-normal tracking-[0.6px] text-[#1a1a1a]"
              >
                Returned Deliveries
              </Typography>
              <Typography
                variant="body"
                className="max-w-xl text-sm font-normal leading-5 text-[#71717a]"
              >
                View and track returned deliveries along with their details and reasons.
              </Typography>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <KpiPeriodSelector value={kpiPeriod} onChange={setKpiPeriod} />
            </div>
          </div>

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {statCards.map((card) => (
              <KpiCard
                key={card.label}
                icon={card.icon}
                iconClassName={card.iconClass}
                label={card.label}
                value={card.value}
                changePct={card.changePct}
                unit={card.unit}
                comparisonLabel={summaryComparisonLabel}
                isLoading={isSummaryFetching && !summary}
              />
            ))}
          </div>

          <div className="flex justify-between min-w-0 items-center gap-3 overflow-x-auto pb-0.5">
            <div className="min-w-0 max-w-xl flex-1">
              <Input
                type="search"
                leftIcon={Search}
                className="h-10 border-[#e4e4e7] bg-[#f8f8fa] placeholder:text-form-subtitle"
                placeholder="Search by tracking ID, postcode, reason..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 flex-nowrap items-center gap-3">
              <OrderQuickDateRangePopover
                label={quickRangeLabel}
                open={quickRangeOpen}
                onOpenChange={setQuickRangeOpen}
                onSelect={selectQuickRange}
              />
              <div className="w-[min(272px,calc(100vw-3rem))] shrink-0 min-w-[220px]">
                <DateRangePicker
                  dateRange={orderDateRange}
                  onDateRangeChange={handleOrderDateRangeChange}
                  dateFormat="d MMM yyyy"
                  placeholder="Any Date"
                  className="gap-0"
                  align="end"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 gap-2 rounded-md border-[#e4e4e7] bg-white px-3 text-sm font-normal text-[#18181b]"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
                <span>Filters</span>
                <span className="flex size-[22px] items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-form-title">
                  {filterBadgeCount}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#ececf0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {isError ? (
            <ErrorState
              message="Failed to load returned deliveries"
              description="Unable to fetch returned deliveries right now. Please retry."
              onRetry={() => void refetch()}
            />
          ) : !isFetching && displayedGroups.length === 0 ? (
            <EmptyState
              message="No returned deliveries found"
              description="Try adjusting your filters or date range."
            />
          ) : (
            <div className="min-w-[1100px]">
              <div
                className="grid items-center border-b border-[#ececf0] bg-[#fafafa] text-sm font-medium text-[#52525b]"
                style={{ gridTemplateColumns: MAIN_GRID_COLS }}
              >
                <div className="py-3" aria-hidden />
                <div className="px-2 py-3">Tracking ID</div>
                <div className="px-2 py-3">Postal Code</div>
                <div className="px-2 py-3">Attempt Status</div>
                <div className="px-2 py-3">Previous Attempt</div>
                <div className="px-2 py-3">Next Attempt</div>
                <div className="px-2 py-3">Stop Status</div>
                <div className="px-2 py-3 text-right">Action</div>
              </div>

              {isFetching ? (
                <div className="flex min-h-[220px] items-center justify-center px-4 py-10">
                  <span className="inline-flex items-center rounded-md bg-[#f8f8fa] px-3 py-1.5 text-sm text-[#71717a]">
                    Loading returned deliveries...
                  </span>
                </div>
              ) : (
                displayedGroups.map((group) => {
                  const isOpen = expanded[group.id] ?? false;
                  return (
                    <div key={group.id} className="border-b border-[#ececf0] last:border-b-0">
                      <div
                        className="grid items-center gap-0 bg-white"
                        style={{ gridTemplateColumns: MAIN_GRID_COLS }}
                      >
                        <div className="flex items-center justify-center py-3">
                          <button
                            type="button"
                            className="flex size-[30px] items-center justify-center rounded-md border border-form-border bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-gray-50"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                            onClick={() => toggle(group.id)}
                          >
                            {isOpen ? (
                              <ChevronUp className="size-4 text-gray-700" aria-hidden />
                            ) : (
                              <ChevronDown className="size-4 text-gray-700" aria-hidden />
                            )}
                          </button>
                        </div>
                        <div className="px-2 py-3">
                          <TableLinkButton
                            label="Open tracking"
                            onClick={() => {
                              void navigate(
                                `/deliveries/${encodeURIComponent(group.orderId)}/stop/${encodeURIComponent(group.id)}`
                              );
                            }}
                          >
                            {group.trackingId}
                          </TableLinkButton>
                        </div>
                        <div className="px-2 py-3 text-sm font-medium text-[#1a1a1a]">
                          {group.postalCode}
                        </div>
                        <div className="px-2 py-3">
                          <AttemptIndicator current={group.attemptCurrent} max={group.attemptMax} />
                        </div>
                        <div className="px-2 py-3 text-sm font-medium text-[#1a1a1a]">
                          {group.previousAttempt}
                        </div>
                        <div className="px-2 py-3 text-sm font-medium text-[#1a1a1a]">
                          {group.nextAttempt}
                        </div>
                        <div className="px-2 py-3">
                          <ReturnStatusBadge kind={group.stopStatusKind} />
                        </div>
                        <div className="flex items-center justify-end px-2 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label="Row actions"
                                className="flex size-8 items-center justify-center rounded-md text-[#52525b] transition-colors hover:bg-gray-100"
                              >
                                <MoreVertical className="size-4" aria-hidden />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  void navigate(
                                    `/deliveries/${encodeURIComponent(group.orderId)}/stop/${encodeURIComponent(group.id)}`
                                  );
                                }}
                              >
                                View Stop Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {isOpen && group.packages.length > 0 && (
                        <div className="border-t border-[#E5E2EC] bg-[#F4F2F7] px-1 pb-1 pt-0">
                          <div
                            className="grid items-center border-b border-[#e5e5e5] text-sm font-medium text-[#52525b]"
                            style={{ gridTemplateColumns: MAIN_GRID_COLS }}
                          >
                            <div className="py-2.5" aria-hidden />
                            <div className="px-2 py-2.5">Package ID</div>
                            <div className="col-span-2 px-2 py-2.5">Reason</div>
                            <div className="col-span-3 px-2 py-2.5">Package Status</div>
                            <div className="px-2 py-2.5 text-right">Action</div>
                          </div>
                          {group.packages.map((pkg, idx) => (
                            <div
                              key={`${group.id}-${pkg.packageId}-${idx}`}
                              className={cn(
                                'grid items-center border-b border-[#e8e8e8] last:border-b-0',
                                idx === group.packages.length - 1 && 'rounded-b-lg'
                              )}
                              style={{ gridTemplateColumns: MAIN_GRID_COLS }}
                            >
                              <div className="min-h-[48px]" aria-hidden />
                              <div className="px-2 py-3">
                                <TableLinkButton
                                  label="Open package"
                                  onClick={() => {
                                    void navigate(
                                      `/deliveries/${encodeURIComponent(group.orderId)}/stop/${encodeURIComponent(group.id)}?package=${encodeURIComponent(pkg.id)}`
                                    );
                                  }}
                                >
                                  {pkg.packageId}
                                </TableLinkButton>
                              </div>
                              <div className="col-span-2 px-2 py-3 text-sm font-medium text-[#1a1a1a]">
                                {pkg.reason}
                              </div>
                              <div className="col-span-3 px-2 py-3">
                                <ReturnStatusBadge kind={pkg.statusKind} />
                              </div>
                              <div className="flex items-center justify-end px-2 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label="Package actions"
                                      className="flex size-8 items-center justify-center rounded-md text-[#52525b] transition-colors hover:bg-gray-100"
                                    >
                                      <MoreVertical className="size-4" aria-hidden />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        void navigate(
                                          `/deliveries/${encodeURIComponent(group.orderId)}/stop/${encodeURIComponent(group.id)}?package=${encodeURIComponent(pkg.id)}`
                                        );
                                      }}
                                    >
                                      View Package Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 text-sm font-medium text-form-title">
            <span className="px-2.5 py-2 leading-5">Show</span>
            <select
              className="h-10 rounded-md border border-form-border-light bg-white px-3 text-sm font-medium text-form-title"
              aria-label="Rows per page"
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="px-1 py-2 text-sm leading-5">
              {fromEntry}-{toEntry} entries out of {totalEntries}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-10 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-form-title opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
            {visiblePages.map((page, idx) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex size-9 items-center justify-center text-form-title"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-md text-sm font-medium',
                    page === currentPage
                      ? 'border border-[#e4e4e7] bg-white text-form-title'
                      : 'text-form-title hover:bg-white/80'
                  )}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              className="flex h-10 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-form-title hover:bg-white/80 disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <OrdersFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        context="returned"
        applied={appliedFilters}
        onApply={setAppliedFilters}
      />
    </>
  );
}
