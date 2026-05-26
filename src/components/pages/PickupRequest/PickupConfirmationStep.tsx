import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Download, Layers, Plus, Printer, ReceiptText } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { Button } from '@/components/atoms/Button';
import { Separator } from '@/components/atoms/separator';
import { PaymentConfirmationImage } from '@/assets/img';
import { cn } from '@/lib/utils';
import type { PickupConfirmationMock } from '@/lib/data';
import type { PaymentInvoiceMock } from '@/lib/paymentInvoiceTypes';
import { MOCK_PAYMENT_INVOICE } from '@/lib/paymentInvoiceMockData';
import {
  PICKUP_CONFIRMATION_ORDER_ID_LABEL,
  PICKUP_CONFIRMATION_ORDER_CREATED_TITLE,
  PICKUP_CONFIRMATION_LABELS_GENERATED_NOTE,
  PICKUP_CONFIRMATION_ILLUSTRATION_ALT,
  PICKUP_CONFIRMATION_MASTER_SECTION_TITLE,
  PICKUP_CONFIRMATION_MASTER_BADGE,
  PICKUP_CONFIRMATION_MASTER_DESCRIPTION,
  PICKUP_CONFIRMATION_DOWNLOAD_MASTER_LABEL,
  PICKUP_CONFIRMATION_PRINT_MASTER_LABEL,
  PICKUP_CONFIRMATION_PACKAGE_SECTION_TITLE,
  PICKUP_CONFIRMATION_PACKAGE_SECTION_SUBTITLE,
  PICKUP_CONFIRMATION_DOWNLOAD_ALL_LABELS,
  PICKUP_CONFIRMATION_PRINT_ALL_LABELS,
  PICKUP_CONFIRMATION_PACKAGE_INFO_BANNER,
  PICKUP_CONFIRMATION_COPY_BUTTON_LABEL,
  PICKUP_CONFIRMATION_COPIED_FEEDBACK,
  PICKUP_CONFIRMATION_GO_PENDING_LABEL,
  PICKUP_CONFIRMATION_CREATE_NEW_LABEL,
  PICKUP_CONFIRMATION_GO_DASHBOARD_LABEL,
  PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL,
} from '@/lib/data';
import { Badge } from '@/components/atoms/badge';
import {
  downloadBlob,
  type LabelSpec,
  labelPdfFileName,
  packageLabelsPdfFileName,
  printBlob,
  renderLabelPdfBlob,
} from '@/lib/labelPdf';
import PrintableLabelCard from './PrintableLabelCard';
import PickupInvoiceModal from './PickupInvoiceModal';

export interface PickupConfirmationStepProps {
  confirmation: PickupConfirmationMock;
  onGoPending: () => void;
  onCreateNew: () => void;
  onGoDashboard: () => void;
  /** When true, hides the top hero (illustration, order created copy, primary actions) — e.g. View Labels from order details. */
  hideConfirmationHeader?: boolean;
  /** Optional hooks after built-in PDF download / print (same behaviour as SW-Courier-FE-Admin OrderInvoicePage). */
  onDownloadMasterLabel?: () => void;
  onPrintMasterLabel?: () => void;
  onDownloadAllPackageLabels?: () => void;
  onPrintAllPackageLabels?: () => void;
  onDownloadPackageLabel?: (packageId: string) => void;
  onPrintPackageLabel?: (packageId: string) => void;
  className?: string;
}

const noop = (): void => {};

