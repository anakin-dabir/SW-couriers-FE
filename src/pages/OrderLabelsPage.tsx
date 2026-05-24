/* eslint-disable react/forbid-elements -- ported as-is from the admin portal so the
   layout stays in lockstep; raw `<p>`/`<h2>` mirror the admin markup. Refactor to
   <Typography> if/when the design is reworked. */
import type React from 'react';
import type { jsPDF } from 'jspdf';
import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Download, FileText, Loader2, Plus, Printer } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Separator } from '@/components/atoms/separator';
import PrintableLabelCard from '@/components/pages/Labels/PrintableLabelCard';
import { DeliveryInvoiceModal } from '@/components/pages/DeliveryDetail';
import { SuccessBox } from '@/assets';
import { cn } from '@/lib/utils';
import { useGetOrderMasterLabelQuery } from '@/store/api';

const LABEL_WIDTH_PX = 460;
const LABEL_HEIGHT_PX = 740;

const LABEL_CANVAS_SCALE = 2;

/** Static lookup payload shown when simulating a QR or barcode scan on labels (preview / dev). */
const MOCK_PACKAGE_LOOKUP_RESPONSE = {
  success: true,
  data: {
    package_id: '7d537aa1-2afa-424a-ba8b-23b495891cd4',
    reference_number: 'PKG-00000051',
    status: 'OUT_FOR_DELIVERY',
    matched_by: 'PACKAGE',
    master_label_id: null,
    packages_confirmed: 1,
  },
} as const;

type SimulatedScanSource = 'qr' | 'barcode';
type LabelAction =
  | 'download-master'
  | 'print-master'
  | 'download-all'
  | 'print-all'
  | `download-package:${string}`
  | `print-package:${string}`;

