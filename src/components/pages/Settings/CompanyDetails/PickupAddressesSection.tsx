import { Plus } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import AddressMapPickerWithCenter from '@/components/pages/Settings/CompanyDetails/AddressMapPickerWithCenter';
import PickupAddressEntry from '@/components/pages/Settings/CompanyDetails/PickupAddressEntry';
import { resolveEffectivePickupAddress } from '@/components/pages/Settings/CompanyDetails/effectiveAddress';
import type {
  ApplyAddressFromMap,
  GeneralSettingsState,
  MapPickerTarget,
  PickupAddress,
} from '@/components/pages/Settings/CompanyDetails/types';
import { sliceErrorsByPrefix } from '@/lib/formFieldErrors';

interface PickupAddressesSectionProps {
  generalSettings: GeneralSettingsState;
  activeMapPicker: MapPickerTarget | null;
  onAddPickup: () => void;
  onToggleMapPicker: (target: MapPickerTarget) => void;
  onCloseMapPicker: () => void;
  onApplyAddressFromMap: ApplyAddressFromMap;
  onRemovePickup: (pickupId: string) => void;
  onSetDefaultPickup: (pickupId: string) => void;
  onPatchPickup: (pickupId: string, updates: Partial<PickupAddress>) => void;
  serverFieldErrors?: Record<string, string>;
}

export default function PickupAddressesSection({
  generalSettings,
  activeMapPicker,
  onAddPickup,
  onToggleMapPicker,
  onCloseMapPicker,
  onApplyAddressFromMap,
  onRemovePickup,
  onSetDefaultPickup,
  onPatchPickup,
  serverFieldErrors,
}: PickupAddressesSectionProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="body" weight="semibold" className="text-sm text-gray-900">
          Pickup Address
        </Typography>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 border-gray-200 px-2 text-[10px] font-medium text-gray-700"
          onClick={onAddPickup}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add New Pickup Address
        </Button>
      </div>

      {generalSettings.pickupAddresses.map((pickup, index) => {
        const effectivePickupAddress = resolveEffectivePickupAddress(pickup, generalSettings);
        const disablePickupAddressInputs = pickup.sameAsRegistered || pickup.sameAsTrading;
        const mapTarget: MapPickerTarget = `pickup:${pickup.id}`;
        const isMapPickerOpen = activeMapPicker === mapTarget;

        const pickupFieldErrors = serverFieldErrors
          ? sliceErrorsByPrefix(serverFieldErrors, `pickupAddresses.${index}`)
          : undefined;

        return (
          <PickupAddressEntry
            key={pickup.id}
            pickup={pickup}
            index={index}
            effectiveAddress={effectivePickupAddress}
            disableAddressInputs={disablePickupAddressInputs}
            pickupCount={generalSettings.pickupAddresses.length}
            isMapPickerOpen={isMapPickerOpen}
            onToggleMapPicker={() => onToggleMapPicker(mapTarget)}
            mapPicker={
              <AddressMapPickerWithCenter
                effectiveAddress={effectivePickupAddress}
                latitude={pickup.latitude}
                longitude={pickup.longitude}
                onApplyAddress={(address) => onApplyAddressFromMap(mapTarget, address)}
                onClose={onCloseMapPicker}
              />
            }
            onRemove={() => onRemovePickup(pickup.id)}
            onDefaultChange={(checked) => {
              if (checked) {
                onSetDefaultPickup(pickup.id);
                return;
              }
              onPatchPickup(pickup.id, { isDefault: false });
            }}
            onPatch={(updates) => onPatchPickup(pickup.id, updates)}
            onAddressFieldChange={(field, value) =>
              onPatchPickup(pickup.id, { [field]: value } as Partial<PickupAddress>)
            }
            pickupFieldErrors={pickupFieldErrors}
          />
        );
      })}
    </div>
  );
}