function bookingIdPlain(orderIdDisplay: string): string {
  return orderIdDisplay.replace(/^#\s*/, '').trim();
}

/**
 * Pickup confirmation screen (Figma 58:8289).
 * Label preview + PDF download/print aligned with SW-Courier-FE-Admin OrderInvoicePage + PrintableLabelCard.
 */
export default function PickupConfirmationStep({
  confirmation,
  onGoPending,
  onCreateNew,
  onGoDashboard,
  hideConfirmationHeader = false,
  onDownloadMasterLabel = noop,
  onPrintMasterLabel = noop,
  onDownloadAllPackageLabels = noop,
  onPrintAllPackageLabels = noop,
  onDownloadPackageLabel = noop,
  onPrintPackageLabel = noop,
  className,
}: PickupConfirmationStepProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const bookingId = useMemo(
    () => bookingIdPlain(confirmation.orderIdDisplay),
    [confirmation.orderIdDisplay]
  );

  const invoiceData = useMemo((): PaymentInvoiceMock => {
    return {
      ...MOCK_PAYMENT_INVOICE,
      bookingOrderId: bookingId,
      stops: MOCK_PAYMENT_INVOICE.stops.map((row) => ({
        ...row,
        trackingId: bookingId,
      })),
    };
  }, [bookingId]);

  const masterDimensions = confirmation.totalDimensions ?? '—';

  const handleCopyOrderId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(confirmation.orderIdDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [confirmation.orderIdDisplay]);

  const masterLabelSpec = useMemo<LabelSpec>(
    () => ({
      id: confirmation.masterLabelCode,
      labelType: 'master',
      trackingId: bookingId,
      orderIdText: bookingId,
      qrValue: confirmation.masterQrValue,
      barcodeValue: confirmation.masterBarcodeValue,
      rightHeaderText: '',
      primaryTitle: PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL,
      primaryAddress: confirmation.pickupAddress,
      packageIdText: `Master Label: ${confirmation.masterLabelCode}`,
      deliveryStopsText: confirmation.deliveryStops,
      totalPackagesText: confirmation.totalPackagesCount,
      weightText: confirmation.totalWeight,
      dimensionsText: masterDimensions,
      volumeText: confirmation.totalVolume,
      returnAddressText: confirmation.returnAddress,
    }),
    [bookingId, confirmation, masterDimensions]
  );

  const packageLabelSpecs = useMemo<LabelSpec[]>(
    () =>
      confirmation.packages.map((pkg) => ({
        id: pkg.id,
        labelType: 'package',
        trackingId: bookingIdPlain(pkg.trackingIdDisplay),
        qrValue: pkg.qrValue,
        barcodeValue: pkg.barcodeValue,
        rightHeaderText: pkg.deliverySla,
        primaryTitle: 'FROM:',
        primaryAddress: pkg.fromAddress,
        secondaryTitle: 'TO:',
        secondaryAddress: pkg.toAddress,
        packageIdText: `Package ID: ${pkg.packageIdDisplay}`,
        weightText: pkg.weight,
        dimensionsText: pkg.dimensions,
        volumeText: pkg.volume,
        returnAddressText: confirmation.returnAddress,
        signatureRequired: pkg.signatureRequiredValue.trim().toUpperCase() === 'YES',
      })),
    [confirmation.packages, confirmation.returnAddress]
  );

  const packageSpecsById = useMemo(() => {
    const map = new Map<string, LabelSpec>();
    for (const spec of packageLabelSpecs) map.set(spec.id, spec);
    return map;
  }, [packageLabelSpecs]);

  const packageIds = useMemo(
    () => confirmation.packages.map((pkg) => pkg.id),
    [confirmation.packages]
  );

  const downloadMasterPdf = useCallback(async (): Promise<void> => {
    const blob = await renderLabelPdfBlob([masterLabelSpec], {
      title: confirmation.masterLabelCode,
    });
    if (!blob) return;
    downloadBlob(blob, labelPdfFileName('master-label', confirmation.masterLabelCode));
    onDownloadMasterLabel();
  }, [confirmation.masterLabelCode, masterLabelSpec, onDownloadMasterLabel]);

  const printMasterPdf = useCallback(async (): Promise<void> => {
    const blob = await renderLabelPdfBlob([masterLabelSpec], {
      title: confirmation.masterLabelCode,
    });
    if (!blob) return;
    printBlob(blob, labelPdfFileName('master-label', confirmation.masterLabelCode));
    onPrintMasterLabel();
  }, [confirmation.masterLabelCode, masterLabelSpec, onPrintMasterLabel]);

  const downloadPackagePdf = useCallback(
    async (packageId: string): Promise<void> => {
      const spec = packageSpecsById.get(packageId);
      if (!spec) return;
      const blob = await renderLabelPdfBlob([spec], { title: packageId });
      if (!blob) return;
      downloadBlob(blob, labelPdfFileName('package-label', packageId));
      onDownloadPackageLabel(packageId);
    },
    [onDownloadPackageLabel, packageSpecsById]
  );

  const printPackagePdf = useCallback(
    async (packageId: string): Promise<void> => {
      const spec = packageSpecsById.get(packageId);
      if (!spec) return;
      const blob = await renderLabelPdfBlob([spec], { title: packageId });
      if (!blob) return;
      printBlob(blob, labelPdfFileName('package-label', packageId));
      onPrintPackageLabel(packageId);
    },
    [onPrintPackageLabel, packageSpecsById]
  );

  const downloadAllPackagePdfs = useCallback(async (): Promise<void> => {
    if (packageLabelSpecs.length === 0) return;
    const blob = await renderLabelPdfBlob(packageLabelSpecs, { title: 'Package Labels' });
    if (!blob) return;
    downloadBlob(blob, packageLabelsPdfFileName(packageIds));
    onDownloadAllPackageLabels();
  }, [onDownloadAllPackageLabels, packageIds, packageLabelSpecs]);

  const printAllPackagePdfs = useCallback(async (): Promise<void> => {
    if (packageLabelSpecs.length === 0) return;
    const blob = await renderLabelPdfBlob(packageLabelSpecs, { title: 'Package Labels' });
    if (!blob) return;
    printBlob(blob, packageLabelsPdfFileName(packageIds));
    onPrintAllPackageLabels();
  }, [onPrintAllPackageLabels, packageIds, packageLabelSpecs]);

  return (
    <div
      className={cn(
        'mx-auto flex w-[96%] overflow-y-auto flex-col gap-10 bg-white px-4 py-8 sm:px-6 sm:py-10',
        className
      )}
    >
      {hideConfirmationHeader ? null : (
        <>
          <header className="flex flex-col items-center gap-8 text-center">
            <img
              src={PaymentConfirmationImage}
              alt={PICKUP_CONFIRMATION_ILLUSTRATION_ALT}
              className="h-auto w-full max-w-[314px] object-contain"
            />

            <div className="flex w-full max-w-xl flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <Typography
                  variant="body"
                  weight="medium"
                  className="text-lg text-gray-700 sm:text-xl"
                >
                  {PICKUP_CONFIRMATION_ORDER_ID_LABEL}
                </Typography>
                <Typography
                  variant="h3"
                  weight="semibold"
                  className="text-xl text-gray-900 sm:text-2xl"
                >
                  {confirmation.orderIdDisplay}
                </Typography>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleCopyOrderId()}
                  className="shrink-0"
                >
                  {copied
                    ? PICKUP_CONFIRMATION_COPIED_FEEDBACK
                    : PICKUP_CONFIRMATION_COPY_BUTTON_LABEL}
                </Button>
              </div>
              <Typography variant="h4" weight="semibold" className="text-gray-900">
                {PICKUP_CONFIRMATION_ORDER_CREATED_TITLE}
              </Typography>
              <Typography
                variant="body"
                className="max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base"
              >
                {PICKUP_CONFIRMATION_LABELS_GENERATED_NOTE}
              </Typography>
            </div>

            <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onGoPending}
                className="min-w-36 flex-1 sm:flex-none"
              >
                {PICKUP_CONFIRMATION_GO_PENDING_LABEL}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setInvoiceModalOpen(true)}
                className="min-w-36 flex-1 sm:flex-none"
              >
                <ReceiptText className="h-4 w-4" /> View Invoice
              </Button>
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={onCreateNew}
                className="min-w-36 flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" /> {PICKUP_CONFIRMATION_CREATE_NEW_LABEL}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onGoDashboard}
                className="min-w-36 flex-1 sm:flex-none"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />{' '}
                {PICKUP_CONFIRMATION_GO_DASHBOARD_LABEL}
              </Button>
            </div>
          </header>

          <Separator className="bg-gray-200" />
        </>
      )}

      <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-end lg:gap-10">
        <div className="flex max-w-[520px] flex-col gap-4 lg:flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Typography
              variant="h4"
              weight="semibold"
              className="text-2xl text-gray-900 sm:text-3xl"
            >
              {PICKUP_CONFIRMATION_MASTER_SECTION_TITLE}
            </Typography>
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border-0 bg-[#3B82F6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FAFCFF]"
            >
              <Layers className="size-3.5 shrink-0 opacity-90" aria-hidden />
              {PICKUP_CONFIRMATION_MASTER_BADGE}
            </Badge>
          </div>
          <Typography variant="body" className="text-base leading-relaxed text-gray-600 sm:text-lg">
            {PICKUP_CONFIRMATION_MASTER_DESCRIPTION}
          </Typography>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B]"
              onClick={() => void downloadMasterPdf()}
            >
              <Download className="h-4 w-4" />
              {PICKUP_CONFIRMATION_DOWNLOAD_MASTER_LABEL}
            </Button>
            <Button
              type="button"
              variant="default"
              className="h-10 bg-[#AE2224] px-4 text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B]"
              onClick={() => void printMasterPdf()}
            >
              <Printer className="h-4 w-4" />
              {PICKUP_CONFIRMATION_PRINT_MASTER_LABEL}
            </Button>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 lg:max-w-[492px]">
          <PrintableLabelCard
            verticalBarcodeWidth={0.8}
            trackingId={bookingId}
            qrValue={confirmation.masterQrValue}
            barcodeValue={confirmation.masterBarcodeValue}
            rightHeaderText={`ORDER ID: ${confirmation.orderIdDisplay}`}
            primaryTitle={PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL}
            primaryAddress={confirmation.pickupAddress}
            packageIdText={`Master Label: ${confirmation.masterLabelCode}`}
            weightText={confirmation.totalWeight}
            dimensionsText={masterDimensions}
            volumeText={confirmation.totalVolume}
            returnAddressText={confirmation.returnAddress}
          />
        </div>
      </section>

      <Separator className="bg-gray-200" />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-2">
            <Typography variant="h4" weight="semibold" className="text-2xl text-gray-900">
              {PICKUP_CONFIRMATION_PACKAGE_SECTION_TITLE}
            </Typography>
            <Typography variant="body" className="text-sm text-gray-600 sm:text-base">
              {PICKUP_CONFIRMATION_PACKAGE_SECTION_SUBTITLE}
            </Typography>
          </div>
          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B]"
              onClick={() => void downloadAllPackagePdfs()}
            >
              <Download className="h-4 w-4" />
              {PICKUP_CONFIRMATION_DOWNLOAD_ALL_LABELS}
            </Button>
            <Button
              type="button"
              variant="default"
              className="h-10 bg-[#AE2224] px-4 text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B]"
              onClick={() => void printAllPackagePdfs()}
            >
              <Printer className="h-4 w-4" />
              {PICKUP_CONFIRMATION_PRINT_ALL_LABELS}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-[#D2E4FF] bg-[#FAFCFF] px-3 py-2 sm:px-4">
          <div className="mt-0.5 rounded-full bg-[#D2E4FF66] p-1.5">
            <AlertCircle className="h-4 w-4 text-[#0F54C7]" aria-hidden />
          </div>
          <Typography variant="body" className="text-sm font-medium leading-5 text-[#0F54C7]">
            {PICKUP_CONFIRMATION_PACKAGE_INFO_BANNER}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {confirmation.packages.map((pkg) => (
            <PrintableLabelCard
              key={pkg.id}
              verticalBarcodeWidth={1}
              trackingId={bookingIdPlain(pkg.trackingIdDisplay)}
              qrValue={pkg.qrValue}
              barcodeValue={pkg.barcodeValue}
              rightHeaderText={pkg.deliverySla}
              primaryTitle="FROM:"
              primaryAddress={pkg.fromAddress}
              secondaryTitle="TO:"
              secondaryAddress={pkg.toAddress}
              packageIdText={`Package ID: ${pkg.packageIdDisplay}`}
              weightText={pkg.weight}
              dimensionsText={pkg.dimensions}
              volumeText={pkg.volume}
              returnAddressText={confirmation.returnAddress}
              showActions
              onDownloadClick={() => void downloadPackagePdf(pkg.id)}
              onPrintClick={() => void printPackagePdf(pkg.id)}
            />
          ))}
        </div>
      </section>

      <PickupInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        invoice={invoiceData}
      />
    </div>
  );
}
