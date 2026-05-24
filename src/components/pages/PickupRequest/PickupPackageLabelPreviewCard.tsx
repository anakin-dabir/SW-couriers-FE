import Typography from '@/components/atoms/Typography';
import { Separator } from '@/components/atoms/separator';
import { SwCouriersLogo } from '@/assets/svg';
import PickupConfirmationLabelBarcode from './PickupConfirmationLabelBarcode';
import PickupConfirmationLabelQr from './PickupConfirmationLabelQr';
import type { PickupConfirmationPackageMock } from '@/lib/data';
import {
  PICKUP_CONFIRMATION_WEBSITE_URL,
  PICKUP_LABEL_FROM,
  PICKUP_LABEL_TO,
  PICKUP_LABEL_TRACKING_PREFIX,
  PICKUP_LABEL_PACKAGE_ID,
  PICKUP_LABEL_WEIGHT,
  PICKUP_LABEL_DIMENSIONS,
  PICKUP_LABEL_VOLUME,
  PICKUP_LABEL_RETURN_ADDRESS,
  PICKUP_LABEL_SIGNATURE_REQUIRED,
} from '@/lib/data';

export interface PickupPackageLabelPreviewCardProps {
  pkg: PickupConfirmationPackageMock;
  returnAddress: string;
}

export default function PickupPackageLabelPreviewCard({
  pkg,
  returnAddress,
}: PickupPackageLabelPreviewCardProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
        <img
          src={SwCouriersLogo}
          alt="SW Couriers"
          className="h-[52px] w-20 shrink-0 object-contain"
        />
        <Typography variant="caption" className="pt-2 text-sm text-gray-600">
          {PICKUP_CONFIRMATION_WEBSITE_URL}
        </Typography>
      </div>

      <Typography
        variant="caption"
        className="block border-b border-gray-200 py-3 text-center text-xs font-medium text-gray-900"
      >
        {PICKUP_LABEL_TRACKING_PREFIX}
        {pkg.trackingIdDisplay}
      </Typography>

      <div className="flex border-b border-gray-200 py-4">
        <div className="min-w-0 flex-1 space-y-6 pr-2">
          <div>
            <Typography variant="caption" className="text-xs font-medium text-gray-900">
              {PICKUP_LABEL_FROM}
            </Typography>
            <Typography
              variant="caption"
              className="mt-2 block whitespace-pre-line text-xs leading-relaxed text-gray-700"
            >
              {pkg.fromAddress}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-xs font-medium text-gray-900">
              {PICKUP_LABEL_TO}
            </Typography>
            <Typography
              variant="caption"
              className="mt-2 block whitespace-pre-line text-xs leading-relaxed text-gray-700"
            >
              {pkg.toAddress}
            </Typography>
          </div>
        </div>
        <Separator orientation="vertical" className="mx-1 h-auto min-h-[160px] bg-gray-200" />
        <PickupConfirmationLabelBarcode value={pkg.barcodeValue} vertical className="self-center" />
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:max-w-[55%]">
          <PickupConfirmationLabelBarcode value={pkg.barcodeValue} />
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-900">
            <span>{PICKUP_LABEL_PACKAGE_ID}</span>
            <span className="font-medium">{pkg.packageIdDisplay}</span>
          </div>
        </div>
        <PickupConfirmationLabelQr value={pkg.qrValue} className="mx-auto sm:mx-0" />
      </div>

      <div className="flex flex-col gap-4 border-b border-gray-200 py-4 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2 text-xs text-gray-900">
            <span className="font-medium">{PICKUP_LABEL_WEIGHT}</span>
            <span>{pkg.weight}</span>
          </div>
          <div className="flex items-baseline gap-2 text-xs text-gray-900">
            <span className="font-medium">{PICKUP_LABEL_DIMENSIONS}</span>
            <span>{pkg.dimensions}</span>
          </div>
          <div className="flex items-baseline gap-2 text-xs text-gray-900">
            <span className="font-medium">{PICKUP_LABEL_VOLUME}</span>
            <span>{pkg.volume}</span>
          </div>
        </div>
        <div className="max-w-[144px] shrink-0">
          <Typography variant="caption" className="text-xs font-medium text-gray-900">
            {PICKUP_LABEL_RETURN_ADDRESS}
          </Typography>
          <Typography
            variant="caption"
            className="mt-2 block text-xs leading-relaxed text-gray-700"
          >
            {returnAddress}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-3 text-xs text-gray-900">
        <span>
          {PICKUP_LABEL_SIGNATURE_REQUIRED} {pkg.signatureRequiredValue}
        </span>
        <span className="text-right font-medium">{pkg.deliverySla}</span>
      </div>
    </div>
  );
}
