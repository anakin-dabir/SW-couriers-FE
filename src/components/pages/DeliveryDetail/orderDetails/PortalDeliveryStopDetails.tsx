import type React from 'react';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import { mapOrderStatusToUi } from '@/lib/orderStatusUi';
import { formatOrderDate, stopStatusBadgeClassName } from '@/lib/orderDetailDisplay';

export interface PortalDeliveryStopRow {
  id: string;
  trackingId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  postcode?: string | null;
  recipientAddress?: string | null;
  scheduledDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  deliveryAttempts?: number | null;
  maxDeliveryAttempts?: number | null;
  status?: string | null;
  packagesCount?: number | null;
}

interface PortalDeliveryStopCardProps {
  orderId: string;
  stop: PortalDeliveryStopRow;
  index: number;
  total: number;
}

function DeliveryAttemptsPills({
  attempts,
  maxAttempts,
}: {
  attempts: number;
  maxAttempts: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-1.5 isolate">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 w-4 rounded-full border-2 border-white',
              i < attempts ? 'bg-[#EF4444]' : 'bg-gray-200'
            )}
            style={{ zIndex: i + 1 }}
            aria-hidden
          />
        ))}
      </div>
      <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
        {attempts} of {maxAttempts}
      </Typography>
    </div>
  );
}

function PortalDeliveryStopCard({
  orderId,
  stop,
  index,
  total,
}: PortalDeliveryStopCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const handleViewStopDetails = (e: React.MouseEvent): void => {
    e.stopPropagation();
    void navigate(`/deliveries/${encodeURIComponent(orderId)}/stop/${encodeURIComponent(stop.id)}`);
  };

  const maxAttempts = Math.max(stop.maxDeliveryAttempts ?? 3, 1);
  const attempts = Math.min(Math.max(stop.deliveryAttempts ?? 0, 0), maxAttempts);
  const statusLabel = mapOrderStatusToUi(stop.status ?? 'PENDING_PICKUP');

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#CBCBD8] bg-white shadow-none">
      <div
        className={cn(
          'flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors',
          isExpanded ? 'border-b border-[#E5E7EB] bg-[#F3F4F6]' : 'bg-white hover:bg-[#F3F4F6]'
        )}
      >
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDEDF2]">
            <div className="h-4 w-4 rounded-full border-[4px] border-[#4B5563] bg-white" />
          </div>
          <Typography
            variant="body"
            weight="medium"
            className="min-w-0 truncate text-[14px] leading-none text-[#111827]"
          >
            Delivery Stop {index + 1} of {total}
          </Typography>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleViewStopDetails}
            className="h-8 gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3 text-[13px] font-medium text-[#374151] shadow-none hover:bg-white"
          >
            <span className="hidden sm:inline">View Stop Details</span>
            <span className="sm:hidden">View</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            className="rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-black/5"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse stop' : 'Expand stop'}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={cn(
                'h-[18px] w-[18px] transition-transform duration-300',
                !isExpanded && '-rotate-90'
              )}
            />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="m-3 overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8F8FA] px-4 py-2.5">
            <Typography
              variant="label"
              className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111827]"
            >
              Delivery Details
            </Typography>
          </div>

          <div className="bg-white p-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-5">
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Recipient
                </Typography>
                <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
                  {stop.recipientName?.trim() || '—'}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Email
                </Typography>
                <Typography
                  variant="body"
                  weight="medium"
                  className="break-all text-[16px] text-[#030303]"
                >
                  {stop.recipientEmail?.trim() || '—'}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Contact number
                </Typography>
                <Typography
                  variant="body"
                  weight="medium"
                  className="break-all text-[16px] text-[#030303]"
                >
                  {stop.recipientPhone?.trim() || '—'}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Postal Code
                </Typography>
                <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
                  {stop.postcode?.trim() || '—'}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Recipient Address
                </Typography>
                <Typography
                  variant="body"
                  weight="medium"
                  className="text-[16px] leading-tight text-[#030303]"
                >
                  {stop.recipientAddress?.trim() || '—'}
                </Typography>
              </div>

              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Scheduled Delivery Date
                </Typography>
                <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
                  {formatOrderDate(stop.scheduledDeliveryDate)}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Actual Delivery Date
                </Typography>
                <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
                  {stop.actualDeliveryDate ? formatOrderDate(stop.actualDeliveryDate) : '—'}
                </Typography>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Attempts
                </Typography>
                <DeliveryAttemptsPills attempts={attempts} maxAttempts={maxAttempts} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  Delivery Status
                </Typography>
                <span className={stopStatusBadgeClassName(stop.status)}>{statusLabel}</span>
              </div>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="body" className="text-[14px] font-medium text-[#858594]">
                  No of Packages
                </Typography>
                <Typography variant="body" weight="medium" className="text-[16px] text-[#030303]">
                  {String(stop.packagesCount ?? 0).padStart(2, '0')}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export interface PortalDeliveryStopDetailsProps {
  orderId: string;
  stops: PortalDeliveryStopRow[];
  className?: string;
}

export default function PortalDeliveryStopDetails({
  orderId,
  stops,
  className,
}: PortalDeliveryStopDetailsProps): React.JSX.Element {
  return (
    <div className={cn('w-full space-y-3', className)}>
      {stops.map((stop, index) => (
        <PortalDeliveryStopCard
          key={stop.id}
          orderId={orderId}
          stop={stop}
          index={index}
          total={stops.length}
        />
      ))}
    </div>
  );
}
