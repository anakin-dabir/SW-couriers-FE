/**
 * Mock data constants
 * TODO: Remove this file when backend is integrated
 */

import type { BillingInvoice, BillingStat } from '@/types/billing';
import type {
  Delivery,
  DeliveryStatus,
  DeliveryStatusData,
  DeliveryTrackingLocation,
  RecentPickupData,
  TrackingDeliveryCardData,
} from '@/types/delivery';
import type { InvoiceDetail, InvoiceServiceItem, DeliveryInvoice } from '@/types/invoice';
import type { StatItem } from '@/types/stats';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { StatementMetrics } from '@/lib/utils';

export type {
  PaymentInvoiceServiceTier,
  PaymentInvoiceStopRow,
  PaymentInvoiceMock,
} from './paymentInvoiceTypes';

// Mock billing data matching the billing table design (Invoice #, Issue Date, Delivery Ref, Value, Payment Date, Status, Actions)
// Page 1 shows Inv-2001..Inv-2005 as in design; Unpaid row has View + Pay Now in actions dropdown.
// Issue date uses today so invoices pass the default "Today" date range filter from DateRangeDropdown.
const BILLING_ISSUE_DATE = format(new Date(), 'yyyy-MM-dd');
const BILLING_VALUE = '£ 1,500.00';
const BILLING_PAYMENT_DATE = '2025-08-01';

