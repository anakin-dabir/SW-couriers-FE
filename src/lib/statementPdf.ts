/**
 * Generate and download a Statement PDF matching the Statement modal UI.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type DateRange } from 'react-day-picker';
import type { BillingInvoice } from '@/types/billing';
import { formatStatementDateRange, formatCurrency, calculateStatementMetrics } from '@/lib/utils';
import { getStatementSummaryItems, STATEMENT_FOOTER_CONFIG } from '@/lib/data';

// Logo SVG URL (Vite resolves to public URL); used to draw logo in PDF via canvas
import { SwCouriersLogo } from '@/assets/svg';

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
/** Horizontal margin for tables only — smaller than MARGIN so table uses more width */
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

// Table styling to match UI: light grey card look, no borders
const TABLE_HEAD_BG: [number, number, number] = [249, 250, 251]; // #F9FAFB
const TABLE_BODY_BG: [number, number, number] = [249, 250, 251];
const TABLE_BODY_TEXT: [number, number, number] = [51, 51, 51]; // #333333
const STATUS_UNPAID_BG: [number, number, number] = [255, 159, 0]; // orange
const STATUS_PAID_BG: [number, number, number] = [40, 167, 69]; // green
const STATUS_OVERDUE_BG: [number, number, number] = [220, 53, 69]; // red
const STATUS_BADGE_TEXT: [number, number, number] = [255, 255, 255];

/** Bill To section content (matches StatementModal UI) */
const BILL_TO = {
  companyName: 'Opus Retail Ltd',
  email: 'accounts@shiftopus.co.uk',
  address: '55 Bridge End, Cardiff, CF10 2BN, United Kingdom',
} as const;

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

/**
 * Load SVG from URL, draw to canvas, return PNG data URL for use in jsPDF.
 */
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

/**
 * Generates a PDF of the statement (same structure as Statement modal) and triggers download.
 * Loads the SW Couriers logo and embeds it in the header and footer.
 */
