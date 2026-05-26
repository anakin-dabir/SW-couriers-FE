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
import { SETTINGS_SECTION_TITLE_CLASS } from '@/lib/settingsUi';

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
  readOnly?: boolean;
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
  readOnly = false,
}: PickupAddressesSectionProps): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography className={SETTINGS_SECTION_TITLE_CLASS}>Pickup Address</Typography>
        {!readOnly ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 border-[#E5E7EB] bg-white px-3 text-sm text-[#18181B]"
            onClick={onAddPickup}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add New Pickup Address
          </Button>
        ) : null}
      </div>

      {generalSettings.pickupAddresses.map((pickup, index) => {
        const effectivePickupAddress = resolveEffectivePickupAddress(pickup, generalSettings);
        const disablePickupAddressInputs =
          readOnly || pickup.sameAsRegistered || pickup.sameAsTrading;
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
            readOnly={readOnly}
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
    </section>
  );
}