export const MOCK_BILLING_DATA: BillingInvoice[] = [
  // Page 1 — matches design: Inv-2001 (Unpaid), Inv-2002–2005 (Paid, Paid, Overdue, Paid)
  {
    id: '1',
    invoiceNumber: 'Inv-2001',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1001',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: '2',
    invoiceNumber: 'Inv-2002',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1002',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '3',
    invoiceNumber: 'Inv-2003',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1003',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '4',
    invoiceNumber: 'Inv-2004',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1004',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: '5',
    invoiceNumber: 'Inv-2005',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1005',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  // Page 2
  {
    id: '6',
    invoiceNumber: 'Inv-2006',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1006',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: '7',
    invoiceNumber: 'Inv-2007',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1007',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '8',
    invoiceNumber: 'Inv-2008',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1008',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '9',
    invoiceNumber: 'Inv-2009',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1009',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: '10',
    invoiceNumber: 'Inv-2010',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1010',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '11',
    invoiceNumber: 'Inv-2011',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1011',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '12',
    invoiceNumber: 'Inv-2012',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1012',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: '13',
    invoiceNumber: 'Inv-2013',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1013',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '14',
    invoiceNumber: 'Inv-2014',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1014',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: '15',
    invoiceNumber: 'Inv-2015',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1015',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '16',
    invoiceNumber: 'Inv-2016',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1016',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: '17',
    invoiceNumber: 'Inv-2017',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1017',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: '18',
    invoiceNumber: 'Inv-2018',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1018',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '19',
    invoiceNumber: 'Inv-2019',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1019',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '20',
    invoiceNumber: 'Inv-2020',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1020',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: '21',
    invoiceNumber: 'Inv-2021',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1021',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '22',
    invoiceNumber: 'Inv-2022',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1022',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: '23',
    invoiceNumber: 'Inv-2023',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1023',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: '24',
    invoiceNumber: 'Inv-2024',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1024',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
];

/** Dummy invoices shown in Statement modal when filtered date range returns no results */
export const STATEMENT_DUMMY_INVOICES: BillingInvoice[] = [
  {
    id: 'stmt-1',
    invoiceNumber: 'Inv-2001',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1001',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'unpaid',
  },
  {
    id: 'stmt-2',
    invoiceNumber: 'Inv-2002',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1002',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: 'stmt-3',
    invoiceNumber: 'Inv-2003',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1003',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
  {
    id: 'stmt-4',
    invoiceNumber: 'Inv-2004',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1004',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'overdue',
  },
  {
    id: 'stmt-5',
    invoiceNumber: 'Inv-2005',
    issueDate: BILLING_ISSUE_DATE,
    deliveryRef: 'DL-1005',
    value: BILLING_VALUE,
    paymentDate: BILLING_PAYMENT_DATE,
    status: 'paid',
  },
];

/** Statement / invoice slip modal footer config (shared by StatementModal and DeliveryInvoiceModal) */
export const STATEMENT_FOOTER_CONFIG: {
  logoAlt: string;
  emailLabel: string;
  email: string;
  contactLabel: string;
  contactValue: string;
  addressLabel: string;
  addressValue: string;
  shipmentHeading: string;
  shipmentLines: string[];
} = {
  logoAlt: 'SW Couriers',
  emailLabel: 'Email',
  email: 'shiftopus@gmail.com',
  contactLabel: 'Contact',
  contactValue: '+44 7700 900123',
  addressLabel: 'Address',
  addressValue: '55 Bridge End, Cardiff, CF10 2BN',
  shipmentHeading: 'How Shipment Charges Are Calculated',
  shipmentLines: [
    'Shipment cost is based on Chargeable Weight x Rate per kg.',
    'Chargeable Weight = greater of Actual Weight and Volumetric Weight.',
    'Volumetric Weight Formula: (Length x Width x Height) ÷ 5000',
  ],
};

/** Mock delivery invoice for DeliveryInvoiceModal (Figma design 3848-27958) */
export const MOCK_DELIVERY_INVOICE: DeliveryInvoice = {
  invoiceNumber: 'Inv-1004',
  referenceNumber: '#SWBHM-204612',
  status: 'overdue',
  customerName: 'Cheryl Arema',
  customerContact: '+44 7700 900123',
  issuedDate: 'December 07, 2025',
  paymentDate: 'December 22, 2025',
  services: [
    {
      items: '01',
      weight: '5 kg',
      height: '10 cm',
      width: '14 cm',
      length: '28 cm',
      value: '£ 10.00',
      total: '£ 1500.00',
      subtotal: '£ 1500.00',
    },
    {
      items: '02',
      weight: '15 kg',
      height: '21 cm',
      width: '43 cm',
      length: '11 cm',
      value: '£ 10.00',
      total: '£ 1500.00',
      subtotal: '£ 1500.00',
    },
  ],
  fuelSurcharge: '£ 1,000',
  vat: '£ 2.40',
  total: '£ 1,002.40',
};

/** Default payment details used when mapping BillingInvoice to InvoiceDetail */
const DEFAULT_INVOICE_PAYMENT_DETAILS = {
  paymentMethod: 'Card',
  cardholderName: 'Shift Opus',
  cardType: 'Visa',
  accountNumber: '**** **** **** 4532',
  noOfPackages: 2,
} as const;

/**
 * Maps a BillingInvoice to InvoiceDetail shape for InvoiceDetailsModal.
 * TODO: Replace with API that returns InvoiceDetail.
 */
const DEFAULT_INVOICE_META = {
  customerName: 'Cheryl Arema',
  customerContact: '+44 7700 900123',
  postcode: 'B6 5TR',
} as const;

/** Default services table rows for Invoice Details modal */
const DEFAULT_INVOICE_SERVICES: InvoiceServiceItem[] = [
  {
    package: '01',
    deliveryId: '#AT246NS5D',
    trackingId: '#3094763527',
    weight: '5 kg',
    dimensions: '20 x 80 x 60 cm',
    value: '£ 370.00',
  },
  {
    package: '02',
    deliveryId: '#AT246NH4D',
    trackingId: '#3094763693',
    weight: '15 kg',
    dimensions: '20 x 80 x 60 cm',
    value: '£ 100.00',
  },
];

export function mapBillingInvoiceToInvoiceDetail(foundInvoice: BillingInvoice): InvoiceDetail {
  return {
    invoiceNumber: foundInvoice.invoiceNumber,
    issueDate: foundInvoice.issueDate,
    status: foundInvoice.status,
    orderId: `#${foundInvoice.id}${foundInvoice.deliveryRef}`,
    paidOn: foundInvoice.paymentDate,
    ...DEFAULT_INVOICE_META,
    deliveryDetails: [],
    services: DEFAULT_INVOICE_SERVICES,
    paymentDetails: {
      ...DEFAULT_INVOICE_PAYMENT_DETAILS,
      timestamp: `${foundInvoice.paymentDate} 10:12AM`,
    },
    subtotal: foundInvoice.value,
    vat: '£ 2.40',
    total: foundInvoice.value,
  };
}

/** Statement summary item label keys for building summary from metrics */
const STATEMENT_SUMMARY_LABELS = {
  TOTAL_PAID: 'Total Paid',
  TOTAL_UNPAID: 'Total Unpaid',
  TOTAL_OVERDUE: 'Total Overdue',
  TOTAL_INVOICE_AMOUNT: 'Total Invoice Amount',
  VAT: 'VAT (20%)',
} as const;

/**
 * Builds summary items for StatementModal from statement metrics.
 */
export function getStatementSummaryItems(metrics: StatementMetrics): Array<{
  label: string;
  value: string;
  isTotal?: boolean;
  muted?: boolean;
}> {
  return [
    { label: STATEMENT_SUMMARY_LABELS.TOTAL_PAID, value: formatCurrency(metrics.totalPaid) },
    { label: STATEMENT_SUMMARY_LABELS.TOTAL_UNPAID, value: formatCurrency(metrics.totalUnpaid) },
    { label: STATEMENT_SUMMARY_LABELS.TOTAL_OVERDUE, value: formatCurrency(metrics.totalOverdue) },
    { label: STATEMENT_SUMMARY_LABELS.VAT, value: formatCurrency(130.4), muted: true },
    {
      label: STATEMENT_SUMMARY_LABELS.TOTAL_INVOICE_AMOUNT,
      value: formatCurrency(metrics.totalInvoiceAmount),
      isTotal: true,
    },
  ];
}

// Billing statistics data
// TODO: Remove this when backend is integrated
export const MOCK_BILLING_STATS: BillingStat[] = [
  {
    id: 'total-unpaid',
    title: 'Total Unpaid',
    value: '£ 7,500.00',
    isCritical: false,
  },
  {
    id: 'paid-invoices',
    title: 'Paid Invoices',
    value: 12,
    isCritical: false,
  },
  {
    id: 'unpaid-invoices',
    title: 'Unpaid Invoices',
    value: 18,
    isCritical: false,
  },
  {
    id: 'overdue-invoices',
    title: 'Overdue Invoices',
    value: 128,
    isCritical: false,
  },
];

/** Dashboard (home) stats. Figma 3838-22076. */
export const MOCK_DASHBOARD_STATS: StatItem[] = [
  { id: 'active-deliveries', title: 'Active Deliveries', value: 18 },
  { id: 'pending-pickups', title: 'Pending Pickups', value: 8 },
  { id: 'completed-deliveries', title: 'Completed Deliveries', value: 138 },
  { id: 'returns', title: 'Returns', value: 2 },
];

// Mock delivery data
// TODO: Remove this when backend is integrated
export const MOCK_DELIVERY_DATA: Delivery[] = [
  {
    id: '1',
    deliveryId: 'DL-1001',
    trackingId: 'TRK-1001',
    recipientName: 'John Smith',
    recipientAddress: 'H #2, Street 4, xyz, London, UK',
    contactNumber: '+44 20 7123 4567',
    status: 'in-transit',
    createdAt: '2026-01-15',
    scheduledDate: '2026-01-20',
    weight: '2.5 kg',
    items: '3',
    value: '1500.00',
  },
  {
    id: '2',
    deliveryId: 'DL-1002',
    trackingId: 'TRK-1002',
    recipientName: 'Sarah Johnson',
    recipientAddress: 'H #5, Street 8, abc, Manchester, UK',
    contactNumber: '+44 161 234 5678',
    status: 'delivered',
    createdAt: '2026-01-12',
    scheduledDate: '2026-01-18',
    weight: '1.8 kg',
    items: '2',
    value: '£ 85.00',
  },
  {
    id: '3',
    deliveryId: 'DL-1003',
    trackingId: 'TRK-1003',
    recipientName: 'Michael Brown',
    recipientAddress: 'H #12, Street 15, def, Birmingham, UK',
    contactNumber: '+44 121 345 6789',
    status: 'pending',
    createdAt: '2026-01-20',
    scheduledDate: '2026-01-25',
    weight: '3.2 kg',
    items: '5',
    value: '£ 220.00',
  },
  {
    id: '4',
    deliveryId: 'DL-1004',
    trackingId: 'TRK-1004',
    recipientName: 'Emily Davis',
    recipientAddress: 'H #8, Street 22, ghi, Liverpool, UK',
    contactNumber: '+44 151 456 7890',
    status: 'in-transit',
    createdAt: '2026-01-18',
    scheduledDate: '2026-01-22',
    weight: '1.5 kg',
    items: '1',
    value: '£ 95.00',
  },
  {
    id: '5',
    deliveryId: 'DL-1005',
    trackingId: 'TRK-1005',
    recipientName: 'David Wilson',
    recipientAddress: 'H #3, Street 7, jkl, Leeds, UK',
    contactNumber: '+44 113 567 8901',
    status: 'delivered',
    createdAt: '2026-01-10',
    scheduledDate: '2026-01-15',
    weight: '4.1 kg',
    items: '4',
    value: '£ 310.00',
  },
  {
    id: '6',
    deliveryId: 'DL-1006',
    trackingId: 'TRK-1006',
    recipientName: 'Lisa Anderson',
    recipientAddress: 'H #9, Street 11, mno, Sheffield, UK',
    contactNumber: '+44 114 678 9012',
    status: 'failed',
    createdAt: '2026-01-14',
    scheduledDate: '2026-01-19',
    weight: '2.0 kg',
    items: '2',
    value: '£ 125.00',
  },
  {
    id: '7',
    deliveryId: 'DL-1007',
    trackingId: 'TRK-1007',
    recipientName: 'Robert Taylor',
    recipientAddress: 'H #14, Street 6, pqr, Bristol, UK',
    contactNumber: '+44 117 789 0123',
    status: 'in-transit',
    createdAt: '2026-01-19',
    scheduledDate: '2026-01-24',
    weight: '2.8 kg',
    items: '3',
    value: '£ 180.00',
  },
  {
    id: '8',
    deliveryId: 'DL-1008',
    trackingId: 'TRK-1008',
    recipientName: 'Jennifer Martinez',
    recipientAddress: 'H #6, Street 19, stu, Edinburgh, UK',
    contactNumber: '+44 131 890 1234',
    status: 'pending',
    createdAt: '2026-01-21',
    scheduledDate: '2026-01-26',
    weight: '1.2 kg',
    items: '1',
    value: '£ 65.00',
  },
  {
    id: '9',
    deliveryId: 'DL-1009',
    trackingId: 'TRK-1009',
    recipientName: 'William Garcia',
    recipientAddress: 'H #11, Street 3, vwx, Glasgow, UK',
    contactNumber: '+44 141 901 2345',
    status: 'delivered',
    createdAt: '2026-01-11',
    scheduledDate: '2026-01-16',
    weight: '3.5 kg',
    items: '4',
    value: '£ 245.00',
  },
  {
    id: '10',
    deliveryId: 'DL-1010',
    trackingId: 'TRK-1010',
    recipientName: 'Amanda Lee',
    recipientAddress: 'H #7, Street 13, yza, Cardiff, UK',
    contactNumber: '+44 29 2012 3456',
    status: 'failed',
    createdAt: '2026-01-13',
    scheduledDate: '2026-01-18',
    weight: '2.3 kg',
    items: '2',
    value: '£ 140.00',
  },
  {
    id: '11',
    deliveryId: 'DL-1011',
    trackingId: 'TRK-1011',
    recipientName: 'Christopher White',
    recipientAddress: 'H #4, Street 9, bcd, Belfast, UK',
    contactNumber: '+44 28 9012 3456',
    status: 'in-transit',
    createdAt: '2026-01-17',
    scheduledDate: '2026-01-23',
    weight: '1.9 kg',
    items: '2',
    value: '£ 110.00',
  },
  {
    id: '12',
    deliveryId: 'DL-1012',
    trackingId: 'TRK-1012',
    recipientName: 'Jessica Harris',
    recipientAddress: 'H #10, Street 5, efg, Newcastle, UK',
    contactNumber: '+44 191 234 5678',
    status: 'delivered',
    createdAt: '2026-01-09',
    scheduledDate: '2026-01-14',
    weight: '3.8 kg',
    items: '3',
    value: '£ 275.00',
  },
];

/** Dashboard (home) page — welcome title, header actions, recent deliveries, placeholder cards. */
export const DASHBOARD_WELCOME_TITLE = 'Welcome, ACME Logistics!';

export const DASHBOARD_HEADER_BUTTONS = [
  // { label: 'Ongoing Deliveries', to: '/deliveries/list', variant: 'secondary' as const },
  // { label: 'Billing', to: '/billing', variant: 'secondary' as const },
  { label: 'New Pickup Request', to: '/deliveries/pending', variant: 'primary' as const },
];

/** Dashboard card titles. */
export const DELIVERY_TRACKING_TITLE = 'Delivery Tracking';
export const RECENT_PICKUP_TITLE = 'Recent Pickup';
export const DELIVERY_STATUS_TITLE = 'Delivery Status';
export const DELIVERIES_OVERVIEW_TITLE = 'Deliveries Overview';
export const RECENT_DELIVERIES_TITLE = 'Recent Deliveries';
export const VIEW_ALL_LABEL = 'View All';

/** Delivery Tracking card filter options. */
export const PENDING_PICKUP_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
];

/** Pickup Request page — form section titles and subtitles (Figma 4700-37957, 4707-38343). */
export const PICKUP_DETAIL_FORM_TITLE = 'Pickup Details';
export const PICKUP_DETAIL_FORM_SUBTITLE =
  'Provide the pickup location and contact details for the driver.';

/** Contact Name combobox — role badges match Figma searchable dropdown. */
export type PickupContactRole = 'owner' | 'logistics' | 'finance' | 'warehouse';

export interface PickupContact {
  /** Stored in `contactName` (full display name). */
  value: string;
  role: PickupContactRole;
  roleLabel: string;
}

export const PICKUP_CONTACT_NAME_LIST: PickupContact[] = [
  { value: 'Emma Clarke', role: 'owner', roleLabel: 'Owner Account' },
  { value: 'Michael Carter', role: 'logistics', roleLabel: 'Logistics Manager' },
  { value: 'Sarah Williams', role: 'finance', roleLabel: 'Finance Manager' },
  { value: 'James Porter', role: 'warehouse', roleLabel: 'Warehouse Manager' },
];

export const PICKUP_ADDRESS_FORM_TITLE = 'Pickup Address';
export const PICKUP_ADDRESS_FORM_SUBTITLE = 'Where should we collect the package from?';

/** Pickup Address — Pickup info select options (Figma 4707-38343). */
export const PICKUP_INFO_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select pickup info' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
];

/** Pickup Address — State / region select options (Figma 4707-38343). */
export const PICKUP_STATE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select state / region' },
  { value: 'England', label: 'England' },
  { value: 'Scotland', label: 'Scotland' },
  { value: 'Wales', label: 'Wales' },
  { value: 'Northern Ireland', label: 'Northern Ireland' },
];

/** Pickup step — saved address / postcode search select (Figma 6:43508). */
export const PICKUP_SAVED_ADDRESS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select a saved address or search postcode' },
  { value: 'default-depot', label: '45 Logistics Way, Blackburn BB2 2AA' },
  { value: 'london-hub', label: '12 High Street, London W8 5ED' },
  { value: 'manchester', label: 'Unit 3, Trafford Park, Manchester M17 1WA' },
];

/** Pickup nested card — country (Figma 6:43508). */
export const PICKUP_COUNTRY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select country' },
  { value: 'GB', label: 'United Kingdom' },
];

