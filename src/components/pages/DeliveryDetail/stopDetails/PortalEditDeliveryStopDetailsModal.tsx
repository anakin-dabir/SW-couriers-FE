import React from 'react';
import { Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import Typography from '@/components/atoms/Typography';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  deliveryStopDetailsSchema,
  type DeliveryStopDetailsFormData,
} from '@/schemas/orderDetails.schema';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_FORM_WRAPPER,
  PORTAL_MODAL_ICON_SMALL,
  PORTAL_MODAL_TITLE_SM,
} from '@/lib/modalStyles';

import { EditDeliveryPreferencesIllustration as editIconSvg } from '@/assets/svg';

export type PortalStopDetails = DeliveryStopDetailsFormData;

interface PortalEditDeliveryStopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PortalStopDetails) => void;
  initialData?: PortalStopDetails;
  saving?: boolean;
}

const EMPTY: PortalStopDetails = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
};

const LABEL = 'text-sm font-medium text-[#030303]';
const INPUT_CLASS = 'h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm';

export default function PortalEditDeliveryStopDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  saving,
}: PortalEditDeliveryStopDetailsModalProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    register,
    reset,
    trigger,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useFormValidation({
    schema: deliveryStopDetailsSchema,
    defaultValues: initialData ?? EMPTY,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData ?? EMPTY);
      const tmr = setTimeout(() => void trigger(), 0);
      return () => clearTimeout(tmr);
    }
  }, [isOpen, initialData, reset, trigger]);

  const onSubmit = handleSubmit((data) => {
    onConfirm(data);
  });

  const fieldError = (msg?: string): React.JSX.Element | null =>
    msg ? (
      <Typography variant="caption" className="text-xs text-[#EF4444]">
        {msg}
      </Typography>
    ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={PORTAL_MODAL_FORM_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={editIconSvg} alt="" className={PORTAL_MODAL_ICON_SMALL} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Edit Delivery Stop Details</DialogTitle>

          <form
            autoComplete="off"
            onSubmit={(e) => {
              void onSubmit(e);
            }}
            className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Recipient First name <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input {...register('firstName')} className={INPUT_CLASS} maxLength={32} />
              {fieldError(errors.firstName?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Recipient Last name <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input {...register('lastName')} className={INPUT_CLASS} maxLength={32} />
              {fieldError(errors.lastName?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Contact number <span className="text-[#EF4444]">*</span>
              </Typography>
              <Controller
                control={control}
                name="contactNumber"
                render={({ field }) => (
                  <div className="rounded-md border border-[#E4E4E7] bg-white px-3 h-10 flex items-center">
                    <PhoneInput
                      international
                      defaultCountry="GB"
                      value={field.value}
                      onChange={(val) => field.onChange(val ?? '')}
                      onBlur={field.onBlur}
                      className="flex w-full items-center gap-2 text-sm"
                    />
                  </div>
                )}
              />
              {fieldError(errors.contactNumber?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Email <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input type="email" {...register('email')} className={INPUT_CLASS} maxLength={40} />
              {fieldError(errors.email?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                First Line of Address <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input {...register('addressLine1')} className={INPUT_CLASS} maxLength={48} />
              {fieldError(errors.addressLine1?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Second Line of Address
              </Typography>
              <Input
                {...register('addressLine2')}
                className={INPUT_CLASS}
                maxLength={48}
                placeholder="Apartment, suite, unit…"
              />
              {fieldError(errors.addressLine2?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                City <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input {...register('city')} className={INPUT_CLASS} />
              {fieldError(errors.city?.message)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" className={LABEL}>
                Postal Code <span className="text-[#EF4444]">*</span>
              </Typography>
              <Input {...register('postalCode')} className={INPUT_CLASS} maxLength={16} />
              {fieldError(errors.postalCode?.message)}
            </div>
          </form>
        </div>

        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || isSubmitting}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void onSubmit()}
              disabled={saving || isSubmitting || !isValid || !isDirty}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
