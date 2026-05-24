import * as React from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  ZoomControl,
  Polyline,
  useMap,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import type { DeliveryTrackingLocation } from '@/types/delivery';
import {
  cn,
  createMarkerIcon,
  createDestinationMarkerIcon,
  createTruckBwMarkerIcon,
  fetchRoadRoute,
  calculateBearing,
} from '@/lib/utils';
import type { LocationPoint } from '@/types/location';
import { DELIVERY_ROUTE_PATH, TRACKING_DELIVERY_CARDS_MOCK } from '@/lib/data';
import FullscreenControl from './map/FullscreenControl';
import PickupDetailsTooltip from './PickupDetailsTooltip';

import 'leaflet/dist/leaflet.css';

interface DashboardMapProps {
  /** Array of delivery locations to display on the map */
  locations: DeliveryTrackingLocation[];
  /** Optional route path for truck animation */
  routePath?: Array<[number, number]>;
  /** Optional className */
  className?: string;
}

const DEFAULT_ZOOM = 13;
const DEFAULT_CENTER: [number, number] = [52.4862, -1.8904];

/**
 * Component to handle map bounds fitting for all locations and route
 */
function MapBoundsFitter({
  locations,
  routePath,
}: {
  locations: LocationPoint[];
  routePath: Array<[number, number]>;
}): null {
  const map = useMap();

  React.useMemo(() => {
    const allLocations = [
      ...locations.map((l) => [l.latitude, l.longitude] as [number, number]),
      ...routePath,
    ];

    if (allLocations.length > 0) {
      const bounds = L.latLngBounds(allLocations);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, routePath, map]);

  return null;
}

/**
 * Truck marker with popup showing selected pin details
 */
// WeakMap to store toggle flags for markers without using any types
const markerToggleFlags = new WeakMap<L.Marker, boolean>();

const TruckMarkerWithPopup = React.memo(function TruckMarkerWithPopup({
  position,
  selectedPinLocation,
  icon,
}: {
  position: LocationPoint;
  selectedPinLocation: DeliveryTrackingLocation | null;
  icon: L.DivIcon;
}): React.JSX.Element {
  const markerRef = React.useRef<L.Marker>(null);

  console.log('[TruckMarkerWithPopup] Component rendered', {
    position,
    selectedPinLocation,
    hasIcon: !!icon,
  });

  // Use callback ref to ensure marker is set up correctly
  const markerCallbackRef = React.useCallback((marker: L.Marker | null) => {
    console.log('[TruckMarkerWithPopup] Marker callback ref called', {
      marker,
      hasMarker: !!marker,
    });

    if (marker) {
      markerRef.current = marker;

      // Ensure marker is interactive
      marker.options.interactive = true;
      console.log('[TruckMarkerWithPopup] Marker options set', {
        interactive: marker.options.interactive,
      });

      // Wait for marker to be added to map
      setTimeout(() => {
        const markerElement = marker.getElement();
        if (markerElement) {
          console.log('[TruckMarkerWithPopup] Marker element found', {
            element: markerElement,
            className: markerElement.className,
          });

          markerElement.style.cursor = 'pointer';
          markerElement.style.pointerEvents = 'auto';

          // Ensure the icon image inside is also clickable (but don't add separate handler)
          const iconImage = markerElement.querySelector('img');
          if (iconImage) {
            console.log('[TruckMarkerWithPopup] Icon image found, setting styles');
            iconImage.style.pointerEvents = 'auto';
            iconImage.style.cursor = 'pointer';
            // Don't add separate click handler - let the marker's click handler handle it
          } else {
            console.warn('[TruckMarkerWithPopup] Icon image not found in marker element');
          }
        } else {
          console.warn('[TruckMarkerWithPopup] Marker element not found');
        }
      }, 100);
    }
  }, []);

  // Get full location details from the locations array
  const locationDetails = selectedPinLocation;

  // Prepare pickup details for the tooltip - map location ID to tracking card data
  const pickupDetails = React.useMemo(() => {
    console.log('[TruckMarkerWithPopup] Computing pickup details', {
      locationDetails,
    });

    if (!locationDetails) {
      console.log('[TruckMarkerWithPopup] No location details, returning null');
      return null;
    }

    // Map location ID to tracking card data
    // Location IDs are '1', '2', '3', etc., map to tracking card indices
    const locationIndex = parseInt(locationDetails.id, 10) - 1;
    const trackingCard =
      TRACKING_DELIVERY_CARDS_MOCK[locationIndex] || TRACKING_DELIVERY_CARDS_MOCK[0];

    console.log('[TruckMarkerWithPopup] Tracking card found', {
      locationIndex,
      trackingCard,
    });

    // Generate tracking IDs based on number of packages
    const numberOfPackages = parseInt(trackingCard.numberOfPackages, 10) || 1;
    const trackingIds = Array.from({ length: numberOfPackages }, (_, i) => ({
      packageNumber: i + 1,
      trackingId: `${trackingCard.trackingId}-${i + 1}`,
    }));

    const details = {
      status: locationDetails.status === 'active' ? 'On Route' : trackingCard.status,
      estimatedPickupTime: trackingCard.eta || '30 min',
      routeId: `ROUTE-${locationDetails.id}`,
      trackingIds,
      driverName: trackingCard.driverName || 'James Wilson',
      vehicleId: `VEH-${locationDetails.id}`,
      locationId: locationDetails.id,
      locationStatus: locationDetails.status,
    };

    console.log('[TruckMarkerWithPopup] Pickup details computed', details);
    return details;
  }, [locationDetails]);

  if (!pickupDetails) {
    console.log('[TruckMarkerWithPopup] No pickup details, rendering marker without popup');
    return (
      <Marker
        ref={markerRef}
        position={[position.latitude, position.longitude]}
        icon={icon}
        interactive={true}
      />
    );
  }

  console.log('[TruckMarkerWithPopup] Rendering marker with popup', {
    position,
    pickupDetails,
  });

  return (
    <Marker
      ref={markerCallbackRef}
      position={[position.latitude, position.longitude]}
      icon={icon}
      interactive={true}
      eventHandlers={{
        click: (e) => {
          console.log('[TruckMarkerWithPopup] Marker click event triggered', {
            event: e,
            target: e.target as L.Marker,
            originalEvent: e.originalEvent,
            markerRef: markerRef.current,
          });

          // Stop event propagation to prevent map click
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            console.log('[TruckMarkerWithPopup] Event propagation stopped');
          }

          const marker = e.target as L.Marker;

          console.log('[TruckMarkerWithPopup] Marker from event', {
            marker,
            isPopupOpen: marker?.isPopupOpen(),
          });

          if (marker) {
            // Check current state and toggle
            const isOpen = marker.isPopupOpen();
            console.log('[TruckMarkerWithPopup] Current popup state', { isOpen });

            // Use WeakMap to prevent double-toggling
            const isToggling = markerToggleFlags.get(marker) ?? false;
            if (isToggling) {
              console.log('[TruckMarkerWithPopup] Already toggling, ignoring');
              return;
            }

            markerToggleFlags.set(marker, true);

            if (isOpen) {
              console.log('[TruckMarkerWithPopup] Closing popup');
              marker.closePopup();
            } else {
              console.log('[TruckMarkerWithPopup] Opening popup');
              marker.openPopup();
            }

            // Reset flag after a short delay
            setTimeout(() => {
              markerToggleFlags.delete(marker);
            }, 300);
          } else {
            console.error('[TruckMarkerWithPopup] Marker is null in click handler');
          }
        },
      }}
    >
      <Popup
        offset={[10, 0]}
        className="leaflet-popup-pickup-details"
        closeButton={true}
        autoPan={true}
        autoClose={false}
      >
        <PickupDetailsTooltip
          status={pickupDetails.status}
          estimatedPickupTime={pickupDetails.estimatedPickupTime}
          routeId={pickupDetails.routeId}
          trackingIds={pickupDetails.trackingIds}
          driverName={pickupDetails.driverName}
          vehicleId={pickupDetails.vehicleId}
          locationId={pickupDetails.locationId}
          locationStatus={pickupDetails.locationStatus}
        />
      </Popup>
    </Marker>
  );
});

