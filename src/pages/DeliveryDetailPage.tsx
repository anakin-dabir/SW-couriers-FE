import type React from 'react';
import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate, useParams } from 'react-router-dom';
import { Ban, Barcode, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { DeliveryInvoiceModal } from '@/components/pages/DeliveryDetail';
import PortalOrderIdHeader from '@/components/pages/DeliveryDetail/orderDetails/PortalOrderIdHeader';
import PortalOrderDetailsHeader from '@/components/pages/DeliveryDetail/orderDetails/PortalOrderDetailsHeader';
import PortalPickupDetailsCard from '@/components/pages/DeliveryDetail/orderDetails/PortalPickupDetailsCard';
import PortalPriceBreakdownTable from '@/components/pages/DeliveryDetail/orderDetails/PortalPriceBreakdownTable';
import PortalFinancialSummaryCard from '@/components/pages/DeliveryDetail/orderDetails/PortalFinancialSummaryCard';
import PortalDeliveryStopDetails from '@/components/pages/DeliveryDetail/orderDetails/PortalDeliveryStopDetails';
import type { PortalDeliveryStopRow } from '@/components/pages/DeliveryDetail/orderDetails/PortalDeliveryStopDetails';
import { mapOrderDetailToPortalView } from '@/lib/orderDetailMapper';
import { useOrganizationId } from '@/lib/organizationContext';
import { cn } from '@/lib/utils';
import { useGetOrderDetailQuery, useCancelOrderMutation } from '@/store/api';
import PortalCancelBookingModal from '@/components/pages/DeliveryDetail/stopDetails/PortalCancelBookingModal';
import { useGetOrganizationProfileQuery } from '@/store/api/organizationProfileApi';
import { getErrorMessage } from '@/store/api/utils';
import type { PortalDeliveryStopApi } from '@/lib/portalOrderDetailMock';

const buildAddress = (stop: PortalDeliveryStopApi): string =>
  [stop.line_1, stop.line_2, stop.city, stop.postcode].filter(Boolean).join(', ');

/**
 * Order detail for `/deliveries/:id` — backed by GET /orders/detail/{order_id}.
 */
export default function DeliveryDetailPage(): React.JSX.Element {
  const { id: routeOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationId = useOrganizationId();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [cancelOrder, { isLoading: isCancellingOrder }] = useCancelOrderMutation();

  const orderIdParam = routeOrderId?.trim() ?? '';

  const {
    data: orderDetailResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetOrderDetailQuery(orderIdParam ? { order_id: orderIdParam } : skipToken, {
    skip: !orderIdParam,
  });

  const { data: orgProfileResponse } = useGetOrganizationProfileQuery(
    organizationId ? { organizationId } : skipToken
  );

  const detail = useMemo(() => {
    const apiDetail = orderDetailResponse?.data;
    if (!apiDetail) return null;
    return mapOrderDetailToPortalView(apiDetail, {
      pickupAddresses: orgProfileResponse?.data?.pickup_addresses,
    });
  }, [orderDetailResponse?.data, orgProfileResponse?.data?.pickup_addresses]);

  const apiStops = orderDetailResponse?.data?.delivery_stops;

  const deliveryStops: PortalDeliveryStopRow[] = useMemo(
    () =>
      (detail?.delivery_stops ?? []).map((stop, index) => {
        const apiStop = apiStops?.[index];
        return {
          id: stop.id,
          trackingId: apiStop?.tracking_id ?? stop.id,
          recipientName: [stop.recipient_first_name, stop.recipient_last_name]
            .filter(Boolean)
            .join(' '),
          recipientEmail: stop.recipient_email ?? null,
          recipientPhone: stop.recipient_phone ?? null,
          postcode: stop.postcode ?? null,
          recipientAddress: buildAddress(stop),
          scheduledDeliveryDate: stop.scheduled_delivery_date ?? null,
          actualDeliveryDate: stop.actual_delivery_date ?? null,
          deliveryAttempts: stop.delivery_attempts ?? 0,
          maxDeliveryAttempts: stop.max_delivery_attempts ?? 3,
          status: stop.status,
          packagesCount: stop.packages_count ?? 0,
        };
      }),
    [detail?.delivery_stops, apiStops]
  );

  const routeSegmentForChildPages = detail?.id ?? orderIdParam;

  if (!orderIdParam) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3">
        <Typography className="text-sm text-[#71717A]">Order not found.</Typography>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void navigate('/orders/list')}
        >
          Back to orders
        </Button>
      </div>
    );
  }

  if (isLoading && !detail) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2
          className="size-8 animate-spin text-[#71717A]"
          aria-label="Loading order details"
        />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8">
        <Typography className="text-center text-sm text-red-700">
          {getErrorMessage(error) || 'Unable to load order details.'}
        </Typography>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void navigate('/orders/list')}
          >
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-[1600px] space-y-6 font-[Inter] md:space-y-8')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void navigate(-1)}
            className="h-10 w-10 shrink-0 rounded-xl hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </Button>
          <Typography
            variant="h3"
            weight="medium"
            className="text-[24px] tracking-tight text-[#030303] md:text-[28px]"
          >
            Order Details
          </Typography>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="h-9 gap-1.5 rounded-lg border-[#D1D5DB] bg-white px-4 text-[13px] font-medium text-[#374151] shadow-none hover:bg-[#FAFAFA]"
          >
            <FileText className="h-3.5 w-3.5" />
            View Invoice
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              void navigate(`/deliveries/${encodeURIComponent(routeSegmentForChildPages)}/labels`)
            }
            className="h-9 gap-1.5 rounded-lg bg-[#A31D21] px-4 text-[13px] font-medium text-white shadow-none hover:bg-[#8B181C]"
          >
            <Barcode className="h-3.5 w-3.5" />
            View Labels
          </Button>
          {(detail.status ?? '').toUpperCase() !== 'CANCELLED' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCancelOrderOpen(true)}
              className="h-9 gap-1.5 rounded-lg border-red-200 bg-white px-4 text-[13px] font-medium text-red-600 hover:bg-red-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Booking
            </Button>
          ) : null}
        </div>
      </div>

      {isFetching && !isLoading ? (
        <Typography className="text-xs text-[#71717A]">Refreshing order details…</Typography>
      ) : null}

      <div className="flex flex-col gap-[10px]">
        <div className="overflow-hidden rounded-[12px] border border-[#CBCBD8] bg-white">
          <PortalOrderIdHeader orderId={detail.order_id} status={detail.status} />
        </div>

        <PortalOrderDetailsHeader createdOn={detail.created_at} createdBy={detail.created_by} />

        <PortalPickupDetailsCard
          pickup={{
            scheduledPickupDate: detail.requested_pickup_date,
            actualPickupDate: detail.actual_pickup_date,
            driver: detail.pickup_driver,
            routeId: detail.pickup_route_id,
            vehicle: detail.pickup_vehicle,
            contactName: detail.pickup_contact_name,
            contactNumber: detail.pickup_contact_phone,
            contactEmail: detail.pickup_contact_email,
            postalCode: detail.pickup_postcode,
            pickupAddress: detail.pickup_address,
          }}
        />

        <div className="grid w-full grid-cols-1 gap-[10px] lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <PortalPriceBreakdownTable breakdown={detail.price_breakdown} />
          </div>
          <div className="min-w-0">
            <PortalFinancialSummaryCard
              paymentMethod={detail.payment_method}
              paymentStatus={detail.payment_status}
              linkedInvoiceId={detail.linked_invoice_id}
              linkedInvoiceNumber={detail.linked_invoice_number}
              cardLastFour={detail.card_last_four}
            />
          </div>
        </div>

        <PortalDeliveryStopDetails orderId={routeSegmentForChildPages} stops={deliveryStops} />
      </div>

      <DeliveryInvoiceModal
        orderReference={detail.order_id}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onDownloadInvoice={() => {
          toast.message('Invoice download is available from Billing → Invoices.');
        }}
      />

      <PortalCancelBookingModal
        isOpen={isCancelOrderOpen}
        onClose={() => setIsCancelOrderOpen(false)}
        saving={isCancellingOrder}
        title="Cancel Booking Order?"
        description="Are you sure you want to cancel this booking? This action will cancel the entire order and may trigger refunds or billing adjustments."
        confirmLabel="Confirm Cancellation"
        onConfirm={(reason) => {
          void (async () => {
            try {
              const result = await cancelOrder({
                orderId: detail.order_id,
                notes: reason,
              }).unwrap();
              notifyApiSuccess(result, { message: 'Order cancelled' });
              setIsCancelOrderOpen(false);
            } catch (err) {
              notifyApiError(err);
            }
          })();
        }}
      />
    </div>
  );
}