/** Pickup nested card — city select (Figma 6:43508). */
export const PICKUP_CITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select city' },
  { value: 'London', label: 'London' },
  { value: 'Manchester', label: 'Manchester' },
  { value: 'Birmingham', label: 'Birmingham' },
  { value: 'Leeds', label: 'Leeds' },
  { value: 'Blackburn', label: 'Blackburn' },
];

/** Pickup nested card — region (Figma 6:43547; maps to `state` in form schema). */
export const PICKUP_REGION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select region' },
  { value: 'England', label: 'England' },
  { value: 'Scotland', label: 'Scotland' },
  { value: 'Wales', label: 'Wales' },
  { value: 'Northern Ireland', label: 'Northern Ireland' },
];

/** Helper under saved-address field (Figma 6:43536). */
export const PICKUP_ADDRESS_HELPER_TEXT = "You can choose from the client's saved addresses.";
export const DELIVERY_ADDRESS_FORM_TITLE = 'Delivery Address';
export const DELIVERY_ADDRESS_FORM_SUBTITLE = 'Where should we deliver the package to?';

/** Pickup Request page — step indicator labels; status derived from currentStep. */
export const PICKUP_REQUEST_STEP_LABELS: Array<{ label: string; comingSoon?: boolean }> = [
  { label: 'Your Detail - Pickup Address' },
  { label: 'Package & Delivery' },
  { label: 'Review Details' },
  { label: 'Pay & Complete' },
];

/** Pickup Request page — form footer button labels (Figma 4706-38135, 4707-39264). */
export const PICKUP_FORM_FOOTER_CANCEL_LABEL = 'Cancel';
export const PICKUP_FORM_FOOTER_SAVE_DRAFT_LABEL = 'Save as draft';
export const PICKUP_FORM_FOOTER_NEXT_LABEL = 'Next';
/** Pickup step 1 primary (Figma 6:43569). */
export const PICKUP_FORM_FOOTER_SAVE_CONTINUE_LABEL = 'Save & Continue';
export const PICKUP_FORM_FOOTER_SUBMIT_LABEL = 'Submit';
/** Review step primary button (Figma 4709-40241). */
export const PICKUP_FORM_FOOTER_SUBMIT_REQUEST_LABEL = 'Submit pickup request';

/** Package & Delivery step — section title and subtitle (Figma 6:43826). */
export const PACKAGE_DELIVERY_FORM_TITLE = 'Delivery Stop Details';
export const PACKAGE_DELIVERY_FORM_SUBTITLE =
  'Enter the delivery contact, address and package information.';

/** Package & Delivery step — header action (Figma 6:43832). */
export const PACKAGE_ADD_DELIVERY_STOP_LABEL = 'Add Delivery Stop';

/** Package & Delivery step — All packages section label and Add new package button. */
export const PACKAGE_ALL_PACKAGES_LABEL = 'All packages';
export const PACKAGE_ADD_NEW_PACKAGE_LABEL = 'Add a new Package';

/** @deprecated Prefer {@link PACKAGE_ADD_DELIVERY_STOP_LABEL}. */
export const PACKAGE_ADD_MORE_ITEMS_LABEL = 'Add more items';

/** Pickup Request — Review & Submit step (Figma 4709-40210). */
export const PICKUP_REVIEW_SUBMIT_TITLE = 'Review & Submit';
export const PICKUP_REVIEW_SUBMIT_SUBTITLE = 'Review the information below and submit';
export const PICKUP_VIEW_SUMMARY_LABEL = 'View summary';

/** Pickup Request — Review Details step (Figma 6:47752). */
export const PICKUP_REVIEW_DETAILS_TITLE = 'Review Details';
export const PICKUP_REVIEW_DETAILS_SUBTITLE = 'Please review the full order before payment.';
export const REVIEW_DETAILS_BOOKING_EMAIL_BANNER =
  'A booking confirmation email will be sent to the client right away.';
export const REVIEW_DETAILS_PICKUP_SECTION_TITLE = 'Pickup Details';
export const REVIEW_DETAILS_DELIVERY_STOPS_SECTION_TITLE = 'Delivery Stops & Packages';
export const REVIEW_DETAILS_EDIT_BUTTON_LABEL = 'Edit';
export const REVIEW_DETAILS_CONTACT_NAME_LABEL = 'Contact name';
export const REVIEW_DETAILS_PICKUP_ADDRESS_LABEL = 'Pickup Address';
export const REVIEW_DETAILS_RECIPIENT_NAME_LABEL = 'Recipient name';
export const REVIEW_DETAILS_RECIPIENT_CONTACT_NUMBER_LABEL = 'Recipient Contact number';
export const REVIEW_DETAILS_RECIPIENT_EMAIL_LABEL = 'Recipient Email';
export const REVIEW_DETAILS_NO_OF_PACKAGES_LABEL = 'No of Packages';
export const REVIEW_DETAILS_POSTAL_CODE_LABEL = 'Postal Code';
export const REVIEW_DETAILS_POSTAL_ADDRESS_LABEL = 'Postal Address';
export const REVIEW_DETAILS_DELIVERY_SERVICE_LABEL = 'Delivery Service';
export const REVIEW_DETAILS_DELIVERY_PREFERENCE_LABEL = 'Delivery Preference';
export const REVIEW_DETAILS_CLIENT_NOTE_LABEL = 'Client Note';
export const REVIEW_DETAILS_DECLARED_WEIGHT_LABEL = 'Declared Weight';
export const REVIEW_DETAILS_DECLARED_VALUE_LABEL = 'Declared Value';
export const REVIEW_DETAILS_DIMENSIONS_LABEL = 'Dimensions';
export const REVIEW_DETAILS_PACKAGE_HEADING = 'Package #';
export const REVIEW_DETAILS_DELIVERY_STOP_PREFIX = 'Delivery Stop';

/** Badge text for delivery service tier on Review Details (aligned with Package & Delivery cards). */
export const DELIVERY_PACKAGE_BADGE_LABEL: Record<'4day' | '5day' | '8day', string> = {
  '4day': 'FASTEST',
  '5day': 'STANDARD',
  '8day': 'ECONOMY',
};

export const DELIVERY_INSTRUCTION_REVIEW_LABEL: Record<'signature' | 'safe_place', string> = {
  signature: 'Signature Required',
  safe_place: 'Leave at Safe Place',
};

/** Review & Submit step — card titles (Figma 4709-40534, 4709-40210). */
export const REVIEW_SUBMIT_REQUESTOR_CARD_TITLE = "Requestor's Info";
export const REVIEW_SUBMIT_PICKUP_CARD_TITLE = 'Pickup Info';
export const REVIEW_SUBMIT_DROPOFF_CARD_TITLE = 'Drop-off Info';
export const REVIEW_SUBMIT_PACKAGE_DETAILS_CARD_TITLE = 'Package Details';
export const REVIEW_SUBMIT_PAYMENT_DETAILS_CARD_TITLE = 'Payment Details';

/** Review & Submit — Requestor's Info field labels (Figma 4709-40534). */
export const REVIEW_SUBMIT_COMPANY_NAME_LABEL = 'Company name';
export const REVIEW_SUBMIT_EMAIL_LABEL = 'Email';
export const REVIEW_SUBMIT_REQUESTOR_NAME_LABEL = 'Requestor name';
export const REVIEW_SUBMIT_CONTACT_NUMBER_LABEL = 'Contact number';

/** Review & Submit — Pickup Info / Drop-off Info field labels (Figma 4709-40555, 4710-40607). */
export const REVIEW_SUBMIT_PICKUP_COMPLETE_ADDRESS_LABEL = 'Pickup complete address';
export const REVIEW_SUBMIT_DELIVERY_COMPLETE_ADDRESS_LABEL = 'Delivery complete address';
export const REVIEW_SUBMIT_NUMBER_LABEL = 'Number';
export const REVIEW_SUBMIT_PERSON_NAME_LABEL = 'Person name';
export const REVIEW_SUBMIT_PICKUP_TIME_WINDOW_LABEL = 'Pickup Time Window';
export const REVIEW_SUBMIT_ESTIMATED_DELIVERY_TIME_LABEL = 'Estimated Delivery Time';

/** Review & Submit — Package Details / Payment Details labels (Figma 4709-40210). */
export const REVIEW_SUBMIT_NUMBER_OF_PACKAGE_LABEL = 'Number of Package';
export const REVIEW_SUBMIT_DECLARED_VALUE_LABEL = 'Declared Value';
export const REVIEW_SUBMIT_DIMENSIONS_LABEL = 'Dimensions';
export const REVIEW_SUBMIT_WEIGHT_LABEL = 'Weight';
export const REVIEW_SUBMIT_PACKAGE_HEADING = 'PACKAGE #';
export const REVIEW_SUBMIT_PAYMENT_METHOD_LABEL = 'Payment Method';
export const REVIEW_SUBMIT_CARD_LABEL = 'Card';
export const REVIEW_SUBMIT_TOTAL_DELIVERY_COST_LABEL = 'Total Delivery Cost';
export const REVIEW_SUBMIT_VAT_LABEL = 'VAT';
export const REVIEW_SUBMIT_CREDIT_CARD_VALUE = 'Credit Card';
export const REVIEW_SUBMIT_VAT_INCLUDED = 'Included';

/** Review & Submit — placeholder when field not available. */
export const REVIEW_SUBMIT_NOT_PROVIDED = '—';

/** Pickup confirmation screen (Figma 58:8289). */
export const PICKUP_CONFIRMATION_ORDER_ID_LABEL = 'Order ID';
export const PICKUP_CONFIRMATION_ORDER_CREATED_TITLE = 'Order Created successfully!';
export const PICKUP_CONFIRMATION_LABELS_GENERATED_NOTE =
  'Labels have been generated for all Packages in this Order.';
