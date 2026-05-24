import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Ban, ChevronLeft, Copy, Package, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Input } from '@/components/atoms/input';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import type { PortalDeliveryStopApi } from '@/lib/portalOrderDetailMock';
import { mapOrderStatusToUi } from '@/lib/orderStatusUi';
import {
  useGetDeliveryStopDetailQuery,
  useGetOrderDetailQuery,
  useUpdateStopDetailsMutation,
  useUpdateStopPackagesMutation,
  useCancelDeliveryStopMutation,
} from '@/store/api';
import type {
  DeliveryStopDetailDto,
  DeliveryStopDetailPackageDto,
  StopTimelineEventDto,
} from '@/store/api/ordersApi';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  buildStopTimelineSkeleton,
  buildPackageTimelineSkeleton,
} from '@/lib/stopTimelineSkeleton';
import PortalDeliveryServiceTierCard from '@/components/pages/DeliveryDetail/stopDetails/PortalDeliveryServiceTierCard';
import PortalDeliveryPreferenceCard from '@/components/pages/DeliveryDetail/stopDetails/PortalDeliveryPreferenceCard';
import PortalDeliveryNotesCard from '@/components/pages/DeliveryDetail/stopDetails/PortalDeliveryNotesCard';
import PortalEditDeliveryStopDetailsModal from '@/components/pages/DeliveryDetail/stopDetails/PortalEditDeliveryStopDetailsModal';
import PortalEditPackagesDetailsModal from '@/components/pages/DeliveryDetail/stopDetails/PortalEditPackagesDetailsModal';
import PortalProofOfDeliveryCard from '@/components/pages/DeliveryDetail/stopDetails/PortalProofOfDeliveryCard';
import PortalProofOfReturnCard from '@/components/pages/DeliveryDetail/stopDetails/PortalProofOfReturnCard';
import PortalCancelBookingModal from '@/components/pages/DeliveryDetail/stopDetails/PortalCancelBookingModal';
import { statusBadgeClass } from '@/lib/statusColors';
import { formatOrderDate, formatOrderDateTime } from '@/lib/orderDetailDisplay';
import MarkerMap from '@/components/organisms/maps/MarkerMap';
import PortalDeliveryStopTimeline, {
  type PortalTimelineStep,
} from '@/components/pages/DeliveryDetail/stopDetails/PortalDeliveryStopTimeline';
import PortalFailedAttemptsSection from '@/components/pages/DeliveryDetail/stopDetails/PortalFailedAttemptsSection';
import { BoxOpenIcon } from '@/assets';

const buildAddress = (stop: PortalDeliveryStopApi): string =>
  [stop.line_1, stop.line_2, stop.city, stop.postcode].filter(Boolean).join(', ');

export interface PortalStopPackageRow {
  id: string;
  number: string;
  /** Declared weight label (e.g. "8 kg"). */
  weight: string;
  actualWeight: string;
  dimensions: string;
  value: string;
  status: string;
  /** 1-based index for "Package # 01". */
  packageNumber: number;
}

