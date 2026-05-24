import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import Typography from '@/components/atoms/Typography';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/atoms/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetOrganizationByIdQuery } from '@/store/api';
import { useFormValidation } from '@/hooks/useFormValidation';
import { buildPackagesListSchema, type PackagesFormData } from '@/schemas/orderDetails.schema';
import {
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_ICON_SMALL,
  PORTAL_MODAL_TITLE_SM,
  PORTAL_MODAL_WIDE_WRAPPER,
} from '@/lib/modalStyles';

import { EditDeliveryPreferencesIllustration as editIconSvg } from '@/assets/svg';

export interface PortalPackageEditData {
  id: string;
  label: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  value: string;
}

interface PortalEditPackagesDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PortalPackageEditData[]) => void;
  initialPackages?: PortalPackageEditData[];
  organizationId?: string | null;
  saving?: boolean;
}

const LABEL = 'flex items-center gap-1 text-[13px] font-semibold text-gray-900';
const INPUT = 'h-10 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm';

export default function PortalEditPackagesDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  initialPackages,
  organizationId,
  saving,
}: PortalEditPackagesDetailsModalProps): React.JSX.Element {
  const { data: orgResponse } = useGetOrganizationByIdQuery(
    organizationId ? { organizationId } : { organizationId: '' },
    { skip: !organizationId || !isOpen }
  );
  const limits = React.useMemo(
    () => ({
      max_package_weight: orgResponse?.data?.max_package_weight ?? null,
      max_package_length: orgResponse?.data?.max_package_length ?? null,
      max_package_width: orgResponse?.data?.max_package_width ?? null,
      max_package_height: orgResponse?.data?.max_package_height ?? null,
    }),
    [orgResponse]
  );

  const schema = React.useMemo(() => buildPackagesListSchema(limits), [limits]);
  const {
    control,
    handleSubmit,
    register,
    reset,
    trigger,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useFormValidation({
    schema,
    defaultValues: { packages: initialPackages ?? [] } as PackagesFormData,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { fields } = useFieldArray({ control, name: 'packages' });
  const [openId, setOpenId] = React.useState<string | null>(initialPackages?.[0]?.id ?? null);

  React.useEffect(() => {
    if (isOpen) {
      reset({ packages: initialPackages ?? [] } as PackagesFormData);
      setOpenId(initialPackages?.[0]?.id ?? null);
      const tmr = setTimeout(() => void trigger(), 0);
      return () => clearTimeout(tmr);
    }
  }, [isOpen, initialPackages, reset, trigger]);

  const onSubmit = handleSubmit((data) => {
    onConfirm(data.packages as PortalPackageEditData[]);
  });

  const fieldErr = (idx: number, key: keyof PortalPackageEditData): string | undefined =>
    errors.packages?.[idx]?.[key]?.message;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${PORTAL_MODAL_WIDE_WRAPPER} flex flex-col`}>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-3 pt-[30px]">
          <div className="flex flex-col items-center">
            <img src={editIconSvg} alt="" className={PORTAL_MODAL_ICON_SMALL} />
            <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Edit Packages Details</DialogTitle>
          </div>

          <form
            onSubmit={(e) => {
              void onSubmit(e);
            }}
            className="space-y-3"
          >
            {fields.map((pkg, idx) => {
              const isOpenPkg = openId === pkg.id;
              return (
                <Collapsible
                  key={pkg.id}
                  open={isOpenPkg}
                  onOpenChange={(o) => setOpenId(o ? pkg.id : null)}
                  className="overflow-hidden rounded-lg border border-[#E5E5EC]"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between bg-[#FBFBFC] px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-gray-900">{pkg.label}</span>
                    {isOpenPkg ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 px-4 py-4">
                    <Typography
                      variant="label"
                      className="text-[11px] font-bold uppercase tracking-wide text-gray-700"
                    >
                      Package Dimensions
                    </Typography>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {(['length', 'width', 'height'] as const).map((dim) => {
                        const err = fieldErr(idx, dim);
                        return (
                          <div key={dim} className="space-y-1.5">
                            <Typography variant="label" className={LABEL}>
                              {dim.charAt(0).toUpperCase() + dim.slice(1)}{' '}
                              <span className="text-[#EF4444]">*</span>
                            </Typography>
                            <div className="relative">
                              <Input
                                {...register(`packages.${idx}.${dim}` as const)}
                                className={cn(INPUT, 'pr-10', err && 'border-red-500')}
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                cm
                              </span>
                            </div>
                            {err ? (
                              <Typography variant="caption" className="text-[12px] text-red-500">
                                {err}
                              </Typography>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Typography variant="label" className={LABEL}>
                          Weight <span className="text-[#EF4444]">*</span>
                        </Typography>
                        <div className="relative">
                          <Input
                            {...register(`packages.${idx}.weight` as const)}
                            className={cn(
                              INPUT,
                              'pr-10',
                              fieldErr(idx, 'weight') && 'border-red-500'
                            )}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                            kg
                          </span>
                        </div>
                        {fieldErr(idx, 'weight') ? (
                          <Typography variant="caption" className="text-[12px] text-red-500">
                            {fieldErr(idx, 'weight')}
                          </Typography>
                        ) : null}
                      </div>
                      <div className="space-y-1.5">
                        <Typography variant="label" className={LABEL}>
                          Declared value <span className="text-[#EF4444]">*</span>
                        </Typography>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                            £
                          </span>
                          <Input
                            {...register(`packages.${idx}.value` as const)}
                            className={cn(
                              INPUT,
                              'pl-7',
                              fieldErr(idx, 'value') && 'border-red-500'
                            )}
                          />
                        </div>
                        {fieldErr(idx, 'value') ? (
                          <Typography variant="caption" className="text-[12px] text-red-500">
                            {fieldErr(idx, 'value')}
                          </Typography>
                        ) : null}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
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
