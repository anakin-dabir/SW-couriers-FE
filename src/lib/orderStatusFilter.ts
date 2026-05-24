import type { OrderStatus } from '@/store/api/ordersApi';

/** API enum → display label (orders list & dashboard recent orders). */
export const ORDER_STATUS_API_TO_LABEL: Record<OrderStatus, string> = {
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

export function getOrderStatusLabel(status: string): string {
  const mapped = ORDER_STATUS_API_TO_LABEL[status as OrderStatus];
  if (mapped) return mapped;
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Order status filter options — aligned with Figma node 303:64272 (B2B clients).
 * `id` matches booking row `status` strings for filtering.
 */
export interface OrderStatusFilterOption {
  id: string;
  label: string;
  /** Tailwind background (+ text-white applied in UI) */
  badgeClassName: string;
}

export const ORDER_STATUS_FILTER_OPTIONS: OrderStatusFilterOption[] = [
  { id: 'Pending Pickup', label: 'Pending Pickup', badgeClassName: 'bg-[#9ca3af]' },
  { id: 'Pickup Scheduled', label: 'Pickup Scheduled', badgeClassName: 'bg-amber-500' },
  { id: 'Pickup On Route', label: 'Pickup On Route', badgeClassName: 'bg-blue-500' },
  { id: 'Enroute warehouse', label: 'Enroute warehouse', badgeClassName: 'bg-blue-700' },
  { id: 'At Warehouse', label: 'At Warehouse', badgeClassName: 'bg-violet-500' },
  { id: 'Sorting in Progress', label: 'Sorting in Progress', badgeClassName: 'bg-violet-700' },
  { id: 'Delivery in Progress', label: 'Delivery in Progress', badgeClassName: 'bg-teal-700' },
  { id: 'Partially Delivered', label: 'Partially Delivered', badgeClassName: 'bg-emerald-600' },
  { id: 'Delivered', label: 'Delivered', badgeClassName: 'bg-emerald-500' },
  { id: 'Failed', label: 'Failed', badgeClassName: 'bg-red-500' },
  { id: 'Cancelled', label: 'Cancelled', badgeClassName: 'bg-slate-600' },
  { id: 'Return in Progress', label: 'Return in Progress', badgeClassName: 'bg-amber-500' },
  { id: 'Return in Transit', label: 'Return in Transit', badgeClassName: 'bg-teal-600' },
  { id: 'Returned', label: 'Returned', badgeClassName: 'bg-slate-800' },
];

export function createFullOrderStatusSelection(): Set<string> {
  return new Set(ORDER_STATUS_FILTER_OPTIONS.map((o) => o.id));
}

export function orderStatusBadgeClass(status: string): string {
  const found = ORDER_STATUS_FILTER_OPTIONS.find((o) => o.id === status);
  return found?.badgeClassName ?? 'bg-slate-500';
}
