'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

import { LocateMeIcon } from '@/assets/img';
import Typography from '@/components/atoms/Typography';

import 'leaflet/dist/leaflet.css';

const FULLSCREEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M0.691174 0C0.50809 0.000732616 0.332713 0.0737872 0.203252 0.203248C0.0737911 0.33271 0.000737236 0.508087 5.31477e-06 0.691171V4.28661C0.000362474 4.46994 0.0732536 4.64567 0.202757 4.77543C0.33226 4.90518 0.50785 4.97842 0.691174 4.97914C0.782409 4.97949 0.872819 4.96185 0.95723 4.92723C1.04164 4.8926 1.11839 4.84167 1.1831 4.77734C1.2478 4.71302 1.29918 4.63657 1.3343 4.55236C1.36942 4.46815 1.38759 4.37785 1.38777 4.28661V2.37166L4.51158 5.49548C4.57606 5.5603 4.65272 5.61175 4.73714 5.64685C4.82157 5.68195 4.9121 5.70002 5.00353 5.70002C5.09497 5.70002 5.1855 5.68195 5.26992 5.64685C5.35435 5.61175 5.43101 5.5603 5.49549 5.49548C5.62475 5.36547 5.69732 5.18958 5.69732 5.00624C5.69732 4.8229 5.62475 4.64701 5.49549 4.517L2.36895 1.38776H4.28662C4.37774 1.38741 4.4679 1.36911 4.55195 1.33391C4.636 1.29871 4.71229 1.2473 4.77647 1.18261C4.84065 1.11793 4.89147 1.04124 4.92601 0.956914C4.96055 0.872592 4.97814 0.782293 4.97779 0.691171C4.97707 0.508081 4.90403 0.332694 4.77456 0.203228C4.6451 0.0737633 4.46971 0.000714473 4.28662 0H0.691174ZM9.19934 0C9.01625 0.000715163 8.84087 0.0737646 8.7114 0.20323C8.58194 0.332695 8.50889 0.508082 8.50818 0.691171C8.50782 0.782292 8.52541 0.872592 8.55996 0.956914C8.5945 1.04124 8.64531 1.11793 8.70949 1.18261C8.77367 1.2473 8.84996 1.29871 8.93401 1.33391C9.01806 1.36911 9.10822 1.38741 9.19934 1.38776H11.117L7.99048 4.517C7.86121 4.64701 7.78865 4.8229 7.78865 5.00624C7.78865 5.18958 7.86121 5.36547 7.99048 5.49548C8.05494 5.5601 8.13151 5.61137 8.21581 5.64635C8.30011 5.68133 8.39048 5.69934 8.48175 5.69934C8.57302 5.69934 8.66339 5.68133 8.74769 5.64635C8.83199 5.61137 8.90856 5.5601 8.97302 5.49548L12.0982 2.37166V4.28661C12.0984 4.37785 12.1165 4.46815 12.1517 4.55236C12.1868 4.63656 12.2382 4.71302 12.3029 4.77734C12.3676 4.84166 12.4443 4.8926 12.5287 4.92722C12.6131 4.96185 12.7035 4.97949 12.7948 4.97914C12.9781 4.97842 13.1537 4.90519 13.2832 4.77543C13.4127 4.64567 13.4856 4.46994 13.486 4.28661V0.691171C13.4852 0.508086 13.4122 0.332709 13.2827 0.203247C13.1532 0.0737858 12.9779 0.000731236 12.7948 0H9.19934ZM4.95475 7.49581C4.78748 7.50737 4.63005 7.5791 4.51158 7.69774L1.38777 10.827V8.91203C1.38813 8.82046 1.37035 8.72971 1.33547 8.64504C1.30059 8.56036 1.2493 8.48343 1.18454 8.41867C1.11978 8.35391 1.04285 8.30262 0.958172 8.26774C0.873496 8.23286 0.782752 8.21508 0.691174 8.21544C0.600052 8.2158 0.509892 8.2341 0.425843 8.2693C0.341794 8.3045 0.2655 8.35591 0.201319 8.42059C0.137138 8.48528 0.0863267 8.56197 0.0517852 8.64629C0.0172436 8.73061 -0.000351319 8.82091 5.31477e-06 8.91203V12.5034C-0.000696518 12.6874 0.0717244 12.8642 0.20134 12.9948C0.330955 13.1255 0.507151 13.1993 0.691174 13.2H4.28662C4.37774 13.1996 4.4679 13.1813 4.55195 13.1461C4.636 13.1109 4.71229 13.0595 4.77647 12.9949C4.84065 12.9302 4.89147 12.8535 4.92601 12.7692C4.96055 12.6848 4.97814 12.5945 4.97779 12.5034C4.97743 12.3201 4.90454 12.1443 4.77504 12.0146C4.64553 11.8848 4.46994 11.8116 4.28662 11.8109H2.36625L5.49549 8.68164C5.56031 8.61716 5.61175 8.54051 5.64685 8.45608C5.68195 8.37166 5.70003 8.28113 5.70003 8.18969C5.70003 8.09826 5.68195 8.00773 5.64685 7.92331C5.61175 7.83888 5.56031 7.76222 5.49549 7.69774C5.42513 7.62725 5.34042 7.57273 5.24711 7.53788C5.15381 7.50304 5.05409 7.48869 4.95475 7.49581ZM8.43228 7.49581C8.26549 7.50769 8.1086 7.5794 7.99048 7.69774C7.92566 7.76222 7.87421 7.83888 7.83911 7.92331C7.80401 8.00773 7.78594 8.09826 7.78594 8.18969C7.78594 8.28113 7.80401 8.37166 7.83911 8.45608C7.87421 8.54051 7.92566 8.61716 7.99048 8.68164L11.1197 11.8109H9.19934C9.01602 11.8116 8.84043 11.8848 8.71093 12.0146C8.58142 12.1444 8.50853 12.3201 8.50818 12.5034C8.50782 12.5945 8.52541 12.6848 8.55996 12.7692C8.5945 12.8535 8.64531 12.9302 8.70949 12.9948C8.77367 13.0595 8.84996 13.1109 8.93401 13.1461C9.01806 13.1813 9.10822 13.1996 9.19934 13.2H12.7948C12.9788 13.1993 13.155 13.1255 13.2846 12.9948C13.4142 12.8642 13.4867 12.6874 13.486 12.5034V8.91203C13.4863 8.82091 13.4687 8.73061 13.4342 8.64629C13.3996 8.56197 13.3488 8.48528 13.2846 8.42059C13.2205 8.35591 13.1442 8.3045 13.0601 8.2693C12.9761 8.2341 12.8859 8.2158 12.7948 8.21544C12.7032 8.21509 12.6125 8.23286 12.5278 8.26774C12.4431 8.30262 12.3662 8.35392 12.3014 8.41867C12.2367 8.48343 12.1854 8.56036 12.1505 8.64504C12.1156 8.72971 12.0978 8.82046 12.0982 8.91203V10.827L8.97302 7.69774C8.90266 7.62725 8.81795 7.57272 8.72464 7.53788C8.63134 7.50304 8.53162 7.48869 8.43228 7.49581Z" fill="#515151"/></svg>`;