export async function downloadStatementPdf(
  dateRange: DateRange | undefined,
  invoices: BillingInvoice[]
): Promise<void> {
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadSvgAsPngDataUrl(SwCouriersLogo);
  } catch {
    // If logo fails to load (e.g. CORS), PDF will still render without logo image
  }

  const doc = new jsPDF();
  let y = MARGIN;

  // Page header: logo (left) + title "Statement" and subtitle date range (same row as modal)
  const dateRangeStr = formatStatementDateRange(dateRange);
  const logoRight = MARGIN + LOGO_HEADER_WIDTH + 8;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', MARGIN, y - 2, LOGO_HEADER_WIDTH, LOGO_HEADER_HEIGHT);
  }
  doc.setFontSize(FONT_SIZE_TITLE);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement', logoRight, y + 4);
  y += LINE_HEIGHT + 2;
  doc.setFontSize(FONT_SIZE_SUBTITLE);
  doc.setFont('helvetica', 'normal');
  doc.text(dateRangeStr || '—', logoRight, y);
  y += LINE_HEIGHT + SECTION_GAP;

  // Bill To section (matches StatementModal)
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
  doc.setTextColor(107, 114, 128); // gray-500
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

  // Overview section
  const metrics = calculateStatementMetrics(invoices);
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', TABLE_MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [
      ['Total Paid', 'Total Unpaid', 'Total Overdue', 'Overdue Invoices', 'Total Invoice Amount'],
    ],
    body: [
      [
        formatCurrency(metrics.totalPaid),
        formatCurrency(metrics.totalUnpaid),
        formatCurrency(metrics.totalOverdue),
        String(metrics.overdueInvoices),
        formatCurrency(metrics.totalInvoiceAmount),
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

  // Invoices Details section — match screenshot: light grey rows, status badges, column alignment
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoices Details', TABLE_MARGIN, y);
  y += 4;

  const invoiceHeaders = [
    'Invoice #',
    'Issue Date',
    'Delivery Ref',
    'Payment Date',
    'Status',
    'Amount',
  ];
  const invoiceRows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.issueDate,
    inv.deliveryRef,
    inv.paymentDate,
    inv.status,
    inv.value,
  ]);

  autoTable(doc, {
    startY: y,
    head: [invoiceHeaders],
    body: invoiceRows,
    margin: { left: TABLE_MARGIN, right: TABLE_MARGIN },
    tableWidth: TABLE_WIDTH,
    theme: 'plain',
    styles: { fontSize: FONT_SIZE_BODY, cellPadding: 4 },
    headStyles: { fillColor: TABLE_HEAD_BG, fontStyle: 'bold', textColor: [0, 0, 0] },
    bodyStyles: { fillColor: TABLE_BODY_BG, textColor: TABLE_BODY_TEXT },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'left' },
      3: { halign: 'left' },
      4: { halign: 'center' },
      5: { halign: 'right' },
    },
    didParseCell: (data) => {
      // Status column: keep cell background light grey; clear text so we draw a chip in didDrawCell
      if (data.section === 'body' && data.column.index === 4) {
        data.cell.styles.fillColor = TABLE_BODY_BG;
        data.cell.raw = '';
      }
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 4) return;
      const status = String(invoiceRows[data.row.index]?.[4] ?? '').toLowerCase();
      const chipColor =
        status === 'unpaid'
          ? STATUS_UNPAID_BG
          : status === 'paid'
            ? STATUS_PAID_BG
            : status === 'overdue'
              ? STATUS_OVERDUE_BG
              : null;
      if (!chipColor || !status) return;
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      doc.setFontSize(FONT_SIZE_BODY);
      doc.setFont('helvetica', 'bold');
      const textW = doc.getTextWidth(label);
      const chipPad = 5;
      const chipW = textW + chipPad * 2;
      const chipH = 5;
      const chipRadius = 2.5; // border radius for pill-like chip
      const cell = data.cell;
      const chipX = cell.x + (cell.width - chipW) / 2;
      const chipY = cell.y + (cell.height - chipH) / 2;
      doc.setFillColor(...chipColor);
      doc.roundedRect(chipX, chipY, chipW, chipH, chipRadius, chipRadius, 'F');
      doc.setTextColor(...STATUS_BADGE_TEXT);
      doc.text(label, cell.x + cell.width / 2, chipY + chipH / 2 + 1.2, { align: 'center' });
      doc.setTextColor(...TABLE_BODY_TEXT);
    },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
  y += SECTION_GAP;

  // Summary section
  const summaryItems = getStatementSummaryItems(metrics);
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', TABLE_MARGIN, y);
  y += 4;

  const summaryHeaders = ['Label', 'Value'];
  const summaryRows = summaryItems.map((item) => [item.label, item.value]);

  autoTable(doc, {
    startY: y,
    head: [summaryHeaders],
    body: summaryRows,
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
      // Ensure "Value" header is right-aligned so it lines up with the values below
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'right';
      }
    },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? y;
  y += SECTION_GAP;

  // Page footer: logo on first row, other info (email, contact, address, shipment) on second row
  const logoRowHeight = LOGO_FOOTER_HEIGHT + 6;
  const footerHeight = logoRowHeight + 22;
  let footerY = y + FOOTER_TOP_PADDING;
  if (footerY + footerHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    footerY = MARGIN + FOOTER_TOP_PADDING;
  }
  {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, footerY - 4, PAGE_WIDTH - MARGIN, footerY - 4);

    // Row 1: logo only
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', MARGIN, footerY, LOGO_FOOTER_WIDTH, LOGO_FOOTER_HEIGHT);
    } else {
      doc.setFontSize(FONT_SIZE_BODY - 1);
      doc.setFont('helvetica', 'bold');
      doc.text(STATEMENT_FOOTER_CONFIG.logoAlt, MARGIN, footerY + FOOTER_LINE_HEIGHT);
    }

    // Row 2: email, contact, address (left) and shipment info (right)
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
  }

  // Filename: statement-YYYY-MM-DD-to-YYYY-MM-DD.pdf
  const fromStr =
    dateRange?.from && dateRange.from instanceof Date
      ? dateRange.from.toISOString().slice(0, 10)
      : 'start';
  const toStr =
    dateRange?.to && dateRange.to instanceof Date ? dateRange.to.toISOString().slice(0, 10) : 'end';
  const filename = `statement-${fromStr}-to-${toStr}.pdf`;

  doc.save(filename);
}
