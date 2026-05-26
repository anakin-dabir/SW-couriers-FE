/* eslint-disable react/forbid-elements -- ported as-is from the admin portal so the
   layout stays in lockstep; raw `<p>`/`<h2>` mirror the admin markup. Refactor to
   <Typography> if/when the design is reworked. */
import type React from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Download, FileText, Loader2, Plus, Printer } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Separator } from '@/components/atoms/separator';
import PrintableLabelCard from '@/components/pages/Labels/PrintableLabelCard';
import { DeliveryInvoiceModal } from '@/components/pages/DeliveryDetail';
import { SuccessBox } from '@/assets';
import { cn } from '@/lib/utils';
import { useGetOrderMasterLabelQuery } from '@/store/api';
import {
  downloadBlob,
  type LabelSpec,
  labelPdfFileName,
  packageLabelsPdfFileName,
  printBlob,
  renderLabelPdfBlob,
} from '@/lib/labelPdf';

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

function formatLabelText(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') return '—';
  return value;
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
  const [labelAction, setLabelAction] = useState<LabelAction | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
  const bookingId = labelPayload?.order_id ?? id ?? stateOrderReference ?? stateOrderUuid ?? '—';
  const orderReferenceText = formatLabelText(labelPayload?.order_id);

  const isLabelsBusy = Boolean(labelsOrderId) && (isLabelsLoading || isLabelsFetching);
  const hasLabels = Boolean(masterLabel) || pickupLabels.length > 0;
  const masterLabelCode = formatLabelText(masterLabel?.master_label_id);
  const masterQrValue = formatLabelText(masterLabel?.qr_value ?? masterLabel?.master_label_id);
  const masterBarcodeValue = formatLabelText(
    masterLabel?.barcode_value ?? masterLabel?.master_label_id
  );

  const masterLabelSpec = useMemo<LabelSpec>(
    () => ({
      id: masterLabelCode,
      labelType: 'master',
      trackingId: orderReferenceText,
      orderIdText: orderReferenceText,
      qrValue: masterQrValue,
      barcodeValue: masterBarcodeValue,
      rightHeaderText: '',
      primaryTitle: 'Pickup Address:',
      primaryAddress: formatLabelText(masterLabel?.pickup_address),
      packageIdText: `Master Label: ${masterLabelCode}`,
      deliveryStopsText: formatLabelNumber(masterLabel?.delivery_stops_count),
      totalPackagesText: formatLabelNumber(masterLabel?.total_packages),
      weightText: formatLabelNumber(masterLabel?.total_weight_kg, 'kg'),
      dimensionsText: '—',
      volumeText: formatLabelNumber(masterLabel?.total_volume_m3, 'm³'),
      returnAddressText: '—',
    }),
    [masterBarcodeValue, masterLabel, masterLabelCode, masterQrValue, orderReferenceText]
  );

  const packageLabelSpecs = useMemo<LabelSpec[]>(
    () =>
      pickupLabels.map((label) => {
        const packageId = label.package_id;
        const recipientLine = [label.recipient_name, label.recipient_address]
          .filter(Boolean)
          .join(' ');
        return {
          id: packageId,
          labelType: 'package',
          trackingId: formatLabelText(label.tracking_id),
          qrValue: packageId,
          barcodeValue: packageId,
          rightHeaderText: formatLabelText(label.delivery_label),
          primaryTitle: 'FROM:',
          primaryAddress: formatLabelText(label.pickup_address),
          secondaryTitle: 'TO:',
          secondaryAddress: formatLabelText(recipientLine),
          packageIdText: `Package ID: #${packageId}`,
          weightText: formatLabelNumber(label.weight_kg, 'kg'),
          dimensionsText: formatLabelText(label.dimensions_cm),
          volumeText: formatLabelNumber(label.volume_m3, 'm³'),
          returnAddressText: formatLabelText(label.return_address),
          signatureRequired: label.signature_required,
        };
      }),
    [pickupLabels]
  );

  const packageSpecsById = useMemo(() => {
    const map = new Map<string, LabelSpec>();
    for (const spec of packageLabelSpecs) map.set(spec.id, spec);
    return map;
  }, [packageLabelSpecs]);

  const packageIds = useMemo(() => pickupLabels.map((label) => label.package_id), [pickupLabels]);

  const downloadMasterPdf = async (): Promise<void> => {
    const blob = await renderLabelPdfBlob([masterLabelSpec], { title: masterLabelCode });
    if (!blob) return;
    downloadBlob(blob, labelPdfFileName('master-label', masterLabelCode));
  };

  const printMasterPdf = async (): Promise<void> => {
    const blob = await renderLabelPdfBlob([masterLabelSpec], { title: masterLabelCode });
    if (!blob) return;
    printBlob(blob, labelPdfFileName('master-label', masterLabelCode));
  };

  const downloadPackagePdf = async (packageId: string): Promise<void> => {
    const spec = packageSpecsById.get(packageId);
    if (!spec) return;
    const blob = await renderLabelPdfBlob([spec], { title: packageId });
    if (!blob) return;
    downloadBlob(blob, labelPdfFileName('package-label', packageId));
  };

  const printPackagePdf = async (packageId: string): Promise<void> => {
    const spec = packageSpecsById.get(packageId);
    if (!spec) return;
    const blob = await renderLabelPdfBlob([spec], { title: packageId });
    if (!blob) return;
    printBlob(blob, labelPdfFileName('package-label', packageId));
  };

  const downloadAllPackagePdfs = async (): Promise<void> => {
    if (packageLabelSpecs.length === 0) return;
    const blob = await renderLabelPdfBlob(packageLabelSpecs, { title: 'Package Labels' });
    if (!blob) return;
    downloadBlob(blob, packageLabelsPdfFileName(packageIds));
  };

  const printAllPackagePdfs = async (): Promise<void> => {
    if (packageLabelSpecs.length === 0) return;
    const blob = await renderLabelPdfBlob(packageLabelSpecs, { title: 'Package Labels' });
    if (!blob) return;
    printBlob(blob, packageLabelsPdfFileName(packageIds));
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
                  disabled={bookingId === '—'}
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
                  trackingId={orderReferenceText}
                  orderIdText={orderReferenceText}
                  qrValue={masterQrValue}
                  barcodeValue={masterBarcodeValue}
                  rightHeaderText=""
                  primaryTitle="Pickup Address:"
                  primaryAddress={formatLabelText(masterLabel?.pickup_address)}
                  packageIdText={`Master Label: ${masterLabelCode}`}
                  deliveryStopsText={formatLabelNumber(masterLabel?.delivery_stops_count)}
                  totalPackagesText={formatLabelNumber(masterLabel?.total_packages)}
                  weightText={formatLabelNumber(masterLabel?.total_weight_kg, 'kg')}
                  dimensionsText="—"
                  volumeText={formatLabelNumber(masterLabel?.total_volume_m3, 'm³')}
                  returnAddressText="—"
                />
              </div>
            </div>
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
                {pickupLabels.map((label) => {
                  const packageId = label.package_id;
                  const recipientLine = [label.recipient_name, label.recipient_address]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <PrintableLabelCard
                      key={packageId}
                      trackingId={formatLabelText(label.tracking_id)}
                      qrValue={packageId}
                      barcodeValue={packageId}
                      rightHeaderText={formatLabelText(label.delivery_label)}
                      primaryTitle="FROM:"
                      primaryAddress={formatLabelText(label.pickup_address)}
                      secondaryTitle="TO:"
                      secondaryAddress={formatLabelText(recipientLine)}
                      packageIdText={`Package ID: #${packageId}`}
                      weightText={formatLabelNumber(label.weight_kg, 'kg')}
                      dimensionsText={formatLabelText(label.dimensions_cm)}
                      volumeText={formatLabelNumber(label.volume_m3, 'm³')}
                      returnAddressText={formatLabelText(label.return_address)}
                      signatureRequired={label.signature_required}
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
