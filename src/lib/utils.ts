import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  endOfDay,
  endOfYear,
  format,
  startOfDay,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import L from 'leaflet';
import { type DateRange } from 'react-day-picker';
import { type DateRangePreset, PRESET_LABELS } from './dateRangePresets';
import {
  DeliveryPackageIcon,
  DeliveryPackageIconDelivered,
  DeliveryPackageIconPending,
  TruckIcon,
  MapPinIcon,
  TruckBwIcon,
} from '@/assets/img';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns the delivery package icon URL for the given status.
 * - Pending → yellow package icon
 * - On Route → default (blue/green) package icon
 * - Delivered → delivered package icon
 */
export function getDeliveryPackageIconByStatus(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return DeliveryPackageIconDelivered;
  if (s.includes('pending')) return DeliveryPackageIconPending;
  return DeliveryPackageIcon;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Home',
    '/orders/list': 'Orders List',
    '/orders/drafts': 'Draft Orders',
    '/orders/failed-deliveries': 'Failed Deliveries',
    '/orders/returned-deliveries': 'Returned Deliveries',
    '/deliveries': 'Deliveries',
    '/deliveries/list': 'Deliveries list',
    // '/deliveries/tracking': 'Tracking Deliveries',
    '/deliveries/drafts': 'Drafts Deliveries',
    '/deliveries/pending': 'Pending Pickup',
    '/billing': 'Billing',
    '/credit-request': 'Overview',
    '/credit-request/new': 'Overview',
    '/credit-request/drafts': 'Draft Credit Applications',
    '/notifications': 'Notifications',
    '/notifications/preferences': 'Preferences',
    '/settings': 'Settings',
    '/reports': 'Reports',
    '/support': 'Support',
  };

  const pageTitle = routes[pathname] || 'Home';

  const parentRoutes: Record<string, string> = {
    '/orders/list': 'Orders',
    '/orders/drafts': 'Orders',
    '/orders/failed-deliveries': 'Orders',
    '/orders/returned-deliveries': 'Orders',
    '/deliveries/list': 'Deliveries',
    '/deliveries/tracking': 'Deliveries',
    '/deliveries/drafts': 'Deliveries',
    '/deliveries/pending': 'Deliveries',
    '/notifications/preferences': 'Notification',
    '/credit-request': 'Credit management',
    '/credit-request/drafts': 'Credit management',
  };

  const parentTitle = parentRoutes[pathname];

  // If it's a sub-page, return breadcrumb format
  if (parentTitle && pageTitle !== parentTitle) {
    return `${parentTitle} / ${pageTitle}`;
  }

  return pageTitle;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

const DELIVERIES_STATIC_SECOND_SEGMENTS = new Set(['list', 'tracking', 'drafts', 'pending']);

