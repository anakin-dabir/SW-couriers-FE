import React from 'react';
import { addDays, format } from 'date-fns';
import { Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Settings, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetEffectiveServiceTiersForOrgQuery } from '@/store/api';
import type { ServiceTier } from '@/store/api/serviceTiersApi';
import { useFormValidation } from '@/hooks/useFormValidation';
import { serviceTierSchema } from '@/schemas/orderDetails.schema';
import {
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_TITLE_SM,
  PORTAL_MODAL_WIDE_WRAPPER,
} from '@/lib/modalStyles';

interface PortalEditServiceTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string | null;
  currentTierId?: string | null;
  onConfirm: (tier: ServiceTier) => void;
  saving?: boolean;
}

function formatEstimatedDelivery(durationDays?: number | null): string {
  if (!durationDays || durationDays <= 0) return '—';
  return `Estimated delivery by ${format(addDays(new Date(), durationDays), 'dd MMMM yyyy')}`;
}

export default function PortalEditServiceTierModal({
  isOpen,
  onClose,
  organizationId,
  currentTierId,
  onConfirm,
  saving,
}: PortalEditServiceTierModalProps): React.JSX.Element {
  const { data, isLoading } = useGetEffectiveServiceTiersForOrgQuery(organizationId ?? '', {
    skip: !organizationId || !isOpen,
  });
  const tiers: ServiceTier[] = data?.data?.items ?? [];

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting },
  } = useFormValidation({
    schema: serviceTierSchema,
    defaultValues: { tierId: currentTierId ?? '' },
    mode: 'onChange',
  });
  const selectedId = watch('tierId');

  React.useEffect(() => {
    if (isOpen) reset({ tierId: currentTierId ?? '' });
  }, [isOpen, currentTierId, reset]);

  const onSubmit = handleSubmit((vals) => {
    const tier = tiers.find((t) => t.id === vals.tierId);
    if (tier) onConfirm(tier);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={PORTAL_MODAL_WIDE_WRAPPER}>
        <div className="px-5 pt-[30px]">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Settings className="h-7 w-7 text-gray-600" />
              </div>
              <span className="absolute -right-1 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#2563EB]">
                <Pencil className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Edit Delivery Service Tier</DialogTitle>
        </div>

        <Controller
          control={control}
          name="tierId"
          render={({ field }) => (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-5">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : null}
              {!isLoading && tiers.length === 0 ? (
                <Typography className="py-8 text-center text-sm text-gray-400">
                  No service tiers available for this organisation.
                </Typography>
              ) : null}
              {tiers.map((tier) => {
                const isSelected = field.value === tier.id;
                const tierColor = tier.color || '#6B7280';
                return (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => field.onChange(tier.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[14px] border bg-white p-4 text-left transition-all',
                      isSelected ? 'border-[#A11010] ring-1 ring-[#A11010]/30' : 'border-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-[#A11010]' : 'border-gray-300'
                      )}
                    >
                      {isSelected ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#A11010]" />
                      ) : null}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                            style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
                          >
                            {tier.tier_name}
                          </span>
                          <span className="text-[14px] font-semibold text-gray-900">
                            Up to {tier.duration_days} Day Delivery
                          </span>
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">
                          {formatEstimatedDelivery(tier.duration_days)}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <Typography className="text-[11px] font-medium text-gray-400">
                            Base Price
                          </Typography>
                          <Typography className="text-[15px] font-semibold text-gray-900">
                            £{tier.base_price}
                          </Typography>
                        </div>
                        <div>
                          <Typography className="text-[11px] font-medium text-gray-400">
                            Price per package
                          </Typography>
                          <Typography className="text-[15px] font-semibold text-gray-900">
                            £{tier.price_per_package}
                          </Typography>
                        </div>
                        <div>
                          <Typography className="text-[11px] font-medium text-gray-400">
                            Price per KG
                          </Typography>
                          <Typography className="text-[15px] font-semibold text-gray-900">
                            £{tier.price_per_kg}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />

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
              disabled={
                saving ||
                isSubmitting ||
                !isValid ||
                !isDirty ||
                selectedId === (currentTierId ?? '')
              }
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
