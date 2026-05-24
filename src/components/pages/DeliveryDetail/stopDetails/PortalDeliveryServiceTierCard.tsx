import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Edit2 } from 'lucide-react';
import PortalEditServiceTierModal from './PortalEditServiceTierModal';
import type { ServiceTier } from '@/store/api/serviceTiersApi';
import { useUpdateStopServiceTierMutation } from '@/store/api';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';

interface PortalDeliveryServiceTierCardProps {
  organizationId?: string | null;
  pricingPlan?: {
    id_price_tier?: string | null;
    plain_name?: string | null;
    color?: string | null;
    duration_days?: number | null;
    days?: number | null;
  } | null;
  scheduledDate?: string | null;
}

function formatEstimatedDelivery(date?: string | null, days?: number | null): string {
  let target: Date | null = null;
  if (date) {
    target = new Date(date);
  } else if (days && days > 0) {
    target = new Date();
    target.setDate(target.getDate() + days);
  }
  if (!target || Number.isNaN(target.getTime())) return '—';
  return `Estimated delivery by ${target.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })}`;
}

export default function PortalDeliveryServiceTierCard({
  organizationId,
  pricingPlan,
  scheduledDate,
}: PortalDeliveryServiceTierCardProps): React.JSX.Element {
  const { id: orderId, stopId } = useParams<{ id: string; stopId: string }>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [updateServiceTier, { isLoading: isSaving }] = useUpdateStopServiceTierMutation();

  const tierName = pricingPlan?.plain_name ?? '—';
  const tierColor = pricingPlan?.color ?? '#6B7280';
  const days = pricingPlan?.duration_days ?? pricingPlan?.days ?? null;

  const handleConfirm = async (tier: ServiceTier): Promise<void> => {
    if (!orderId || !stopId) return;
    try {
      const result = await updateServiceTier({
        orderId,
        stopId,
        service_tier_id: tier.id,
      }).unwrap();
      notifyApiSuccess(result, { message: `Service tier updated to ${tier.tier_name}` });
      setIsOpen(false);
    } catch (err) {
      notifyApiError(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none">
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          Delivery Service Tier
        </Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-8 gap-1.5 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <Typography className="text-[15px] font-semibold text-gray-900">
            Up to {days ?? '—'} Days Delivery
          </Typography>
          <Typography className="mt-0.5 text-[12px] font-medium text-gray-500">
            {formatEstimatedDelivery(scheduledDate, days)}
          </Typography>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
          style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
        >
          {tierName}
        </span>
      </div>

      <PortalEditServiceTierModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        organizationId={organizationId}
        currentTierId={pricingPlan?.id_price_tier ?? null}
        onConfirm={(tier) => {
          void handleConfirm(tier);
        }}
        saving={isSaving}
      />
    </div>
  );
}