function formatLabelNumber(value: number | string | null | undefined, suffix = ''): string {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = Number(value);
  const formatted = Number.isFinite(numeric) ? numeric.toLocaleString('en-GB') : String(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function labelPdfFileName(prefix: 'master-label' | 'package-label', labelId: string): string {
  return `${prefix}-${labelId.replace(/[^A-Za-z0-9._-]/g, '-')}.pdf`;
}

function packageLabelsPdfFileName(packageIds: string[]): string {
  const validIds = packageIds.filter(Boolean);
  const rawName = validIds.length > 0 ? `package-labels-${validIds.join('-')}` : 'package-labels';
  return `${rawName.replace(/[^A-Za-z0-9._-]/g, '-')}.pdf`;
}

export default function OrderLabelsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navState = location.state as { orderId?: unknown; orderReference?: unknown } | null;
  const stateOrderUuid =
    typeof navState?.orderId === 'string' && navState.orderId.length > 0
      ? navState.orderId
      : undefined;
  const stateOrderReference =
    typeof navState?.orderReference === 'string' && navState.orderReference.length > 0
      ? navState.orderReference
      : undefined;
  const isCreateOrderFlow = !id;
  const [simulatedScanSource, setSimulatedScanSource] = useState<SimulatedScanSource | null>(null);
  const [labelAction, setLabelAction] = useState<LabelAction | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Display label is the human-readable SWC-ORD-… reference; the master-label API
  // takes the order UUID. PendingPickupPage surfaces both via location state.
  const bookingId = id ?? stateOrderReference ?? stateOrderUuid ?? 'SWC-BK-01234';
  const labelsOrderId = id ?? stateOrderUuid ?? '';
  const {
    data: labelsData,
    isLoading: isLabelsLoading,
    isFetching: isLabelsFetching,
  } = useGetOrderMasterLabelQuery(labelsOrderId, { skip: !labelsOrderId });
  const labelPayload = labelsData?.data;
  const masterLabel = labelPayload?.master_label;
  const pickupLabels = useMemo(
    () => labelPayload?.pickup_labels ?? [],
    [labelPayload?.pickup_labels]
  );

  const packageLabels = useMemo(
    () => pickupLabels.map((label, idx) => label.package_id || `PKG-${idx + 1}`),
    [pickupLabels]
  );
  const isLabelsBusy = Boolean(labelsOrderId) && (isLabelsLoading || isLabelsFetching);
  const hasLabels = Boolean(masterLabel) || pickupLabels.length > 0;
  const qrValue = useMemo(
    () => masterLabel?.qr_value || masterLabel?.master_label_id || bookingId,
    [bookingId, masterLabel]
  );
  const masterLabelCode =
    masterLabel?.master_label_id ?? `ML-${bookingId.replace(/[^A-Za-z0-9]/g, '')}`;
  const masterBarcodeValue = masterLabelCode;
  const masterCardRef = useRef<HTMLDivElement | null>(null);
  const packageCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const createPdfFromElement = async (element: HTMLDivElement): Promise<jsPDF> => {
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(element, {
      scale: LABEL_CANVAS_SCALE,
      backgroundColor: '#ffffff',
      useCORS: true,
      width: LABEL_WIDTH_PX,
      height: LABEL_HEIGHT_PX,
      windowWidth: LABEL_WIDTH_PX,
      windowHeight: LABEL_HEIGHT_PX,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument, clonedElement) => {
        if (clonedDocument.documentElement) {
          clonedDocument.documentElement.style.fontSize = '16px';
        }

        if (clonedDocument.body) {
          clonedDocument.body.style.margin = '0';
          clonedDocument.body.style.padding = '0';
        }
        if (clonedElement instanceof HTMLElement) {
          clonedElement.style.width = `${LABEL_WIDTH_PX}px`;
          clonedElement.style.height = `${LABEL_HEIGHT_PX}px`;
          clonedElement.style.minWidth = `${LABEL_WIDTH_PX}px`;
          clonedElement.style.maxWidth = `${LABEL_WIDTH_PX}px`;
          clonedElement.style.minHeight = `${LABEL_HEIGHT_PX}px`;
          clonedElement.style.maxHeight = `${LABEL_HEIGHT_PX}px`;
          clonedElement.style.transform = 'none';
          clonedElement.style.transformOrigin = 'top left';
          clonedElement.style.margin = '0';
          clonedElement.style.position = 'fixed';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
        }
      },
    });
    const imageData = canvas.toDataURL('image/png');
    const JsPDFCtor = JsPDF as unknown as new (options: {
      orientation: 'p' | 'portrait' | 'l' | 'landscape';
      unit: 'px';
      format: [number, number];
      hotfixes: string[];
      compress?: boolean;
    }) => jsPDF;
    const pdf = new JsPDFCtor({
      orientation: 'p',
      unit: 'px',
      format: [LABEL_WIDTH_PX, LABEL_HEIGHT_PX],
      hotfixes: ['px_scaling'],
      compress: true,
    });
    pdf.addImage(imageData, 'PNG', 0, 0, LABEL_WIDTH_PX, LABEL_HEIGHT_PX, undefined, 'FAST');
    return pdf;
  };

  const printPdf = (pdf: jsPDF, fileName: string): void => {
    const title = fileName.replace(/\.pdf$/i, '');
    pdf.setProperties({ title });

    const blobUrl = pdf.output('bloburl');
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.title = fileName;
    printWindow.onload = () => {
      printWindow.document.title = fileName;
      printWindow.focus();
      printWindow.print();
    };
  };

  const downloadMasterPdf = async (): Promise<void> => {
    if (!masterCardRef.current) return;
    const pdf = await createPdfFromElement(masterCardRef.current);
    pdf.save(labelPdfFileName('master-label', masterLabelCode));
  };

  const printMasterPdf = async (): Promise<void> => {
    if (!masterCardRef.current) return;
    const pdf = await createPdfFromElement(masterCardRef.current);
    printPdf(pdf, labelPdfFileName('master-label', masterLabelCode));
  };

  const downloadPackagePdf = async (packageId: string): Promise<void> => {
    const element = packageCardRefs.current[packageId];
    if (!element) return;
    const pdf = await createPdfFromElement(element);
    pdf.save(labelPdfFileName('package-label', packageId));
  };

  const printPackagePdf = async (packageId: string): Promise<void> => {
    const element = packageCardRefs.current[packageId];
    if (!element) return;
    const pdf = await createPdfFromElement(element);
    printPdf(pdf, labelPdfFileName('package-label', packageId));
  };

  const createPdfForAllPackages = async (): Promise<jsPDF | null> => {
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const JsPDFCtor = JsPDF as unknown as new (options: {
      orientation: 'p' | 'portrait' | 'l' | 'landscape';
      unit: 'px';
      format: [number, number];
      hotfixes: string[];
      compress?: boolean;
    }) => jsPDF;
    const pdf = new JsPDFCtor({
      orientation: 'p',
      unit: 'px',
      format: [LABEL_WIDTH_PX, LABEL_HEIGHT_PX],
      hotfixes: ['px_scaling'],
      compress: true,
    });
    let hasPage = false;

    for (const packageId of packageLabels) {
      const element = packageCardRefs.current[packageId];
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: LABEL_CANVAS_SCALE,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: LABEL_WIDTH_PX,
        height: LABEL_HEIGHT_PX,
        windowWidth: LABEL_WIDTH_PX,
        windowHeight: LABEL_HEIGHT_PX,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDocument, clonedElement) => {
          // Pin the rem baseline (see createPdfFromElement comment).
          if (clonedDocument.documentElement) {
            clonedDocument.documentElement.style.fontSize = '16px';
          }
          if (clonedDocument.body) {
            clonedDocument.body.style.margin = '0';
            clonedDocument.body.style.padding = '0';
          }
          if (clonedElement instanceof HTMLElement) {
            // See createPdfFromElement above — pin to 460×740 at (0,0) of the sandbox.
            clonedElement.style.width = `${LABEL_WIDTH_PX}px`;
            clonedElement.style.height = `${LABEL_HEIGHT_PX}px`;
            clonedElement.style.minWidth = `${LABEL_WIDTH_PX}px`;
            clonedElement.style.maxWidth = `${LABEL_WIDTH_PX}px`;
            clonedElement.style.minHeight = `${LABEL_HEIGHT_PX}px`;
            clonedElement.style.maxHeight = `${LABEL_HEIGHT_PX}px`;
            clonedElement.style.transform = 'none';
            clonedElement.style.transformOrigin = 'top left';
            clonedElement.style.margin = '0';
            clonedElement.style.position = 'fixed';
            clonedElement.style.left = '0';
            clonedElement.style.top = '0';
          }
        },
      });
      const imageData = canvas.toDataURL('image/png');
      if (hasPage) {
        pdf.addPage([LABEL_WIDTH_PX, LABEL_HEIGHT_PX], 'p');
      }
      pdf.addImage(imageData, 'PNG', 0, 0, LABEL_WIDTH_PX, LABEL_HEIGHT_PX, undefined, 'FAST');
      hasPage = true;
    }

    if (hasPage) {
      return pdf;
    }
    return null;
  };

  const downloadAllPackagePdfs = async (): Promise<void> => {
    const pdf = await createPdfForAllPackages();
    if (!pdf) return;
    pdf.save(packageLabelsPdfFileName(packageLabels));
  };

  const printAllPackagePdfs = async (): Promise<void> => {
    const pdf = await createPdfForAllPackages();
    if (!pdf) return;
    printPdf(pdf, packageLabelsPdfFileName(packageLabels));
  };

  const runLabelAction = async (action: LabelAction, task: () => Promise<void>): Promise<void> => {
    if (labelAction !== null) return;
    setLabelAction(action);
    try {
      await task();
    } finally {
      setLabelAction(null);
    }
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F3F4F6] p-3 sm:p-4">
      <div className={cn(' space-y-4', isCreateOrderFlow && 'px-24')}>
        {isCreateOrderFlow ? (
          <section className="rounded-xl  px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <div className="flex  items-center justify-center rounded-full ">
                <img src={SuccessBox} alt="Success" className=" text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-[#858594]">
                  Order ID{' '}
                  <span className="underline decoration-[#858594] underline-offset-2">
                    # {bookingId}
                  </span>
                </p>
                <h2 className="text-4xl font-semibold text-[#1A1A1A]">
                  Order Created successfully!
                </h2>
                <p className="text-base text-[#464649] sm:text-lg">
                  Labels have been generated for all Packages in this Order
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 h-11 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B]"
                  onClick={() => void navigate('/deliveries/list')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 h-11 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B] disabled:opacity-50"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  disabled={!bookingId}
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Button>
                <Button
                  type="button"
                  className="min-h-11 h-11 bg-[#AE2224] px-4 text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B]"
                  onClick={() => void navigate('/deliveries/pending')}
                >
                  <Plus className="h-4 w-4" />
                  Create a new Order
                </Button>
              </div>
            </div>
            <Separator className="my-4" />
          </section>
        ) : (
          <div className=" px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => void navigate(`/deliveries/${bookingId}`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold text-[#18181B]">View Labels</h1>
              </div>
            </div>
          </div>
        )}

        {isLabelsBusy ? (
          <div className="flex items-center justify-center px-6 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#858594]" aria-label="Loading labels" />
          </div>
        ) : !hasLabels ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-24 text-center">
            <AlertCircle className="h-8 w-8 text-[#858594]" />
            <p className="text-base font-medium text-[#18181B]">No labels available</p>
            <p className="text-sm text-[#858594]">
              There are no labels generated for this order yet.
            </p>
          </div>
        ) : (
          <>
            <div className=" p-6">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-end">
                <div className="flex min-w-0 flex-1 flex-col gap-12 py-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-medium leading-tight text-[#18181B] sm:text-4xl">
                        Master Pickup Label
                      </h3>
                      <span className="rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-semibold text-[#FAFCFF]">
                        MASTER LABEL
                      </span>
                    </div>
                    <p className="max-w-[520px] text-lg leading-8 tracking-[0.02em] text-[#464649] sm:text-2xl">
                      This is a Master label for this Booking Order. The driver can scan this label
                      once to collect information of all packages in this order.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void runLabelAction('download-master', downloadMasterPdf)}
                      disabled={labelAction !== null}
                      className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#E4E4E7] bg-white text-[#18181B] disabled:opacity-70"
                    >
                      {labelAction === 'download-master' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {labelAction === 'download-master' ? 'Downloading…' : 'Download PDF'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void runLabelAction('print-master', printMasterPdf)}
                      disabled={labelAction !== null}
                      className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#AE2224] bg-[#AE2224] text-[#FAFAFA] hover:border-[#991B1B] hover:bg-[#991B1B] disabled:opacity-70"
                    >
                      {labelAction === 'print-master' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4" />
                      )}
                      {labelAction === 'print-master' ? 'Printing…' : 'Print Master Label'}
                    </Button>
                  </div>
                </div>

                <PrintableLabelCard
                  labelType="master"
                  cardRef={masterCardRef}
                  trackingId={labelPayload?.order_id ?? bookingId}
                  orderIdText={labelPayload?.order_id ?? bookingId}
                  qrValue={qrValue}
                  barcodeValue={masterBarcodeValue}
                  rightHeaderText=""
                  primaryTitle="Pickup Address:"
                  primaryAddress={
                    masterLabel?.pickup_address ?? 'John Smith 21 Baker Street London, W1U 3BW UK'
                  }
                  packageIdText={`Master Label: ${masterLabelCode}`}
                  deliveryStopsText={formatLabelNumber(masterLabel?.delivery_stops_count)}
                  totalPackagesText={formatLabelNumber(masterLabel?.total_packages)}
                  weightText={formatLabelNumber(masterLabel?.total_weight_kg ?? '13.8', 'kg')}
                  dimensionsText="40 x 30 x 20 cm"
                  volumeText={formatLabelNumber(masterLabel?.total_volume_m3 ?? '0.18', 'm³')}
                  returnAddressText="SW Couriers, Unit 25, Thompson Dr, Birmingham B24 8HZ"
                  onSimulateQrScan={() => setSimulatedScanSource('qr')}
                  onSimulateBarcodeScan={() => setSimulatedScanSource('barcode')}
                />
              </div>
            </div>
            {simulatedScanSource !== null ? (
              <div className="border-t border-[#E4E4E7] bg-[#FAFCFF] px-6 py-4">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#0F54C7]">
                      Scan lookup (simulated)
                    </p>
                    <p className="mt-1 text-sm text-[#464649]">
                      Triggered by{' '}
                      <span className="font-semibold text-[#18181B]">
                        {simulatedScanSource === 'qr' ? 'QR code' : 'Barcode'}
                      </span>{' '}
                      scan — static response:
                    </p>
                    <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">package_id</dt>
                        <dd className="font-mono text-[13px] text-[#18181B]">
                          {MOCK_PACKAGE_LOOKUP_RESPONSE.data.package_id}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">reference_number</dt>
                        <dd className="font-semibold text-[#18181B]">
                          {MOCK_PACKAGE_LOOKUP_RESPONSE.data.reference_number}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">status</dt>
                        <dd className="text-[#18181B]">
                          {MOCK_PACKAGE_LOOKUP_RESPONSE.data.status}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">matched_by</dt>
                        <dd className="text-[#18181B]">
                          {MOCK_PACKAGE_LOOKUP_RESPONSE.data.matched_by}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">master_label_id</dt>
                        <dd className="text-[#18181B]">
                          {MOCK_PACKAGE_LOOKUP_RESPONSE.data.master_label_id === null
                            ? 'null'
                            : MOCK_PACKAGE_LOOKUP_RESPONSE.data.master_label_id}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-[#858594]">packages_confirmed</dt>
                        <dd className="text-[#18181B]">
                          {String(MOCK_PACKAGE_LOOKUP_RESPONSE.data.packages_confirmed)}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs font-medium text-[#858594]">
                      success: {String(MOCK_PACKAGE_LOOKUP_RESPONSE.success)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 border-[#E4E4E7] bg-white text-[#18181B]"
                    onClick={() => setSimulatedScanSource(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null}
            <Separator />

            <section className="space-y-6 px-6 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium text-[#18181B]">Package Labels</h2>
                  <p className="mt-2 text-base tracking-[0.02em] text-[#464649]">
                    You can download and print labels again at anytime.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void runLabelAction('download-all', downloadAllPackagePdfs)}
                    disabled={labelAction !== null}
                    className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#E4E4E7] bg-white text-[#18181B] disabled:opacity-70"
                  >
                    {labelAction === 'download-all' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {labelAction === 'download-all' ? 'Downloading…' : 'Download All Labels'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void runLabelAction('print-all', printAllPackagePdfs)}
                    disabled={labelAction !== null}
                    className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#AE2224] bg-[#AE2224] text-[#FAFAFA] hover:border-[#991B1B] hover:bg-[#991B1B] disabled:opacity-70"
                  >
                    {labelAction === 'print-all' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4" />
                    )}
                    {labelAction === 'print-all' ? 'Printing…' : 'Print All Labels'}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#D2E4FF] bg-[#FAFCFF] px-3 py-2">
                <div className="mt-0.5 rounded-full bg-[#D2E4FF66] p-1.5">
                  <AlertCircle className="h-4 w-4 text-[#0F54C7]" />
                </div>
                <p className="text-sm font-medium leading-5 text-[#0F54C7]">
                  Individual labels must still be attached to each package.
                  <br />
                  These will be scanned by the delivery driver at delivery stop and by the warehouse
                  team during sorting.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {packageLabels.map((packageId, index) => {
                  const label = pickupLabels[index];
                  return (
                    <PrintableLabelCard
                      key={packageId}
                      cardRef={(element) => {
                        packageCardRefs.current[packageId] = element;
                      }}
                      trackingId={label?.tracking_id ?? `SWBHM-9845${23 + index}`}
                      qrValue={packageId}
                      barcodeValue={packageId}
                      rightHeaderText={label?.delivery_label ?? '5 Days Delivery'}
                      primaryTitle="FROM:"
                      primaryAddress={
                        label?.pickup_address ??
                        'UrbanNest Home Ltd 12 Industrial Road Manchester, M1 2AB'
                      }
                      secondaryTitle="TO:"
                      secondaryAddress={
                        label
                          ? `${label.recipient_name} ${label.recipient_address}`
                          : 'John Smith 21 Baker Street London, W1U 3BW UK'
                      }
                      packageIdText={`Package ID: #${packageId}`}
                      weightText={`${label?.weight_kg ?? '2.3'} kg`}
                      dimensionsText={label?.dimensions_cm ?? '40 x 30 x 25 cm'}
                      volumeText={formatLabelNumber(label?.volume_m3 ?? '0.03', 'm³')}
                      returnAddressText={
                        label?.return_address ??
                        'SW Couriers, Unit 25, Thompson Dr, Birmingham B24 8HZ'
                      }
                      signatureRequired={label?.signature_required ?? true}
                      showActions
                      actionsDisabled={labelAction !== null}
                      downloadPending={labelAction === `download-package:${packageId}`}
                      printPending={labelAction === `print-package:${packageId}`}
                      onDownloadClick={() =>
                        void runLabelAction(`download-package:${packageId}`, () =>
                          downloadPackagePdf(packageId)
                        )
                      }
                      onPrintClick={() =>
                        void runLabelAction(`print-package:${packageId}`, () =>
                          printPackagePdf(packageId)
                        )
                      }
                      onSimulateQrScan={() => setSimulatedScanSource('qr')}
                      onSimulateBarcodeScan={() => setSimulatedScanSource('barcode')}
                    />
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
      <DeliveryInvoiceModal
        orderReference={stateOrderReference ?? bookingId}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
