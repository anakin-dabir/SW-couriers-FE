import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { PickupRequestFormData } from '@/schemas/pickup.schema';
import PickupAddressFormFields from './PickupAddressFormFields';

interface PickupAddressFormProps {
  register: UseFormRegister<PickupRequestFormData>;
  control: Control<PickupRequestFormData>;
  errors: FieldErrors<PickupRequestFormData>;
  setValue: UseFormSetValue<PickupRequestFormData>;
  watch: UseFormWatch<PickupRequestFormData>;
  disabled?: boolean;
}

/**
 * Pickup address section for step 1 — layout lives in {@link PickupAddressFormFields}
 * (Figma 6:43508). Parent card supplies the single "Pickup Details" header.
 */
export default function PickupAddressForm({
  register,
  control,
  errors,
  setValue,
  watch,
  disabled = false,
}: PickupAddressFormProps): React.JSX.Element {
  return (
    <PickupAddressFormFields
      register={register}
      control={control}
      errors={errors.pickupAddress}
      setValue={setValue}
      watch={watch}
      disabled={disabled}
    />
  );
}
