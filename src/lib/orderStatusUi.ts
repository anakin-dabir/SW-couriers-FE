/** Maps API order / stop status codes to customer-facing labels (aligned with SW-Courier-FE-Admin). */
export function mapOrderStatusToUi(status: string): string {
  const normalized = status.toUpperCase();
  const statusMap: Record<string, string> = {
    PENDING_PICKUP: 'Pending Pickup',
    PICKUP_SCHEDULED: 'Pickup Scheduled',
    PICKUP_ON_ROUTE: 'Pickup On Route',
    PICKED_UP: 'Pickup On Route',
    IN_TRANSIT_TO_WAREHOUSE: 'Enroute warehouse',
    AT_WAREHOUSE: 'At Warehouse',
    SORTING_IN_PROGRESS: 'Sorting in Progress',
    DELIVERY_IN_PROGRESS: 'Delivery in Progress',
    PARTIALLY_DELIVERED: 'Partially Delivered',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    RETURN_INITIATED: 'Return in Progress',
    RETURN_IN_PROGRESS: 'Return in Progress',
    RETURN_IN_TRANSIT: 'Return in Transit',
    RETURNED: 'Returned',
    RETURNED_TO_SENDER: 'Returned',
  };
  return statusMap[normalized] ?? status.replace(/_/g, ' ');
}
