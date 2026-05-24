import { useCallback, useMemo, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import PickupFormFooter from '@/components/molecules/PickupFormFooter';
import PackageDeliveryCard from './PackageDeliveryCard';
import {
  packageDeliverySchema,
  type DeliveryItemFormData,
  type PackageDeliveryFormData,
} from '@/schemas/pickup.schema';
import {
  PACKAGE_ADD_DELIVERY_STOP_LABEL,
  PACKAGE_DELIVERY_FORM_SUBTITLE,
  PACKAGE_DELIVERY_FORM_TITLE,
} from '@/lib/data';
import { useAppSelector } from '@/store/hooks';
import { useGetOrganizationByIdQuery, useGetEffectiveServiceTiersForOrgQuery } from '@/store/api';
import {
  formatPackageIssue,
  formatStopIssue,
  formatTierIssue,
  validateAllStopsAgainstLimits,
  validateStopAgainstLimits,
  type OrgOrderLimits,
} from '@/lib/orderLimitsValidation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';

const DEFAULT_PACKAGE_FIELDS = {
  length: '',
  width: '',
  height: '',
  weight: '',
  declaredValue: '',
};

const DEFAULT_DROPOFF = {
  recipientFirstName: '',
  recipientLastName: '',
  recipientEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  contactNumber: '',
  stopNotes: '',
  deliveryInstruction: 'signature' as const,
  /** Service tier id — populated from the user's selection in the card */
  deliveryPackage: '',
  packages: [DEFAULT_PACKAGE_FIELDS],
};

const DEFAULT_PACKAGE_VALUES: PackageDeliveryFormData = {
  deliveryItems: [DEFAULT_DROPOFF],
};

interface PackageDeliveryStepProps {
  initialData?: PackageDeliveryFormData | null;
  onNext: (data: PackageDeliveryFormData) => void;
  onBack?: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
}

export default function PackageDeliveryStep({
  initialData,
  onNext,
  onBack,
  onCancel,
  onSaveDraft,
}: PackageDeliveryStepProps): React.JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: packageDeliverySchema,
    defaultValues: initialData ?? DEFAULT_PACKAGE_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'deliveryItems' });

  /** Indices of stops the user has hit "Save Stop" on (collapsed + Edit details mode). */
  const [savedStops, setSavedStops] = useState<Set<number>>(new Set());
  /** Index pending removal — drives the confirmation dialog. */
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);
  /** Per-stop limit violation messages keyed by stopIndex, surfaced beneath the card. */
  const [stopLimitErrors, setStopLimitErrors] = useState<Record<number, string[]>>({});

  // Org limits + effective tiers — used to validate package dimensions/weight and min charge.
  const orgId = useAppSelector((state) => state.auth.user?.organization_id ?? '');
  const { data: orgResponse } = useGetOrganizationByIdQuery(
    { organizationId: orgId },
    { skip: !orgId }
  );
  const { data: tiersResponse } = useGetEffectiveServiceTiersForOrgQuery(orgId, { skip: !orgId });
  const orgLimits: OrgOrderLimits = useMemo(
    () => ({
      max_package_weight: orgResponse?.data?.max_package_weight ?? null,
      max_package_length: orgResponse?.data?.max_package_length ?? null,
      max_package_width: orgResponse?.data?.max_package_width ?? null,
      max_package_height: orgResponse?.data?.max_package_height ?? null,
      min_charge_per_booking: orgResponse?.data?.min_charge_per_booking ?? null,
    }),
    [orgResponse]
  );
  const orgTiers = useMemo(() => tiersResponse?.data.items ?? [], [tiersResponse]);

  const handleAddDeliveryStop = (): void => {
    append({ ...DEFAULT_DROPOFF, packages: [{ ...DEFAULT_PACKAGE_FIELDS }] });
  };

  const handleSaveStop = useCallback(
    async (itemIndex: number): Promise<void> => {
      const ok = await trigger(`deliveryItems.${itemIndex}`, { shouldFocus: true });
      if (!ok) return;

      // Org-limit validation (size, weight, min charge per booking).
      const items = watch('deliveryItems') ?? [];
      const item = items[itemIndex];
      if (item) {
        const tier = orgTiers.find((t) => t.id === item.deliveryPackage);
        const result = validateStopAgainstLimits(itemIndex, item, tier, orgLimits);
        if (result.hasErrors) {
          const messages = [
            ...result.tierIssues.map(formatTierIssue),
            ...result.packageIssues.map(formatPackageIssue),
            ...result.stopIssues.map(formatStopIssue),
          ];
          setStopLimitErrors((prev) => ({ ...prev, [itemIndex]: messages }));
          messages.forEach((msg) => toast.error(msg));
          return;
        }
      }

      // All good — clear any stale errors for this stop and mark it saved.
      setStopLimitErrors((prev) => {
        if (!(itemIndex in prev)) return prev;
        const next = { ...prev };
        delete next[itemIndex];
        return next;
      });
      setSavedStops((prev) => {
        const next = new Set(prev);
        next.add(itemIndex);
        return next;
      });
    },
    [trigger, watch, orgLimits, orgTiers]
  );

  /** Same limit check, but for every stop at once. Used by the Next button. */
  const validateAllAgainstOrgLimits = useCallback(
    (items: DeliveryItemFormData[]) => {
      const result = validateAllStopsAgainstLimits(items, orgTiers, orgLimits);
      if (!result.hasErrors) {
        setStopLimitErrors({});
        return true;
      }
      const groupedByStop: Record<number, string[]> = {};
      result.tierIssues.forEach((issue) => {
        const list = groupedByStop[issue.stopIndex] ?? [];
        list.push(formatTierIssue(issue));
        groupedByStop[issue.stopIndex] = list;
      });
      result.packageIssues.forEach((issue) => {
        const list = groupedByStop[issue.stopIndex] ?? [];
        list.push(formatPackageIssue(issue));
        groupedByStop[issue.stopIndex] = list;
      });
      result.stopIssues.forEach((issue) => {
        const list = groupedByStop[issue.stopIndex] ?? [];
        list.push(formatStopIssue(issue));
        groupedByStop[issue.stopIndex] = list;
      });
      setStopLimitErrors(groupedByStop);
      Object.values(groupedByStop)
        .flat()
        .forEach((msg) => toast.error(msg));
      return false;
    },
    [orgTiers, orgLimits]
  );

  const handleEditStop = useCallback((itemIndex: number): void => {
    setSavedStops((prev) => {
      const next = new Set(prev);
      next.delete(itemIndex);
      return next;
    });
  }, []);

  const handleRequestRemove = useCallback((itemIndex: number): void => {
    setPendingRemoveIndex(itemIndex);
  }, []);

  const handleConfirmRemove = useCallback((): void => {
    if (pendingRemoveIndex === null) return;
    const removedIndex = pendingRemoveIndex;
    remove(removedIndex);
    setSavedStops((prev) => {
      // Drop removed index and re-index any saved stop above it (they shift down by 1).
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i === removedIndex) return;
        next.add(i > removedIndex ? i - 1 : i);
      });
      return next;
    });
    setPendingRemoveIndex(null);
  }, [pendingRemoveIndex, remove]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2.5">
          <Typography variant="h4" weight="medium" className="text-xl text-form-title">
            {PACKAGE_DELIVERY_FORM_TITLE}
          </Typography>
          <Typography className="text-sm leading-5 text-muted-foreground">
            {PACKAGE_DELIVERY_FORM_SUBTITLE}
          </Typography>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-2 border-[#5d5567] px-3.5 text-sm font-medium shadow-sm"
          onClick={handleAddDeliveryStop}
          disabled={isSubmitting}
        >
          <Plus className="size-4" aria-hidden />
          {PACKAGE_ADD_DELIVERY_STOP_LABEL}
        </Button>
      </div>

      <form
        onSubmit={(e) =>
          void handleSubmit((data) => {
            if (!validateAllAgainstOrgLimits(data.deliveryItems)) return;
            onNext(data);
          })(e)
        }
        noValidate
        aria-label="Package & Delivery form"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-6">
          {fields.map((field, itemIndex) => (
            <div key={field.id} className="flex flex-col gap-2">
              <PackageDeliveryCard
                itemIndex={itemIndex}
                register={register}
                control={control}
                errors={errors.deliveryItems?.[itemIndex]}
                setValue={setValue}
                watch={watch}
                disabled={isSubmitting}
                formErrors={errors}
                onRemoveStop={() => handleRequestRemove(itemIndex)}
                canRemoveStop={fields.length > 1}
                isSaved={savedStops.has(itemIndex)}
                onSaveStop={() => void handleSaveStop(itemIndex)}
                onEditStop={() => handleEditStop(itemIndex)}
              />
              {stopLimitErrors[itemIndex]?.length ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FBC4C5] bg-[#FFF2F2] px-3 py-2 text-xs text-[#C11616]"
                >
                  <ul className="list-disc space-y-1 pl-4">
                    {stopLimitErrors[itemIndex].map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <PickupFormFooter
          onCancel={onCancel}
          onSaveDraft={onSaveDraft}
          onNext={() =>
            void handleSubmit((data) => {
              if (!validateAllAgainstOrgLimits(data.deliveryItems)) return;
              onNext(data);
            })()
          }
          onBack={onBack}
          isSubmitting={isSubmitting}
        />
      </form>

      <Dialog
        open={pendingRemoveIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoveIndex(null);
        }}
      >
        <DialogContent className="h-auto sm:max-w-[420px] sm:max-h-fit overflow-hidden rounded-2xl border border-[#E6E8EE] p-0 shadow-xl">
          <div className="px-6 pt-7 pb-2">
            <DialogHeader className="items-center space-y-0 text-center">
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
                <Trash2 className="h-6 w-6 text-[#9CA3AF]" aria-hidden />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-white ring-2 ring-white">
                  <Trash2 className="h-3 w-3" aria-hidden />
                </span>
              </div>
              <DialogTitle className="text-center text-lg font-semibold text-[#1F2430]">
                Remove Delivery Stop #{' '}
                {pendingRemoveIndex !== null ? String(pendingRemoveIndex + 1).padStart(2, '0') : ''}
                ?
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-[340px] text-center text-sm leading-relaxed text-[#5D6370]">
                Are you sure you want to delete this delivery contact?
                <br />
                All associated package details will be permanently removed.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#ECEEF3] p-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-[#E1E3EA] bg-white text-sm font-medium text-[#5A6070]"
              onClick={() => setPendingRemoveIndex(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#DC2626] text-sm font-semibold text-white hover:bg-[#B91C1C]"
              onClick={handleConfirmRemove}
            >
              Remove Delivery Stop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
