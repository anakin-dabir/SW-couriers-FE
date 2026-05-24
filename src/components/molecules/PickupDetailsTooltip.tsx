import * as React from 'react';
import { cn } from '@/lib/utils';
import { DeliveryPackageIcon } from '@/assets/img';
import { X } from 'lucide-react';
import { Typography } from '@/components/atoms';

interface TrackingPackage {
  packageNumber: number;
  trackingId: string;
}

interface PickupDetailsTooltipProps {
  status: string;
  estimatedPickupTime: string;
  routeId: string;
  trackingIds: TrackingPackage[];
  driverName: string;
  vehicleId: string;
  driverAvatar?: string;
  locationId?: string;
  locationStatus?: string;
  className?: string;
}

interface PackageDetailsSubDialogProps {
  package: TrackingPackage;
  onClose: () => void;
}

/**
 * Package Details Sub-Dialog Component
 * Shows detailed information for a specific package when clicking on its tracking ID
 */
function PackageDetailsSubDialog({
  package: pkg,
  onClose,
}: PackageDetailsSubDialogProps): React.JSX.Element {
  // Generate mock weight and size based on package number
  // In a real app, this would come from props or API
  const packageDetails = React.useMemo(() => {
    const weights = ['8 kg', '5 kg', '12 kg', '3 kg', '10 kg', '6 kg', '4 kg'];
    const sizes = [
      '40 x 30 x 25 cm',
      '35 x 25 x 20 cm',
      '50 x 40 x 30 cm',
      '30 x 20 x 15 cm',
      '45 x 35 x 28 cm',
      '38 x 28 x 22 cm',
      '32 x 24 x 18 cm',
    ];

    const index = (pkg.packageNumber - 1) % weights.length;
    return {
      weight: weights[index] || '5 kg',
      size: sizes[index] || '35 x 25 x 20 cm',
    };
  }, [pkg.packageNumber]);

  return (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      className="absolute left-full top-0 ml-2.5 w-[280px] rounded-lg bg-white p-4 shadow-lg border border-gray-200 z-[100]"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        e.stopPropagation();
      }}
      role="dialog"
      aria-label={`Package ${pkg.packageNumber} details`}
      aria-modal="true"
      tabIndex={0}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <Typography variant="h4" className="text-sm font-semibold text-gray-900">
            Package #{pkg.packageNumber}
          </Typography>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Package Details */}
      <div className="space-y-3">
        {/* Tracking ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tracking ID</span>
          <span className="text-sm font-medium text-gray-900">{pkg.trackingId}</span>
        </div>

        {/* Weight */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Weight</span>
          <span className="text-sm font-medium text-gray-900">{packageDetails.weight}</span>
        </div>

        {/* Size */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Size</span>
          <span className="text-sm font-medium text-gray-900">{packageDetails.size}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PickupDetailsTooltip molecule component.
 * Displays detailed pickup information in a tooltip format.
 * Matches the design shown in the screenshot.
 */
export default function PickupDetailsTooltip({
  status,
  estimatedPickupTime,
  routeId,
  trackingIds,
  driverName,
  vehicleId,
  driverAvatar,
  locationId,
  locationStatus,
  className,
}: PickupDetailsTooltipProps): React.JSX.Element {
  const [selectedPackage, setSelectedPackage] = React.useState<TrackingPackage | null>(null);

  const handlePackageClick = React.useCallback((pkg: TrackingPackage, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPackage(pkg);
  }, []);

  const handleCloseSubDialog = React.useCallback(() => {
    setSelectedPackage(null);
  }, []);

  return (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      className={cn(
        'relative w-[320px] rounded-lg bg-white p-4 shadow-lg',
        'border border-gray-200',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && selectedPackage) {
          handleCloseSubDialog();
        }
        e.stopPropagation();
      }}
      role="dialog"
      aria-label="Pickup Details"
      aria-modal="false"
      tabIndex={0}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative">
          <img src={DeliveryPackageIcon} alt="Package" className="h-6 w-6 object-contain" />
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
            <span className="text-[10px] font-bold text-white">+</span>
          </div>
        </div>
        <Typography variant="h3" className="text-base font-semibold text-gray-900">
          Pickup Details
        </Typography>
      </div>

      {/* Pickup Information */}
      <div className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            {status}
          </span>
        </div>

        {/* Estimated Pickup Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Estimated Pickup time</span>
          <span className="text-sm font-medium text-gray-900">{estimatedPickupTime}</span>
        </div>

        {/* Route ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Route ID</span>
          <span className="text-sm font-medium text-gray-900">{routeId}</span>
        </div>

        {/* Location ID (Pin Details) */}
        {locationId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location ID</span>
            <span className="text-sm font-medium text-gray-900">{locationId}</span>
          </div>
        )}

        {/* Location Status */}
        {locationStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location Status</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                locationStatus === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              }`}
            >
              {locationStatus.charAt(0).toUpperCase() + locationStatus.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="my-4 border-t border-gray-200" />

      {/* Tracking IDs Section */}
      <div className="mb-4 relative">
        <Typography variant="h4" className="mb-3 text-sm font-semibold text-gray-900">
          Tracking IDs
        </Typography>
        <div className="space-y-2">
          {trackingIds.map((pkg) => (
            <div key={pkg.packageNumber} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Package # {pkg.packageNumber}</span>
              <button
                onClick={(e) => handlePackageClick(pkg, e)}
                className="ml-auto text-sm font-medium text-blue-600 underline hover:text-blue-700 cursor-pointer"
              >
                {pkg.trackingId}
              </button>
            </div>
          ))}
        </div>

        {/* Package Details Sub-Dialog - positioned relative to Tracking IDs section */}
        {selectedPackage && (
          <PackageDetailsSubDialog package={selectedPackage} onClose={handleCloseSubDialog} />
        )}
      </div>

      {/* Separator */}
      <div className="my-4 border-t border-gray-200" />

      {/* Driver Information */}
      <div className="flex items-center gap-3">
        {driverAvatar ? (
          <img
            src={driverAvatar}
            alt={driverName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
            <span className="text-sm font-semibold text-gray-600">
              {driverName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{driverName}</span>
          <span className="text-xs text-gray-500">{vehicleId}</span>
        </div>
      </div>
    </div>
  );
}
