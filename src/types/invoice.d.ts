/**
 * Invoice detail types
 */

import type { PaymentStatus } from './billing';

export interface InvoiceDeliveryDetail {
  deliveryId: string;
  trackingId: string;
  weight: string;
  items: string;
  value: string;
}

/** Single service/package row for Invoice Details Services table */
export interface InvoiceServiceItem {
  package: string;
  deliveryId: string;
  trackingId: string;
  weight: string;
  dimensions: string;
  value: string;
}

export interface InvoicePaymentDetail {
  paymentMethod: string;
  cardholderName: string;
  cardType: string;
  accountNumber: string;
  /** Number of packages (shown in paid-invoice Payment Details table) */
  noOfPackages?: number;
  timestamp: string;
}

export interface InvoiceDetail {
  invoiceNumber: string;
  issueDate: string;
  status: PaymentStatus;
  /** Order/reference ID for display (e.g. #AT246NS5D) */
  orderId?: string;
  /** Paid date for display (e.g. December 22, 2025) */
  paidOn?: string;
  /** Customer name for invoice meta section */
  customerName?: string;
  /** Customer contact for invoice meta section */
  customerContact?: string;
  /** Postcode for invoice meta section */
  postcode?: string;
  deliveryDetails: InvoiceDeliveryDetail[];
  /** Services table (Package, Delivery ID, Tracking ID, Weight, Dimensions, Value) */
  services?: InvoiceServiceItem[];
  paymentDetails: InvoicePaymentDetail;
  subtotal: string;
  vat: string;
  total: string;
}

export interface DeliveryInvoiceService {
  items: string;
  weight: string;
  height: string;
  width: string;
  length: string;
  value: string;
  total: string;
  subtotal: string;
}

export interface DeliveryInvoice {
  invoiceNumber: string;
  referenceNumber: string;
  status: PaymentStatus;
  customerName: string;
  customerContact: string;
  issuedDate: string;
  paymentDate: string;
  services: DeliveryInvoiceService[];
  fuelSurcharge: string;
  vat: string;
  total: string;
}
