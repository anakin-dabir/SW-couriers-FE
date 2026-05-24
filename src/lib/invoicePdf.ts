/**
 * Generate and download an Invoice PDF matching the Invoice Details modal UI.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceDetail, InvoiceServiceItem } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';
import { STATEMENT_FOOTER_CONFIG } from '@/lib/data';

import { SwCouriersLogo } from '@/assets/svg';

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const TABLE_MARGIN = 10;
const TABLE_WIDTH = PAGE_WIDTH - 2 * TABLE_MARGIN;
const LOGO_HEADER_WIDTH = 12.5;
const LOGO_HEADER_HEIGHT = 6;
const LOGO_FOOTER_WIDTH = 14;
const LOGO_FOOTER_HEIGHT = 9;
const FONT_SIZE_TITLE = 18;
const FONT_SIZE_SUBTITLE = 10;
const FONT_SIZE_HEADING = 14;
const FONT_SIZE_BODY = 10;
const LINE_HEIGHT = 7;
const SECTION_GAP = 12;
const FOOTER_TOP_PADDING = 10;
const FOOTER_LINE_HEIGHT = 5;

const TABLE_HEAD_BG: [number, number, number] = [249, 250, 251];
/** Gray-200 for Delivery Details main header (matches UI bg-gray-200) */
const TABLE_HEAD_GRAY_200: [number, number, number] = [229, 231, 235];
const TABLE_BODY_BG: [number, number, number] = [249, 250, 251];
const TABLE_BODY_TEXT: [number, number, number] = [51, 51, 51];
const STATUS_UNPAID_BG: [number, number, number] = [255, 159, 0];
const STATUS_PAID_BG: [number, number, number] = [40, 167, 69];
const STATUS_OVERDUE_BG: [number, number, number] = [220, 53, 69];
const STATUS_BADGE_TEXT: [number, number, number] = [255, 255, 255];

const BILL_TO = {
  companyName: 'Opus Retail Ltd',
  email: 'accounts@shiftopus.co.uk',
  address: '55 Bridge End, Cardiff, CF10 2BN, United Kingdom',
} as const;

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

