import { useEffect, useState } from 'react';
import AddressMapPicker from '@/components/molecules/AddressMapPicker';
import type { MapPickedAddress } from '@/components/molecules/AddressMapPicker';
import Typography from '@/components/atoms/Typography';
import type { AddressFields } from './types';
import { resolveMapInitialCenter } from './mapCenterFromAddress';

interface AddressMapPickerWithCenterProps {
  effectiveAddress: AddressFields;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onApplyAddress: (address: MapPickedAddress) => void;
  onClose: () => void;
}

export default function AddressMapPickerWithCenter({
  effectiveAddress,
  latitude,
  longitude,
  onApplyAddress,
  onClose,
}: AddressMapPickerWithCenterProps): React.JSX.Element | null {
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const center = await resolveMapInitialCenter(effectiveAddress, latitude, longitude);
      if (!cancelled) {
        setInitialCenter(center);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveAddress, latitude, longitude]);

  if (!initialCenter) {
    return (
      <Typography variant="caption" className="mb-3 text-xs text-gray-500">
        {effectiveAddress.line1?.trim() ? 'Locating address on map…' : 'Loading map…'}
      </Typography>
    );
  }

  return (
    <AddressMapPicker
      key={`${initialCenter[0]}-${initialCenter[1]}`}
      initialCenter={initialCenter}
      onApplyAddress={onApplyAddress}
      onClose={onClose}
    />
  );
}
