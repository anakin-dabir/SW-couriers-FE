import * as React from 'react';
import { Copy } from 'lucide-react';
import { Typography, StatusBadge } from '@/components/atoms';
import { cn, getDeliveryPackageIconByStatus } from '@/lib/utils';

interface PickupCardHeaderProps {
  trackingId: string;
  status: string;
  onCopyTrackingId?: () => void;
  className?: string;
  variant?: 'default' | 'detail';
  label?: string;
  /** Optional badge variant override */
  badgeVariant?: 'success' | 'info' | 'warning';
}

export default function PickupCardHeader({
  trackingId,
  status,
  onCopyTrackingId,
  className,
  variant = 'default',
  label,
  badgeVariant: badgeVariantProp,
}: PickupCardHeaderProps): React.JSX.Element {
  const isDetailVariant = variant === 'detail';
  const defaultLabel = isDetailVariant ? 'DELIVERY ID' : 'Tracking ID';
  const displayLabel = label ?? defaultLabel;

  const statusLower = status.toLowerCase();
  const badgeVariant: 'success' | 'info' | 'warning' =
    badgeVariantProp ??
    (statusLower.includes('delivered')
      ? 'success'
      : statusLower.includes('route') || statusLower.includes('on route')
        ? 'info'
        : 'warning');

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        isDetailVariant ? 'gap-6' : 'gap-4',
        className
      )}
    >
      <div className={cn('flex items-center', isDetailVariant ? 'gap-4' : 'gap-3')}>
        <img
          src={getDeliveryPackageIconByStatus(status)}
          alt="Delivery package"
          className={cn('shrink-0 object-contain', isDetailVariant ? 'h-12 w-12' : 'h-10 w-10')}
        />
        <div className="flex flex-col gap-1">
          <Typography variant="caption" className="text-xs font-medium text-gray-500 uppercase">
            {displayLabel}
          </Typography>
          <div className="flex items-center gap-2">
            <Typography
              variant="body"
              className={cn(
                'font-semibold text-gray-900',
                isDetailVariant ? 'text-base' : 'text-lg'
              )}
            >
              {trackingId}
            </Typography>
            <button
              type="button"
              onClick={onCopyTrackingId}
              className="flex items-center justify-center"
              aria-label="Copy tracking ID"
            >
              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <StatusBadge status={status} variant={badgeVariant} />
    </div>
  );
}