/**
 * DashboardMap molecule component.
 * Displays a Leaflet map with circular markers for delivery locations.
 * Shows animated truck moving along route path with traveled/remaining route visualization.
 * Matches Figma design 3838-22118.
 */
export default function DashboardMap({
  locations,
  routePath = DELIVERY_ROUTE_PATH,
  className,
}: DashboardMapProps): React.JSX.Element {
  // State for selected pin and its route
  const [selectedPinLocation, setSelectedPinLocation] = React.useState<LocationPoint | null>(null);
  const [pinRoutePath, setPinRoutePath] = React.useState<Array<[number, number]>>([]);
  const [destinationPinLocation, setDestinationPinLocation] = React.useState<LocationPoint | null>(
    null
  );

  const ACTIVE_LOCATIONS = React.useMemo((): LocationPoint[] => {
    return locations
      .filter((l) => l.status === 'active')
      .map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude }));
  }, [locations]);

  const INACTIVE_LOCATIONS = React.useMemo((): LocationPoint[] => {
    return locations
      .filter((l) => l.status !== 'active')
      .map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude }));
  }, [locations]);

  // Fetch road-based route from OSRM
  const [roadRoutePath, setRoadRoutePath] = React.useState<Array<[number, number]>>(routePath);

  React.useEffect(() => {
    if (routePath.length < 2) {
      return;
    }

    const start = routePath[0];
    const end = routePath[routePath.length - 1];

    if (!start || !end) {
      return;
    }

    fetchRoadRoute(start, end)
      .then((roadRoute) => {
        setRoadRoutePath(roadRoute);
      })
      .catch(() => {
        // Fallback to provided route path if OSRM fails
        setRoadRoutePath(routePath);
      });
  }, [routePath]);

  // Use road-based route if available, otherwise fallback to provided route
  const activeRoutePath = React.useMemo(() => {
    return roadRoutePath.length > 0 ? roadRoutePath : routePath;
  }, [roadRoutePath, routePath]);

  // Calculate map center
  const center = React.useMemo((): [number, number] => {
    if (activeRoutePath.length > 0) {
      const avgLat =
        activeRoutePath.reduce((sum, point) => sum + point[0], 0) / activeRoutePath.length;
      const avgLng =
        activeRoutePath.reduce((sum, point) => sum + point[1], 0) / activeRoutePath.length;
      return [avgLat, avgLng];
    }
    if (ACTIVE_LOCATIONS.length > 0 || INACTIVE_LOCATIONS.length > 0) {
      const allLocations = [...ACTIVE_LOCATIONS, ...INACTIVE_LOCATIONS];
      const avgLat = allLocations.reduce((sum, loc) => sum + loc.latitude, 0) / allLocations.length;
      const avgLng =
        allLocations.reduce((sum, loc) => sum + loc.longitude, 0) / allLocations.length;
      return [avgLat, avgLng];
    }
    return DEFAULT_CENTER;
  }, [activeRoutePath, ACTIVE_LOCATIONS, INACTIVE_LOCATIONS]);

  const ACTIVE_ID_SET = React.useMemo(() => {
    return new Set(ACTIVE_LOCATIONS.map((l) => l.id));
  }, [ACTIVE_LOCATIONS]);

  const allLocations = React.useMemo(() => {
    return [...ACTIVE_LOCATIONS, ...INACTIVE_LOCATIONS];
  }, [ACTIVE_LOCATIONS, INACTIVE_LOCATIONS]);

  // Find the full location details for the selected pin
  const selectedPinFullLocation = React.useMemo((): DeliveryTrackingLocation | null => {
    if (!selectedPinLocation) {
      return null;
    }
    return locations.find((loc) => loc.id === selectedPinLocation.id) || null;
  }, [selectedPinLocation, locations]);

  // Find next pin in sequence for the selected pin
  const nextPinLocation = React.useMemo((): LocationPoint | null => {
    if (!selectedPinLocation || allLocations.length < 2) {
      return null;
    }

    // Find the index of the selected pin in the allLocations array
    const selectedIndex = allLocations.findIndex((loc) => loc.id === selectedPinLocation.id);

    if (selectedIndex === -1 || selectedIndex === allLocations.length - 1) {
      // If selected pin is last or not found, route to first pin (wrap around)
      return allLocations[0];
    }

    // Route to the next pin in sequence
    return allLocations[selectedIndex + 1];
  }, [selectedPinLocation, allLocations]);

  // Fetch route from selected pin to next pin in sequence
  React.useEffect(() => {
    if (!selectedPinLocation || !nextPinLocation) {
      setPinRoutePath([]);
      setDestinationPinLocation(null);
      return;
    }

    const start: [number, number] = [selectedPinLocation.latitude, selectedPinLocation.longitude];
    const end: [number, number] = [nextPinLocation.latitude, nextPinLocation.longitude];

    setDestinationPinLocation(nextPinLocation);

    fetchRoadRoute(start, end)
      .then((roadRoute) => {
        setPinRoutePath(roadRoute);
      })
      .catch(() => {
        // Fallback to straight line if OSRM fails
        setPinRoutePath([start, end]);
      });
  }, [selectedPinLocation, nextPinLocation]);

  // Truck position along pin route - fixed at 30% progress (not animated)
  const truckProgress = React.useMemo(() => 0.3, []);

  // Calculate truck position along the pin route
  const TRUCK_POSITION = React.useMemo((): LocationPoint | null => {
    if (!selectedPinLocation || !nextPinLocation || pinRoutePath.length < 2) {
      return null;
    }

    const totalDistance = pinRoutePath.length - 1;
    const currentIndex = Math.floor(truckProgress * totalDistance);
    const nextIndex = Math.min(currentIndex + 1, pinRoutePath.length - 1);
    const segmentProgress = (truckProgress * totalDistance) % 1;

    const currentPoint = pinRoutePath[currentIndex];
    const nextPoint = pinRoutePath[nextIndex];

    if (!currentPoint || !nextPoint) {
      return selectedPinLocation;
    }

    // Interpolate between current and next point
    const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * segmentProgress;
    const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * segmentProgress;

    return { id: 'truck', latitude: lat, longitude: lng };
  }, [selectedPinLocation, nextPinLocation, pinRoutePath, truckProgress]);

  // Calculate truck bearing (direction) along the pin route
  const TRUCK_BEARING = React.useMemo((): number | undefined => {
    if (!selectedPinLocation || !nextPinLocation || pinRoutePath.length < 2) {
      return undefined;
    }

    const totalDistance = pinRoutePath.length - 1;
    const currentIndex = Math.floor(truckProgress * totalDistance);
    const nextIndex = Math.min(currentIndex + 1, pinRoutePath.length - 1);

    const currentPoint = pinRoutePath[currentIndex];
    const nextPoint = pinRoutePath[nextIndex];

    if (!currentPoint || !nextPoint || currentIndex === pinRoutePath.length - 1) {
      // If at the end, use previous segment direction
      if (currentIndex > 0) {
        const prevPoint = pinRoutePath[currentIndex - 1];
        if (prevPoint) {
          return calculateBearing(prevPoint[0], prevPoint[1], currentPoint[0], currentPoint[1]);
        }
      }
      return undefined;
    }

    // Calculate bearing from current to next point
    return calculateBearing(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]);
  }, [selectedPinLocation, nextPinLocation, pinRoutePath, truckProgress]);

  return (
    <div
      className={cn(
        'dashboard-map-root relative h-full w-full overflow-hidden rounded-lg',
        className
      )}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to show all locations and route */}
        <MapBoundsFitter locations={allLocations} routePath={activeRoutePath} />

        <ZoomControl position="bottomright" />
        <FullscreenControl />

        {/* Route from selected pin to destination - only show when pin is selected */}
        {selectedPinLocation && pinRoutePath.length > 1 && (
          <Polyline
            positions={pinRoutePath}
            pathOptions={{
              color: '#808080', // Grey color for pin route
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {/* Truck marker on pin route - only show when pin is selected */}
        {selectedPinLocation && TRUCK_POSITION && selectedPinFullLocation && (
          <TruckMarkerWithPopup
            key={`truck-${selectedPinLocation.id}-${TRUCK_POSITION.latitude}-${TRUCK_POSITION.longitude}`}
            position={TRUCK_POSITION}
            selectedPinLocation={selectedPinFullLocation}
            icon={createTruckBwMarkerIcon(TRUCK_BEARING)}
          />
        )}

        {/* Destination pin marker - only show when pin is selected */}
        {selectedPinLocation && destinationPinLocation && (
          <Marker
            position={[destinationPinLocation.latitude, destinationPinLocation.longitude]}
            icon={createDestinationMarkerIcon('#CA0000')}
          />
        )}

        {/* Location markers */}
        {allLocations.map((location) => {
          const isActiveByData = ACTIVE_ID_SET.has(location.id);
          const isSelected = selectedPinLocation?.id === location.id;
          // Use primary color (#CA0000) for selected pin
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createMarkerIcon(isActiveByData, location.id, isSelected)}
              eventHandlers={{
                click: () => {
                  // Toggle selection: if same pin clicked, deselect; otherwise select new pin
                  if (isSelected) {
                    setSelectedPinLocation(null);
                    setPinRoutePath([]);
                    setDestinationPinLocation(null);
                  } else {
                    setSelectedPinLocation(location);
                  }
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* Fullscreen styles */}
      <style>{`
        .leaflet-container:fullscreen .leaflet-map-pane {
          height: 100vh !important;
        }
        .leaflet-control {
          margin-right: 10px !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: none !important;
        }
        .vehicle-marker img,
        .warehouse-marker img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        .vehicle-marker,
        .warehouse-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