function loadSvgAsPngDataUrl(svgUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2d context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch {
        reject(new Error('Canvas tainted'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = svgUrl;
  });
}

function buildDeliveryGroups(invoice: InvoiceDetail): Array<{
  deliveryId: string;
  customerName: string;
  postcode: string;
  totalPackages: string;
  totalWeight: string;
  totalAmount: string;
  packages: InvoiceServiceItem[];
}> {
  const servicesData = invoice.services ?? [];
  const byDelivery = new Map<string, InvoiceServiceItem[]>();
  for (const s of servicesData) {
    const list = byDelivery.get(s.deliveryId) ?? [];
    list.push(s);
    byDelivery.set(s.deliveryId, list);
  }
  return Array.from(byDelivery.entries()).map(([deliveryId, packages]) => {
    const totalWeightNum = packages.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
    const totalAmountNum = packages.reduce(
      (sum, p) => sum + (parseFloat(String(p.value).replace(/[£,\s]/g, '')) || 0),
      0
    );
    return {
      deliveryId,
      customerName: invoice.customerName ?? '—',
      postcode: invoice.postcode ?? '—',
      totalPackages: String(packages.length).padStart(2, '0'),
      totalWeight: `${totalWeightNum} kg`,
      totalAmount: formatCurrency(totalAmountNum),
      packages,
    };
  });
}

/**
 * Generates a PDF of the invoice (same structure as Invoice Details modal) and triggers download.
 */
export async function downloadInvoicePdf(invoice: InvoiceDetail): Promise<void> {
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadSvgAsPngDataUrl(SwCouriersLogo);
  } catch {
    // continue without logo
  }

  const doc = new jsPDF();
  let y = MARGIN;

  const orderId = invoice.orderId ?? invoice.invoiceNumber;
  const paidOn = invoice.paidOn ?? invoice.paymentDetails.timestamp?.split(' ')[0] ?? '—';

  // Header: logo + invoice number + status chip + Issue Date
  const logoRight = MARGIN + LOGO_HEADER_WIDTH + 8;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', MARGIN, y - 2, LOGO_HEADER_WIDTH, LOGO_HEADER_HEIGHT);
  }
  doc.setFontSize(FONT_SIZE_TITLE);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, logoRight, y + 4);
  // Measure invoice number width with same font/size as drawn (before changing font)
  const invoiceNumberWidth = doc.getTextWidth(invoice.invoiceNumber);
  const gapBetweenTitleAndChip = 12;

  // Status chip: position after invoice number with clear gap (no overlap)
  const status = String(invoice.status).toLowerCase();
  const chipColor =
    status === 'unpaid'
      ? STATUS_UNPAID_BG
      : status === 'paid'
        ? STATUS_PAID_BG
        : status === 'overdue'
          ? STATUS_OVERDUE_BG
          : TABLE_HEAD_BG;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  doc.setFontSize(FONT_SIZE_BODY);
  doc.setFont('helvetica', 'bold');
  const chipPad = 5;
  const chipW = doc.getTextWidth(statusLabel) + chipPad * 2;
  const chipH = 5;
  const chipRadius = 2.5;
  const chipX = logoRight + invoiceNumberWidth + gapBetweenTitleAndChip;
  const chipY = y + 1.5;
  doc.setFillColor(...chipColor);
  doc.roundedRect(chipX, chipY, chipW, chipH, chipRadius, chipRadius, 'F');
  doc.setTextColor(...STATUS_BADGE_TEXT);
  doc.text(statusLabel, chipX + chipW / 2, chipY + chipH / 2 + 1.2, { align: 'center' });
  doc.setTextColor(...TABLE_BODY_TEXT);

  y += LINE_HEIGHT + 2;
  doc.setFontSize(FONT_SIZE_SUBTITLE);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${invoice.issueDate}`, logoRight, y);
  y += LINE_HEIGHT + SECTION_GAP;

  // Bill To
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', TABLE_MARGIN, y);
  y += 4;

  doc.setFontSize(FONT_SIZE_BODY);
  doc.setFont('helvetica', 'normal');
  const addressColWidth = TABLE_WIDTH / 3 - 12;
  const addressLines = doc.splitTextToSize(BILL_TO.address, addressColWidth) as string[];
  const billToBoxHeight = 18 + addressLines.length * LINE_HEIGHT;
  const billToBoxY = y;
  doc.setFillColor(...TABLE_HEAD_BG);
  doc.roundedRect(TABLE_MARGIN, billToBoxY, TABLE_WIDTH, billToBoxHeight, 2, 2, 'F');
  const col1X = TABLE_MARGIN + 8;
  const col2X = TABLE_MARGIN + TABLE_WIDTH / 3 + 4;
  const col3X = TABLE_MARGIN + (TABLE_WIDTH * 2) / 3 + 4;
  const labelY = billToBoxY + 6;
  const valueY = billToBoxY + 13;
  doc.setFontSize(FONT_SIZE_BODY - 2);
  doc.setTextColor(107, 114, 128);
  doc.text('Company name', col1X, labelY);
  doc.text('Email', col2X, labelY);
  doc.text('Address', col3X, labelY);
  doc.setFontSize(FONT_SIZE_BODY);
  doc.setTextColor(...TABLE_BODY_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text(BILL_TO.companyName, col1X, valueY);
  doc.setFont('helvetica', 'normal');
  doc.text(BILL_TO.email, col2X, valueY);
  doc.text(addressLines, col3X, valueY);
  y = billToBoxY + billToBoxHeight + SECTION_GAP;

  // Order: Order ID, Issued on, Paid on
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Order', TABLE_MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Order ID', 'Issued on', 'Paid on']],
    body: [[orderId, invoice.issueDate, paidOn]],
    margin: { left: TABLE_MARGIN, right: TABLE_MARGIN },
    tableWidth: TABLE_WIDTH,
    theme: 'plain',
    styles: { fontSize: FONT_SIZE_BODY, cellPadding: 4 },
    headStyles: { fillColor: TABLE_HEAD_BG, fontStyle: 'bold', textColor: [0, 0, 0] },
    bodyStyles: { fillColor: TABLE_BODY_BG, textColor: TABLE_BODY_TEXT },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
  y += SECTION_GAP;

  // Payment Details
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', TABLE_MARGIN, y);
  y += 4;

  const noOfPackages =
    invoice.paymentDetails.noOfPackages != null ? String(invoice.paymentDetails.noOfPackages) : '—';
  autoTable(doc, {
    startY: y,
    head: [['Payment Method', "Cardholder's Name", 'Card Number', 'No of Packages']],
    body: [
      [
        invoice.paymentDetails.cardType.toUpperCase(),
        invoice.paymentDetails.cardholderName,
        invoice.paymentDetails.accountNumber,
        noOfPackages,
      ],
    ],
    margin: { left: TABLE_MARGIN, right: TABLE_MARGIN },
    tableWidth: TABLE_WIDTH,
    theme: 'plain',
    styles: { fontSize: FONT_SIZE_BODY, cellPadding: 4 },
    headStyles: { fillColor: TABLE_HEAD_BG, fontStyle: 'bold', textColor: [0, 0, 0] },
    bodyStyles: { fillColor: TABLE_BODY_BG, textColor: TABLE_BODY_TEXT },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
  y += SECTION_GAP;

  // Delivery Details / Services — start on new page
  const deliveryGroups = buildDeliveryGroups(invoice);
  if (deliveryGroups.length > 0) {
    doc.addPage();
    y = MARGIN;

    doc.setFontSize(FONT_SIZE_HEADING);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Details', TABLE_MARGIN, y);
    y += 4;

    const mainHeaders = [
      'Customer name',
      'Postcode',
      'Delivery ID',
      'Total Packages',
      'Total Weight',
      'Total Amount',
    ];
    // Sub-header: empty (Customer name col), Tracking ID, Weight, Dimensions (cm), empty (Total Weight col), Amount
    const subRowHeaders = ['', 'Tracking ID', 'Weight', 'Dimensions (cm)', '', 'Amount'];
    const rows: string[][] = [];
    const subHeaderRowIndices = new Set<number>();
    let rowIndex = 0;

    for (const group of deliveryGroups) {
      rows.push([
        group.customerName,
        group.postcode,
        group.deliveryId,
        group.totalPackages,
        group.totalWeight,
        group.totalAmount,
      ]);
      rowIndex += 1;
      rows.push(subRowHeaders);
      subHeaderRowIndices.add(rowIndex);
      rowIndex += 1;
      for (let pkgIdx = 0; pkgIdx < group.packages.length; pkgIdx++) {
        const pkg = group.packages[pkgIdx];
        const amount = formatCurrency(parseFloat(String(pkg.value).replace(/[£,\s]/g, '')) || 0);
        const packageLabel = `Package ${String(pkgIdx + 1).padStart(2, '0')}`;
        rows.push([packageLabel, pkg.trackingId, pkg.weight, pkg.dimensions, '', amount]);
        rowIndex += 1;
      }
    }

    const ROW_LINE_COLOR: [number, number, number] = [229, 231, 235];

    autoTable(doc, {
      startY: y,
      head: [mainHeaders],
      body: rows,
      margin: { left: TABLE_MARGIN, right: TABLE_MARGIN },
      tableWidth: TABLE_WIDTH,
      theme: 'plain',
      styles: { fontSize: FONT_SIZE_BODY - 1, cellPadding: 3 },
      headStyles: { fillColor: TABLE_HEAD_GRAY_200, fontStyle: 'bold', textColor: [0, 0, 0] },
      bodyStyles: { fillColor: TABLE_BODY_BG, textColor: TABLE_BODY_TEXT },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'left' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && subHeaderRowIndices.has(data.row.index)) {
          data.cell.styles.fillColor = TABLE_HEAD_BG;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
      didDrawCell: (data) => {
        // Draw bottom border for each row (header + body), full table width
        const isLastCol = data.column.index === 5;
        if (!isLastCol) return;
        doc.setDrawColor(...ROW_LINE_COLOR);
        doc.setLineWidth(0.2);
        const cell = data.cell;
        const lineY = cell.y + cell.height;
        doc.line(TABLE_MARGIN, lineY, TABLE_MARGIN + TABLE_WIDTH, lineY);
      },
    });
    y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
    y += SECTION_GAP;
  }

  // Summary
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', TABLE_MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Label', 'Value']],
    body: [
      ['VAT', invoice.vat],
      ['Total', invoice.total],
    ],
    margin: { left: TABLE_MARGIN, right: TABLE_MARGIN },
    tableWidth: TABLE_WIDTH,
    theme: 'plain',
    styles: { fontSize: FONT_SIZE_BODY, cellPadding: 4 },
    headStyles: { fillColor: TABLE_HEAD_BG, fontStyle: 'bold', textColor: [0, 0, 0] },
    bodyStyles: { fillColor: TABLE_BODY_BG, textColor: TABLE_BODY_TEXT },
    columnStyles: {
      0: { cellWidth: TABLE_WIDTH / 2, halign: 'left' },
      1: { cellWidth: TABLE_WIDTH / 2, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'right';
      }
    },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
  y += SECTION_GAP;

  // Footer (same as statement)
  const logoRowHeight = LOGO_FOOTER_HEIGHT + 6;
  const footerHeight = logoRowHeight + 22;
  let footerY = y + FOOTER_TOP_PADDING;
  if (footerY + footerHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    footerY = MARGIN + FOOTER_TOP_PADDING;
  }
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, footerY - 4, PAGE_WIDTH - MARGIN, footerY - 4);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', MARGIN, footerY, LOGO_FOOTER_WIDTH, LOGO_FOOTER_HEIGHT);
  } else {
    doc.setFontSize(FONT_SIZE_BODY - 1);
    doc.setFont('helvetica', 'bold');
    doc.text(STATEMENT_FOOTER_CONFIG.logoAlt, MARGIN, footerY + FOOTER_LINE_HEIGHT);
  }

  const infoRowY = footerY + logoRowHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT_SIZE_BODY - 2);
  doc.text(`${STATEMENT_FOOTER_CONFIG.emailLabel}:`, MARGIN, infoRowY + FOOTER_LINE_HEIGHT);
  doc.setFont('helvetica', 'bold');
  doc.text(STATEMENT_FOOTER_CONFIG.email, MARGIN, infoRowY + FOOTER_LINE_HEIGHT * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${STATEMENT_FOOTER_CONFIG.contactLabel}: ${STATEMENT_FOOTER_CONFIG.contactValue}`,
    MARGIN,
    infoRowY + FOOTER_LINE_HEIGHT * 3
  );
  doc.text(
    `${STATEMENT_FOOTER_CONFIG.addressLabel}: ${STATEMENT_FOOTER_CONFIG.addressValue}`,
    MARGIN,
    infoRowY + FOOTER_LINE_HEIGHT * 4
  );

  const rightColX = PAGE_WIDTH - MARGIN - 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(FONT_SIZE_BODY - 1);
  doc.text(STATEMENT_FOOTER_CONFIG.shipmentHeading, rightColX, infoRowY + FOOTER_LINE_HEIGHT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT_SIZE_BODY - 2);
  STATEMENT_FOOTER_CONFIG.shipmentLines.forEach((line, i) => {
    doc.text(line, rightColX, infoRowY + FOOTER_LINE_HEIGHT * (2.2 + i * 1.1));
  });

  const safeId = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  const filename = `invoice-${safeId}.pdf`;
  doc.save(filename);
}
