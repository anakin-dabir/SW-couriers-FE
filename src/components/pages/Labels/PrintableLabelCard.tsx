/* eslint-disable react/forbid-elements -- ported as-is from the admin portal so the
   printable label markup stays byte-identical (PDF/print snapshotting depends on the
   exact tag structure). Refactor to <Typography> only alongside a design refresh. */
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Download, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import { SwCouriersLogo as swCouriersLogo } from '@/assets/svg';

const LABEL_WIDTH_PX = 460;
const LABEL_HEIGHT_PX = 740;
const BARCODE_MODULE_WIDTH = 1.25;
const BARCODE_HEIGHT = 72;
const VERTICAL_BARCODE_SLOT_HEIGHT = 252;
const QR_CODE_SIZE = 94;

function assignForwardedRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function BarcodeMark({ value }: { value: string }): React.JSX.Element {
  return (
    <Barcode
      value={value}
      format="CODE128"
      width={BARCODE_MODULE_WIDTH}
      height={BARCODE_HEIGHT}
      displayValue={false}
      margin={0}
    />
  );
}

function MasterLabelBadge(): React.JSX.Element {
  return (
    <svg
      width="132"
      height="26"
      viewBox="0 0 132 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Master label"
      role="img"
    >
      <rect width="132" height="26" rx="13" fill="#030303" />
      <text
        x="66"
        y="17"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="0"
      >
        MASTER LABEL
      </text>
    </svg>
  );
}

interface PrintableLabelCardProps {
  labelType?: 'master' | 'package';
  trackingId: string;
  orderIdText?: string;
  qrValue: string;
  barcodeValue: string;
  rightHeaderText: string;
  primaryTitle: string;
  primaryAddress: string;
  secondaryTitle?: string;
  secondaryAddress?: string;
  packageIdText: string;
  weightText: string;
  dimensionsText: string;
  volumeText: string;
  returnAddressText: string;
  deliveryStopsText?: string;
  totalPackagesText?: string;
  signatureRequired?: boolean;
  showActions?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  onDownloadClick?: () => void;
  onPrintClick?: () => void;
  downloadPending?: boolean;
  printPending?: boolean;
  actionsDisabled?: boolean;
  /** Simulates a driver/device QR scan (e.g. static lookup response in dev). */
  onSimulateQrScan?: () => void;
  /** Simulates scanning a package barcode (horizontal or vertical strip). */
  onSimulateBarcodeScan?: () => void;
}