export const PICKUP_CONFIRMATION_ILLUSTRATION_ALT = 'Order created';
export const PICKUP_CONFIRMATION_MASTER_SECTION_TITLE = 'Master Pickup Label';
export const PICKUP_CONFIRMATION_MASTER_BADGE = 'MASTER LABEL';
export const PICKUP_CONFIRMATION_MASTER_DESCRIPTION =
  'This is a Master label for this Booking Order. The driver can scan this label once to Collect Information of all Packages in this order.';
export const PICKUP_CONFIRMATION_DOWNLOAD_MASTER_LABEL = 'Download Master Label';
export const PICKUP_CONFIRMATION_PRINT_MASTER_LABEL = 'Print Master Label';
export const PICKUP_CONFIRMATION_WEBSITE_URL = 'www.swcouriers.co.uk';
export const PICKUP_CONFIRMATION_ORDER_ID_INLINE_LABEL = 'Order ID:';
export const PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL = 'Pickup Address:';
export const PICKUP_CONFIRMATION_MASTER_LABEL_CAPTION_PREFIX = 'Master Label: ';
export const PICKUP_CONFIRMATION_PACKAGE_SECTION_TITLE = 'Package Labels';
export const PICKUP_CONFIRMATION_PACKAGE_SECTION_SUBTITLE =
  'You can download and print labels again at anytime.';
export const PICKUP_CONFIRMATION_DOWNLOAD_ALL_LABELS = 'Download All Labels';
export const PICKUP_CONFIRMATION_PRINT_ALL_LABELS = 'Print All Labels';
export const PICKUP_CONFIRMATION_PACKAGE_INFO_BANNER =
  'Individual labels must still be attached to each package. These will be scanned by the delivery driver at delivery stop and by the warehouse team during sorting.';
export const PICKUP_LABEL_FROM = 'FROM:';
export const PICKUP_LABEL_TO = 'TO:';
export const PICKUP_LABEL_TRACKING_PREFIX = 'Tracking ID ';
export const PICKUP_LABEL_PACKAGE_ID = 'Package ID:';
export const PICKUP_LABEL_DELIVERY_STOPS = 'Delivery Stops:';
export const PICKUP_LABEL_TOTAL_PACKAGES = 'Total Packages:';
export const PICKUP_LABEL_TOTAL_WEIGHT = 'Total Weight:';
export const PICKUP_LABEL_TOTAL_VOLUME = 'Total Volume:';
export const PICKUP_LABEL_WEIGHT = 'Weight:';
export const PICKUP_LABEL_DIMENSIONS = 'Dimensions:';
export const PICKUP_LABEL_VOLUME = 'Volume:';
export const PICKUP_LABEL_RETURN_ADDRESS = 'Return Address:';
export const PICKUP_LABEL_SIGNATURE_REQUIRED = 'Signature Required:';
export const PICKUP_CONFIRMATION_DOWNLOAD_PACKAGE_LABEL = 'Download Label';
export const PICKUP_CONFIRMATION_PRINT_PACKAGE_LABEL = 'Print Label';
export const PICKUP_CONFIRMATION_COPY_BUTTON_LABEL = 'Copy';
export const PICKUP_CONFIRMATION_COPIED_FEEDBACK = 'Copied!';
export const PICKUP_CONFIRMATION_GO_PENDING_LABEL = 'Go to Pending Pickups';
export const PICKUP_CONFIRMATION_CREATE_NEW_LABEL = 'Create a new pickup';
export const PICKUP_CONFIRMATION_GO_DASHBOARD_LABEL = 'Go To Dashboard';
export const PICKUP_CONFIRMATION_FEATURE_COMING_SOON = 'This action is not available yet.';

/** @deprecated Use PICKUP_CONFIRMATION_ORDER_CREATED_TITLE — kept for any external imports. */
export const PICKUP_CONFIRMATION_SUCCESS_SUFFIX = PICKUP_CONFIRMATION_ORDER_CREATED_TITLE;
/** @deprecated Not used on new confirmation layout. */
export const PICKUP_CONFIRMATION_DELIVERY_ADDRESS_LABEL = 'Delivery Address';
/** @deprecated Not used on new confirmation layout. */
export const PICKUP_CONFIRMATION_TRACKING_ID_LABEL = 'Tracking ID #';

export interface PickupConfirmationPackageMock {
  id: string;
  packageIdDisplay: string;
  trackingIdDisplay: string;
  fromAddress: string;
  toAddress: string;
  weight: string;
  dimensions: string;
  volume: string;
  signatureRequiredValue: string;
  deliverySla: string;
  barcodeValue: string;
  qrValue: string;
}

export interface PickupConfirmationMock {
  orderIdDisplay: string;
  pickupAddress: string;
  masterLabelCode: string;
  masterBarcodeValue: string;
  masterQrValue: string;
  verticalBarcodeValue: string;
  deliveryStops: string;
  totalPackagesCount: string;
  totalWeight: string;
  totalVolume: string;
  returnAddress: string;
  /** Shown on master label card (e.g. "40 x 30 x 20 cm"). */
  totalDimensions?: string;
  packages: readonly PickupConfirmationPackageMock[];
}

/** Pickup confirmation — mock data (Figma 58:8289). */
export const MOCK_PICKUP_CONFIRMATION: PickupConfirmationMock = {
  orderIdDisplay: '# SWC-BK-01234',
  pickupAddress: 'John Smith\n21 Baker Street\nLondon, W1U 3BW\nUK',
  masterLabelCode: 'AT246NS5D',
  masterBarcodeValue: 'SWCMASTERAT246NS5D',
  masterQrValue: 'https://www.swcouriers.co.uk/track?order=SWC-BK-01234&type=master',
  verticalBarcodeValue: 'SWC-BK-01234-MASTER',
  deliveryStops: '03',
  totalPackagesCount: '15',
  totalWeight: '13.8 kg',
  totalVolume: '0.18 m³',
  totalDimensions: '40 × 30 × 20 cm',
  returnAddress: 'SW Couriers, Unit 25,\nThompson Dr,\nBirmingham B24 8HZ',
  packages: [
    {
      id: 'pkg-1',
      packageIdDisplay: '#PKG-0031',
      trackingIdDisplay: '#SWBHM-984523',
      fromAddress: 'UrbanNest Home Ltd\n12 Industrial Road\nManchester, M1 2AB',
      toAddress: 'John Smith\n21 Baker Street\nLondon, W1U 3BW UK',
      weight: '2.3 kg',
      dimensions: '40 × 30 × 25 cm',
      volume: '0.03 m³',
      signatureRequiredValue: 'YES',
      deliverySla: '5 DAYs DELIVERY',
      barcodeValue: 'SWBHM984523PKG0031',
      qrValue: 'https://www.swcouriers.co.uk/track?pkg=PKG-0031',
    },
    {
      id: 'pkg-2',
      packageIdDisplay: '#PKG-0032',
      trackingIdDisplay: '#SWBHM-984523',
      fromAddress: 'UrbanNest Home Ltd\n12 Industrial Road\nManchester, M1 2AB',
      toAddress: 'John Smith\n21 Baker Street\nLondon, W1U 3BW UK',
      weight: '2.3 kg',
      dimensions: '40 × 30 × 25 cm',
      volume: '0.03 m³',
      signatureRequiredValue: 'YES',
      deliverySla: '5 DAYs DELIVERY',
      barcodeValue: 'SWBHM984523PKG0032',
      qrValue: 'https://www.swcouriers.co.uk/track?pkg=PKG-0032',
    },
    {
      id: 'pkg-3',
      packageIdDisplay: '#PKG-0033',
      trackingIdDisplay: '#SWBHM-984523',
      fromAddress: 'UrbanNest Home Ltd\n12 Industrial Road\nManchester, M1 2AB',
      toAddress: 'John Smith\n21 Baker Street\nLondon, W1U 3BW UK',
      weight: '2.3 kg',
      dimensions: '40 × 30 × 25 cm',
      volume: '0.03 m³',
      signatureRequiredValue: 'YES',
      deliverySla: '5 DAYs DELIVERY',
      barcodeValue: 'SWBHM984523PKG0033',
      qrValue: 'https://www.swcouriers.co.uk/track?pkg=PKG-0033',
    },
    {
      id: 'pkg-4',
      packageIdDisplay: '#PKG-0034',
      trackingIdDisplay: '#SWBHM-984523',
      fromAddress: 'UrbanNest Home Ltd\n12 Industrial Road\nManchester, M1 2AB',
      toAddress: 'John Smith\n21 Baker Street\nLondon, W1U 3BW UK',
      weight: '2.3 kg',
      dimensions: '40 × 30 × 25 cm',
      volume: '0.03 m³',
      signatureRequiredValue: 'YES',
      deliverySla: '5 DAYs DELIVERY',
      barcodeValue: 'SWBHM984523PKG0034',
      qrValue: 'https://www.swcouriers.co.uk/track?pkg=PKG-0034',
    },
  ],
};

/** Recent deliveries for dashboard "Recent Deliveries" table. Subset of MOCK_DELIVERY_DATA. */
export const MOCK_DASHBOARD_RECENT_DELIVERIES: Delivery[] = MOCK_DELIVERY_DATA.slice(0, 6);

/** Draft Deliveries page — title, primary button, search placeholder, continue link (Figma 4537-25876, 4538-26965). */
export const DRAFTS_DELIVERIES_TITLE = 'Draft Deliveries';
export const DRAFTS_DELIVERIES_PRIMARY_BUTTON_LABEL = 'New Pickup Request';
export const DRAFTS_DELIVERIES_SEARCH_PLACEHOLDER = 'Search by tracking ID, customer, address…';
export const DRAFTS_DELIVERIES_CONTINUE_LABEL = 'Continue';

/** Draft Deliveries page — mock table data (Figma 4538-26965). Request ID format #AT246NS5D. */
const DRAFT_MISSING_FIELDS = [
  'postalCode',
  'customer',
  'packages',
  'totalWeight',
  'value',
] as const;
type DraftMissingField = (typeof DRAFT_MISSING_FIELDS)[number];

