import { TERMINAL_STATUSES } from './statusColors';

interface TimelineEventLike {
  to_status: string;
  display_label: string;
  created_at: string;
}

export interface TimelineStep {
  title: string;
  time: string;
  completed: boolean;
  isTerminal?: boolean;
}

const STOP_SKELETON: Array<{ status: string; title: string }> = [
  { status: 'PENDING_PICKUP', title: 'Pending Pickup' },
  { status: 'PICKUP_SCHEDULED', title: 'Pickup Scheduled' },
  { status: 'ENROUTE_PICKUP', title: 'Pickup On Route' },
  { status: 'ENROUTE_WAREHOUSE', title: 'Enroute Warehouse' },
  { status: 'AT_WAREHOUSE', title: 'At Warehouse' },
  { status: 'SORTING_IN_PROGRESS', title: 'Sorting in Progress' },
  { status: 'DELIVERY_SCHEDULED', title: 'Delivery Scheduled' },
  { status: 'LOADED_FOR_DELIVERY', title: 'Loaded for Delivery' },
  { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery' },
  { status: 'DELIVERED', title: 'Delivered Successfully' },
];

const PACKAGE_SKELETON: Array<{ status: string; title: string }> = [
  { status: 'PENDING_PICKUP', title: 'Pending Pickup' },
  { status: 'PICKUP_SCHEDULED', title: 'Pickup Scheduled' },
  { status: 'ENROUTE_PICKUP', title: 'Pickup On Route' },
  { status: 'ENROUTE_WAREHOUSE', title: 'Enroute Warehouse' },
  { status: 'AT_WAREHOUSE', title: 'At Warehouse' },
  { status: 'SORTING_IN_PROGRESS', title: 'Sorting in Progress' },
  { status: 'DELIVERY_SCHEDULED', title: 'Delivery Scheduled' },
  { status: 'LOADED_FOR_DELIVERY', title: 'Loaded for Delivery' },
  { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery' },
  { status: 'DELIVERED_TO_CUSTOMER', title: 'Delivered Successfully' },
];

const TERMINAL_LABELS: Record<string, string> = {
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  RETURNED: 'Returned',
  DISPOSED: 'Disposed',
  PARTIALLY_DELIVERED: 'Partially Delivered',
};

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return iso;
  }
}

function buildSkeleton(
  skeleton: Array<{ status: string; title: string }>,
  events: TimelineEventLike[]
): TimelineStep[] {
  const eventByStatus = new Map<string, TimelineEventLike>();
  for (const ev of events) {
    if (!eventByStatus.has(ev.to_status)) eventByStatus.set(ev.to_status, ev);
  }

  const terminalEvent = events.find(
    (ev) =>
      TERMINAL_STATUSES.has(ev.to_status) &&
      ev.to_status !== 'DELIVERED' &&
      ev.to_status !== 'DELIVERED_TO_CUSTOMER' &&
      ev.to_status !== 'LEFT_AT_SAFE_PLACE'
  );

  if (terminalEvent) {
    const steps: TimelineStep[] = [];
    for (const { status, title } of skeleton) {
      const ev = eventByStatus.get(status);
      if (ev) {
        steps.push({ title, time: formatEventTime(ev.created_at), completed: true });
      }
    }
    const label = TERMINAL_LABELS[terminalEvent.to_status] ?? terminalEvent.display_label;
    steps.push({
      title: label,
      time: formatEventTime(terminalEvent.created_at),
      completed: true,
      isTerminal: true,
    });
    return steps;
  }

  return skeleton.map(({ status, title }) => {
    const ev = eventByStatus.get(status);
    return {
      title,
      time: ev ? formatEventTime(ev.created_at) : '-',
      completed: Boolean(ev),
    };
  });
}

export function buildStopTimelineSkeleton(events: TimelineEventLike[] | undefined): TimelineStep[] {
  return buildSkeleton(STOP_SKELETON, events ?? []);
}

export function buildPackageTimelineSkeleton(
  events: TimelineEventLike[] | undefined
): TimelineStep[] {
  return buildSkeleton(PACKAGE_SKELETON, events ?? []);
}
