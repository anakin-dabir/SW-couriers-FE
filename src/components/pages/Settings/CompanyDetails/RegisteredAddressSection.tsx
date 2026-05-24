import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import AddressCoordinatesInputs from '@/components/pages/Settings/CompanyDetails/AddressCoordinatesInputs';
import UkAddressFields from '@/components/pages/Settings/CompanyDetails/UkAddressFields';
import type { AddressFields } from '@/components/pages/Settings/CompanyDetails/types';

interface RegisteredAddressSectionProps {
  address: AddressFields;
  latitude: number | null;
  longitude: number | null;
  isMapPickerOpen: boolean;
  onToggleMapPicker: () => void;
  mapPicker: ReactNode;
  onAddressChange: (field: keyof AddressFields, value: string) => void;
  onPatchCoordinates: (coords: { latitude?: number | null; longitude?: number | null }) => void;
  fieldErrors?: Record<string, string>;
}

export default function RegisteredAddressSection({
  address,
  latitude,
  longitude,
  isMapPickerOpen,
  onToggleMapPicker,
  mapPicker,
  onAddressChange,
  onPatchCoordinates,
  fieldErrors,
}: RegisteredAddressSectionProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <Typography variant="body" weight="semibold" className="text-sm text-gray-900">
            Registered Address
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 border-gray-200 px-2 text-[10px] font-medium text-gray-500"
            onClick={onToggleMapPicker}
          >
            Pin from Map
          </Button>
        </div>

        {isMapPickerOpen ? mapPicker : null}

        <UkAddressFields
          prefix="registered"
          address={address}
          onChange={onAddressChange}
          onCoordinatesSelect={({ latitude: lat, longitude: lng }) =>
            onPatchCoordinates({ latitude: lat, longitude: lng })
          }
          required
          fieldErrors={fieldErrors}
        />

        <AddressCoordinatesInputs
          prefix="registered"
          latitude={latitude}
          longitude={longitude}
          onPatch={onPatchCoordinates}
          required
          fieldErrors={fieldErrors}
        />
      </div>
    </div>
  );
}