const DRAFT_POSTAL_CODE_PATTERN = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i;

const removePostalCodeFromAddress = (address: string): string =>
  address
    .replace(DRAFT_POSTAL_CODE_PATTERN, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*$/, '')
    .trim();

const getRandomMissingField = (): DraftMissingField =>
  DRAFT_MISSING_FIELDS[Math.floor(Math.random() * DRAFT_MISSING_FIELDS.length)];

const applyRandomMissingField = (
  row: Delivery & { requestId?: string }
): Delivery & { requestId?: string } => {
  const missingField = getRandomMissingField();

  switch (missingField) {
    case 'postalCode':
      return { ...row, recipientAddress: removePostalCodeFromAddress(row.recipientAddress) };
    case 'customer':
      return { ...row, recipientName: '' };
    case 'packages':
      return { ...row, items: '' };
    case 'totalWeight':
      return { ...row, weight: '' };
    case 'value':
      return { ...row, value: '' };
    default:
      return row;
  }
};

const MOCK_DRAFT_DELIVERY_BASE_DATA: Array<Delivery & { requestId?: string }> = [
  {
    id: 'd1',
    deliveryId: 'DL-2001',
    trackingId: 'TRK-2001',
    requestId: '#AT246NS5D',
    recipientName: 'John Potter',
    recipientAddress: 'H #2, Street 4, xyz, London, W1U 3BW',
    contactNumber: '+44 7700 900123',
    status: 'pending',
    createdAt: '2026-01-20',
    scheduledDate: '2026-01-28',
    weight: '0.5 kg',
    items: '1',
    value: '1500.00',
  },
  {
    id: 'd2',
    deliveryId: 'DL-2002',
    trackingId: 'TRK-2002',
    requestId: '#AT246NS5E',
    recipientName: 'Emma Clark',
    recipientAddress: '7 Victoria St, Bristol, BS1 5TR',
    contactNumber: '+44 117 345 6789',
    status: 'pending',
    createdAt: '2026-01-19',
    scheduledDate: '2026-01-26',
    weight: '3.0 kg',
    items: '4',
    value: '180.00',
  },
  {
    id: 'd3',
    deliveryId: 'DL-2003',
    trackingId: 'TRK-2003',
    requestId: '#AT246NS5F',
    recipientName: 'Oliver Green',
    recipientAddress: '15 Park Rd, Sheffield, S1 4AB',
    contactNumber: '+44 114 456 7890',
    status: 'pending',
    createdAt: '2026-01-21',
    scheduledDate: '2026-01-29',
    weight: '2.1 kg',
    items: '2',
    value: '95.00',
  },
  {
    id: 'd4',
    deliveryId: 'DL-2004',
    trackingId: 'TRK-2004',
    requestId: '#AT246NS5G',
    recipientName: 'Sophie Hall',
    recipientAddress: '22 Church St, Newcastle, NE1 7RU',
    contactNumber: '+44 191 567 8901',
    status: 'pending',
    createdAt: '2026-01-18',
    scheduledDate: '2026-01-25',
    weight: '0.8 kg',
    items: '1',
    value: '32.00',
  },
  {
    id: 'd5',
    deliveryId: 'DL-2005',
    trackingId: 'TRK-2005',
    requestId: '#AT246NS5H',
    recipientName: 'William Lee',
    recipientAddress: '9 High St, Nottingham, NG1 2DT',
    contactNumber: '+44 115 678 9012',
    status: 'pending',
    createdAt: '2026-01-22',
    scheduledDate: '2026-01-30',
    weight: '4.5 kg',
    items: '6',
    value: '260.00',
  },
];

export const MOCK_DRAFT_DELIVERY_DATA: Array<Delivery & { requestId?: string }> =
  MOCK_DRAFT_DELIVERY_BASE_DATA.map(applyRandomMissingField);

/** Placeholder card config: map, recent pickup, delivery status (Figma 3838-22117). */
export const DASHBOARD_PLACEHOLDER_CARDS = [
  { id: 'delivery-tracking', title: 'Delivery Tracking' },
  { id: 'recent-pickup', title: 'Recent Pickup' },
  { id: 'delivery-status', title: 'Delivery Status' },
] as const;

/** Recent Pickup card data (Figma 3838-22152). */
export const MOCK_RECENT_PICKUP: RecentPickupData = {
  trackingId: 'SWBHM-204612',
  status: 'Out for Delivery',
  origin: 'Birmingham Depot',
  destination: 'VX19 JKU',
  eta: '14:20 AM',
  distance: '8.4 miles',
} as const;

/** Deliveries Overview stat cards for dashboard (Figma 3838-22117). */
export const DASHBOARD_OVERVIEW_STATS = [
  { id: 'at-warehouse', title: 'At Warehouse', value: '15', change: '+10%', isPositive: true },
  {
    id: 'total-deliveries',
    title: 'Total Deliveries',
    value: '26',
    change: '-1%',
    isPositive: false,
  },
  {
    id: '1st-attempt-failed',
    title: '1st Attempt Failed',
    value: '2',
    change: '+5%',
    isPositive: false,
  },
  {
    id: 'out-for-delivery',
    title: 'Out for Delivery',
    value: '8',
    change: '+12%',
    isPositive: true,
  },
  { id: 'delivered', title: 'Delivered', value: '20', change: '+8%', isPositive: true },
  { id: 'pending-pickup', title: 'Pending Pickup', value: '5', change: '-3%', isPositive: false },
  { id: 'returns', title: 'Returns', value: '1', change: '0%', isPositive: true },
  {
    id: 'avg-delivery-time',
    title: 'Avg Delivery Time',
    value: '2.5h',
    change: '-0.5h',
    isPositive: true,
  },
] as const;

/** Delivery Overview cards for 4×4 grid (Figma 3838-22247). */
export const DELIVERY_OVERVIEW_CARDS = [
  { label: 'Out for Delivery', value: 4, delta: 11, deltaType: 'positive' as const },
  { label: 'At Warehouse', value: 15, delta: 10, deltaType: 'positive' as const },
  { label: 'Total Deliveries', value: 26, delta: 1, deltaType: 'negative' as const },
  { label: '1st Attempt Failed', value: 2, delta: 5, deltaType: 'negative' as const },
  { label: 'Delivered', value: 20, delta: 8, deltaType: 'positive' as const },
  { label: 'Pending Pickup', value: 5, delta: 3, deltaType: 'negative' as const },
  { label: 'Returns', value: 1, delta: 0, deltaType: 'positive' as const },
  { label: 'Avg Delivery Time', value: '2.5h', delta: 0.5, deltaType: 'negative' as const },
  { label: 'On-Time Delivery', value: 18, delta: 12, deltaType: 'positive' as const },
  { label: 'Late Deliveries', value: 3, delta: 2, deltaType: 'negative' as const },
  { label: 'In Transit', value: 7, delta: 4, deltaType: 'positive' as const },
  { label: 'Scheduled', value: 12, delta: 6, deltaType: 'positive' as const },
  { label: 'Cancelled', value: 1, delta: 1, deltaType: 'negative' as const },
  { label: 'Rescheduled', value: 2, delta: 1, deltaType: 'positive' as const },
  { label: 'Failed Attempts', value: 3, delta: 2, deltaType: 'negative' as const },
  { label: 'Completed Today', value: 24, delta: 15, deltaType: 'positive' as const },
] as const;

/** Time period options for delivery overview filter dropdown (Figma 3838-22193). */
export const DELIVERY_OVERVIEW_TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: '90days', label: '90 Days' },
] as const;

/** Delivery Status chart data (Figma 3838-22190). */
export const DELIVERY_STATUS_DATA: DeliveryStatusData[] = [
  { name: 'Pending Pickup', value: 30, color: '#f59e0b' }, // orange-500
  { name: 'At SW Warehouse', value: 20, color: '#a855f7' }, // purple-500
  { name: 'Out for Delivery', value: 15, color: '#06b6d4' }, // cyan-500
  { name: 'Delivered', value: 30, color: '#10b981' }, // success/green-500
  { name: 'Returns', value: 5, color: '#ef4444' }, // error/red-500
] as const;

export const DELIVERY_RATE_PERCENTAGE = 80;

/** Status chips/options used by deliveries list status filter and table chips. */
export const DELIVERY_LIST_STATUS_CHIP_OPTIONS: Array<{
  id: string;
  value: DeliveryStatus;
  label: string;
  chipClassName: string;
}> = [
  {
    id: 'pending-pickup',
    value: 'pending',
    label: 'Pending Pickup',
    chipClassName: 'bg-[#F97316] text-white',
  },
  {
    id: 'pickup-going-warehouse',
    value: 'in-transit',
    label: 'Pickup going to Warehouse',
    chipClassName: 'bg-[#8B5CF6] text-white',
  },
  {
    id: 'sorting-in-progress',
    value: 'in-transit',
    label: 'Sorting in progress',
    chipClassName: 'bg-[#334155] text-white',
  },
  {
    id: 'loaded-for-delivery',
    value: 'in-transit',
    label: 'Loaded for Delivery',
    chipClassName: 'bg-[#F59E0B] text-white',
  },
  {
    id: 'out-for-delivery',
    value: 'in-transit',
    label: 'Out for Delivery',
    chipClassName: 'bg-[#3B82F6] text-white',
  },
  {
    id: 'partially-delivered',
    value: 'in-transit',
    label: 'Partially Delivered',
    chipClassName: 'bg-[#047857] text-white',
  },
  {
    id: 'delivered',
    value: 'delivered',
    label: 'Delivered',
    chipClassName: 'bg-[#10B981] text-white',
  },
  {
    id: 'not-delivered-attempt',
    value: 'failed',
    label: 'Not delivered (1st Attempt)',
    chipClassName: 'bg-[#EF4444] text-white',
  },
  {
    id: 'refused',
    value: 'failed',
    label: 'Refused',
    chipClassName: 'bg-[#DC2626] text-white',
  },
] as const;

