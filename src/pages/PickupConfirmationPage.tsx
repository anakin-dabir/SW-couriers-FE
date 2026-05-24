import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { PickupConfirmationStep } from '@/components/pages/PickupRequest';
import type { PickupConfirmationRouteState } from '@/lib/pickupOrderFlow';
import { getLatestPickupConfirmation } from '@/lib/pickupOrderFlow';

/**
 * Pickup confirmation page (payment confirmed).
 * Own route: header only, no map.
 */
export default function PickupConfirmationPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? null) as PickupConfirmationRouteState | null;
  const confirmation = routeState?.confirmation ?? getLatestPickupConfirmation();

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
          message="Order confirmation is unavailable"
          description="Please create or resume an order first, then complete payment."
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
      confirmation={confirmation}
      onGoPending={handleGoPending}
      onCreateNew={handleCreateNew}
      onGoDashboard={handleGoDashboard}
    />
  );
}
