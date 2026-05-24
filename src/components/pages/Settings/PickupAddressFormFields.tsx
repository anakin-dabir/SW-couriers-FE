import { useCallback } from 'react';
import { FormField } from '@/components/molecules';
import { PickupLocationMap } from '@/components/molecules/map';
import { Checkbox } from '@/components/atoms/checkbox';
import { Typography } from '@/components/atoms';
import type { SettingsPickupAddressFormData } from '@/schemas/pickup.schema';
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';

export interface PickupAddressFormFieldsProps {
  register: UseFormRegister<SettingsPickupAddressFormData>;
  errors: FieldErrors<SettingsPickupAddressFormData>;
  watch: UseFormWatch<SettingsPickupAddressFormData>;
  setValue: UseFormSetValue<SettingsPickupAddressFormData>;
}

/**
 * Presentational form body for pickup address: map + address fields + default checkbox.
 * Used inside PickupAddressDrawer.
 */
export default function PickupAddressFormFields({
  register,
  errors,
  watch,
  setValue,
}: PickupAddressFormFieldsProps): React.JSX.Element {
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const mapPosition =
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;

  const handleMapPositionChange = useCallback(
    (lat: number, lng: number) => {
      setValue('latitude', lat);
      setValue('longitude', lng);
    },
    [setValue]
  );

  const isDefaultChecked = watch('isDefault');

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PickupLocationMap
        position={mapPosition}
        onPositionChange={handleMapPositionChange}
        className="w-full"
      />

      <FormField
        label="Address title"
        type="text"
        placeholder="e.g. Pickup-1 ( Address Label )"
        required
        {...register('label')}
        error={errors.label}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Contact first name"
          type="text"
          required
          {...register('contactFirstName')}
          error={errors.contactFirstName}
        />
        <FormField
          label="Contact last name"
          type="text"
          required
          {...register('contactLastName')}
          error={errors.contactLastName}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Registered Number"
          type="tel"
          required
          {...register('phoneNumber')}
          error={errors.phoneNumber}
        />
        <FormField label="Country" type="text" readOnly {...register('country')} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Building / House Number"
          type="text"
          required
          {...register('buildingHouseNumber')}
          error={errors.buildingHouseNumber}
        />
        <FormField
          label="First line of address"
          type="text"
          required
          {...register('firstLineOfAddress')}
          error={errors.firstLineOfAddress}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Second line of address"
          type="text"
          required
          {...register('secondLineOfAddress')}
          error={errors.secondLineOfAddress}
        />
        <FormField
          label="Town / City"
          type="text"
          required
          {...register('townCity')}
          error={errors.townCity}
        />
      </div>

      <FormField
        label="Postal code"
        type="text"
        required
        {...register('postalCode')}
        error={errors.postalCode}
      />

      <div className="flex min-h-12 items-center gap-4 rounded-xl px-3 py-3">
        <Typography variant="body" className="shrink-0 text-gray-900">
          Set as Default
        </Typography>
        <div className="shrink-0">
          <Checkbox
            id="pickup-is-default"
            checked={isDefaultChecked}
            onChange={(e) => setValue('isDefault', e.target.checked)}
            className="border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