/** Delivery status filter options for deliveries table. */
export const DELIVERY_STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Select' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-transit', label: 'On-Route' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Returned' },
];

/** Delivery tracking locations for dashboard map (Figma 3838-22118). At least one has status 'active' to show Activesvg. */
export const MOCK_DELIVERY_TRACKING_LOCATIONS: DeliveryTrackingLocation[] = [
  { id: '1', latitude: 52.4862, longitude: -1.8904, status: 'active' },
  { id: '2', latitude: 52.4779, longitude: -1.8998, status: 'pending' },
  { id: '3', latitude: 52.4815, longitude: -1.8995, status: 'pending' },
  { id: '4', latitude: 52.4838, longitude: -1.8887, status: 'pending' },
  { id: '5', latitude: 52.4792, longitude: -1.8856, status: 'pending' },
];

/** Delivery tracking — route path coordinates for map polyline */
export const DELIVERY_ROUTE_PATH: Array<[number, number]> = [
  [52.4779, -1.8998], // Start point
  [52.4792, -1.8975],
  [52.4815, -1.895],
  [52.4838, -1.892],
  [52.485, -1.89],
  [52.4862, -1.888], // Current truck position
  [52.488, -1.885],
  [52.49, -1.882],
  [52.492, -1.88], // Destination point
] as const;

/** Delivery tracking — truck current position on route */
export const DELIVERY_TRUCK_POSITION: [number, number] = [52.4862, -1.888] as const;

/** Delivery tracking — route start position */
export const DELIVERY_ROUTE_START: [number, number] = [52.4779, -1.8998] as const;

/** Delivery tracking — route destination position */
export const DELIVERY_ROUTE_DESTINATION: [number, number] = [52.492, -1.88] as const;

/** Delivery detail — route markers (start, truck, destination only) */
export const DELIVERY_DETAIL_ROUTE_MARKERS = {
  start: DELIVERY_ROUTE_START,
  truck: DELIVERY_TRUCK_POSITION,
  destination: DELIVERY_ROUTE_DESTINATION,
} as const;

/** Tracking Delivery Page — Mock Data (Figma 425-66337) */
export const TRACKING_DELIVERY_HEADER_BUTTONS = [
  { label: 'New Pickup Request', to: '/deliveries/pending', variant: 'primary' as const },
] as const;

export const TRACKING_DELIVERY_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'on-route', label: 'On Route' },
  { id: 'pending', label: 'Pending' },
  { id: 'delivered', label: 'Delivered' },
] as const;

export const TRACKING_DELIVERY_MOCK_LOCATIONS = [
  { id: 'SWBHM-204612', latitude: 52.4862, longitude: -1.8904 },
  { id: 'SWBHM-204613', latitude: 52.4838, longitude: -1.8887 },
  { id: 'SWBHM-204614', latitude: 52.4792, longitude: -1.8856 },
  { id: 'SWBHM-204615', latitude: 52.4815, longitude: -1.8995 },
] as const;

export const TRACKING_DELIVERY_MOCK_PICKUPS = [
  {
    id: 'SWBHM-204612',
    trackingId: 'SWBHM-204612',
    status: 'On Route',
    origin: 'Rosewood Ave, Manchester, M14 6LT',
    destination: 'C55 Bridge End, Cardiff, CF10 2BN',
    eta: '22 min',
    distance: '0,542 km',
  },
  {
    id: 'SWBHM-204613',
    trackingId: 'SWBHM-204613',
    status: 'Pending',
    origin: 'Broad St, Birmingham, B15 1AU',
    destination: 'Old Kent Rd, London, SE1 5EU',
    eta: '1 hr 12 min',
    distance: '12,4 km',
  },
  {
    id: 'SWBHM-204614',
    trackingId: 'SWBHM-204614',
    status: 'Delivered',
    origin: 'King St, Glasgow, G1 2FF',
    destination: '82 High Street',
    eta: 'Delivered',
    distance: '—',
  },
  {
    id: 'SWBHM-204615',
    trackingId: 'SWBHM-204615',
    status: 'On Route',
    origin: 'Manchester, M14 6LT',
    destination: 'Broad St, Birmingham, B15 1AU',
    eta: '48 min',
    distance: '4,2 km',
  },
] as const;

/** Tracking Delivery page — card list mock (Figma 4537-22692). */
export const TRACKING_DELIVERY_CARDS_MOCK: TrackingDeliveryCardData[] = [
  {
    id: 'SWBHM-204612',
    trackingId: 'SWBHM-204612',
    status: 'On Route',
    postcode: 'M14 6LT',
    eta: '22 min',
    distance: '0,542 km',
    weight: '2.5 kg',
    numberOfPackages: '3',
    driverName: 'James Wilson',
    driverAvatar: undefined,
    routeStart: [52.4779, -1.8998],
    routeDestination: [52.492, -1.88],
    routeCurrent: [52.4862, -1.888],
  },
  {
    id: 'SWBHM-204613',
    trackingId: 'SWBHM-204613',
    status: 'Pending',
    postcode: 'B15 1AU',
    eta: '1 hr 12 min',
    distance: '12,4 km',
    weight: '1.8 kg',
    numberOfPackages: '2',
    driverName: 'Sarah Jones',
    driverAvatar: undefined,
    routeStart: [52.4838, -1.8887],
    routeDestination: [52.4815, -1.8995],
    routeCurrent: [52.4838, -1.8887],
  },
  {
    id: 'SWBHM-204614',
    trackingId: 'SWBHM-204614',
    status: 'Delivered',
    postcode: 'G1 2FF',
    eta: 'Delivered',
    distance: '—',
    weight: '3.2 kg',
    numberOfPackages: '5',
    driverName: 'Michael Brown',
    driverAvatar: undefined,
    routeStart: [52.4792, -1.8856],
    routeDestination: [52.4815, -1.8995],
    routeCurrent: undefined,
  },
  {
    id: 'SWBHM-204615',
    trackingId: 'SWBHM-204615',
    status: 'On Route',
    postcode: 'M14 6LT',
    eta: '48 min',
    distance: '4,2 km',
    weight: '2.0 kg',
    numberOfPackages: '2',
    driverName: 'Emma Davis',
    driverAvatar: undefined,
    routeStart: [52.4862, -1.8904],
    routeDestination: [52.4838, -1.8887],
    routeCurrent: [52.485, -1.889],
  },
];

/** Tracking Delivery → Delivery Details page mock (keeps detail page in sync with tracking cards). */
export const TRACKING_DELIVERY_DETAIL_INFO_BY_ID = {
  'SWBHM-204612': {
    deliveryId: 'SWBHM-204612',
    status: 'On Route',
    customer: 'Cheryl Arema',
    contact: '+44 7700 900123',
    address: 'C55 Bridge End, Cardiff, CF10 2BN',
    timeRemaining: '12 Hrs Left',
    notes: '',
  },
  'SWBHM-204613': {
    deliveryId: 'SWBHM-204613',
    status: 'Pending',
    customer: 'Sarah Johnson',
    contact: '+44 161 234 5678',
    address: 'Old Kent Rd, London, SE1 5EU',
    timeRemaining: '—',
    notes: '',
  },
  'SWBHM-204614': {
    deliveryId: 'SWBHM-204614',
    status: 'Delivered',
    customer: 'Michael Brown',
    contact: '+44 121 345 6789',
    address: '82 High Street',
    timeRemaining: '—',
    notes: '',
  },
  'SWBHM-204615': {
    deliveryId: 'SWBHM-204615',
    status: 'On Route',
    customer: 'Emma Davis',
    contact: '+44 151 456 7890',
    address: 'Broad St, Birmingham, B15 1AU',
    timeRemaining: '—',
    notes: '',
  },
} as const;

export const TRACKING_DELIVERY_DETAIL_CUSTOMER_INFO_CARDS_BY_ID = {
  'SWBHM-204612': [
    { id: 1, iconType: 'user' as const, title: 'Customer', value: 'Cheryl Arema' },
    { id: 2, iconType: 'phone' as const, title: 'Contact', value: '+44 7700 900123' },
    {
      id: 3,
      iconType: 'mapPin' as const,
      title: 'Address',
      value: 'C55 Bridge End, Cardiff, CF10 2BN',
    },
  ],
  'SWBHM-204613': [
    { id: 1, iconType: 'user' as const, title: 'Customer', value: 'Sarah Johnson' },
    { id: 2, iconType: 'phone' as const, title: 'Contact', value: '+44 161 234 5678' },
    { id: 3, iconType: 'mapPin' as const, title: 'Address', value: 'Old Kent Rd, London, SE1 5EU' },
  ],
  'SWBHM-204614': [
    { id: 1, iconType: 'user' as const, title: 'Customer', value: 'Michael Brown' },
    { id: 2, iconType: 'phone' as const, title: 'Contact', value: '+44 121 345 6789' },
    { id: 3, iconType: 'mapPin' as const, title: 'Address', value: '82 High Street' },
  ],
  'SWBHM-204615': [
    { id: 1, iconType: 'user' as const, title: 'Customer', value: 'Emma Davis' },
    { id: 2, iconType: 'phone' as const, title: 'Contact', value: '+44 151 456 7890' },
    {
      id: 3,
      iconType: 'mapPin' as const,
      title: 'Address',
      value: 'Broad St, Birmingham, B15 1AU',
    },
  ],
} as const;

