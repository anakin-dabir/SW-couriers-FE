export const STATUS_COLOR_MAP: Record<string, string> = {
  PENDING_PICKUP: 'bg-[#9CA3AF] text-white',
  PICKUP_SCHEDULED: 'bg-[#F59E0B] text-white',
  ENROUTE_PICKUP: 'bg-[#3B82F6] text-white',
  ENROUTE_WAREHOUSE: 'bg-[#1D4ED8] text-white',
  AT_WAREHOUSE: 'bg-[#8B5CF6] text-white',
  SORTING_IN_PROGRESS: 'bg-[#7C3AED] text-white',
  DELIVERY_SCHEDULED: 'bg-[#0F766E] text-white',
  LOADED_FOR_DELIVERY: 'bg-[#0F766E] text-white',
  OUT_FOR_DELIVERY: 'bg-[#0F766E] text-white',
  DELIVERY_IN_PROGRESS: 'bg-[#0F766E] text-white',
  PARTIALLY_DELIVERED: 'bg-[#059669] text-white',
  DELIVERED: 'bg-[#10B981] text-white',
  DELIVERED_TO_CUSTOMER: 'bg-[#10B981] text-white',
  LEFT_AT_SAFE_PLACE: 'bg-[#10B981] text-white',
  FAILED: 'bg-[#EF4444] text-white',
  DELIVERY_ATTEMPT_1_FAILED: 'bg-[#EF4444] text-white',
  DELIVERY_ATTEMPT_2_FAILED: 'bg-[#EF4444] text-white',
  DELIVERY_ATTEMPT_3_FAILED: 'bg-[#EF4444] text-white',
  CANCELLED: 'bg-[#475569] text-white',
  RETURN_INITIATED: 'bg-[#F59E0B] text-white',
  RETURN_IN_PROGRESS: 'bg-[#F59E0B] text-white',
  RETURN_IN_TRANSIT: 'bg-[#0D9488] text-white',
  RETURNED: 'bg-[#1E293B] text-white',
  DISPOSED: 'bg-[#1E293B] text-white',
  CUSTOMER_NOT_HOME: 'bg-[#EF4444] text-white',
  REFUSED_BY_CUSTOMER: 'bg-[#EF4444] text-white',
  MISSING: 'bg-[#EF4444] text-white',
  DAMAGED: 'bg-[#EF4444] text-white',
};

const STATUS_LABEL_TO_KEY: Record<string, string> = {
  'Pending Pickup': 'PENDING_PICKUP',
  'Pickup Scheduled': 'PICKUP_SCHEDULED',
  'Pickup On Route': 'ENROUTE_PICKUP',
  'Enroute Pickup': 'ENROUTE_PICKUP',
  'Enroute warehouse': 'ENROUTE_WAREHOUSE',
  'Enroute Warehouse': 'ENROUTE_WAREHOUSE',
  'At Warehouse': 'AT_WAREHOUSE',
  'Sorting in Progress': 'SORTING_IN_PROGRESS',
  'Delivery Scheduled': 'DELIVERY_SCHEDULED',
  'Loaded for Delivery': 'LOADED_FOR_DELIVERY',
  'Out for Delivery': 'OUT_FOR_DELIVERY',
  'Delivery in Progress': 'OUT_FOR_DELIVERY',
  'Partially Delivered': 'PARTIALLY_DELIVERED',
  Delivered: 'DELIVERED',
  'Delivered Successfully': 'DELIVERED',
  Failed: 'FAILED',
  Cancelled: 'CANCELLED',
  'Return in Progress': 'RETURN_IN_PROGRESS',
  'Return Initiated': 'RETURN_INITIATED',
  'Return in Transit': 'RETURN_IN_TRANSIT',
  Returned: 'RETURNED',
};

export function statusBadgeClass(status?: string | null): string {
  if (!status) return 'bg-gray-200 text-gray-700';
  const key = STATUS_LABEL_TO_KEY[status] ?? status.toUpperCase().replace(/[\s-]+/g, '_');
  return STATUS_COLOR_MAP[key] ?? 'bg-gray-200 text-gray-700';
}

export const TERMINAL_STATUSES = new Set<string>([
  'CANCELLED',
  'RETURNED',
  'DISPOSED',
  'DELIVERED',
  'DELIVERED_TO_CUSTOMER',
  'LEFT_AT_SAFE_PLACE',
  'PARTIALLY_DELIVERED',
  'FAILED',
]);