function SectionShell({
  heading,
  children,
  className,
  headerAction,
}: {
  heading: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      className={cn('mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white', className)}
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          {heading}
        </Typography>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

/**
 * Delivery stop details — layout aligned with SW-Courier-FE-Admin DeliveryStopDetailsPage (read-only portal).
 */
function formatStatusLabel(status?: string | null): string {
  if (!status) return '-';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function packageDtoToRow(
  pkg: DeliveryStopDetailPackageDto,
  index: number
): PortalStopPackageRow & { events: StopTimelineEventDto[] } {
  return {
    id: pkg.id,
    number: pkg.package_id ?? '-',
    weight: pkg.declared_weight_kg != null ? `${pkg.declared_weight_kg} kg` : '-',
    actualWeight: pkg.weight_kg != null ? `${pkg.weight_kg} kg` : '-',
    dimensions:
      pkg.length_cm != null && pkg.width_cm != null && pkg.height_cm != null
        ? `${pkg.length_cm} × ${pkg.width_cm} × ${pkg.height_cm} cm`
        : '-',
    value: pkg.declared_value != null ? `£${pkg.declared_value}` : '-',
    status: formatStatusLabel(pkg.status),
    packageNumber: index + 1,
    events: pkg.events,
  };
}

export default function DeliveryStopDetailPage(): React.JSX.Element {
  const { id, stopId } = useParams<{ id: string; stopId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deepLinkPackageId = searchParams.get('package');
  const [appliedDeepLinkPackageId, setAppliedDeepLinkPackageId] = useState<string | null>(null);
  const bookingId = id ?? '';

  const stopArgs = bookingId && stopId ? { order_id: bookingId, stop_id: stopId } : skipToken;
  const { data: stopRes, isLoading, isError } = useGetDeliveryStopDetailQuery(stopArgs);
  const { data: orderRes } = useGetOrderDetailQuery(
    bookingId ? { order_id: bookingId } : skipToken
  );
  const detailDto: DeliveryStopDetailDto | undefined = stopRes?.data;
  const totalStops = orderRes?.data?.delivery_stops?.length ?? null;

  const stop: PortalDeliveryStopApi | undefined = useMemo(() => {
    if (!detailDto) return undefined;
    return {
      id: detailDto.id,
      recipient_first_name: detailDto.recipient_first_name,
      recipient_last_name: detailDto.recipient_last_name,
      recipient_phone: detailDto.recipient_phone,
      recipient_email: detailDto.recipient_email,
      line_1: detailDto.line_1,
      line_2: detailDto.line_2,
      city: detailDto.city,
      postcode: detailDto.postcode,
      status: detailDto.status,
      packages_count: detailDto.packages_count,
      scheduled_delivery_date: detailDto.scheduled_delivery_date,
      actual_delivery_date: detailDto.actual_delivery_date,
      delivery_attempts: detailDto.delivery_attempts ?? null,
      max_delivery_attempts: detailDto.max_delivery_attempts ?? null,
    };
  }, [detailDto]);

  const stopIndex = (detailDto?.stop_index ?? 1) - 1;

  const recipientName = [stop?.recipient_first_name, stop?.recipient_last_name]
    .filter(Boolean)
    .join(' ');

  const trackingLink = useMemo(() => {
    const plain = (detailDto?.tracking_id ?? bookingId).replace(/^#\s*/, '').trim();
    return `https://swcouriers.com/track-order?tracking_id=${encodeURIComponent(plain)}`;
  }, [bookingId, detailDto?.tracking_id]);

  const statusLabel = mapOrderStatusToUi(stop?.status ?? 'PENDING_PICKUP');

  const packageRows = useMemo(
    () => (detailDto?.packages ?? []).map((pkg, i) => packageDtoToRow(pkg, i)),
    [detailDto?.packages]
  );

  const stopTimelineSteps: PortalTimelineStep[] = useMemo(
    () => buildStopTimelineSkeleton(detailDto?.events),
    [detailDto?.events]
  );

  const [selectedPackage, setSelectedPackage] = useState<
    (PortalStopPackageRow & { events: StopTimelineEventDto[] }) | null
  >(null);

  if (
    deepLinkPackageId &&
    appliedDeepLinkPackageId !== deepLinkPackageId &&
    packageRows.length > 0
  ) {
    const target = packageRows.find((p) => p.id === deepLinkPackageId);
    if (target) {
      setAppliedDeepLinkPackageId(deepLinkPackageId);
      setSelectedPackage(target);
    }
  }
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [isStopEditOpen, setIsStopEditOpen] = useState(false);
  const [isPackagesEditOpen, setIsPackagesEditOpen] = useState(false);
  const [isCancelStopOpen, setIsCancelStopOpen] = useState(false);
  const [updateStopDetails, { isLoading: isSavingStop }] = useUpdateStopDetailsMutation();
  const [updateStopPackages, { isLoading: isSavingPackages }] = useUpdateStopPackagesMutation();
  const [cancelDeliveryStop, { isLoading: isCancellingStop }] = useCancelDeliveryStopMutation();

  const orderReference = detailDto?.order_reference ?? bookingId;
  const handleCopyOrderId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(orderReference);
      setCopiedOrder(true);
      toast.success('Booking ID copied');
      setTimeout(() => setCopiedOrder(false), 2000);
    } catch {
      // ignore
    }
  }, [orderReference]);

  const handleCopyTrackingField = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(trackingLink);
      toast.success('Tracking link copied');
    } catch {
      // ignore
    }
  }, [trackingLink]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center font-[Inter]">
        <span className="text-sm text-gray-500">Loading delivery stop…</span>
      </div>
    );
  }
  if (isError || !detailDto || !stop) {
    return (
      <div className="w-full pb-12 font-[Inter]">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => void navigate(-1)}
            className="group flex cursor-pointer items-center gap-2 border-none bg-transparent text-[16px] font-bold text-gray-900 outline-none transition-colors"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm font-medium text-red-700">
          Could not load this delivery stop.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  pb-12 font-[Inter]">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => void navigate(-1)}
          className="group flex cursor-pointer items-center gap-2 border-none bg-transparent text-[16px] font-bold text-gray-900 outline-none transition-colors"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
      </div>

      <div className="mx-auto mt-6  space-y-6 rounded-xl border border-gray-300">
        <div className="flex items-center justify-between rounded-t-xl border border-gray-300 border-b-0 bg-[#FBFBFC] p-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px] border-gray-900" />
              <Typography
                variant="h3"
                weight="semibold"
                className="text-[20px] tracking-tight text-gray-900"
              >
                Delivery Stop {stopIndex + 1} of {totalStops ?? 1}
              </Typography>
              <div className="ml-0 flex items-center gap-2.5 px-3 py-1.5 md:ml-4">
                <Typography variant="body" weight="bold" className="text-[14px] text-gray-400">
                  # {orderReference}
                </Typography>
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={() => void handleCopyOrderId()}
                  aria-label="Copy booking ID"
                >
                  <Copy className="h-5 w-5 cursor-pointer text-[#9C9CAB] transition-colors hover:text-gray-900" />
                </button>
                {copiedOrder ? (
                  <Typography variant="caption" className="text-xs text-emerald-600">
                    Copied
                  </Typography>
                ) : null}
              </div>
            </div>
          </div>
          {(detailDto?.status ?? '').toUpperCase() !== 'CANCELLED' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelStopOpen(true)}
              className="h-8 gap-1.5 rounded-md border-red-200 bg-white px-3 text-[13px] font-medium text-red-600 hover:bg-red-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Delivery Stop
            </Button>
          ) : null}
        </div>

        <div className="p-4">
          {!stop ? (
            <Typography variant="body" className="text-gray-600">
              This delivery stop could not be found.
            </Typography>
          ) : (
            <>
              <SectionShell
                heading="Delivery Details"
                headerAction={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStopEditOpen(true)}
                    className="h-8 gap-1.5 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                }
              >
                <div className="px-5 pb-4 pt-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="min-w-0">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Recipient
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="text-[13px] leading-tight text-gray-800"
                      >
                        {recipientName || '-'}
                      </Typography>
                    </div>
                    <div className="min-w-0">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="break-all text-[13px] leading-tight text-gray-800"
                      >
                        <span className="underline decoration-1 underline-offset-2">
                          {stop.recipient_email ?? '-'}
                        </span>
                      </Typography>
                    </div>
                    <div className="min-w-0">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Contact number
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="break-all text-[13px] leading-tight text-gray-800"
                      >
                        {stop.recipient_phone ?? '-'}
                      </Typography>
                    </div>
                    <div className="min-w-0">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Postal Code
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="break-words text-[13px] leading-tight text-gray-800"
                      >
                        {stop.postcode ?? '-'}
                      </Typography>
                    </div>
                    <div className="min-w-0">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Recipient Address
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="break-words text-[13px] leading-tight text-gray-800"
                      >
                        {buildAddress(stop)}
                      </Typography>
                    </div>
                    <div className="pt-2 lg:pt-5">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Scheduled Delivery Date
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className={cn(
                          'text-[13px]',
                          stop.scheduled_delivery_date ? 'text-gray-800' : 'text-gray-400'
                        )}
                      >
                        {formatOrderDate(stop.scheduled_delivery_date)}
                      </Typography>
                    </div>
                    <div className="pt-2 lg:pt-5">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Actual Delivery Time
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className={cn(
                          'text-[13px]',
                          stop.actual_delivery_date ? 'text-gray-800' : 'text-gray-400'
                        )}
                      >
                        {formatOrderDateTime(stop.actual_delivery_date)}
                      </Typography>
                    </div>
                    <div className="pt-2 lg:pt-5">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Attempts
                      </Typography>
                      <div className="mt-0.5 flex items-center gap-3">
                        <div className="flex -space-x-1.5 isolate">
                          {Array.from({
                            length: detailDto?.max_delivery_attempts ?? 3,
                          }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-4 w-4 rounded-full border-2 border-white',
                                i < (detailDto?.delivery_attempts ?? 0)
                                  ? 'bg-[#EF4444]'
                                  : 'bg-gray-200'
                              )}
                              style={{ zIndex: i + 1 }}
                            />
                          ))}
                        </div>
                        <Typography
                          variant="body"
                          className="ml-2 text-[12px] font-bold text-gray-800"
                        >
                          {detailDto?.delivery_attempts ?? 0} of{' '}
                          {detailDto?.max_delivery_attempts ?? 3}
                        </Typography>
                      </div>
                    </div>
                    <div className="pt-2 lg:pt-5">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        Status
                      </Typography>
                      <Badge
                        className={cn(
                          'h-6 max-w-fit select-none rounded-full border-transparent px-3.5 py-1 text-[10px] font-bold shadow-none',
                          statusBadgeClass(stop?.status ?? 'PENDING_PICKUP')
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <div className="pt-2 lg:pt-5">
                      <Typography
                        variant="caption"
                        className="mb-1 text-[11px] font-medium text-gray-400"
                      >
                        No of Packages
                      </Typography>
                      <Typography
                        variant="body"
                        weight="bold"
                        className="text-[13px] text-gray-800"
                      >
                        {String(stop.packages_count ?? 0).padStart(2, '0')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </SectionShell>

              <div className="grid grid-cols-1 gap-0 lg:grid-cols-[58%_42%]">
                <div className="relative space-y-8 pr-0 lg:col-span-1 lg:pr-2">
                  <SectionShell heading="Tracking Link">
                    <div className="space-y-3 px-5 pb-4 pt-6">
                      <div className="flex w-full flex-wrap items-center justify-between gap-2 pb-1">
                        <Typography
                          variant="caption"
                          className="text-[11px] font-medium text-gray-400"
                        >
                          Link to share to the Recipient
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => toast.success('Tracking link resent (demo)')}
                            className="h-7 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
                          >
                            Resend
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => void handleCopyTrackingField()}
                            className="h-7 w-7 rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                            aria-label="Copy tracking link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center rounded-[10px] border border-[#E5E7EB] bg-[#F8F8FA] px-4 py-2.5">
                        <Input
                          readOnly
                          value={trackingLink}
                          className="border-0 bg-transparent shadow-none"
                        />
                      </div>
                    </div>
                  </SectionShell>

                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
                      <Typography
                        variant="label"
                        className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
                      >
                        Packages Details
                      </Typography>
                      {packageRows.length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPackagesEditOpen(true)}
                          className="h-8 gap-1.5 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      ) : null}
                    </div>
                    <div className="space-y-3 px-5 py-4">
                      {packageRows.map((pkg) => (
                        <div
                          key={pkg.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedPackage(pkg);
                            }
                          }}
                          onClick={() => setSelectedPackage(pkg)}
                          className={cn(
                            'group relative flex cursor-pointer items-start gap-6 rounded-[10px] border bg-white p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
                            selectedPackage?.id === pkg.id
                              ? 'border-red-500 shadow-md ring-1 ring-red-500/20'
                              : 'border-gray-300 hover:border-gray-200'
                          )}
                        >
                          <div className="flex h-[96px] w-[120px] shrink-0 items-center justify-center rounded-md bg-gray-50">
                            <img src={BoxOpenIcon} alt="box-open" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-4 flex items-start justify-between gap-2">
                              <div>
                                <Typography
                                  variant="body"
                                  weight="semibold"
                                  className="text-[15px] text-gray-900"
                                >
                                  Package {String(pkg.packageNumber).padStart(2, '0')}
                                </Typography>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <Typography
                                    variant="caption"
                                    className="text-[12px] font-medium text-gray-400"
                                  >
                                    {pkg.number}
                                  </Typography>
                                  <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void navigator.clipboard.writeText(pkg.number);
                                      toast.success('Tracking number copied');
                                    }}
                                    aria-label="Copy tracking number"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-gray-300 transition-colors hover:text-gray-900" />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPackage(pkg);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white transition-all hover:bg-gray-50"
                                aria-label={`Open details for ${pkg.id}`}
                              >
                                <ArrowUpRight
                                  className={cn(
                                    'h-4 w-4 transition-colors',
                                    selectedPackage?.id === pkg.id
                                      ? 'text-red-500'
                                      : 'text-gray-300 group-hover:text-gray-900'
                                  )}
                                />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                              <div>
                                <Typography variant="caption" className="text-[11px] text-gray-400">
                                  Weight
                                </Typography>
                                <Typography
                                  variant="body"
                                  className="text-[13px] font-semibold text-gray-900"
                                >
                                  {pkg.weight}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-[11px] text-gray-400">
                                  Dimensions
                                </Typography>
                                <Typography
                                  variant="body"
                                  className="text-[13px] font-semibold text-gray-900"
                                >
                                  {pkg.dimensions}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-[11px] text-gray-400">
                                  Value
                                </Typography>
                                <Typography
                                  variant="body"
                                  className="text-[13px] font-semibold text-gray-900"
                                >
                                  {pkg.value}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-[11px] text-gray-400">
                                  Status
                                </Typography>
                                <Badge
                                  className={cn(
                                    'mt-1 h-6 max-w-fit select-none rounded-full border-transparent px-3 py-1 text-[10px] font-bold shadow-none',
                                    statusBadgeClass(pkg.status)
                                  )}
                                >
                                  {pkg.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <PortalDeliveryNotesCard packages={detailDto?.packages ?? []} />

                    <PortalProofOfDeliveryCard
                      pod={detailDto?.pod ?? null}
                      recipientName={recipientName || null}
                    />

                    <PortalProofOfReturnCard evidence={detailDto?.return_evidence ?? null} />

                    <PortalDeliveryPreferenceCard
                      initialPreference={
                        detailDto?.safe_place_allowed ? 'Leave at Safe Place' : 'Signature Required'
                      }
                    />

                    <PortalDeliveryServiceTierCard
                      organizationId={detailDto?.organization_id}
                      pricingPlan={
                        detailDto?.pricing_plan as React.ComponentProps<
                          typeof PortalDeliveryServiceTierCard
                        >['pricingPlan']
                      }
                      scheduledDate={detailDto?.scheduled_delivery_date}
                    />
                  </div>
                </div>

                <div
                  id="stop-details-sidebar"
                  className="mt-8 h-auto overflow-y-auto border-gray-100 pl-0  lg:col-span-1 lg:mt-0 lg:max-h-[calc(100vh-48px)] lg:sticky lg:top-6 lg:border-l lg:pl-4 lg:pr-1"
                >
                  <div className="space-y-8">
                    <div className="h-[390px] overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white">
                      <MarkerMap
                        activeLocations={[]}
                        inactiveLocations={[]}
                        className="h-full w-full"
                      />
                    </div>
                    <PortalDeliveryStopTimeline steps={stopTimelineSteps} />
                  </div>
                </div>
              </div>

              <PortalFailedAttemptsSection
                attempts={detailDto?.failed_attempts ?? []}
                totalAttempts={detailDto?.max_delivery_attempts ?? 3}
                title="FAILED ATTEMPT"
                className="mt-6"
              />
              <PortalFailedAttemptsSection
                attempts={detailDto?.return_attempts ?? []}
                title="RETURN ATTEMPT"
                className="mt-3"
              />
            </>
          )}
        </div>
      </div>

      {selectedPackage ? (
        <div className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] items-stretch justify-end overflow-hidden">
          <button
            type="button"
            className="h-full min-h-0 flex-1 cursor-default border-none bg-black/20 p-0"
            aria-label="Close package details"
            onClick={() => setSelectedPackage(null)}
          />
          <aside
            className="flex h-full min-h-0 w-full max-w-[700px] flex-col overflow-hidden border-l border-[#CBCBD8] bg-[#FBFBFC] shadow-[-9px_0px_20px_0px_rgba(0,0,0,0.02)] animate-in duration-300 slide-in-from-right-full"
            aria-labelledby="package-drawer-title"
          >
            <div className="shrink-0 bg-white px-5 pb-0 pt-5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-none bg-transparent text-[#030303] outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-red-500/40"
                  aria-label="Back to delivery stop"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <div className="flex min-w-0 flex-1 items-center px-2.5 py-2">
                  <Typography
                    id="package-drawer-title"
                    variant="body"
                    weight="semibold"
                    className="text-[20px] leading-5 tracking-tight text-[#030303]"
                  >
                    Package details
                  </Typography>
                </div>
              </div>
              <div className="mt-1 h-px w-full bg-[#E5E5EC]" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 pb-10 pt-6">
              <div className="shrink-0 flex flex-col gap-5 rounded-xl border border-[#E5E5EC] bg-white px-[18px] pb-6 pt-[18px] sm:flex-row sm:items-start">
                <div className="relative mx-auto flex h-[110px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F4F4F7] sm:mx-0">
                  <Package className="h-14 w-14 text-[#9C9CAB]" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-lg leading-5 text-[#030303]"
                    >
                      Package # {String(selectedPackage.packageNumber).padStart(2, '0')}
                    </Typography>
                    <div className="flex items-center gap-2.5">
                      <Typography variant="caption" className="text-xs font-medium text-[#9C9CAB]">
                        {selectedPackage.number}
                      </Typography>
                      <button
                        type="button"
                        className="rounded p-0.5 text-[#9C9CAB] outline-none transition-colors hover:text-[#030303] focus-visible:ring-2 focus-visible:ring-red-500/40"
                        onClick={() => {
                          void navigator.clipboard.writeText(selectedPackage.number);
                          toast.success('Package ID copied');
                        }}
                        aria-label="Copy package ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-16 lg:gap-x-[100px]">
                    <div className="flex flex-col gap-2">
                      <Typography
                        variant="body"
                        className="text-sm font-medium leading-normal text-[#858594]"
                      >
                        Declared Weight
                      </Typography>
                      <Typography
                        variant="body"
                        className="text-base font-medium leading-normal text-[#030303]"
                      >
                        {selectedPackage.weight}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography
                        variant="body"
                        className="text-sm font-medium leading-normal text-[#858594]"
                      >
                        Actual Weight
                      </Typography>
                      <Typography
                        variant="body"
                        className="text-base font-medium leading-normal text-[#030303]"
                      >
                        {selectedPackage.actualWeight}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography
                        variant="body"
                        className="text-sm font-medium leading-normal text-[#858594]"
                      >
                        Dimensions
                      </Typography>
                      <Typography
                        variant="body"
                        className="text-base font-medium leading-normal text-[#030303]"
                      >
                        {selectedPackage.dimensions}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography
                        variant="body"
                        className="text-sm font-medium leading-normal text-[#858594]"
                      >
                        Declared Value
                      </Typography>
                      <Typography
                        variant="body"
                        className="text-base font-medium leading-normal text-[#030303]"
                      >
                        {selectedPackage.value}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Typography
                      variant="body"
                      className="text-sm font-medium leading-normal text-[#858594]"
                    >
                      Delivery Status
                    </Typography>
                    <Badge
                      className={cn(
                        'h-auto w-fit rounded-full border-transparent px-2.5 py-1 text-xs font-semibold shadow-none',
                        statusBadgeClass(selectedPackage.status)
                      )}
                    >
                      {selectedPackage.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <PortalDeliveryStopTimeline
                title="PACKAGE TIMELINE"
                steps={buildPackageTimelineSkeleton(selectedPackage.events)}
              />
            </div>
          </aside>
        </div>
      ) : null}

      <PortalEditDeliveryStopDetailsModal
        isOpen={isStopEditOpen}
        onClose={() => setIsStopEditOpen(false)}
        saving={isSavingStop}
        initialData={{
          firstName: detailDto?.recipient_first_name ?? '',
          lastName: detailDto?.recipient_last_name ?? '',
          contactNumber: detailDto?.recipient_phone ?? '',
          email: detailDto?.recipient_email ?? '',
          addressLine1: detailDto?.line_1 ?? '',
          addressLine2: detailDto?.line_2 ?? '',
          city: detailDto?.city ?? '',
          postalCode: detailDto?.postcode ?? '',
        }}
        onConfirm={(data) => {
          if (!bookingId || !stopId) return;
          void (async () => {
            try {
              const result = await updateStopDetails({
                orderId: bookingId,
                stopId,
                recipient_first_name: data.firstName,
                recipient_last_name: data.lastName,
                recipient_phone: data.contactNumber,
                recipient_email: data.email,
                line_1: data.addressLine1,
                line_2: data.addressLine2 || undefined,
                city: data.city,
                postcode: data.postalCode,
              }).unwrap();
              notifyApiSuccess(result, { message: 'Delivery stop details updated' });
              setIsStopEditOpen(false);
            } catch (err) {
              notifyApiError(err);
            }
          })();
        }}
      />

      <PortalEditPackagesDetailsModal
        isOpen={isPackagesEditOpen}
        onClose={() => setIsPackagesEditOpen(false)}
        saving={isSavingPackages}
        organizationId={detailDto?.organization_id ?? null}
        initialPackages={(detailDto?.packages ?? []).map((pkg, idx) => ({
          id: pkg.id,
          label: `Package # ${String(idx + 1).padStart(2, '0')}`,
          length: pkg.length_cm != null ? String(pkg.length_cm) : '',
          width: pkg.width_cm != null ? String(pkg.width_cm) : '',
          height: pkg.height_cm != null ? String(pkg.height_cm) : '',
          weight: pkg.declared_weight_kg != null ? String(pkg.declared_weight_kg) : '',
          value: pkg.declared_value != null ? String(pkg.declared_value) : '',
        }))}
        onConfirm={(data) => {
          if (!bookingId || !stopId) return;
          void (async () => {
            try {
              const result = await updateStopPackages({
                orderId: bookingId,
                stopId,
                packages: data.map((p) => ({
                  id: p.id,
                  length_cm: p.length ? Number(p.length) : undefined,
                  width_cm: p.width ? Number(p.width) : undefined,
                  height_cm: p.height ? Number(p.height) : undefined,
                  declared_weight_kg: p.weight ? Number(p.weight) : undefined,
                  declared_value: p.value ? Number(p.value) : undefined,
                })),
              }).unwrap();
              notifyApiSuccess(result, { message: 'Packages updated' });
              setIsPackagesEditOpen(false);
            } catch (err) {
              notifyApiError(err);
            }
          })();
        }}
      />

      <PortalCancelBookingModal
        isOpen={isCancelStopOpen}
        onClose={() => setIsCancelStopOpen(false)}
        saving={isCancellingStop}
        title="Cancel Delivery Stop?"
        description="Are you sure you want to cancel this delivery stop? All packages on this stop will be cancelled."
        confirmLabel="Cancel Delivery Stop"
        onConfirm={(reason) => {
          if (!bookingId || !stopId) return;
          void (async () => {
            try {
              const result = await cancelDeliveryStop({
                orderId: bookingId,
                stopId,
                notes: reason,
              }).unwrap();
              notifyApiSuccess(result, { message: 'Delivery stop cancelled' });
              setIsCancelStopOpen(false);
              void navigate(-1);
            } catch (err) {
              notifyApiError(err);
            }
          })();
        }}
      />
    </div>
  );
}
