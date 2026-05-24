import { useEffect, useCallback } from 'react';
import { Button } from '@/components/atoms/Button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/molecules/drawer';
import { useFormValidation } from '@/hooks/useFormValidation';
import { settingsPickupAddressSchema } from '@/schemas/pickup.schema';
import type { SettingsPickupAddressFormData } from '@/schemas/pickup.schema';
import type { PickupAddress } from '@/types/pickupAddress';
import { defaultFormValues } from './pickupAddress.constants';
import PickupAddressFormFields from './PickupAddressFormFields';

export interface PickupAddressDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Initial values when opening (empty for add, address for edit). */
  editingAddress: PickupAddress;
  onSave: (payload: PickupAddress) => void;
}

/**
 * Drawer for adding/editing a pickup address.
 * Owns form state, resets when open/editingAddress change, converts form data to PickupAddress on save.
 */
export default function PickupAddressDrawer({
  open,
  onOpenChange,
  editingAddress,
  onSave,
}: PickupAddressDrawerProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useFormValidation({
    schema: settingsPickupAddressSchema,
    defaultValues: defaultFormValues,
  });

  const isEditMode = Boolean(editingAddress.id);

  useEffect(() => {
    if (open) {
      const initial = { ...editingAddress, country: 'United Kingdom' };
      reset(initial as SettingsPickupAddressFormData);
    }
  }, [open, editingAddress, reset]);

  const handleFormSave = useCallback(
    (data: SettingsPickupAddressFormData): void => {
      const payload: PickupAddress = {
        id: data.id,
        label: data.label,
        isDefault: data.isDefault,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        phoneNumber: data.phoneNumber,
        buildingHouseNumber: data.buildingHouseNumber,
        firstLineOfAddress: data.firstLineOfAddress,
        secondLineOfAddress: data.secondLineOfAddress,
        townCity: data.townCity,
        county: data.county ?? '',
        postalCode: data.postalCode,
        country: 'United Kingdom',
        latitude: data.latitude,
        longitude: data.longitude,
      };
      onSave(payload);
      onOpenChange(false);
    },
    [onSave, onOpenChange]
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        maxWidthClass="sm:max-w-5xl"
        className="flex h-full w-full flex-col overflow-hidden rounded-l-2xl p-6"
      >
        <DrawerHeader>
          <DrawerTitle>{isEditMode ? 'Edit Pickup Address' : 'Add New Pickup Address'}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto py-6">
          <PickupAddressFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>
        <DrawerFooter className="flex sm:justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => void handleSubmit(handleFormSave)()}
          >
            Save Address
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
