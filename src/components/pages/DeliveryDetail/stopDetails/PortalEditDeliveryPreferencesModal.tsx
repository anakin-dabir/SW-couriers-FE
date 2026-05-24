import React from 'react';
import { Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import { useFormValidation } from '@/hooks/useFormValidation';
import { deliveryPreferenceSchema } from '@/schemas/orderDetails.schema';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESCRIPTION,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_FORM_WRAPPER,
  PORTAL_MODAL_ICON_SMALL,
  PORTAL_MODAL_TITLE_SM,
} from '@/lib/modalStyles';

import {
  EditDeliveryPreferencesIllustration as editHeaderIcon,
  SignatureIllustration as signatureIcon,
  LeaveSafePlaceIllustration as leaveSafePlaceIcon,
} from '@/assets/svg';

export type PortalDeliveryPreference = 'Signature Required' | 'Leave at Safe Place';

interface PortalEditDeliveryPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preference: PortalDeliveryPreference) => void;
  currentPreference: PortalDeliveryPreference;
}

export default function PortalEditDeliveryPreferencesModal({
  isOpen,
  onClose,
  onSave,
  currentPreference,
}: PortalEditDeliveryPreferencesModalProps): React.JSX.Element {
  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting },
  } = useFormValidation({
    schema: deliveryPreferenceSchema,
    defaultValues: { preference: currentPreference },
    mode: 'onChange',
  });
  const selected = watch('preference');

  React.useEffect(() => {
    if (isOpen) reset({ preference: currentPreference });
  }, [isOpen, currentPreference, reset]);

  const onSubmit = handleSubmit((data) => {
    onSave(data.preference);
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={PORTAL_MODAL_FORM_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={editHeaderIcon} alt="" className={PORTAL_MODAL_ICON_SMALL} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Edit Delivery Preferences</DialogTitle>
          <DialogDescription className={PORTAL_MODAL_DESCRIPTION}>
            Choose how this delivery stop should be completed.
          </DialogDescription>
          <Controller
            control={control}
            name="preference"
            render={({ field }) => (
              <div className="mt-6 flex flex-row gap-3">
                {[
                  {
                    value: 'Signature Required' as const,
                    icon: signatureIcon,
                    title: 'Signature Required',
                    desc: 'The recipient must sign to confirm delivery.',
                  },
                  {
                    value: 'Leave at Safe Place' as const,
                    icon: leaveSafePlaceIcon,
                    title: 'Leave at Safe Place',
                    desc: 'The package can be left at a secure location if the recipient is unavailable.',
                  },
                ].map((opt) => {
                  const isSelected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        'group relative flex w-1/2 flex-col items-center justify-start rounded-lg border bg-white px-0 py-0 transition-colors',
                        isSelected
                          ? 'border-[#CD1111] shadow-[0_4px_16px_0_rgb(205,17,17,0.10)]'
                          : 'border-[#EAEAEA] hover:border-[#BDBDBD]'
                      )}
                      style={{ minHeight: 156 }}
                    >
                      <span className="absolute left-4 top-4 flex items-center">
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                            isSelected ? 'border-[#CD1111]' : 'border-[#C7CBD9]'
                          )}
                        >
                          {isSelected ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-[#CD1111]" />
                          ) : null}
                        </span>
                      </span>
                      <div className="flex w-full flex-col items-center gap-2 px-4 pb-5 pt-8">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F5F9]">
                          <img src={opt.icon} alt={opt.title} className="h-7 w-7" />
                        </div>
                        <Typography
                          variant="label"
                          className="mb-1 text-center text-[16px] font-medium leading-5 text-[#23272E]"
                        >
                          {opt.title}
                        </Typography>
                        <Typography className="px-1 text-center text-[12px] leading-normal text-[#23272E] opacity-70">
                          {opt.desc}
                        </Typography>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void onSubmit()}
              disabled={isSubmitting || !isValid || !isDirty || selected === currentPreference}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