/** Tracking Delivery → Timeline steps per card ID */
export const TRACKING_DELIVERY_TIMELINE_BY_ID = {
  'SWBHM-204612': [
    {
      id: 'pickup',
      label: 'Pickup',
      location: 'Rosewood Ave, Manchester, M14 6LT',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'completed' as const,
    },
    {
      id: 'sw-carriers',
      label: 'SW Carriers',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '14 JULY 2024 - 10:00AM',
      status: 'completed' as const,
    },
    {
      id: 'on-route',
      label: 'On-Route',
      location: 'C55 Bridge End, Cardiff, CF10 2BN',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'active' as const,
    },
    {
      id: 'final-delivery',
      label: 'Final Delivery',
      location: 'C55 Bridge End, Cardiff, CF10 2BN',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'pending' as const,
    },
  ],
  'SWBHM-204613': [
    {
      id: 'pickup',
      label: 'Pickup',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'active' as const,
    },
    {
      id: 'sw-carriers',
      label: 'SW Carriers',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '14 JULY 2024 - 10:00AM',
      status: 'pending' as const,
    },
    {
      id: 'on-route',
      label: 'On-Route',
      location: 'Old Kent Rd, London, SE1 5EU',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'pending' as const,
    },
    {
      id: 'final-delivery',
      label: 'Final Delivery',
      location: 'Old Kent Rd, London, SE1 5EU',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'pending' as const,
    },
  ],
  'SWBHM-204614': [
    {
      id: 'pickup',
      label: 'Pickup',
      location: 'King St, Glasgow, G1 2FF',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'completed' as const,
    },
    {
      id: 'sw-carriers',
      label: 'SW Carriers',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '14 JULY 2024 - 10:00AM',
      status: 'completed' as const,
    },
    {
      id: 'on-route',
      label: 'On-Route',
      location: '82 High Street',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'completed' as const,
    },
    {
      id: 'final-delivery',
      label: 'Final Delivery',
      location: '82 High Street',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'completed' as const,
    },
  ],
  'SWBHM-204615': [
    {
      id: 'pickup',
      label: 'Pickup',
      location: 'Manchester, M14 6LT',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'completed' as const,
    },
    {
      id: 'sw-carriers',
      label: 'SW Carriers',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '14 JULY 2024 - 10:00AM',
      status: 'completed' as const,
    },
    {
      id: 'on-route',
      label: 'On-Route',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'active' as const,
    },
    {
      id: 'final-delivery',
      label: 'Final Delivery',
      location: 'Broad St, Birmingham, B15 1AU',
      timestamp: '17 JULY 2024 - 04:00AM',
      status: 'pending' as const,
    },
  ],
} as const;

/** Tracking Delivery → Progress locations per card ID */
export const TRACKING_DELIVERY_PROGRESS_LOCATIONS_BY_ID = {
  'SWBHM-204612': [
    'Manchester, M14 6LT',
    'Birmingham, B15 1AU',
    'Cardiff, CF10 2BN',
    'Cardiff, CF10 2BN',
  ],
  'SWBHM-204613': [
    'Birmingham, B15 1AU',
    'Birmingham, B15 1AU',
    'London, SE1 5EU',
    'London, SE1 5EU',
  ],
  'SWBHM-204614': ['Glasgow, G1 2FF', 'Birmingham, B15 1AU', '82 High Street', '82 High Street'],
  'SWBHM-204615': [
    'Manchester, M14 6LT',
    'Birmingham, B15 1AU',
    'Birmingham, B15 1AU',
    'Birmingham, B15 1AU',
  ],
} as const;

/** Id used for Dashboard Recent Pickup card; detail page uses same id so info matches. */
export const RECENT_PICKUP_ID = 'SWBHM-204612' as const;

/** Dashboard Recent Pickup display data — derived from same card as detail page (RECENT_PICKUP_ID). */
export const RECENT_PICKUP_DISPLAY: RecentPickupData = (() => {
  const card = TRACKING_DELIVERY_CARDS_MOCK.find((c) => c.id === RECENT_PICKUP_ID);
  const locations = TRACKING_DELIVERY_PROGRESS_LOCATIONS_BY_ID[RECENT_PICKUP_ID];
  if (!card || !locations?.length) return MOCK_RECENT_PICKUP;
  return {
    trackingId: card.trackingId,
    status: card.status,
    origin: locations[0],
    destination: locations[locations.length - 1],
    eta: card.eta,
    distance: card.distance,
  };
})();

/** Delivery detail page — coming soon cards config. */
export const DELIVERY_DETAIL_COMING_SOON_CARDS = [
  { id: 'card-1', icon: 'Package' },
  { id: 'card-2', icon: 'Map' },
  { id: 'card-3', icon: 'FileText' },
] as const;

/** Delivery detail page — header title and subtitle. */
export const DELIVERY_DETAIL_TITLE = 'Order Details';

/** Delivery tracking — map overlay metrics */
export const DELIVERY_TRACKING_OVERLAY_DATA = {
  address: '82 High Street',
  currentDistance: '0,5 km',
} as const;

/** Delivery tracking — map overlay metric cards */
export const DELIVERY_TRACKING_OVERLAY_CARDS = [
  {
    id: 'address',
    label: '82 High Street',
    value: '0,5 km',
  },
  {
    id: 'distance-remaining',
    label: 'Distance remaining',
    value: '0,542 km',
  },
  {
    id: 'estimated-time',
    label: 'Estimated time',
    value: '22 min',
  },
] as const;

/** Delivery detail page — left column data */
export const DELIVERY_DETAIL_INFO = {
  deliveryId: 'SWBHM-204612',
  status: 'On Route',
  customer: 'Cheryl Arema',
  contact: '+44 7700 900123',
  address: 'C55 Bridge End, Cardiff, CF10 2BN',
  timeRemaining: '12 Hrs Left',
  notes: '',
} as const;

/** Delivery detail page — delivery status timeline */
export const DELIVERY_STATUS_TIMELINE = [
  {
    id: 'pickup',
    label: 'Pickup',
    location: 'Rosewood Ave, Manchester, M14 6LT',
    timestamp: '17 JULY 2024 - 04:00AM',
    status: 'completed',
  },
  {
    id: 'sw-carriers',
    label: 'SW Carriers',
    location: 'Broad St, Birmingham, B15 1AU',
    timestamp: '14 JULY 2024 - 10:00AM',
    status: 'active',
  },
  {
    id: 'on-route',
    label: 'On-Route',
    location: 'King St, Glasgow, G1 2FF',
    timestamp: '17 JULY 2024 - 04:00AM',
    status: 'pending',
  },
  {
    id: 'final-delivery',
    label: 'Final Delivery',
    location: 'Old Kent Rd, London, SE1 5EU',
    timestamp: '17 JULY 2024 - 04:00AM',
    status: 'pending',
  },
] as const;

/** Delivery detail page — progress bar locations */
export const DELIVERY_PROGRESS_LOCATIONS = [
  'Manchester, M14 6LT',
  'Birmingham, B15 1AU',
  'Glasgow, G1 2FF',
  'London, SE1 5EU',
] as const;

/** Delivery detail page — customer info cards data */
export const DELIVERY_DETAIL_CUSTOMER_INFO_CARDS = [
  {
    id: 1,
    iconType: 'user' as const,
    title: 'Customer',
    value: 'Cheryl Arema',
  },
  {
    id: 2,
    iconType: 'phone' as const,
    title: 'Contact',
    value: '+44 7700 900123',
  },
  {
    id: 3,
    iconType: 'mapPin' as const,
    title: 'Address',
    value: 'C55 Bridge End, Cardiff, CF10 2BN',
  },
] as const;
/** Mock notifications data matching Figma design 425-65247 */
export const MOCK_NOTIFICATIONS: Array<{
  id: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'delivery' | 'billing' | 'system' | 'other';
}> = (() => {
  const now = new Date();
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today's notifications (various times today)
  const today1 = new Date(today);
  today1.setHours(11, 5, 0, 0); // 11:05 AM

  const today2 = new Date(today);
  today2.setHours(9, 30, 0, 0); // 9:30 AM

  const today3 = new Date(today);
  today3.setHours(8, 15, 0, 0); // 8:15 AM

  // Yesterday's notifications (various times yesterday)
  const yesterday1 = new Date(yesterday);
  yesterday1.setHours(15, 45, 0, 0); // 3:45 PM

  const yesterday2 = new Date(yesterday);
  yesterday2.setHours(14, 20, 0, 0); // 2:20 PM

  const yesterday3 = new Date(yesterday);
  yesterday3.setHours(11, 0, 0, 0); // 11:00 AM

  const yesterday4 = new Date(yesterday);
  yesterday4.setHours(10, 30, 0, 0); // 10:30 AM

  const yesterday5 = new Date(yesterday);
  yesterday5.setHours(9, 0, 0, 0); // 9:00 AM

  return [
    {
      id: '1',
      message: 'Inbound to hub for Delivery #DL-101 - 2025-09-09 11:05 AM',
      timestamp: today1,
      isRead: false,
      type: 'delivery',
    },
    {
      id: '2',
      message: 'Delivery #DL-102 has been picked up - 2025-09-09 09:30 AM',
      timestamp: today2,
      isRead: false,
      type: 'delivery',
    },
    {
      id: '3',
      message: 'Invoice #Inv-2001 is now due - 2025-09-09 08:15 AM',
      timestamp: today3,
      isRead: true,
      type: 'billing',
    },
    {
      id: '4',
      message: 'Delivery #DL-100 has been completed - 2025-09-08 03:45 PM',
      timestamp: yesterday1,
      isRead: false,
      type: 'delivery',
    },
    {
      id: '5',
      message: 'New pickup request received for Delivery #DL-103 - 2025-09-08 02:20 PM',
      timestamp: yesterday2,
      isRead: true,
      type: 'delivery',
    },
    {
      id: '6',
      message: 'Payment received for Invoice #Inv-2002 - 2025-09-08 11:00 AM',
      timestamp: yesterday3,
      isRead: true,
      type: 'billing',
    },
    {
      id: '7',
      message: 'Delivery #DL-99 is out for delivery - 2025-09-08 10:30 AM',
      timestamp: yesterday4,
      isRead: true,
      type: 'delivery',
    },
    {
      id: '8',
      message: 'System maintenance scheduled for tonight - 2025-09-08 09:00 AM',
      timestamp: yesterday5,
      isRead: true,
      type: 'system',
    },
  ];
})();