const DEFAULT_UK_CENTER: [number, number] = [54.89, -2.93];
const DEFAULT_ZOOM = 13;

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

/** Teardrop pin icon (black with white circle) for pickup location */
function createPickupPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'pickup-location-pin',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#1a1a1a"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

const pickupPinIcon = createPickupPinIcon();

/** Sync map view to position when it changes (e.g. after form reset on edit) */
function SetViewOnPosition({ position }: { position: { lat: number; lng: number } }): null {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom());
  }, [map, position.lat, position.lng]);
  return null;
}

interface PickupMapControlsGroupProps {
  onRecenter?: (lat: number, lng: number) => void;
}

/** Single control group at bottom-right: current location, zoom in/out, fullscreen in flex-col */
function PickupMapControlsGroup({ onRecenter }: PickupMapControlsGroupProps): null {
  const map = useMap();

  const handleRecenter = useCallback((): void => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], map.getZoom());
        onRecenter?.(latitude, longitude);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, [map, onRecenter]);

  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const wrapper = L.DomUtil.create('div', 'flex flex-col gap-1');
    container.appendChild(wrapper);

    // 1. Current location button (no white container)
    const recenterBtn = L.DomUtil.create('button', '', wrapper);
    recenterBtn.className =
      'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-700 text-white shadow hover:bg-gray-600';
    recenterBtn.title = 'Recenter to my location';
    recenterBtn.setAttribute('type', 'button');
    recenterBtn.innerHTML = `
      <img src="${LocateMeIcon}" alt="" width="18" height="18" class="pointer-events-none" />
      <span class="sr-only">Recenter</span>
    `;
    L.DomEvent.disableClickPropagation(recenterBtn);
    L.DomEvent.on(recenterBtn, 'click', handleRecenter);

    // 2. Zoom in / out button group (white container only around zoom)
    const zoomGroup = L.DomUtil.create('div', 'flex flex-col rounded-full bg-white p-1 shadow');
    wrapper.appendChild(zoomGroup);
    const zoomIn = L.DomUtil.create('button', '', zoomGroup);
    const zoomOut = L.DomUtil.create('button', '', zoomGroup);
    const zoomBtnClass =
      'flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-800 hover:bg-gray-100';
    zoomIn.className = zoomBtnClass;
    zoomOut.className = zoomBtnClass;
    zoomIn.title = 'Zoom in';
    zoomOut.title = 'Zoom out';
    zoomIn.setAttribute('type', 'button');
    zoomOut.setAttribute('type', 'button');
    zoomIn.innerHTML = '<span aria-hidden="true">+</span>';
    zoomOut.innerHTML = '<span aria-hidden="true">−</span>';
    L.DomEvent.disableClickPropagation(zoomIn);
    L.DomEvent.disableClickPropagation(zoomOut);
    L.DomEvent.on(zoomIn, 'click', () => map.zoomIn());
    L.DomEvent.on(zoomOut, 'click', () => map.zoomOut());

    // 3. Fullscreen button (no white container)
    const fullscreenBtn = L.DomUtil.create('button', '', wrapper);
    fullscreenBtn.className =
      'flex h-10 w-10 cursor-pointer items-center justify-center bg-white rounded-full  text-gray-800 shadow hover:bg-gray-100';
    fullscreenBtn.title = 'Toggle Fullscreen';
    fullscreenBtn.setAttribute('type', 'button');
    fullscreenBtn.innerHTML = FULLSCREEN_SVG;
    L.DomEvent.disableClickPropagation(fullscreenBtn);
    L.DomEvent.on(fullscreenBtn, 'click', () => {
      const mapContainer = map.getContainer().parentElement;
      if (!document.fullscreenElement) {
        void mapContainer?.requestFullscreen();
      } else {
        void document.exitFullscreen();
      }
    });

    const Control = L.Control.extend({
      options: { position: 'bottomright' as const },
      onAdd: () => container,
    });
    const instance = new Control();
    map.addControl(instance);
    return () => {
      map.removeControl(instance);
    };
  }, [map, handleRecenter]);

  return null;
}

