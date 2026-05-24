import type { ReactNode } from 'react';
import { Minus } from 'lucide-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Switch } from '@/components/atoms/switch';
import Typography from '@/components/atoms/Typography';
import AddressCoordinatesInputs from '@/components/pages/Settings/CompanyDetails/AddressCoordinatesInputs';
import UkAddressFields from '@/components/pages/Settings/CompanyDetails/UkAddressFields';
import type {
  AddressFields,
  PickupAddress,
} from '@/components/pages/Settings/CompanyDetails/types';

const PICKUP_ADDRESS_FORM_KEYS = new Set([
  'line1',
  'line2',
  'country',
  'region',
  'city',
  'postcode',
  'latitude',
  'longitude',
]);

interface PickupAddressEntryProps {
  pickup: PickupAddress;
  index: number;
  effectiveAddress: AddressFields;
  disableAddressInputs: boolean;
  pickupCount: number;
  isMapPickerOpen: boolean;
  onToggleMapPicker: () => void;
  mapPicker: ReactNode;
  onRemove: () => void;
  onDefaultChange: (checked: boolean) => void;
  onPatch: (updates: Partial<PickupAddress>) => void;
  onAddressFieldChange: (field: keyof AddressFields, value: string) => void;
  pickupFieldErrors?: Record<string, string>;
}

export default function PickupAddressEntry({
  pickup,
  index,
  effectiveAddress,
  disableAddressInputs,
  pickupCount,
  isMapPickerOpen,
  onToggleMapPicker,
  mapPicker,
  onRemove,
  onDefaultChange,
  onPatch,
  onAddressFieldChange,
  pickupFieldErrors,
}: PickupAddressEntryProps): React.JSX.Element {
  const addressSlice: Record<string, string> = {};
  const extraPickupMessages: string[] = [];
  if (pickupFieldErrors) {
    for (const [key, message] of Object.entries(pickupFieldErrors)) {
      if (PICKUP_ADDRESS_FORM_KEYS.has(key)) {
        addressSlice[key] = message;
      } else {
        extraPickupMessages.push(message);
      }
    }
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <Typography
          variant="caption"
          weight="semibold"
          className="text-[10px] tracking-wide text-gray-500 uppercase"
        >
          Pickup Address # {String(index + 1).padStart(2, '0')}
        </Typography>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-6 items-center rounded border border-gray-200 px-2 text-[10px] font-medium text-gray-500"
            onClick={onToggleMapPicker}
            disabled={disableAddressInputs}
          >
            Pin from Map
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={pickupCount === 1}
            className="inline-flex h-6 items-center gap-1 rounded border border-red-200 px-2 text-[10px] font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>

      {isMapPickerOpen && !disableAddressInputs ? mapPicker : null}

      <div className="mb-3 flex items-center gap-2">
        <Switch checked={pickup.isDefault} onCheckedChange={onDefaultChange} />
        <Typography variant="body" className="text-xs font-medium text-gray-700">
          Set as Default Pickup Address
        </Typography>
      </div>

      <div className="mb-3 space-y-2">
        <Checkbox
          checked={pickup.sameAsRegistered}
          onChange={(event) => {
            onPatch({
              sameAsRegistered: event.target.checked,
              ...(event.target.checked && { sameAsTrading: false }),
            });
          }}
          label="Same as Registered Address"
          className="h-3.5 w-3.5"
        />
        <Checkbox
          checked={pickup.sameAsTrading}
          onChange={(event) => {
            onPatch({
              sameAsTrading: event.target.checked,
              ...(event.target.checked && { sameAsRegistered: false }),
            });
          }}
          label="Same as Trading Address"
          className="h-3.5 w-3.5"
        />
      </div>

      {extraPickupMessages.length > 0 ? (
        <Typography variant="caption" className="text-red-600">
          {extraPickupMessages.join(' ')}
        </Typography>
      ) : null}

      <UkAddressFields
        prefix={`pickup-${pickup.id}`}
        address={effectiveAddress}
        onChange={onAddressFieldChange}
        onCoordinatesSelect={({ latitude, longitude }) => onPatch({ latitude, longitude })}
        disabled={disableAddressInputs}
        required
        fieldErrors={Object.keys(addressSlice).length > 0 ? addressSlice : undefined}
      />

      <AddressCoordinatesInputs
        prefix={`pickup-${pickup.id}`}
        latitude={pickup.latitude}
        longitude={pickup.longitude}
        onPatch={onPatch}
        disabled={disableAddressInputs}
        required
        fieldErrors={Object.keys(addressSlice).length > 0 ? addressSlice : undefined}
      />
    </div>
  );
}
