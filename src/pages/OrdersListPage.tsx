import * as React from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Package, Plus, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { DateRangePicker, EmptyState, ErrorState, Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import OrderQuickDateRangePopover from '@/components/molecules/OrderQuickDateRangePopover';
import OrderStatusFilterPopover from '@/components/molecules/OrderStatusFilterPopover';
import { useOrderDateRangeFilter } from '@/hooks/useOrderDateRangeFilter';
import KpiPeriodSelector, {
  KPI_COMPARISON_LABELS,
  type KpiPeriod,
} from '@/components/common/KpiPeriodSelector';
import { createFullOrderStatusSelection, orderStatusBadgeClass } from '@/lib/orderStatusFilter';
import { formatOrderTotalGBP } from '@/lib/homeDashboard';
import { formatOrdersMetricValue } from '@/lib/ordersSummaryMetrics';
import KpiCard from '@/components/common/KpiCard';
import { cn, getVisiblePages } from '@/lib/utils';
import {
  type OrderStatus,
  useGetOrdersQuery,
  useGetOrdersSummaryQuery,
} from '@/store/api/ordersApi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

interface OrderRow {
  id: string;
  routeId: string;
  createdDate: string;
  createdBy: string;
  pickupAddress: string;
  pickupSchedule: string;
  deliveryStop: string;
  packageCount: string;
  totalValue: string;
  status: string;
}

const ORDER_STATUS_TO_LABEL: Record<OrderStatus, string> = {
  PENDING_PICKUP: 'Pending Pickup',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  ENROUTE_PICKUP: 'Pickup On Route',
  ENROUTE_WAREHOUSE: 'Enroute warehouse',
  AT_WAREHOUSE: 'At Warehouse',
  SORTING_IN_PROGRESS: 'Sorting in Progress',
  DELIVERY_IN_PROGRESS: 'Delivery in Progress',
  PARTIALLY_DELIVERED: 'Partially Delivered',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURN_IN_PROGRESS: 'Return in Progress',
  RETURN_IN_TRANSIT: 'Return in Transit',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
};

const STATUS_LABEL_TO_API: Record<string, OrderStatus> = Object.entries(
  ORDER_STATUS_TO_LABEL
).reduce(
  (acc, [apiStatus, label]) => {
    acc[label] = apiStatus as OrderStatus;
    return acc;
  },
  {} as Record<string, OrderStatus>
);

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '-';
  }
}

function formatStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_TO_LABEL[status] ?? status;
}

function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return value.toString().padStart(2, '0');
}

