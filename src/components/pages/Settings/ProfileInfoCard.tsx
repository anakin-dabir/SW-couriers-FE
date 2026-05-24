import { useState } from 'react';
import { SquarePen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Button } from '@/components/atoms/Button';
import { MetaLabelValue } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import FormPhoneField from '@/components/molecules/FormPhoneField';
import { useFormValidation } from '@/hooks/useFormValidation';
import { companyProfileSchema, type CompanyProfileFormData } from '@/schemas/companyDetails.schema';

export interface ProfileInfoCardProps {
  defaultValues: CompanyProfileFormData;
  onSave?: (data: CompanyProfileFormData) => void;
}

/**
 * Profile Info card: view mode (MetaLabelValue grid) and edit mode (form).
 * Owns form state and edit toggle.
 */
export default function ProfileInfoCard({
  defaultValues,
  onSave,
}: ProfileInfoCardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useFormValidation({
    schema: companyProfileSchema,
    defaultValues,
  });

  const values = watch();

  const handleSave = (data: CompanyProfileFormData): void => {
    setIsEditing(false);
    onSave?.(data);
  };

  const handleCancel = (): void => {
    reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <Card className="rounded-xl border-none bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Profile Info</CardTitle>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="border border-gray-200 sm:w-[100px]"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-1.5 sm:w-[100px]"
              onClick={() => void handleSubmit(handleSave)()}
            >
              Save
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 text-gray-600"
            onClick={() => setIsEditing(true)}
          >
            Edit
            <SquarePen className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        {isEditing ? (
          <>
            <div className="flex flex-col gap-4">
              <FormField
                label="Company name"
                required
                error={errors.companyName}
                {...register('companyName')}
              />
              <FormPhoneField<CompanyProfileFormData>
                control={control}
                name="registeredNumber"
                label="Registered number"
                required
                error={errors.registeredNumber}
                placeholder="Enter registered number"
                defaultCountry="GB"
              />
              <FormField
                label="Registered address"
                required
                error={errors.registeredAddress}
                {...register('registeredAddress')}
              />
            </div>
            <div className="flex flex-col gap-4">
              <FormField
                label="Primary contact"
                required
                error={errors.primaryContact}
                {...register('primaryContact')}
              />
              <FormField
                label="Accounts email"
                type="email"
                required
                error={errors.accountsEmail}
                {...register('accountsEmail')}
              />
              <FormField
                label="VAT number"
                required
                error={errors.vatNumber}
                {...register('vatNumber')}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <MetaLabelValue label="Company name" value={values.companyName ?? ''} />
              <MetaLabelValue label="Registered number" value={values.registeredNumber ?? ''} />
              <MetaLabelValue label="Registered address" value={values.registeredAddress ?? ''} />
            </div>
            <div className="flex flex-col gap-4">
              <MetaLabelValue label="Primary contact" value={values.primaryContact ?? ''} />
              <MetaLabelValue label="Accounts email" value={values.accountsEmail ?? ''} />
              <MetaLabelValue label="VAT number" value={values.vatNumber ?? ''} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
