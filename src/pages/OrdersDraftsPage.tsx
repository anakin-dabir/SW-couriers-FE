import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker, EmptyState, ErrorState, Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { cn, getVisiblePages } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { useDeleteOrderDraftMutation, useGetOrderDraftsQuery } from '@/store/api/ordersApi';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import { DeleteDraftBookingIcon } from '@/assets/svg';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESCRIPTION,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_ICON_LARGE,
  PORTAL_MODAL_TITLE,
  PORTAL_MODAL_WRAPPER,
} from '@/lib/modalStyles';

interface DraftRow {
  id: string;
  draftId: string;
  draftCreatedDate: string;
  createdBy: string;
  pickupAddress: string;
  deliveryStop: string;
  packageCount: string;
  totalValue: string;
}

type SortBy = 'newest' | 'oldest';

function formatDraftCreatedDate(value: string): string {
  try {
    return format(parseISO(value), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '-';
  }
}

function formatCurrencyValue(raw: string): string {
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return '-';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function formatCount(count: number): string {
  if (!Number.isFinite(count)) return '-';
  return count.toString().padStart(2, '0');
}

export default function OrdersDraftsPage(): React.JSX.Element {
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
  const [sortBy, setSortBy] = React.useState<SortBy>('newest');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [draftDateRange, setDraftDateRange] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const dateFrom = draftDateRange?.from ? format(draftDateRange.from, 'yyyy-MM-dd') : undefined;
  const dateTo = draftDateRange?.to ? format(draftDateRange.to, 'yyyy-MM-dd') : undefined;

  const {
    data: draftsRes,
    isFetching,
    isError,
    refetch,
  } = useGetOrderDraftsQuery(
    {
      organization_id: organizationId ?? undefined,
      page: currentPage,
      size: pageSize,
      search: debouncedSearch || undefined,
      date_from: dateFrom,
      date_to: dateTo,
    },
    { skip: !organizationId }
  );
  const [deleteOrderDraft, { isLoading: isDeleting }] = useDeleteOrderDraftMutation();

  const rows = React.useMemo<DraftRow[]>(() => {
    const items = draftsRes?.data?.items ?? [];
    const mapped = items.map((item) => ({
      id: item.id,
      draftId: item.draft_id || '-',
      draftCreatedDate: formatDraftCreatedDate(item.created_at),
      createdBy: item.created_by?.trim() || item.contact_name || '-',
      pickupAddress: item.pickup_address || '-',
      deliveryStop: formatCount(item.delivery_stop_count),
      packageCount: formatCount(item.package_count),
      totalValue: formatCurrencyValue(item.total_value),
    }));
    if (sortBy === 'oldest') return mapped;
    return [...mapped].reverse();
  }, [draftsRes, sortBy]);

  const totalEntries = draftsRes?.data?.total ?? 0;
  const totalPages = Math.max(1, draftsRes?.data?.pages ?? 1);
  const fromEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toEntry = totalEntries === 0 ? 0 : Math.min(currentPage * pageSize, totalEntries);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize, dateFrom, dateTo]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const [pendingDelete, setPendingDelete] = React.useState<DraftRow | null>(null);

  const handleDeleteDraft = (row: DraftRow): void => {
    setPendingDelete(row);
  };

  const confirmDeleteDraft = async (): Promise<void> => {
    if (!organizationId || !pendingDelete) return;
    try {
      const result = await deleteOrderDraft({
        draft_id: pendingDelete.id,
        organization_id: organizationId,
      }).unwrap();
      notifyApiSuccess(result, { message: 'Draft deleted' });
      setPendingDelete(null);
    } catch (error) {
      notifyApiError(error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Typography
              variant="h1"
              className="text-[22px] font-medium leading-normal tracking-[0.6px] text-[#1a1a1a]"
            >
              Draft Orders
            </Typography>
            <Typography
              variant="body"
              className="max-w-xl text-sm font-normal leading-5 text-[#71717a]"
            >
              View, filter, and manage all draft bookings.
            </Typography>
          </div>
          <Button
            type="button"
            className="h-10 gap-2 rounded-lg bg-[#ae2224] px-4 text-base font-normal tracking-wide text-white shadow-sm hover:bg-[#951d1f]"
            onClick={() => void navigate('/deliveries/pending')}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Create New Order
          </Button>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3 overflow-x-auto pb-0.5">
          <div className="min-w-0 max-w-xl flex-1">
            <Input
              type="search"
              leftIcon={Search}
              className="h-10 border-[#e4e4e7] bg-[#f8f8fa] placeholder:text-[#858594]"
              placeholder="Search by draft ID, pickup address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-[129px] shrink-0 justify-between gap-2 rounded-md border-[#e4e4e7] bg-white px-3 text-sm font-normal text-[#18181b]"
              onClick={() => setSortBy((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            >
              {sortBy === 'newest' ? 'Newest first' : 'Oldest first'}
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </Button>
            <div className="w-[min(272px,calc(100vw-3rem))] min-w-[220px] shrink-0">
              <DateRangePicker
                dateRange={draftDateRange}
                onDateRangeChange={setDraftDateRange}
                dateFormat="d MMM yyyy"
                placeholder="Select date range"
                className="gap-0"
                align="end"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-2xl border border-[rgba(224,224,224,0.3)] bg-[#f9f9f9] p-5">
        {isError ? (
          <ErrorState
            message="Failed to load draft orders"
            description="Unable to fetch draft orders right now. Please retry."
            onRetry={() => void refetch()}
          />
        ) : !isFetching && rows.length === 0 ? (
          <EmptyState
            message="No draft orders found"
            description="Create a new order draft or adjust your filters."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[#ececf0] bg-white">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#f0f0f3] bg-[#fafafa]">
                    {[
                      'Draft ID',
                      'Draft Created Date',
                      'Created By',
                      'Pickup Address',
                      'Delivery Stop',
                      'Package Count',
                      'Total Value',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-3 py-2.5 text-sm font-medium capitalize text-[#464649]',
                          h === 'Actions' && 'text-right',
                          h === 'Draft ID' && 'pl-4',
                          h === 'Actions' && 'pr-4'
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <span className="inline-flex items-center rounded-md bg-[#f8f8fa] px-3 py-1.5 text-sm text-[#71717a]">
                          Loading draft orders...
                        </span>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-b border-[#f5f5f6] last:border-b-0">
                        <td className="px-3 py-3 pl-4 align-middle">
                          <button
                            type="button"
                            className="text-sm font-medium text-[#1a1a1a] underline decoration-solid underline-offset-2 hover:text-primary-600"
                            onClick={() =>
                              void navigate(
                                `/deliveries/pending?draftId=${encodeURIComponent(row.id)}`
                              )
                            }
                          >
                            {row.draftId}
                          </button>
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-sm font-medium capitalize text-[#1a1a1a]">
                          {row.draftCreatedDate}
                        </td>
                        <td className="max-w-[130px] truncate px-3 py-3 text-sm font-medium capitalize text-[#1a1a1a]">
                          {row.createdBy}
                        </td>
                        <td className="max-w-[260px] truncate px-3 py-3 text-sm font-medium text-[#1a1a1a]">
                          {row.pickupAddress}
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
                        <td className="px-3 py-3 pr-4 text-right align-middle">
                          <div className="inline-flex justify-end gap-2">
                            <button
                              type="button"
                              className="flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[#cbcbd8] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-gray-50"
                              aria-label={`Edit draft ${row.draftId}`}
                              onClick={() =>
                                void navigate(
                                  `/deliveries/pending?draftId=${encodeURIComponent(row.id)}`
                                )
                              }
                            >
                              <Pencil
                                className="size-4 text-gray-600"
                                strokeWidth={1.75}
                                aria-hidden
                              />
                            </button>
                            <button
                              type="button"
                              className="flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[#ffd1d0] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-red-50 disabled:opacity-50"
                              aria-label={`Delete draft ${row.draftId}`}
                              onClick={() => void handleDeleteDraft(row)}
                              disabled={isDeleting}
                            >
                              <Trash2
                                className="size-4 text-red-500"
                                strokeWidth={1.75}
                                aria-hidden
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 text-sm font-medium text-[#030303]">
                <span className="px-2.5 py-2 leading-5">Show</span>
                <select
                  className="h-10 rounded-md border border-[#e5e5ec] bg-white px-3 text-sm font-medium text-[#030303]"
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
                  className="flex h-10 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-[#030303] disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Previous
                </button>
                {visiblePages.map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex size-9 items-center justify-center text-[#030303]"
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
                        currentPage === page
                          ? 'border border-[#e4e4e7] bg-white text-[#030303]'
                          : 'text-[#030303] hover:bg-white/80'
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="flex h-10 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-[#030303] disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className={PORTAL_MODAL_WRAPPER}>
          <div className={PORTAL_MODAL_BODY}>
            <div className="flex flex-col items-center">
              <img src={DeleteDraftBookingIcon} alt="" className={PORTAL_MODAL_ICON_LARGE} />
            </div>
            <DialogTitle className={PORTAL_MODAL_TITLE}>
              Delete Draft Booking{pendingDelete ? ` # ${pendingDelete.draftId}` : ''}?
            </DialogTitle>
            <DialogDescription className={PORTAL_MODAL_DESCRIPTION}>
              Are you sure you want to delete this draft booking? All associated data will be
              permanently removed.
            </DialogDescription>
          </div>

          <div className={PORTAL_MODAL_FOOTER}>
            <div className={PORTAL_MODAL_FOOTER_ROW}>
              <Button
                type="button"
                variant="outline"
                className={PORTAL_MODAL_CANCEL_BTN}
                onClick={() => setPendingDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={PORTAL_MODAL_DESTRUCTIVE_BTN}
                onClick={() => void confirmDeleteDraft()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete Draft'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