/** `/deliveries/:bookingId` (e.g. SWC-BK-01236) — order detail, not a static deliveries sub-route. */
function isDeliveriesOrderDetailPath(pathname: string): boolean {
  const match = /^\/deliveries\/([^/]+)$/.exec(pathname);
  if (!match) return false;
  const second = match[1];
  return !DELIVERIES_STATIC_SECOND_SEGMENTS.has(second);
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  if (pathname === '/invite-team') {
    return [{ label: 'Team Management' }, { label: 'All Team Members' }];
  }
  if (pathname === '/invite-team/create') {
    return [{ label: 'Team Management', to: '/invite-team' }, { label: 'Invite Team Member' }];
  }
  const inviteTeamDetailMatch = /^\/invite-team\/([^/]+)$/.exec(pathname);
  if (inviteTeamDetailMatch?.[1] && inviteTeamDetailMatch[1] !== 'create') {
    return [
      { label: 'Team Management', to: '/invite-team' },
      { label: 'All Team Members', to: '/invite-team' },
      { label: 'Team Member Details' },
    ];
  }

  const labelsMatch = /^\/deliveries\/([^/]+)\/labels$/.exec(pathname);
  if (labelsMatch) {
    const bookingId = labelsMatch[1];
    if (!DELIVERIES_STATIC_SECOND_SEGMENTS.has(bookingId)) {
      return [
        { label: 'Deliveries', to: '/deliveries' },
        { label: 'Order Details', to: `/deliveries/${encodeURIComponent(bookingId)}` },
        { label: 'Labels' },
      ];
    }
  }

  const stopMatch = /^\/deliveries\/([^/]+)\/stop\/([^/]+)$/.exec(pathname);
  if (stopMatch) {
    const bookingId = stopMatch[1];
    if (!DELIVERIES_STATIC_SECOND_SEGMENTS.has(bookingId)) {
      return [
        { label: 'Deliveries', to: '/deliveries' },
        { label: 'Order Details', to: `/deliveries/${encodeURIComponent(bookingId)}` },
        { label: 'Stop details' },
      ];
    }
  }

  if (isDeliveriesOrderDetailPath(pathname)) {
    return [{ label: 'Deliveries', to: '/deliveries' }, { label: 'Order Details' }];
  }

  const invoiceDetailMatch = /^\/billing\/invoices\/([^/]+)$/.exec(pathname);
  if (invoiceDetailMatch?.[1]) {
    return [
      { label: 'Billings', to: '/billing/invoices' },
      { label: 'Invoices', to: '/billing/invoices' },
      { label: 'Invoice Details' },
    ];
  }

  const routes: Record<string, string> = {
    '/dashboard': 'Home',
    '/orders/list': 'Orders List',
    '/orders/drafts': 'Draft Orders',
    '/orders/failed-deliveries': 'Failed Deliveries',
    '/orders/returned-deliveries': 'Returned Deliveries',
    '/deliveries': 'Deliveries',
    '/deliveries/list': 'Deliveries list',
    // '/deliveries/tracking': 'Tracking Deliveries',
    '/deliveries/drafts': 'Drafts Deliveries',
    '/deliveries/pending': 'Pending Pickup',
    '/billing': 'Billing',
    '/credit-request': 'Overview',
    '/credit-request/new': 'Overview',
    '/credit-request/drafts': 'Draft Credit Applications',
    '/notifications': 'Notifications',
    '/notifications/preferences': 'Preferences',
    '/settings': 'Settings',
    '/reports': 'Reports',
    '/support': 'Support',
  };

  const parentRoutes: Record<string, { label: string; to: string }> = {
    '/orders/list': { label: 'Orders', to: '/orders' },
    '/orders/drafts': { label: 'Orders', to: '/orders' },
    '/orders/failed-deliveries': { label: 'Orders', to: '/orders' },
    '/orders/returned-deliveries': { label: 'Orders', to: '/orders' },
    '/deliveries/list': { label: 'Deliveries', to: '/deliveries' },
    '/deliveries/tracking': { label: 'Deliveries', to: '/deliveries' },
    '/deliveries/drafts': { label: 'Deliveries', to: '/deliveries' },
    '/deliveries/pending': { label: 'Deliveries', to: '/deliveries' },
    '/notifications/preferences': { label: 'Notifications', to: '/notifications' },
    '/credit-request': { label: 'Credit management', to: '/credit-request' },
    '/credit-request/new': { label: 'Credit management', to: '/credit-request' },
    '/credit-request/drafts': { label: 'Credit management', to: '/credit-request' },
  };

  const items: BreadcrumbItem[] = [];
  const parent = parentRoutes[pathname];
  const currentLabel = routes[pathname] || 'Home';

  if (parent) {
    items.push({ label: parent.label, to: parent.to });
  }

  items.push({ label: currentLabel });

  return items;
}

export function isRightGradientPage(pathname: string): boolean {
  return pathname.includes('/register') || pathname.includes('/forgot-password');
}

export function getHeroContent(pathname: string): { title: string; description: string } {
  if (pathname.includes('/register')) {
    return {
      title: 'Create your account',
      description:
        'Join thousands of businesses using SW Couriers to streamline their logistics and manage deliveries efficiently.',
    };
  }
  if (pathname.includes('/forgot-password')) {
    return {
      title: 'Reset your password',
      description:
        'Securely reset your password and regain access to your SW Couriers account in just a few steps.',
    };
  }
  return {
    title: 'Sign in to your account',
    description:
      'Track deliveries in real time, manage invoices with ease, and keep complete control of your logistics — all in one secure portal.',
  };
}