interface PickupLocationMapProps {
  /** Current pin position (lat, lng). If null, uses default UK center. */
  position: { lat: number; lng: number } | null;
  /** Called when the user drags the pin. */
  onPositionChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function PickupLocationMap({
  position,
  onPositionChange,
  className = '',
}: PickupLocationMapProps): React.JSX.Element {
  const initialCenter = useMemo((): [number, number] => {
    if (position) return [position.lat, position.lng];
    return DEFAULT_UK_CENTER;
  }, [position]);

  const markerPosition: [number, number] = position
    ? [position.lat, position.lng]
    : DEFAULT_UK_CENTER;

  const displayPosition = position ?? { lat: DEFAULT_UK_CENTER[0], lng: DEFAULT_UK_CENTER[1] };

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <Typography variant="h5" className="text-sm font-semibold text-gray-900">
          Map View
        </Typography>
      </div>
      <div className="flex flex-col gap-2 border border-gray-200 rounded-md ">
        <Typography variant="body" className="mb-2 text-center text-sm text-gray-600 pt-2">
          Move the pointer to your exact pickup location.
        </Typography>
        <div className="pickup-location-map-root relative overflow-hidden rounded-md border border-gray-200 bg-white">
          <MapContainer
            center={initialCenter}
            zoom={DEFAULT_ZOOM}
            className="h-[280px] w-full"
            style={{ height: 280, width: '100%' }}
            zoomControl={false}
            attributionControl
          >
            <TileLayer
              attribution={CARTO_ATTRIBUTION}
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />
            <Marker
              position={markerPosition}
              icon={pickupPinIcon}
              draggable
              eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                  const marker = e.target as L.Marker;
                  const ll = marker.getLatLng();
                  onPositionChange(ll.lat, ll.lng);
                },
              }}
            />
            {position && <SetViewOnPosition position={position} />}
            <PickupMapControlsGroup
              onRecenter={(lat, lng) => {
                onPositionChange(lat, lng);
              }}
            />
          </MapContainer>
          <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow">
            {displayPosition.lat.toFixed(4)} / {displayPosition.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}
