import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import Typography from '@/components/atoms/Typography';
import FormField from '@/components/molecules/FormField';
import FormPhoneField from '@/components/molecules/FormPhoneField';
import type { PickupRequestFormData } from '@/schemas/pickup.schema';
import PickupContactNameCombobox from './PickupContactNameCombobox';

const LOCKED_INPUT_CLASS =
  'disabled:opacity-100 disabled:text-form-title disabled:bg-form-surface disabled:border-form-border-light';

interface PickupDetailFormProps {
  register: UseFormRegister<PickupRequestFormData>;
  control: Control<PickupRequestFormData>;
  errors: FieldErrors<PickupRequestFormData>;
  contactRoleLabel?: string;
  disabled?: boolean;
}

export default function PickupDetailForm({
  register,
  control,
  errors,
  contactRoleLabel,
}: PickupDetailFormProps): React.JSX.Element {
  return (
    <>
      {/* Figma 6:43515 — 20px between rows; 12px between columns; two flex rows (Company|Contact, Email|Contact number) */}
      <div className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <FormField
              label="Company name"
              type="text"
              autoComplete="organization"
              readOnly
              disabled
              className={LOCKED_INPUT_CLASS}
              required
              error={errors.companyName}
              {...register('companyName')}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Controller
              control={control}
              name="contactName"
              render={({ field }) => (
                <div className="flex w-full flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Typography
                      variant="label"
                      htmlFor="pickup-contact-name"
                      className="text-sm font-medium leading-none text-form-title"
                    >
                      Contact Name
                    </Typography>
                    <Typography
                      variant="body"
                      className="text-sm font-medium leading-none text-error"
                      aria-hidden
                    >
                      *
                    </Typography>
                  </div>
                  <PickupContactNameCombobox
                    id="pickup-contact-name"
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    roleLabel={contactRoleLabel}
                    disabled
                    error={errors.contactName}
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              disabled
              className={LOCKED_INPUT_CLASS}
              required
              error={errors.email}
              {...register('email')}
            />
          </div>
          <div className="min-w-0 flex-1">
            <FormPhoneField<PickupRequestFormData>
              control={control}
              name="phone"
              label="Contact number"
              placeholder=""
              disabled
              required
              error={errors.phone}
              defaultCountry="GB"
            />
          </div>
        </div>
      </div>
    </>
  );
}
