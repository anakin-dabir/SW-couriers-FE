import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PickupConfirmationStep } from '@/components/pages/PickupRequest';
import { EmptyState } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import type { PickupConfirmationMock } from '@/lib/data';
import type { PickupConfirmationRouteState } from '@/lib/pickupOrderFlow';
import { getPickupConfirmation } from '@/lib/pickupOrderFlow';

function formatOrderIdDisplay(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('#')) return t;
  return `# ${t}`;
}

function createFallbackConfirmation(orderId: string): PickupConfirmationMock {
  return {
    orderIdDisplay: formatOrderIdDisplay(orderId),
    pickupAddress: 'Address unavailable',
    masterLabelCode: `${orderId}-MASTER`,
    masterBarcodeValue: `${orderId.replace(/[^A-Z0-9]/gi, '').toUpperCase()}MASTER`,
    masterQrValue: `https://www.swcouriers.co.uk/track?order=${encodeURIComponent(orderId)}&type=master`,
    verticalBarcodeValue: `${orderId}-MASTER`,
    deliveryStops: '00',
    totalPackagesCount: '00',
    totalWeight: '0.0 kg',
    totalVolume: '0.00 m3',
    returnAddress: 'Address unavailable',
    totalDimensions: '—',
    packages: [],
  };
}

/**
 * Reuses pickup confirmation label UI (same as `/deliveries/pending/confirmation`) without the top hero header.
 */
export default function DeliveryLabelsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? null) as PickupConfirmationRouteState | null;
  const bookingId = id?.trim() || routeState?.orderId?.trim() || '';

  const confirmation = useMemo(() => {
    if (routeState?.confirmation) return routeState.confirmation;
    if (bookingId) {
      const persisted = getPickupConfirmation(bookingId);
      if (persisted) return persisted;
      return createFallbackConfirmation(bookingId);
    }
    return null;
  }, [bookingId, routeState]);

  const handleGoPending = useCallback((): void => {
    void navigate('/deliveries/pending');
  }, [navigate]);

  const handleCreateNew = useCallback((): void => {
    void navigate('/deliveries/pending');
  }, [navigate]);

  const handleGoDashboard = useCallback((): void => {
    void navigate('/dashboard');
  }, [navigate]);

  if (!confirmation) {
    return (
      <div className="mx-auto w-full max-w-3xl py-12">
        <EmptyState
          message="Label data is unavailable"
          description="Open labels from a submitted order or create a new order first."
        />
        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={() => void navigate('/deliveries/pending')}>
            Go To New Pickup Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PickupConfirmationStep
      hideConfirmationHeader
      confirmation={confirmation}
      onGoPending={handleGoPending}
      onCreateNew={handleCreateNew}
      onGoDashboard={handleGoDashboard}
      className="max-w-none"
    />
  );
}