export default function OrdersListPage(): React.JSX.Element {
  const navigate = useNavigate();
  const organizationId = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
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
  const [selectedOrderStatuses, setSelectedOrderStatuses] = React.useState<Set<string>>(() =>
    createFullOrderStatusSelection()
  );

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const selectedStatusApiValues = React.useMemo<OrderStatus[]>(() => {
    if (selectedOrderStatuses.size === 0) return [];
    return Array.from(selectedOrderStatuses)
      .map((statusLabel) => STATUS_LABEL_TO_API[statusLabel])
      .filter((value): value is OrderStatus => Boolean(value));
  }, [selectedOrderStatuses]);

  const {
    data: ordersRes,
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery(
    {
      organization_id: organizationId ?? undefined,
      page: currentPage,
      size: pageSize,
      search: debouncedSearch || undefined,
      status: selectedStatusApiValues.length > 0 ? selectedStatusApiValues : undefined,
      date_from: listQuery.date_from,
      date_to: listQuery.date_to,
    },
    { skip: !organizationId }
  );

  const [kpiPeriod, setKpiPeriod] = React.useState<KpiPeriod>('LAST_30_DAYS');
  const { data: summaryRes, isFetching: isSummaryFetching } = useGetOrdersSummaryQuery(
    {
      organization_id: organizationId ?? undefined,
      period: kpiPeriod,
    },
    { skip: !organizationId }
  );

  const rows = React.useMemo<OrderRow[]>(() => {
    const items = ordersRes?.data?.items ?? [];
    return items.map((item) => ({
      id: item.order_id || '-',
      routeId: item.id,
      createdDate: formatDateTime(item.created_at),
      createdBy: item.created_by?.name || '-',
      pickupAddress: item.pickup_address || '-',
      pickupSchedule: '-',
      deliveryStop: formatCount(item.delivery_stop_count),
      packageCount: formatCount(item.package_count),
      totalValue: formatOrderTotalGBP(item.total_amount),
      status: formatStatusLabel(item.status),
    }));
  }, [ordersRes]);

  const totalEntries = ordersRes?.data?.total ?? 0;
  const totalPages = Math.max(1, ordersRes?.data?.pages ?? 1);
  const fromEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toEntry = totalEntries === 0 ? 0 : Math.min(currentPage * pageSize, totalEntries);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize, dateQueryKey, selectedStatusApiValues]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const summary = summaryRes?.data;
  const summaryComparisonLabel = KPI_COMPARISON_LABELS[kpiPeriod];
  const summaryCards = [
    {
      label: 'Total Booking Orders',
      value: formatOrdersMetricValue(summary?.total_orders.current),
      changePct: summary?.total_orders.change_pct,
      iconClass: 'text-violet-600',
    },
    {
      label: 'Pickups On Route',
      value: formatOrdersMetricValue(summary?.pickups_on_route.current),
      changePct: summary?.pickups_on_route.change_pct,
      iconClass: 'text-blue-500',
    },
    {
      label: 'Delivered Orders',
      value: formatOrdersMetricValue(summary?.delivered.current),
      changePct: summary?.delivered.change_pct,
      iconClass: 'text-emerald-500',
    },
    {
      label: 'Cancelled Orders',
      value: formatOrdersMetricValue(summary?.cancelled.current),
      changePct: summary?.cancelled.change_pct,
      iconClass: 'text-gray-400',
    },
    {
      label: 'Failed Orders',
      value: formatOrdersMetricValue(summary?.failed.current),
      changePct: summary?.failed.change_pct,
      iconClass: 'text-red-500',
    },
    {
      label: 'Returned Orders',
      value: formatOrdersMetricValue(summary?.returned.current),
      changePct: summary?.returned.change_pct,
      iconClass: 'text-slate-700',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page header — Figma: 22px title, 14px subtitle #808080, actions gap 12px */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Typography
              variant="h1"
              className="font-medium leading-normal tracking-[0.6px] text-[#1a1a1a] text-[22px]"
            >
              Orders
            </Typography>
            <Typography
              variant="body"
              className="max-w-xl text-sm leading-5 font-normal text-[#808080]"
            >
              View, filter, and manage all bookings placed by this client.
            </Typography>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <KpiPeriodSelector value={kpiPeriod} onChange={setKpiPeriod} />
            <Button
              type="button"
              className="h-10 gap-2 rounded-lg bg-[#ae2224] px-4 text-base font-normal tracking-wide text-white shadow-sm hover:bg-[#951d1f]"
              onClick={() => {
                void navigate('/deliveries/pending');
              }}
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              Create New Order
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {summaryCards.map((card) => (
            <KpiCard
              key={card.label}
              icon={Package}
              iconClassName={card.iconClass}
              label={card.label}
              value={card.value}
              changePct={card.changePct}
              comparisonLabel={summaryComparisonLabel}
              isLoading={isSummaryFetching && !summary}
            />
          ))}
        </div>

        {/* Filters row — search left; preset + date + status stay one row (scroll on narrow viewports) */}
        <div className="flex justify-between min-w-0 items-center gap-3 overflow-x-auto pb-0.5">
          <div className="min-w-0 max-w-xl flex-1">
            <Input
              type="search"
              leftIcon={Search}
              className="h-10 border-[#e4e4e7] bg-[#f8f8fa] placeholder:text-form-subtitle"
              placeholder="Search by order id, postcode, pickup address..."
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
            <OrderStatusFilterPopover
              selectedIds={selectedOrderStatuses}
              onSelectedIdsChange={setSelectedOrderStatuses}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#ececf0] bg-white">
        {isOrdersError ? (
          <ErrorState
            message="Failed to load orders"
            description="Unable to fetch order list right now. Please retry."
            onRetry={() => void refetchOrders()}
          />
        ) : !isOrdersFetching && rows.length === 0 ? (
          <EmptyState
            message="No orders found"
            description="Try adjusting filters or create a new order."
          />
        ) : (
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f0f0f3] bg-[#fafafa]">
                {[
                  'Order ID',
                  'Created Date',
                  'Created By',
                  'Pickup Address',
                  'Pickup Schedule',
                  'Delivery Stop',
                  'Package Count',
                  'Total Value',
                  'Status',
                  '',
                ].map((h) => (
                  <th
                    key={h || 'action'}
                    className="px-3 py-2.5 text-sm font-medium capitalize text-form-body first:pl-4 last:pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isOrdersFetching ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <span className="inline-flex items-center rounded-md bg-[#f8f8fa] px-3 py-1.5 text-sm text-[#71717a]">
                      Loading orders...
                    </span>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.routeId} className="border-b border-[#f5f5f6] last:border-b-0">
                    <td className="px-3 py-3 pl-4 align-middle">
                      <Link
                        to={`/deliveries/${encodeURIComponent(row.routeId)}`}
                        className="text-sm font-medium text-[#1a1a1a] underline decoration-solid underline-offset-2 hover:text-primary-600"
                      >
                        {row.id}
                      </Link>
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-3 text-sm font-medium capitalize text-[#1a1a1a]">
                      {row.createdDate}
                    </td>
                    <td className="max-w-[120px] truncate px-3 py-3 text-sm font-medium capitalize text-[#1a1a1a]">
                      {row.createdBy}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-sm font-medium text-[#1a1a1a]">
                      {row.pickupAddress}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-form-title">
                      {row.pickupSchedule}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-[#1a1a1a]">
                      {row.deliveryStop}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-[#1a1a1a]">
                      {row.packageCount}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-[#1a1a1a]">
                      {row.totalValue}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-4 text-white',
                          orderStatusBadgeClass(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 pr-4 text-right align-middle">
                      <button
                        type="button"
                        className="inline-flex text-gray-400 transition-colors hover:text-gray-600"
                        aria-label={`Open order ${row.id}`}
                        onClick={() => {
                          void navigate(`/deliveries/${encodeURIComponent(row.routeId)}`);
                        }}
                      >
                        <ArrowUpRight className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination — Figma: show rows selector + range left; prev / pages / next right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[#52525b]">
          <Typography variant="caption" className="text-sm text-[#52525b]">
            Show
          </Typography>
          <select
            className="h-8 rounded-md border border-[#e4e4e7] bg-white px-2 text-sm text-[#18181b]"
            aria-label="Rows per page"
            value={String(pageSize)}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <Typography variant="caption" className="text-sm text-[#71717a]">
            {fromEntry}-{toEntry} entries out of {totalEntries}
          </Typography>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#a1a1aa] hover:bg-white hover:text-[#52525b] disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </button>
          {visiblePages.map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-[#a1a1aa]">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={cn(
                  'h-8 min-w-8 rounded-md px-2 text-sm',
                  page === currentPage
                    ? 'border border-[#e4e4e7] bg-white font-semibold text-[#18181b]'
                    : 'text-[#71717a] hover:bg-white'
                )}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#18181b] hover:bg-white hover:text-[#52525b] disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
