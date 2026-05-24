import type React from 'react';
import { useCallback, useState } from 'react';
import { Copy } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import {
  formatOrderDate,
  ORDER_DETAIL_SECTION_HEADER,
  ORDER_DETAIL_SECTION_SHELL,
} from '@/lib/orderDetailDisplay';

export interface PortalPickupDetails {
  scheduledPickupDate?: string | null;
  actualPickupDate?: string | null;
  driver?: string | null;
  routeId?: string | null;
  vehicle?: string | null;
  contactName?: string | null;
  contactNumber?: string | null;
  contactEmail?: string | null;
  postalCode?: string | null;
  pickupAddress?: string | null;
}

export interface PortalPickupDetailsCardProps {
  pickup: PortalPickupDetails;
  className?: string;
}

function PickupDetailField({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string | null;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(copyValue?.trim());

  const handleCopy = useCallback(async () => {
    if (!copyValue?.trim()) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [copyValue]);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
        {label}
      </Typography>
      <div className="flex min-w-0 items-center gap-2">
        <Typography variant="body" weight="medium" className="break-all text-[16px] text-[#030303]">
          {value}
        </Typography>
        {canCopy ? (
          <button
            type="button"
            className="p-0.5 text-[#CBCBD8] transition-colors hover:text-[#858594]"
            aria-label={`Copy ${label}`}
            onClick={() => void handleCopy()}
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
        {copied ? (
          <Typography variant="caption" className="text-[11px] font-medium text-emerald-600">
            Copied
          </Typography>
        ) : null}
      </div>
    </div>
  );
}

export default function PortalPickupDetailsCard({
  pickup,
  className,
}: PortalPickupDetailsCardProps): React.JSX.Element {
  const displayOrDash = (value?: string | null): string => value?.trim() || '—';
  const phone = pickup.contactNumber?.trim();
  const email = pickup.contactEmail?.trim();
  const showEmail = !phone && Boolean(email);

  return (
    <div className={cn(ORDER_DETAIL_SECTION_SHELL, className)}>
      <div className={ORDER_DETAIL_SECTION_HEADER}>
        <Typography
          variant="label"
          className="mb-0 text-[11px] font-medium uppercase tracking-[0.1em] text-[#0D0D12] md:text-[13px]"
        >
          Pickup details
        </Typography>
      </div>
      <div className="px-4 py-4 md:px-5 md:py-5">
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 md:grid-cols-5 md:gap-x-4">
          <PickupDetailField
            label="Scheduled Pickup Date"
            value={formatOrderDate(pickup.scheduledPickupDate)}
          />
          <PickupDetailField
            label="Actual Pickup Date"
            value={formatOrderDate(pickup.actualPickupDate)}
          />
          <PickupDetailField label="Driver" value={displayOrDash(pickup.driver)} />
          <PickupDetailField
            label="Route ID"
            value={displayOrDash(pickup.routeId)}
            copyValue={pickup.routeId}
          />
          <PickupDetailField label="Vehicle" value={displayOrDash(pickup.vehicle)} />

          <PickupDetailField label="Contact name" value={displayOrDash(pickup.contactName)} />
          <PickupDetailField
            label={showEmail ? 'Contact email' : 'Contact number'}
            value={displayOrDash(showEmail ? pickup.contactEmail : pickup.contactNumber)}
          />
          <PickupDetailField label="Postal Code" value={displayOrDash(pickup.postalCode)} />
          <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-2 md:col-span-2">
            <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
              Pickup Address
            </Typography>
            <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
              {displayOrDash(pickup.pickupAddress)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
