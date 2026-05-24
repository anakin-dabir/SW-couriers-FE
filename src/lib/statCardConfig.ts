import type { LucideIcon } from 'lucide-react';
import {
  BadgePoundSterling,
  ReceiptPoundSterling,
  Package,
  Truck,
  PackageX,
  PackageCheck,
} from 'lucide-react';

export interface StatCardConfigEntry {
  Icon: LucideIcon;
  iconColorClass: string;
}

/**
 * Billing stat card config (Total Unpaid, Overdue, Unpaid, Paid Invoices).
 * Icons: BadgePoundSterling (Total Unpaid), ReceiptPoundSterling (Overdue / Unpaid / Paid).
 */
export const STAT_CARD_CONFIG_BILLING: Record<string, StatCardConfigEntry> = {
  'total-unpaid': {
    Icon: BadgePoundSterling,
    iconColorClass: 'text-gray-600',
  },
  'overdue-invoices': {
    Icon: ReceiptPoundSterling,
    iconColorClass: 'text-red-500',
  },
  'unpaid-invoices': {
    Icon: ReceiptPoundSterling,
    iconColorClass: 'text-orange-500',
  },
  'paid-invoices': {
    Icon: ReceiptPoundSterling,
    iconColorClass: 'text-green-600',
  },
};

/**
 * Dashboard (home) stat card config. Figma 3838-22076.
 * Active Deliveries, Pending Pickups, Completed Deliveries, Returns.
 * Icons: blue package, yellow truck, violet package, red return.
 */
export const STAT_CARD_CONFIG_DASHBOARD: Record<string, StatCardConfigEntry> = {
  'active-deliveries': {
    Icon: Package,
    iconColorClass: 'text-blue-600',
  },
  'pending-pickups': {
    Icon: Truck,
    iconColorClass: 'text-warning',
  },
  'completed-deliveries': {
    Icon: PackageCheck,
    iconColorClass: 'text-violet-600',
  },
  returns: {
    Icon: PackageX,
    iconColorClass: 'text-error',
  },
};
