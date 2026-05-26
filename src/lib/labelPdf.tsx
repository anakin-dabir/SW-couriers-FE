import { pdf } from '@react-pdf/renderer';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import OrderLabelPdf, {
  type BarcodeImage,
  type LabelSpec,
  type PreparedLabel,
} from '@/components/pages/Labels/OrderLabelPdf';
import { registerLabelPdfFonts } from '@/lib/labelPdfFonts';
import { SwCouriersLogo } from '@/assets/svg';

export type { BarcodeImage, LabelSpec, PreparedLabel };

const BARCODE_MODULE_WIDTH = 2;
const BARCODE_HEIGHT = 144;
const QR_RENDER_SIZE = 188;
const LOGO_RENDER_WIDTH = 320;
const LOGO_RENDER_HEIGHT = 208;

function safeValue(value: string): string {
  return value && value.length > 0 ? value : ' ';
}

function makeHorizontalBarcode(value: string): BarcodeImage {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, safeValue(value), {
    format: 'CODE128',
    width: BARCODE_MODULE_WIDTH,
    height: BARCODE_HEIGHT,
    displayValue: false,
    margin: 0,
    background: '#FFFFFF',
    lineColor: '#000000',
  });
  return {
    src: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  };
}

function makeRotatedBarcode(value: string): BarcodeImage {
  const baseCanvas = document.createElement('canvas');
  JsBarcode(baseCanvas, safeValue(value), {
    format: 'CODE128',
    width: BARCODE_MODULE_WIDTH,
    height: BARCODE_HEIGHT,
    displayValue: false,
    margin: 0,
    background: '#FFFFFF',
    lineColor: '#000000',
  });
  const rotated = document.createElement('canvas');
  rotated.width = baseCanvas.height;
  rotated.height = baseCanvas.width;
  const ctx = rotated.getContext('2d');
  if (!ctx) {
    return {
      src: baseCanvas.toDataURL('image/png'),
      width: baseCanvas.width,
      height: baseCanvas.height,
    };
  }
  ctx.translate(rotated.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(baseCanvas, 0, 0);
  return {
    src: rotated.toDataURL('image/png'),
    width: rotated.width,
    height: rotated.height,
  };
}

async function makeQrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(safeValue(value), {
    margin: 0,
    width: QR_RENDER_SIZE,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

let cachedLogoPromise: Promise<string> | null = null;
async function loadLogoDataUrl(): Promise<string> {
  if (cachedLogoPromise) return cachedLogoPromise;
  cachedLogoPromise = (async (): Promise<string> => {
    const response = await fetch(SwCouriersLogo);
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new globalThis.Image();
        element.crossOrigin = 'anonymous';
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('Failed to load SW Couriers logo for PDF'));
        element.src = objectUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = LOGO_RENDER_WIDTH;
      canvas.height = LOGO_RENDER_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable for logo render');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  })();
  try {
    return await cachedLogoPromise;
  } catch (error) {
    cachedLogoPromise = null;
    throw error;
  }
}

async function prepareLabel(spec: LabelSpec): Promise<PreparedLabel> {
  const horizontalBarcode = makeHorizontalBarcode(spec.barcodeValue);
  const verticalBarcode = makeRotatedBarcode(spec.barcodeValue);
  const qrDataUrl = await makeQrDataUrl(spec.qrValue);
  return { ...spec, horizontalBarcode, verticalBarcode, qrDataUrl };
}

export async function renderLabelPdfBlob(
  specs: LabelSpec[],
  options?: { title?: string }
): Promise<Blob | null> {
  if (specs.length === 0) return null;
  registerLabelPdfFonts();
  const logoDataUrl = await loadLogoDataUrl();
  const labels = await Promise.all(specs.map((spec) => prepareLabel(spec)));
  return pdf(
    <OrderLabelPdf labels={labels} logoDataUrl={logoDataUrl} title={options?.title} />
  ).toBlob();
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function printBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  printWindow.document.title = fileName;
  printWindow.onload = () => {
    printWindow.document.title = fileName;
    printWindow.focus();
    printWindow.print();
  };
}

export function labelPdfFileName(
  prefix: 'master-label' | 'package-label',
  labelId: string
): string {
  return `${prefix}-${labelId.replace(/[^A-Za-z0-9._-]/g, '-')}.pdf`;
}

export function packageLabelsPdfFileName(packageIds: string[]): string {
  const validIds = packageIds.filter(Boolean);
  const rawName = validIds.length > 0 ? `package-labels-${validIds.join('-')}` : 'package-labels';
  return `${rawName.replace(/[^A-Za-z0-9._-]/g, '-')}.pdf`;
}
