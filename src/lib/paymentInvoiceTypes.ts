/** Payment invoice modal (Figma B2B-clients node 6:47505). Kept in a small module so type-aware ESLint resolves cleanly (see `data.ts` mock). */

export type PaymentInvoiceServiceTier = 'FASTEST' | 'STANDARD' | 'ECONOMY';

export interface PaymentInvoiceStopRow {
  stop: string;
  trackingId: string;
  customer: string;
  postcode: string;
  tier: PaymentInvoiceServiceTier;
  packages: string;
  weight: string;
  total: string;
}

export interface PaymentInvoiceMock {
  invoiceId: string;
  billToName: string;
  billToEmail: string;
  billToAddress: string;
  issuedOn: string;
  dueDate: string;
  paymentMethodLabel: string;
  cardholderName: string;
  cardNumber: string;
  paymentDate: string;
  paidAmount: string;
  bookingOrderId: string;
  totalStops: string;
  totalPackages: string;
  totalWeight: string;
  serviceType: string;
  stops: readonly PaymentInvoiceStopRow[];
  subtotal: string;
  vat: string;
  total: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  chargesNoteTitle: string;
  chargesNoteBody: string;
}
