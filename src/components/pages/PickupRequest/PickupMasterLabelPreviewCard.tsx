import { Layers } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import { Separator } from '@/components/atoms/separator';
import { SwCouriersLogo } from '@/assets/svg';
import PickupConfirmationLabelBarcode from './PickupConfirmationLabelBarcode';
import PickupConfirmationLabelQr from './PickupConfirmationLabelQr';
import {
  PICKUP_CONFIRMATION_WEBSITE_URL,
  PICKUP_CONFIRMATION_ORDER_ID_INLINE_LABEL,
  PICKUP_CONFIRMATION_MASTER_BADGE,
  PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL,
  PICKUP_CONFIRMATION_MASTER_LABEL_CAPTION_PREFIX,
  PICKUP_LABEL_DELIVERY_STOPS,
  PICKUP_LABEL_TOTAL_PACKAGES,
  PICKUP_LABEL_TOTAL_WEIGHT,
  PICKUP_LABEL_TOTAL_VOLUME,
} from '@/lib/data';

export interface PickupMasterLabelPreviewCardProps {
  orderIdDisplay: string;
  pickupAddress: string;
  masterLabelCode: string;
  masterBarcodeValue: string;
  masterQrValue: string;
  verticalBarcodeValue: string;
  deliveryStops: string;
  totalPackagesCount: string;
  totalWeight: string;
  totalVolume: string;
}

function StatRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-baseline gap-2 text-xs leading-3 text-gray-900">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function PickupMasterLabelPreviewCard({
  orderIdDisplay,
  pickupAddress,
  masterLabelCode,
  masterBarcodeValue,
  masterQrValue,
  verticalBarcodeValue,
  deliveryStops,
  totalPackagesCount,
  totalWeight,
  totalVolume,
}: PickupMasterLabelPreviewCardProps): React.JSX.Element {
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 py-3">
        <Badge
          variant="secondary"
          className="gap-1.5 rounded-full border-0 bg-slate-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white"
        >
          <Layers className="size-3.5 shrink-0 opacity-90" aria-hidden />
          {PICKUP_CONFIRMATION_MASTER_BADGE}
        </Badge>
        <div className="flex flex-wrap items-baseline gap-1 text-xs text-gray-900">
          <span className="text-gray-500">{PICKUP_CONFIRMATION_ORDER_ID_INLINE_LABEL}</span>
          <span className="font-medium">{orderIdDisplay}</span>
        </div>
      </div>

      <div className="flex border-b border-gray-200 py-4">
        <div className="min-w-0 flex-1 pr-2">
          <Typography variant="caption" className="text-xs font-medium text-gray-900">
            {PICKUP_CONFIRMATION_PICKUP_ADDRESS_LABEL}
          </Typography>
          <Typography
            variant="caption"
            className="mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-700"
          >
            {pickupAddress}
          </Typography>
        </div>
        <Separator orientation="vertical" className="mx-1 h-auto min-h-[120px] bg-gray-200" />
        <PickupConfirmationLabelBarcode
          value={verticalBarcodeValue}
          vertical
          className="self-center"
        />
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:max-w-[60%]">
          <PickupConfirmationLabelBarcode value={masterBarcodeValue} />
          <Typography variant="caption" className="text-center text-xs text-gray-800">
            {PICKUP_CONFIRMATION_MASTER_LABEL_CAPTION_PREFIX}
            {masterLabelCode}
          </Typography>
        </div>
        <PickupConfirmationLabelQr value={masterQrValue} className="mx-auto sm:mx-0" />
      </div>

      <div className="space-y-2 pt-4">
        <StatRow label={PICKUP_LABEL_DELIVERY_STOPS} value={deliveryStops} />
        <StatRow label={PICKUP_LABEL_TOTAL_PACKAGES} value={totalPackagesCount} />
        <StatRow label={PICKUP_LABEL_TOTAL_WEIGHT} value={totalWeight} />
        <StatRow label={PICKUP_LABEL_TOTAL_VOLUME} value={totalVolume} />
      </div>
    </div>
  );
}
