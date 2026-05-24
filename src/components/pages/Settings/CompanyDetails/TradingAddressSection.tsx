import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';
import Typography from '@/components/atoms/Typography';
import AddressCoordinatesInputs from '@/components/pages/Settings/CompanyDetails/AddressCoordinatesInputs';
import UkAddressFields from '@/components/pages/Settings/CompanyDetails/UkAddressFields';
import type { AddressFields } from '@/components/pages/Settings/CompanyDetails/types';

interface TradingAddressSectionProps {
  sameAsRegistered: boolean;
  displayAddress: AddressFields;
  latitude: number | null;
  longitude: number | null;
  isMapPickerOpen: boolean;
  onToggleMapPicker: () => void;
  mapPicker: ReactNode;
  onSameAsRegisteredChange: (checked: boolean) => void;
  onAddressChange: (field: keyof AddressFields, value: string) => void;
  onPatchCoordinates: (coords: { latitude?: number | null; longitude?: number | null }) => void;
  tradingFieldErrors?: Record<string, string>;
}

export default function TradingAddressSection({
  sameAsRegistered,
  displayAddress,
  latitude,
  longitude,
  isMapPickerOpen,
  onToggleMapPicker,
  mapPicker,
  onSameAsRegisteredChange,
  onAddressChange,
  onPatchCoordinates,
  tradingFieldErrors,
}: TradingAddressSectionProps): React.JSX.Element {
  const disableInputs = sameAsRegistered;

  const mergedAddressFieldErrors = ((): Record<string, string> | undefined => {
    if (!sameAsRegistered) {
      return tradingFieldErrors;
    }
    const tr = tradingFieldErrors ?? {};
    return Object.keys(tr).length > 0 ? tr : undefined;
  })();

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <Typography variant="body" weight="semibold" className="text-sm text-gray-900">
            Trading Address
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 border-gray-200 px-2 text-[10px] font-medium text-gray-500"
            onClick={onToggleMapPicker}
            disabled={disableInputs}
          >
            Pin from Map
          </Button>
        </div>

        {isMapPickerOpen && !disableInputs ? mapPicker : null}

        <Checkbox
          checked={sameAsRegistered}
          onChange={(event) => onSameAsRegisteredChange(event.target.checked)}
          label="Same as Registered Address"
          className="mb-3 h-3.5 w-3.5"
        />

        <UkAddressFields
          prefix="trading"
          address={displayAddress}
          onChange={onAddressChange}
          onCoordinatesSelect={({ latitude: lat, longitude: lng }) =>
            onPatchCoordinates({ latitude: lat, longitude: lng })
          }
          disabled={disableInputs}
          required={!disableInputs}
          fieldErrors={mergedAddressFieldErrors}
        />

        <AddressCoordinatesInputs
          prefix="trading"
          latitude={latitude}
          longitude={longitude}
          onPatch={onPatchCoordinates}
          disabled={disableInputs}
          required={!disableInputs}
          fieldErrors={mergedAddressFieldErrors}
        />
      </div>
    </div>
  );
}