export default function PrintableLabelCard({
  labelType = 'package',
  trackingId,
  orderIdText,
  qrValue,
  barcodeValue,
  rightHeaderText,
  primaryTitle,
  primaryAddress,
  secondaryTitle,
  secondaryAddress,
  packageIdText,
  weightText,
  dimensionsText,
  volumeText,
  returnAddressText,
  deliveryStopsText,
  totalPackagesText,
  signatureRequired = true,
  showActions = false,
  cardRef,
  onDownloadClick,
  onPrintClick,
  downloadPending = false,
  printPending = false,
  actionsDisabled = false,
  onSimulateQrScan,
  onSimulateBarcodeScan,
}: PrintableLabelCardProps): React.JSX.Element {
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(LABEL_WIDTH_PX);
  const previewScale = Math.min(1, previewWidth / LABEL_WIDTH_PX);
  const previewHeight = LABEL_HEIGHT_PX * previewScale;

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return undefined;

    const updatePreviewWidth = (): void => {
      setPreviewWidth(frame.getBoundingClientRect().width || LABEL_WIDTH_PX);
    };

    updatePreviewWidth();
    const observer = new ResizeObserver(updatePreviewWidth);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const barcodeInteractive =
    onSimulateBarcodeScan !== undefined
      ? {
          role: 'button' as const,
          tabIndex: 0 as const,
          onClick: onSimulateBarcodeScan,
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSimulateBarcodeScan();
            }
          },
        }
      : null;
  const isMasterLabel = labelType === 'master';

  const renderLabelContent = (interactive: boolean): React.JSX.Element => {
    const liveBarcodeInteractive = interactive ? barcodeInteractive : null;
    const liveOnSimulateQrScan = interactive ? onSimulateQrScan : undefined;
    return (
      <>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-[#030303]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-[#030303]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[3px] bg-[#030303]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[3px] bg-[#030303]" />

        <div className="flex items-center justify-between px-5 py-5">
          <img
            src={swCouriersLogo}
            alt="SW Couriers"
            className="h-[52px] w-[80px] object-contain"
          />
          <p className="text-xs text-[#030303]">www.swcouriers.co.uk</p>
        </div>

        <div className="h-px w-full bg-[#030303]" />

        <div
          className={cn(
            'px-5 py-4',
            isMasterLabel ? 'flex items-center justify-between gap-3' : 'text-center'
          )}
        >
          {isMasterLabel ? (
            <>
              <MasterLabelBadge />
              <p className="text-sm font-semibold text-[#030303]">
                Order ID: #{orderIdText ?? trackingId}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-[#030303]">Tracking ID #{trackingId}</p>
          )}
        </div>

        <div className="h-px w-full bg-[#030303]" />

        <div className="grid min-h-[252px] grid-cols-[1fr_132px]">
          <div className="space-y-8 px-5 py-6">
            <div>
              <p className="text-[14px] font-medium text-[#030303]">{primaryTitle}</p>
              <p className="mt-1 text-[14px] leading-tight text-[#030303] sm:text-[14px]">
                {primaryAddress}
              </p>
            </div>
            {secondaryTitle && secondaryAddress ? (
              <div>
                <p className="text-[14px] font-medium text-[#030303]">{secondaryTitle}</p>
                <p className="mt-1 text-[14px] leading-tight text-[#030303] sm:text-[14px]">
                  {secondaryAddress}
                </p>
              </div>
            ) : null}
          </div>
          <div
            className={cn(
              'relative flex items-center justify-center px-2 py-4',
              liveBarcodeInteractive &&
                'cursor-pointer rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#0F54C7]'
            )}
            {...(liveBarcodeInteractive ?? {})}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#030303]" />
            <div
              className="relative"
              style={{ width: BARCODE_HEIGHT, height: VERTICAL_BARCODE_SLOT_HEIGHT }}
            >
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: 'translate(-50%, -50%) rotate(90deg)' }}
              >
                <BarcodeMark value={barcodeValue} />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-[#030303]" />
        <div className="h-px w-full bg-[#030303]" />

        <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="inline-flex w-fit flex-col items-center">
              <div
                className={cn(
                  liveBarcodeInteractive &&
                    'inline-block cursor-pointer rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#0F54C7]'
                )}
                {...(liveBarcodeInteractive ?? {})}
              >
                <BarcodeMark value={barcodeValue} />
              </div>
              <p className="w-full py-4 text-center text-[13px] font-medium leading-none text-[#030303]">
                {packageIdText}
              </p>
            </div>
          </div>
          {liveOnSimulateQrScan !== undefined ? (
            <button
              type="button"
              aria-label="Simulate QR code scan"
              className="mx-auto rounded-sm border border-[#111] bg-white p-1 cursor-pointer outline-none ring-offset-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0F54C7]"
              onClick={liveOnSimulateQrScan}
            >
              <QRCode value={qrValue} size={QR_CODE_SIZE} />
            </button>
          ) : (
            <div className="mx-auto rounded-sm border border-[#111] bg-white p-1">
              <QRCode value={qrValue} size={QR_CODE_SIZE} />
            </div>
          )}
        </div>

        <div className="h-px w-full bg-[#030303]" />
        <div className="h-px w-full bg-[#030303]" />

        <div className="flex items-start justify-between gap-6 px-5 py-4 text-[#030303]">
          <div className="space-y-2 text-xs">
            {isMasterLabel ? (
              <>
                <p>
                  <span className="font-semibold">Delivery Stops:</span> {deliveryStopsText ?? '—'}
                </p>
                <p>
                  <span className="font-semibold">Total Packages:</span> {totalPackagesText ?? '—'}
                </p>
              </>
            ) : null}
            <p>
              <span className="font-semibold">{isMasterLabel ? 'Total Weight:' : 'Weight:'}</span>{' '}
              {weightText}
            </p>
            {!isMasterLabel ? (
              <p>
                <span className="font-semibold">Dimensions:</span> {dimensionsText}
              </p>
            ) : null}
            <p>
              <span className="font-semibold">{isMasterLabel ? 'Total Volume:' : 'Volume:'}</span>{' '}
              {volumeText}
            </p>
          </div>
          {!isMasterLabel ? (
            <div className="max-w-[144px] text-xs">
              <p className="font-semibold uppercase">Return Address:</p>
              <p className="mt-1 leading-[1.4]">{returnAddressText}</p>
            </div>
          ) : null}
        </div>

        {!isMasterLabel ? <div className="h-px w-full bg-[#030303]" /> : null}

        {!isMasterLabel ? (
          <div className="flex items-center justify-between gap-4 px-5 py-3 text-xs font-medium text-[#030303]">
            <p>Signature Required: {signatureRequired ? 'YES' : 'NO'}</p>
            <p className="uppercase text-right">{rightHeaderText}</p>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="min-w-0 w-full max-w-[492px] border border-dashed border-[#8E8E8E] p-4">
      {/* On-screen preview — responsive scale via transform. */}
      <div
        ref={previewFrameRef}
        className="relative mx-auto w-full max-w-[460px] overflow-hidden"
        style={{ height: previewHeight }}
      >
        <div
          className="absolute left-0 top-0 h-[740px] w-[460px] overflow-hidden rounded-[2px] bg-white"
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',

            fontSize: '16px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {renderLabelContent(true)}
        </div>
      </div>

      <div
        ref={(element) => assignForwardedRef(cardRef, element)}
        aria-hidden="true"
        className="overflow-hidden rounded-[2px] bg-white"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: '0',
          width: `${LABEL_WIDTH_PX}px`,
          height: `${LABEL_HEIGHT_PX}px`,
          pointerEvents: 'none',
          fontSize: '16px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {renderLabelContent(false)}
      </div>

      {showActions ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadClick}
            disabled={actionsDisabled || downloadPending}
            className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#E4E4E7] bg-white text-[#18181B] disabled:opacity-70"
          >
            {downloadPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloadPending ? 'Downloading…' : 'Download PDF'}
          </Button>
          <Button
            type="button"
            onClick={onPrintClick}
            disabled={actionsDisabled || printPending}
            className="box-border min-h-11 h-11 border px-4 py-0 text-sm font-medium leading-none border-[#AE2224] bg-[#AE2224] text-[#FAFAFA] hover:border-[#991B1B] hover:bg-[#991B1B] disabled:opacity-70"
          >
            {printPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {printPending ? 'Printing…' : 'Print Label'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
