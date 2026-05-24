/**
 * Type definitions for Delivery components
 */

import type { DeliveryFiltersState } from '@/components/molecules/DeliveriesFilters';
import type { Column } from './datatable';

export type DeliveryStatus = 'pending' | 'in-transit' | 'delivered' | 'failed';

export interface Delivery {
  id: string;
  deliveryId: string;
  trackingId: string;
  recipientName: string;
  recipientAddress: string;
  contactNumber: string;
  status: DeliveryStatus;
  createdAt: string;
  scheduledDate: string;
  weight: string;
  items: string;
  value: string;
}

export interface RecentPickupData {
  trackingId: string;
  status: string;
  origin: string;
  destination: string;
  eta: string;
  distance: string;
}

/** Tracking Delivery page card data (Figma 4537-22692). */
export interface TrackingDeliveryCardData {
  id: string;
  trackingId: string;
  status: string;
  postcode: string;
  eta: string;
  distance: string;
  weight: string;
  numberOfPackages: string;
  driverName: string;
  driverAvatar?: string;
  /** Route start position [latitude, longitude] */
  routeStart: [number, number];
  /** Route destination position [latitude, longitude] */
  routeDestination: [number, number];
  /** Current truck position [latitude, longitude] - undefined if delivered */
  routeCurrent?: [number, number];
}

export interface DeliveryStatusData {
  name: string;
  value: number;
  color: string;
}

export interface DeliveryTrackingLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'active';
}

export interface DeliveryTableContentProps {
  /** Table columns */
  columns: Column<Delivery>[];
  /** Table data */
  data: Delivery[];
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Current filters */
  filters: DeliveryFiltersState;
  /** Filter change handler */
  onFiltersChange: (filters: DeliveryFiltersState) => void;
  /** Clear filters handler */
  onClearFilters: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Row click handler */
  onRowClick?: (row: Delivery) => void;
}