export function getPresetRange(
  preset: DateRangePreset,
  currentRange?: DateRange
): DateRange | undefined {
  const today = new Date();
  switch (preset) {
    case 'today': {
      const range: DateRange = {
        from: startOfDay(today),
        to: endOfDay(today),
      };
      return range;
    }
    case 'lastWeek': {
      const range: DateRange = {
        from: startOfDay(subWeeks(today, 1)),
        to: endOfDay(today),
      };
      return range;
    }
    case 'lastMonth': {
      const range: DateRange = {
        from: startOfDay(subMonths(today, 1)),
        to: endOfDay(today),
      };
      return range;
    }
    case 'lastYear': {
      const previousYear = subYears(today, 1);
      const range: DateRange = {
        from: startOfDay(startOfYear(previousYear)),
        to: endOfDay(endOfYear(previousYear)),
      };
      return range;
    }
    case 'custom':
      return currentRange;
    default:
      return undefined;
  }
}

export function formatDateRangeDisplay(preset: DateRangePreset, dateRange?: DateRange): string {
  if (
    preset === 'custom' &&
    dateRange &&
    dateRange.from &&
    dateRange.to &&
    dateRange.from instanceof Date &&
    dateRange.to instanceof Date
  ) {
    const fromDate = dateRange.from;
    const toDate = dateRange.to;
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`;
  }
  return PRESET_LABELS[preset] || '';
}

export function getVisiblePages(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
  }

  return pages;
}

export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[£,\s]/g, '')) : value;

  if (isNaN(numericValue)) {
    return typeof value === 'string' ? value : String(value);
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(numericValue);
}

export function formatStatementDateRange(dateRange?: {
  from?: Date | null;
  to?: Date | null;
}): string {
  if (!dateRange?.from || !dateRange?.to) {
    return '';
  }
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
}

export function formatIssuedDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export interface StatementMetrics {
  totalPaid: number;
  totalUnpaid: number;
  totalOverdue: number;
  overdueInvoices: number;
  totalInvoiceAmount: number;
}

export function calculateStatementMetrics(
  invoices: Array<{ value: string; status: string }>
): StatementMetrics {
  return invoices.reduce(
    (acc, invoice) => {
      const value = parseFloat(invoice.value.replace(/[£,\s]/g, ''));
      if (invoice.status === 'paid') {
        acc.totalPaid += value;
      } else if (invoice.status === 'unpaid') {
        acc.totalUnpaid += value;
      } else if (invoice.status === 'overdue') {
        acc.totalOverdue += value;
        acc.overdueInvoices += 1;
      }
      acc.totalInvoiceAmount += value;
      return acc;
    },
    { totalPaid: 0, totalUnpaid: 0, totalOverdue: 0, overdueInvoices: 0, totalInvoiceAmount: 0 }
  );
}

export function createMarkerIcon(
  _isActive: boolean,
  _uniqueId: string,
  isPrimary: boolean = false
): L.DivIcon {
  // All pin points have the same opacity regardless of active/inactive status
  // Apply CSS filter to make pin primary red (#AE2224) when isPrimary is true
  const primaryStyle = isPrimary
    ? `filter: brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(7498%) hue-rotate(0deg) brightness(95%) contrast(118%);`
    : '';

  return L.divIcon({
    className: 'delivery-tracking-marker',
    html: `<img src="${MapPinIcon}" alt="Map pin" style="width: 40px; height: 40px; object-fit: contain; ${primaryStyle}" />`,
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Anchor at bottom center of pin (where the point is)
  });
}

/**
 * Creates a Leaflet DivIcon for truck marker on delivery route.
 * Uses truck.png image asset.
 *
 * @returns Leaflet DivIcon
 */
export function createTruckMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'delivery-tracking-truck-marker',
    html: `<img src="${TruckIcon}" alt="Truck" style="width: 48px; height: 48px; object-fit: contain;" />`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

/**
 * Calculates the bearing (direction) between two geographic points.
 * Returns angle in degrees (0-360) where 0 is North, 90 is East, etc.
 *
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Bearing in degrees
 */
export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
}

/**
 * Creates a Leaflet DivIcon for black and white truck marker.
 * Uses truck-bw.png image asset.
 *
 * @param bearing - Optional bearing angle in degrees (0-360) to rotate the truck icon. 0 = North, 90 = East.
 * @returns Leaflet DivIcon
 */
export function createTruckBwMarkerIcon(bearing?: number): L.DivIcon {
  const rotationStyle = bearing !== undefined ? `transform: rotate(${bearing}deg);` : '';
  // Apply grayscale filter to ensure black and white appearance
  // Ensure pointer events work on the image
  const grayscaleStyle = 'filter: grayscale(100%);';
  const pointerEventsStyle = 'pointer-events: auto; cursor: pointer;';
  return L.divIcon({
    className: 'delivery-tracking-truck-bw-marker',
    html: `<img src="${TruckBwIcon}" alt="Truck" style="width: 48px; height: 48px; object-fit: contain; ${grayscaleStyle} ${rotationStyle} ${pointerEventsStyle}" />`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

/**
 * OSRM Route Response Types
 */
interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]>; // [lng, lat]
    };
    distance: number;
    duration: number;
  }>;
  waypoints: Array<{
    location: [number, number]; // [lng, lat]
  }>;
}

/**
 * Fetches a road-based route from OSRM routing service.
 * Returns coordinates following actual roads between start and end points.
 *
 * @param start - Start point [lat, lng]
 * @param end - End point [lat, lng]
 * @returns Promise resolving to array of route coordinates [lat, lng][]
 */
export async function fetchRoadRoute(
  start: [number, number],
  end: [number, number]
): Promise<Array<[number, number]>> {
  try {
    // OSRM API expects coordinates in [lng, lat] format
    const [startLat, startLng] = start;
    const [endLat, endLng] = end;

    // Build OSRM API URL
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = (await response.json()) as OSRMRouteResponse;

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Convert GeoJSON coordinates [lng, lat] to [lat, lng] format
    const routeCoordinates = data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

    return routeCoordinates;
  } catch (error) {
    console.warn('Failed to fetch road route from OSRM:', error);
    // Fallback to straight line between points
    return [start, end];
  }
}

const DEFAULT_MARKER_RED = '#AE2224';

/**
 * Creates a Leaflet DivIcon for destination marker (white circle with stroke + flag on top).
 * Used to mark the delivery destination on the route.
 * Matches Figma design 3840-23653 (base) and 3840-23702 (flag).
 *
 * @param color - Stroke/flag color (default #AE2224)
 * @returns Leaflet DivIcon
 */
export function createDestinationMarkerIcon(color: string = DEFAULT_MARKER_RED): L.DivIcon {
  const svg = `<svg width="70" height="80" viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- Red location pin flag with package icon inside (pointing to circle center at y=50) -->
<g filter="url(#filter1_dd_3840_23702)">
<!-- Location pin from Figma (32x48, bottom point at y=50) -->
<g transform="translate(19, 2)">
<path d="M16 40C18.2091 40 20 41.7909 20 44C20 46.2091 18.2091 48 16 48C13.7909 48 12 46.2091 12 44C12 41.7909 13.7909 40 16 40ZM16 0C24.8365 0 31.9999 7.25783 32 16.2109C32 22.0198 29.0418 26.9066 25.8252 30.5127C22.5986 34.13 18.9929 36.5946 17.4248 37.584C16.5453 38.1388 15.4547 38.1388 14.5752 37.584C13.0071 36.5946 9.40142 34.13 6.1748 30.5127C2.95824 26.9066 0 22.0198 0 16.2109C7.30759e-05 7.25783 7.16345 1.14238e-07 16 0Z" fill="${color}"/>
</g>
<!-- Package icon from Figma (18x18, horizontally centered in pin) -->
<g transform="translate(26, 8)">
<g clip-path="url(#clip0_dest_package)">
<path d="M8.4375 17.4029C7.45687 17.2908 6.27157 16.9215 5.18738 16.518C3.86243 16.0248 2.60217 15.4464 1.87988 15.101C1.32364 14.8349 0.914985 14.3177 0.826091 13.6822C0.712121 12.8674 0.5625 11.3503 0.5625 8.99997C0.5625 7.14683 0.655515 5.81168 0.750731 4.93036C0.893396 4.99838 1.05716 5.07605 1.2384 5.16128C1.91408 5.47917 2.83419 5.90348 3.81004 6.32825C4.7844 6.75233 5.82154 7.17998 6.72937 7.50263C7.18305 7.66388 7.61153 7.80147 7.98791 7.89935C8.14121 7.93921 8.2923 7.97423 8.4375 8.00153V17.4029Z" fill="white"/>
<path d="M9.5625 17.4029C10.5431 17.2909 11.7284 16.9216 12.8126 16.518C14.1376 16.0249 15.3978 15.4465 16.1201 15.101C16.6764 14.8349 17.085 14.3177 17.1739 13.6822C17.2879 12.8675 17.4375 11.3503 17.4375 9.00002C17.4375 7.14696 17.3445 5.81181 17.2493 4.93048C17.1067 4.99851 16.943 5.07613 16.7618 5.16133C16.0861 5.47922 15.166 5.90353 14.1902 6.32829C13.2158 6.75238 12.1786 7.18003 11.2708 7.50268C10.8171 7.66393 10.3887 7.80152 10.0123 7.89939C9.8589 7.93929 9.70774 7.97432 9.5625 8.00162V17.4029Z" fill="white"/>
<path d="M1.87994 2.89903C1.48641 3.08728 1.16675 3.40121 0.981934 3.7938C1.16769 3.88305 1.41842 4.00271 1.71737 4.14337C2.38677 4.4583 3.29637 4.87774 4.25908 5.29673C5.22324 5.71639 6.23353 6.13249 7.10619 6.44265C7.54273 6.59779 7.93776 6.7239 8.27109 6.8106C8.61403 6.89974 8.85594 6.9375 9.00017 6.9375C9.14436 6.9375 9.38631 6.89974 9.72921 6.8106C10.0626 6.7239 10.4576 6.59779 10.8941 6.44265C11.7668 6.13249 12.7771 5.71639 13.7413 5.29673C14.704 4.87774 15.6136 4.4583 16.2829 4.14337C16.5818 4.00275 16.8325 3.88312 17.0182 3.79387C16.8334 3.40125 16.5137 3.08729 16.1202 2.89903C15.3979 2.55352 14.1376 1.97518 12.8127 1.48201C11.5112 0.997545 10.064 0.5625 9.00006 0.5625C7.93614 0.5625 6.48894 0.997545 5.18743 1.482C3.86248 1.97518 2.60223 2.55351 1.87994 2.89903Z" fill="white"/>
</g>
</g>
<!-- White circle base (centered at y=50, center x=35) - rendered on top -->
<g filter="url(#filter0_dd_3840_23653)">
<rect x="26" y="41" width="18" height="18" rx="9" fill="white"/>
<rect x="28" y="43" width="14" height="14" rx="7" stroke="${color}" stroke-width="4"/>
</g>
<defs>
<!-- Filter for white circle base -->
<filter id="filter0_dd_3840_23653" x="0" y="20" width="70" height="58" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_3840_23653"/>
<feOffset/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3840_23653"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_3840_23653"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="effect1_dropShadow_3840_23653" result="effect2_dropShadow_3840_23653"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_3840_23653" result="shape"/>
</filter>
<!-- Filter for red pin flag -->
<filter id="filter1_dd_3840_23702" x="0" y="0" width="70" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_3840_23702"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3840_23702"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3840_23702" result="shape"/>
</filter>
<!-- ClipPath for package icon -->
<clipPath id="clip0_dest_package">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;
  return L.divIcon({
    className: 'delivery-tracking-destination-marker',
    html: svg,
    iconSize: [70, 80],
    iconAnchor: [35, 50],
  });
}

/**
 * Creates a Leaflet DivIcon for route start marker (circle).
 * Used to mark the start of the delivery route.
 * Matches Figma design 3840-23660.
 *
 * @param color - Fill and stroke color (default #AE2224)
 * @returns Leaflet DivIcon
 */
export function createStartMarkerIcon(color: string = DEFAULT_MARKER_RED): L.DivIcon {
  const svg = `<svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_dd_3840_23660)">
<rect x="20" y="20" width="18" height="18" rx="9" fill="${color}"/>
<rect x="22" y="22" width="14" height="14" rx="7" stroke="${color}" stroke-width="4"/>
</g>
<defs>
<filter id="filter0_dd_3840_23660" x="0" y="0" width="58" height="58" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_3840_23660"/>
<feOffset/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3840_23660"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_3840_23660"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="effect1_dropShadow_3840_23660" result="effect2_dropShadow_3840_23660"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_3840_23660" result="shape"/>
</filter>
</defs>
</svg>`;
  return L.divIcon({
    className: 'delivery-tracking-start-marker',
    html: svg,
    iconSize: [58, 58],
    iconAnchor: [29, 29],
  });
}
