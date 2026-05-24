import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrackingDeliveryCard,
  TrackingDeliveryMapToggler,
  TrackingFiltersHeader,
} from '@/components/pages/TrackingDeliveries';
import { EmptyState, ErrorState, PageHeader } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import {
  TRACKING_DELIVERY_CARDS_MOCK,
  TRACKING_DELIVERY_FILTER_OPTIONS,
  TRACKING_DELIVERY_HEADER_BUTTONS,
  TRACKING_DELIVERY_MOCK_LOCATIONS,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import type { LocationPoint } from '@/types/location';

export default function TrackingDeliveriesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [search, setSearch] = React.useState('');

  const handleViewDetails = (id: string): void => {
    void navigate(`/deliveries/${id}`);
  };

  const handleRetry = (): void => {
    setError(null);
    setIsLoading(false);
  };

  const filteredCards = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TRACKING_DELIVERY_CARDS_MOCK;
    return TRACKING_DELIVERY_CARDS_MOCK.filter((c) => {
      return (
        c.trackingId.toLowerCase().includes(query) ||
        c.postcode.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query) ||
        c.driverName.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const SELECTED_CARD = React.useMemo(() => {
    return TRACKING_DELIVERY_CARDS_MOCK.find((c) => c.id === selectedId);
  }, [selectedId]);

  const ALL_LOCATIONS = React.useMemo((): LocationPoint[] => {
    return TRACKING_DELIVERY_MOCK_LOCATIONS.map((l) => ({
      id: l.id,
      latitude: l.latitude,
      longitude: l.longitude,
    }));
  }, []);

  const FILTER_OPTIONS = React.useMemo(() => {
    return TRACKING_DELIVERY_FILTER_OPTIONS.map((o) => ({ id: o.id, label: o.label }));
  }, []);

  const HEADER_ACTIONS = (
    <>
      {TRACKING_DELIVERY_HEADER_BUTTONS.map((btn) => (
        <Button
          key={btn.to}
          variant={btn.variant === 'primary' ? 'default' : btn.variant}
          size="sm"
          onClick={() => {
            void navigate(btn.to);
          }}
        >
          {btn.label}
        </Button>
      ))}
    </>
  );

  return (
    <div className={cn('flex flex-col gap-4 h-full min-h-0')}>
      <PageHeader title="Tracking Deliveries" actions={HEADER_ACTIONS} />
      {/* Desktop: grid 2 cols (left: filter+cards, right: map). Mobile: 1 col, order filter → map → cards, only cards scrollable */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4 min-h-0 flex-1 grid-rows-[auto_auto_1fr]',
          'lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:h-[calc(100vh-6.875rem)] lg:flex-none'
        )}
      >
        {/* Filter row - mobile: order 1. Desktop: col 1 row 1 */}
        <div className={cn('order-1 lg:col-span-1 lg:row-start-1')}>
          <TrackingFiltersHeader
            filterOptions={FILTER_OPTIONS}
            onSearchChange={(value) => setSearch(value)}
          />
        </div>

        {/* Map - mobile: order 2. Desktop: col 2-3, both rows, sticky */}
        <div
          className={cn(
            'order-2 relative h-full lg:order-3 lg:col-span-2 lg:col-start-2 lg:row-start-1 lg:row-span-2'
          )}
        >
          <TrackingDeliveryMapToggler
            selectedCard={SELECTED_CARD}
            allLocations={ALL_LOCATIONS}
            onMarkerClick={setSelectedId}
          />
        </div>

        {/* Cards - mobile: order 3, only scrollable. Desktop: col 1 row 2, scrollable */}
        <div
          className={cn('order-3 flex flex-col gap-4 pb-6', 'lg:col-span-1 lg:row-start-2 lg:pb-0')}
        >
          {error && <ErrorState onRetry={handleRetry} />}
          {!error && isLoading && (
            <div className="py-6">
              <EmptyState message="Loading..." />
            </div>
          )}
          {!error && !isLoading && filteredCards.length === 0 && (
            <EmptyState message="No deliveries found" />
          )}

          {!error && !isLoading && filteredCards.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredCards.map((card) => (
                <TrackingDeliveryCard
                  key={card.id}
                  data={card}
                  isSelected={card.id === selectedId}
                  onSelect={setSelectedId}
                  onViewDetails={handleViewDetails}
                  className="cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