export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

/** Pay & Complete step — Figma 6:44927 (Payment Method), legacy 5026-42260 */
export const PAY_COMPLETE_FORM_TITLE = 'Payment Method';
export const PAY_COMPLETE_FORM_SUBTITLE =
  'Review the calculated price and choose how the order will be paid.';
export const PAY_COMPLETE_FORM_SUBTITLE_ADD =
  'Add a payment method to complete this pickup request.';
export const PAY_COMPLETE_CHANGE_PAYMENT_MODEL_LABEL = 'Change Payment Model';

/** Change Payment Method modal (Figma 6:45472). */
export const PAY_MODAL_TITLE = 'Change Payment Method';
export const PAY_MODAL_OPTION_CARD_TITLE = 'Card Payment';
export const PAY_MODAL_OPTION_CARD_DESC = 'Instant payment via saved cards.';
export const PAY_MODAL_OPTION_BANK_TITLE = 'Bank Transfer';
export const PAY_MODAL_OPTION_BANK_DESC = 'Monthly manual transfer through bank.';
export const PAY_MODAL_OPTION_CREDIT_TITLE = 'Credit Account';
export const PAY_MODAL_OPTION_CREDIT_DESC = 'Use available credit balance.';
export const PAY_MODAL_OPTION_CASH_TITLE = 'Cash';
export const PAY_MODAL_OPTION_CASH_DESC =
  'Pay service charges in cash through in-person settlement.';
export const PAY_MODAL_DEFAULT_BADGE = 'Default';
export const PAY_MODAL_CANCEL = 'Cancel';
export const PAY_MODAL_CONFIRM = 'Change Method';
export const PAY_COMPLETE_CHARGE_INFO_CREDIT =
  'Charges will be posted against your available credit when the order is confirmed.';
export const PAY_COMPLETE_CHARGE_INFO_CASH =
  'Service charges will be collected in cash at pickup or delivery, per your agreement.';
export const PAY_COMPLETE_PAYMENT_MODEL_CARD_HEADER = 'Payment Model';
export const PAY_COMPLETE_PAYMENT_MODEL_FIELD_LABEL = 'Payment Model';
export const PAY_COMPLETE_CARD_PAYMENT_BADGE = 'Card Payment';
export const PAY_COMPLETE_MONTHLY_INVOICE_BADGE = 'Monthly Invoice';
export const PAY_COMPLETE_BANK_TRANSFER_BADGE = 'Bank Transfer';
export const PAY_COMPLETE_CREDIT_ACCOUNT_BADGE = 'Credit Account';
export const PAY_COMPLETE_CASH_BADGE = 'Cash';
export const PAY_COMPLETE_BILLING_SCHEDULE_LABEL = 'Billing Schedule';
export const PAY_COMPLETE_BILLING_IMMEDIATE_VALUE = 'Immediate';
export const PAY_COMPLETE_BILLING_MONTHLY_VALUE = 'Monthly';
export const PAY_COMPLETE_CLIENT_CHARGE_INFO =
  'Client card will be charged immediately upon submission.';
export const PAY_COMPLETE_SELECTED_CARD_LABEL = 'Selected Card';
export const PAY_COMPLETE_ADD_PAYMENT_BUTTON_LABEL = 'Add Payment Method';
export const PAY_COMPLETE_SAVE_PAYMENT_BUTTON_LABEL = 'Save Payment Method';
export const PAY_COMPLETE_CONFIRM_PAY_BUTTON_LABEL = 'Confirm & Pay';
export const PAY_COMPLETE_CONFIRM_ORDER_BUTTON_LABEL = 'Confirm Order Creation';

export const PAY_COMPLETE_PRICE_BREAKDOWN_TITLE = 'Price Breakdown';
export const PAY_COMPLETE_STOP_LABEL_PREFIX = 'Stop - ';
export const PAY_COMPLETE_TABLE_CHARGE_TYPE = 'Charge Type';
export const PAY_COMPLETE_TABLE_CALCULATION = 'Calculation';
export const PAY_COMPLETE_TABLE_AMOUNT = 'Amount';
export const PAY_COMPLETE_ROW_BASE_PRICE = 'Base Price';
export const PAY_COMPLETE_ROW_PACKAGES_TOTAL = 'Packages Total Price';
export const PAY_COMPLETE_ROW_FIXED_DISCOUNT = 'Fixed Discount';
export const PAY_COMPLETE_ROW_SUBTOTAL_EX_VAT = 'Subtotal (excl. VAT)';
export const PAY_COMPLETE_ROW_GRAND_TOTAL = 'Grand Total (incl. VAT)';
export const PAY_COMPLETE_ROW_PRICE_PER_PACKAGE = 'Price Per Package';
export const PAY_COMPLETE_ROW_PACKAGE_WEIGHT_PRICE = 'Package Weight Price';
export const PAY_COMPLETE_ROW_TOTAL_PACKAGE_PRICE = 'Total Package price';
export const PAY_COMPLETE_PACKAGE_BAND_PREFIX = 'Package';

/** Pay & Complete step — Summary labels (Figma 5026-42391, 6:44927) */
export const PAY_COMPLETE_DELIVERY_COST_LABEL = 'Delivery Cost';
export const PAY_COMPLETE_VAT_LABEL = 'VAT';
export const PAY_COMPLETE_TOTAL_COST_LABEL = 'Total Cost';
export const PAY_COMPLETE_VAT_INCLUDED = 'Included';

/** Pay & Complete step — Alert messages (Figma 5030-30375, 5030-30519, 5031-14464) */
export const PAY_COMPLETE_ALERT_IMMEDIATE = "You'll be charged in the next 10 minutes.";
export const PAY_COMPLETE_ALERT_MONTHLY_LINE1 = "You'll be charged on the 1st of each month.";
export const PAY_COMPLETE_ALERT_MONTHLY_LINE2 =
  '(This pickup will be added to your monthly invoice.)';
export const PAY_COMPLETE_ALERT_REQUIRED =
  'Payment details are required before your pickup can be scheduled.';

/** Pay & Complete step — Add card form labels (Figma 5031-14753) */
export const PAY_COMPLETE_CARDHOLDER_NAME_LABEL = 'Cardholder Name';
export const PAY_COMPLETE_CARD_NUMBER_LABEL = 'Card Number';
export const PAY_COMPLETE_EXPIRY_DATE_LABEL = 'Expiry Date';
export const PAY_COMPLETE_CVC_LABEL = 'CVC';

/** Pay & Complete step — Mock saved cards */
export const MOCK_SAVED_CARDS = [
  { id: '1', type: 'visa', lastFour: '4242', isDefault: true },
  { id: '2', type: 'mastercard', lastFour: '5555', isDefault: false },
] as const;

/** Pay & Complete step — Order totals under price breakdown (Figma 6:44927). */
export const MOCK_DELIVERY_COST = {
  deliveryCost: 124.5,
  vatAmount: 24.9,
  totalCost: 149.4,
  vatIncluded: false,
} as const;

/** Per-stop pricing mock for payment price breakdown table (Figma 6:44927). */
export type PaymentBreakdownTier = '4day' | '5day' | '8day';

export interface PaymentBreakdownPackageLine {
  pricePerPackageCalc: string;
  pricePerPackageAmount: number;
  packageWeightCalc: string;
  packageWeightAmount: number;
  totalPackageCalc: string;
  totalPackageAmount: number;
}

export interface PaymentBreakdownStop {
  tier: PaymentBreakdownTier;
  baseCalc: string;
  baseAmount: number;
  packagesSummaryCalc: string;
  packagesTotalAmount: number;
  packageLines: PaymentBreakdownPackageLine[];
  discountCalc: string;
  discountAmount: number;
  subtotalExVat: number;
  vatLabel: string;
  vatAmount: number;
  grandTotal: number;
}

export const MOCK_PAYMENT_BREAKDOWN_STOPS: PaymentBreakdownStop[] = [
  {
    tier: '5day',
    baseCalc: 'Standard Service',
    baseAmount: 50,
    packagesSummaryCalc: '£10 + £12 + £8 + … + £20',
    packagesTotalAmount: 72,
    packageLines: [
      {
        pricePerPackageCalc: 'Standard → £5',
        pricePerPackageAmount: 5,
        packageWeightCalc: '12kg × £2',
        packageWeightAmount: 24,
        totalPackageCalc: '£2 + £22',
        totalPackageAmount: 24,
      },
      {
        pricePerPackageCalc: 'Standard → £5',
        pricePerPackageAmount: 5,
        packageWeightCalc: '12kg × £2',
        packageWeightAmount: 24,
        totalPackageCalc: '£2 + £22',
        totalPackageAmount: 24,
      },
      {
        pricePerPackageCalc: 'Standard → £5',
        pricePerPackageAmount: 5,
        packageWeightCalc: '12kg × £2',
        packageWeightAmount: 24,
        totalPackageCalc: '£2 + £22',
        totalPackageAmount: 24,
      },
    ],
    discountCalc: 'Standard → £10',
    discountAmount: 10,
    subtotalExVat: 112,
    vatLabel: 'VAT (20%)',
    vatAmount: 24,
    grandTotal: 136,
  },
  {
    tier: '5day',
    baseCalc: 'Standard Service',
    baseAmount: 50,
    packagesSummaryCalc: '£10 + £12 + £8 + … + £20',
    packagesTotalAmount: 20,
    packageLines: [
      {
        pricePerPackageCalc: 'Standard → £5',
        pricePerPackageAmount: 5,
        packageWeightCalc: '8kg × £2',
        packageWeightAmount: 15,
        totalPackageCalc: '£5 + £15',
        totalPackageAmount: 20,
      },
    ],
    discountCalc: '—',
    discountAmount: 0,
    subtotalExVat: 70,
    vatLabel: 'VAT (20%)',
    vatAmount: 14,
    grandTotal: 84,
  },
];
