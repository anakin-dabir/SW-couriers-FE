import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import type { HomeRecentOrderRow } from '@/lib/homeDashboard';
import { formatOrderCreatedDateTime } from '@/lib/homeDashboard';
import { orderStatusBadgeClass } from '@/lib/orderStatusFilter';
import { cn } from '@/lib/utils';

export interface RecentOrdersPanelProps {
  orders: HomeRecentOrderRow[];
  isLoading?: boolean;
  isError?: boolean;
  onViewDetails: () => void;
  onCreateOrder: () => void;
  className?: string;
}

const TABLE_HEADERS = [
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
] as const;

export function RecentOrdersPanel({
  orders,
  isLoading = false,
  isError = false,
  onViewDetails,
  onCreateOrder,
  className,
}: RecentOrdersPanelProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="my-3 flex h-7 items-center justify-between gap-3">
        <Typography component="div" className="text-xl font-semibold leading-5 text-form-title">
          Recent Orders
        </Typography>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 gap-2 border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#18181B]"
          onClick={onViewDetails}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-px w-full bg-[#F1F5F9]" />

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5EC] bg-[#F9F9F9] px-6 py-10 text-center text-sm text-[#9C9CAB]">
          Loading recent orders…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-[#FECACA] bg-[#F9F9F9] px-6 py-10 text-center text-sm text-[#B91C1C]">
          Could not load recent orders right now. Open Orders for full details.
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-[rgba(224,224,224,0.3)] bg-[#F9F9F9] p-4">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E8E8EC]">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header || 'action'}
                    className="px-2.5 py-1.5 text-sm font-medium capitalize text-[#464649] first:pl-2 last:pr-2"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => (
                <tr key={row.id} className="border-b border-[#ECECF1] bg-white last:border-b-0">
                  <td className="max-w-[140px] px-2.5 py-3 pl-2 align-middle">
                    <Link
                      to={`/deliveries/${encodeURIComponent(row.id)}`}
                      className="block truncate text-sm font-medium text-[#1A1A1A] underline decoration-solid underline-offset-2 hover:text-[#A31D21]"
                    >
                      {row.orderId}
                    </Link>
                  </td>
                  <td className="max-w-[150px] truncate whitespace-nowrap px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {formatOrderCreatedDateTime(row.createdAt)}
                  </td>
                  <td className="max-w-[130px] truncate whitespace-nowrap px-2.5 py-3 text-sm font-medium capitalize text-[#1A1A1A]">
                    {row.createdBy}
                  </td>
                  <td className="max-w-[220px] truncate px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {row.pickupAddress}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {row.pickupSchedule}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {row.deliveryStopCount}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {row.packageCount}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-sm font-medium text-[#1A1A1A]">
                    {row.totalValue}
                  </td>
                  <td className="px-2.5 py-3 align-middle">
                    <span
                      className={cn(
                        'inline-flex max-w-full rounded-full px-2.5 py-0.5 text-xs font-semibold leading-4 text-white',
                        orderStatusBadgeClass(row.statusLabel)
                      )}
                    >
                      <span className="truncate">{row.statusLabel}</span>
                    </span>
                  </td>
                  <td className="w-10 px-2.5 py-3 pr-2 text-center align-middle">
                    <Link
                      to={`/deliveries/${encodeURIComponent(row.id)}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[#9C9CAB] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
                      aria-label={`Open order ${row.orderId}`}
                    >
                      <ArrowUpRight className="size-4 shrink-0" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#E5E5EC] px-6 py-10 text-center">
          <Typography component="div" className="text-base font-semibold text-form-title">
            No orders yet!
          </Typography>
          <Typography component="div" className="mt-1 text-sm text-[#9C9CAB]">
            Create your first order to start tracking deliveries and managing bookings.
          </Typography>
          <Button
            type="button"
            className="mt-4 h-9 gap-2 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B]"
            variant="outline"
            onClick={onCreateOrder}
          >
            <Plus className="h-4 w-4" />
            Create your first order
          </Button>
        </div>
      )}
    </div>
  );
}
