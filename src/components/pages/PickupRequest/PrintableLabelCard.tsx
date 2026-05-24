import type React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { SwCouriersLogo } from '@/assets/svg';

export interface PrintableLabelCardProps {
  verticalBarcodeWidth: number;
  trackingId: string;
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
  showActions?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  onDownloadClick?: () => void;
  onPrintClick?: () => void;
}

const LABEL_DIVIDER = 'h-px w-full shrink-0 bg-black';

/**
 * Printable shipping label — layout tuned to match the master label reference (PDF via html2canvas).
 * Uses system sans-serif stack for reliable print/PDF rendering.
 */
export default function PrintableLabelCard({
  verticalBarcodeWidth,
  trackingId,
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
  showActions = false,
  cardRef,
  onDownloadClick,
  onPrintClick,
}: PrintableLabelCardProps): React.JSX.Element {
  return (
    <div className="w-full max-w-[492px] border border-dashed border-[#8E8E8E] p-4">
      <div
        ref={cardRef}
        style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", sans-serif' }}
        className="overflow-hidden border-[3px] border-black bg-white text-black antialiased"
      >
        {/* Row 1 — logo + site */}
        <div className="flex items-start justify-between gap-4 px-5 py-5">
          <img
            src={SwCouriersLogo}
            alt="SW Couriers"
            className="h-[52px] w-[80px] shrink-0 object-contain"
          />
          <Typography
            component="p"
            variant="caption"
            className="max-w-[55%] pt-1 text-right text-[11px] leading-snug text-[#1e3a8a]"
          >
            www.swcouriers.co.uk
          </Typography>
        </div>

        <div className={LABEL_DIVIDER} />

        {/* Row 2 — tracking (left-aligned per reference) */}
        <div className="px-5 py-3">
          <Typography
            component="p"
            variant="body"
            weight="medium"
            className="text-left text-sm text-black"
          >
            Tracking ID #{trackingId}
          </Typography>
        </div>

        <div className={LABEL_DIVIDER} />

        {/* Row 3 — address ~70% | vertical barcode */}
        <div className="grid min-h-[210px] grid-cols-[minmax(0,1fr)_118px]">
          <div className="space-y-6 px-5 py-5">
            <div>
              <Typography
                component="p"
                variant="caption"
                weight="medium"
                className="text-[14px] text-black"
              >
                {primaryTitle}
              </Typography>
              <Typography
                component="p"
                variant="caption"
                className="mt-1.5 whitespace-pre-line text-[14px] leading-snug text-black"
              >
                {primaryAddress}
              </Typography>
            </div>
            {secondaryTitle && secondaryAddress ? (
              <div>
                <Typography
                  component="p"
                  variant="caption"
                  weight="medium"
                  className="text-[14px] text-black"
                >
                  {secondaryTitle}
                </Typography>
                <Typography
                  component="p"
                  variant="caption"
                  className="mt-1.5 whitespace-pre-line text-[14px] leading-snug text-black"
                >
                  {secondaryAddress}
                </Typography>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-center border-l border-black px-1.5 py-4">
            <div className="rotate-90">
              <Barcode
                value={barcodeValue}
                format="CODE128"
                width={verticalBarcodeWidth}
                height={100}
                displayValue={false}
                margin={0}
              />
            </div>
          </div>
        </div>

        <div className={LABEL_DIVIDER} />

        {/* Row 4 — horizontal barcode + caption | QR */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 px-5 py-4">
          <div className="min-w-0">
            <div className="flex w-full flex-col items-center">
              <div className="w-full max-w-[280px]">
                <Barcode
                  value={barcodeValue}
                  format="CODE128"
                  width={1.3}
                  height={73}
                  displayValue={false}
                  margin={0}
                />
              </div>
              <Typography
                component="p"
                variant="caption"
                weight="medium"
                className="mt-3 w-full text-center text-[14px] leading-tight text-black"
              >
                {packageIdText}
              </Typography>
            </div>
          </div>
          <div className="shrink-0 rounded-sm border border-black bg-white p-1">
            <QRCodeSVG value={qrValue} size={107} level="M" includeMargin={false} />
          </div>
        </div>

        <div className={LABEL_DIVIDER} />

        {/* Row 5 — weight / dims / vol | return address (≈50/50) */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4">
          <div className="min-w-0 space-y-2">
            <Typography
              component="p"
              variant="caption"
              className="text-[13px] leading-snug text-black"
            >
              <span className="font-semibold">Weight:</span> {weightText}
            </Typography>
            <Typography
              component="p"
              variant="caption"
              className="text-[13px] leading-snug text-black"
            >
              <span className="font-semibold">Dimensions:</span> {dimensionsText}
            </Typography>
            <Typography
              component="p"
              variant="caption"
              className="text-[13px] leading-snug text-black"
            >
              <span className="font-semibold">Volume:</span> {volumeText}
            </Typography>
          </div>
          <div className="min-w-0">
            <Typography
              component="p"
              variant="caption"
              weight="semibold"
              className="text-[11px] uppercase tracking-wide text-black"
            >
              Return Address:
            </Typography>
            <Typography
              component="p"
              variant="caption"
              className="mt-1.5 whitespace-pre-line text-[13px] leading-[1.45] text-black"
            >
              {returnAddressText}
            </Typography>
          </div>
        </div>

        <div className={LABEL_DIVIDER} />

        {/* Row 6 — footer */}
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <Typography
            component="p"
            variant="caption"
            weight="medium"
            className="text-[12px] text-black"
          >
            Signature Required: YES
          </Typography>
          <Typography
            component="p"
            variant="caption"
            weight="medium"
            className="max-w-[58%] text-right text-[11px] leading-snug text-black sm:text-[12px]"
          >
            {rightHeaderText}
          </Typography>
        </div>
      </div>

      {showActions ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadClick}
            className="h-10 border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#18181B]"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onPrintClick}
            className="h-10 bg-[#AE2224] px-4 text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B]"
          >
            <Printer className="h-4 w-4" />
            Print Label
          </Button>
        </div>
      ) : null}
    </div>
  );
}
