import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import AddressCoordinatesInputs from '@/components/pages/Settings/CompanyDetails/AddressCoordinatesInputs';
import UkAddressFields from '@/components/pages/Settings/CompanyDetails/UkAddressFields';
import type { AddressFields } from '@/components/pages/Settings/CompanyDetails/types';
import { SETTINGS_SECTION_TITLE_CLASS } from '@/lib/settingsUi';

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
  readOnly?: boolean;
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
  readOnly = false,
}: RegisteredAddressSectionProps): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography className={SETTINGS_SECTION_TITLE_CLASS}>Registered Address</Typography>
        {!readOnly ? (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-xs font-medium text-[#71717A] hover:text-[#18181B]"
            onClick={onToggleMapPicker}
          >
            Pin from Map
          </Button>
        ) : null}
      </div>

      {isMapPickerOpen && !readOnly ? mapPicker : null}

      <UkAddressFields
        prefix="registered"
        address={address}
        onChange={onAddressChange}
        onCoordinatesSelect={({ latitude: lat, longitude: lng }) =>
          onPatchCoordinates({ latitude: lat, longitude: lng })
        }
        disabled={readOnly}
        required
        fieldErrors={fieldErrors}
      />

      <div className="hidden">
        <AddressCoordinatesInputs
          prefix="registered"
          latitude={latitude}
          longitude={longitude}
          onPatch={onPatchCoordinates}
          disabled={readOnly}
          required
          fieldErrors={fieldErrors}
        />
      </div>
    </section>
  );
}
