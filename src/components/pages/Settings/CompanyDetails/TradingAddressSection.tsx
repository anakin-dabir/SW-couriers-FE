import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';
import Typography from '@/components/atoms/Typography';
import AddressCoordinatesInputs from '@/components/pages/Settings/CompanyDetails/AddressCoordinatesInputs';
import UkAddressFields from '@/components/pages/Settings/CompanyDetails/UkAddressFields';
import type { AddressFields } from '@/components/pages/Settings/CompanyDetails/types';
import { SETTINGS_SECTION_TITLE_CLASS } from '@/lib/settingsUi';

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
  readOnly?: boolean;
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
  readOnly = false,
}: TradingAddressSectionProps): React.JSX.Element {
  const disableInputs = sameAsRegistered || readOnly;

  const mergedAddressFieldErrors = ((): Record<string, string> | undefined => {
    if (!sameAsRegistered) {
      return tradingFieldErrors;
    }
    const tr = tradingFieldErrors ?? {};
    return Object.keys(tr).length > 0 ? tr : undefined;
  })();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography className={SETTINGS_SECTION_TITLE_CLASS}>Trading Address</Typography>
        {!readOnly ? (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-xs font-medium text-[#71717A] hover:text-[#18181B]"
            onClick={onToggleMapPicker}
            disabled={sameAsRegistered}
          >
            Pin from Map
          </Button>
        ) : null}
      </div>

      <Checkbox
        checked={sameAsRegistered}
        onChange={(event) => onSameAsRegisteredChange(event.target.checked)}
        label="Same as Registered Address"
        className="h-4 w-4 border-[#D4D4D8] data-[state=checked]:border-[#C63131] data-[state=checked]:bg-[#C63131]"
        disabled={readOnly}
      />

      {isMapPickerOpen && !disableInputs ? mapPicker : null}

      {!sameAsRegistered ? (
        <>
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

          <div className="hidden">
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
        </>
      ) : null}
    </section>
  );
}
