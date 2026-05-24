import { useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import type {
  Control,
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import FormField from '@/components/molecules/FormField';
import FormPhoneField from '@/components/molecules/FormPhoneField';
import FormTextareaField from '@/components/molecules/FormTextareaField';
import Typography from '@/components/atoms/Typography';
import type {
  PackageDeliveryFormData,
  DeliveryItemFormData,
  PackageFieldsFormData,
} from '@/schemas/pickup.schema';
import SearchableCitySelect from '@/components/common/SearchableCitySelect';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Plus, ChevronDown, ChevronUp, Save, Trash2, Package, PenLine, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { useAppSelector } from '@/store/hooks';
import { useGetEffectiveServiceTiersForOrgQuery, type ServiceTier } from '@/store/api';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { PACKAGE_ADD_NEW_PACKAGE_LABEL } from '@/lib/data';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/molecules/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';

type DeliveryItemErrors = FieldErrors<DeliveryItemFormData>;
type PackageFieldsErrors = FieldErrors<PackageFieldsFormData>;

const DELIVERY_PREFERENCE_OPTIONS = [
  {
    value: 'signature' as const,
    title: 'Signature Required',
    description: 'The recipient must sign to confirm delivery.',
    Icon: PenLine,
  },
  {
    value: 'safe_place' as const,
    title: 'Leave at Safe Place',
    description: 'The package can be left at a secure location if the recipient is unavailable.',
    Icon: Package,
  },
];

interface DeliveryPackageOption {
  value: string;
  line: string;
  estimate: string;
  badge: string;
  badgeColor: string;
  basePrice: string;
  perPackage: string;
  perKg: string;
}

function buildDeliveryPackageOption(tier: ServiceTier): DeliveryPackageOption {
  const eta = addDays(new Date(), tier.duration_days);
  return {
    value: tier.id,
    line: `Up to ${tier.duration_days} Day Delivery`,
    estimate: `Estimated delivery by ${format(eta, 'd MMMM yyyy')}`,
    badge: tier.tier_name.toUpperCase(),
    badgeColor: tier.color || '#525252',
    basePrice: `£${tier.base_price}`,
    perPackage: `£${tier.price_per_package}`,
    perKg: `£${tier.price_per_kg}`,
  };
}

const DEFAULT_PACKAGE_FIELDS = {
  length: '',
  width: '',
  height: '',
  weight: '',
  declaredValue: '',
};

interface PackageAccordionItemProps {
  packageIndex: number;
  packagesPrefix: string;
  register: UseFormRegister<PackageDeliveryFormData>;
  errors?: PackageFieldsErrors;
  disabled?: boolean;
  onRemovePackage: () => void;
  canRemovePackage: boolean;
}

function PackageAccordionItem({
  packageIndex,
  packagesPrefix,
  register,
  errors,
  disabled = false,
  onRemovePackage,
  canRemovePackage,
}: PackageAccordionItemProps): React.JSX.Element {
  const [open, setOpen] = useState(packageIndex === 0);
  const basePath = `${packagesPrefix}.${packageIndex}` as Path<PackageDeliveryFormData>;
  const p = (field: string): Path<PackageDeliveryFormData> =>
    `${basePath}.${field}` as Path<PackageDeliveryFormData>;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-[10px] border border-form-border bg-black/[0.04] px-5 py-5 sm:px-6"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-[30px] shrink-0 rounded-md shadow-sm"
              disabled={disabled}
              aria-label={open ? 'Collapse package' : 'Expand package'}
            >
              {open ? (
                <ChevronUp className="size-4 text-form-subtitle" />
              ) : (
                <ChevronDown className="size-4 text-form-subtitle" />
              )}
            </Button>
          </CollapsibleTrigger>
          <Package className="size-6 shrink-0 text-form-subtitle" aria-hidden />
          <Typography variant="body" weight="semibold" className="truncate text-lg text-form-title">
            Package # {String(packageIndex + 1).padStart(2, '0')}
          </Typography>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !canRemovePackage}
          onClick={onRemovePackage}
          className="h-[30px] shrink-0 gap-1 rounded-md border-[#ffd1d0] px-3 text-xs font-medium text-[#c11616] shadow-sm hover:bg-white hover:text-[#c11616]"
        >
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Remove Package
        </Button>
      </div>
      <Separator className="my-4" />
      <CollapsibleContent>
        <div className="flex flex-col gap-5">
          <Typography variant="body" weight="medium" className="text-base text-form-title">
            Package Dimensions
          </Typography>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
              {(
                [
                  { key: 'length', label: 'Length' },
                  { key: 'width', label: 'Width' },
                  { key: 'height', label: 'Height' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Typography
                      variant="label"
                      className="text-sm font-medium leading-none text-form-title"
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body"
                      className="text-sm font-medium leading-none text-error"
                    >
                      *
                    </Typography>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      disabled={disabled}
                      className="h-10 pr-10"
                      aria-invalid={errors?.[key] ? 'true' : 'false'}
                      {...register(p(key))}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      cm
                    </span>
                  </div>
                  {errors?.[key] && (
                    <Typography variant="caption" color="error" role="alert" className="text-sm">
                      {errors[key]?.message}
                    </Typography>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Typography
                    variant="label"
                    className="text-sm font-medium leading-none text-form-title"
                  >
                    Declared Weight
                  </Typography>
                  <Typography
                    variant="body"
                    className="text-sm font-medium leading-none text-error"
                  >
                    *
                  </Typography>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    disabled={disabled}
                    className="h-10 pr-10"
                    aria-invalid={errors?.weight ? 'true' : 'false'}
                    {...register(p('weight'))}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg
                  </span>
                </div>
                {errors?.weight && (
                  <Typography variant="caption" color="error" role="alert" className="text-sm">
                    {errors.weight.message}
                  </Typography>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Typography
                    variant="label"
                    className="text-sm font-medium leading-none text-form-title"
                  >
                    Declared value
                  </Typography>
                  <Typography
                    variant="body"
                    className="text-sm font-medium leading-none text-error"
                  >
                    *
                  </Typography>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                    £
                  </span>
                  <Input
                    type="text"
                    disabled={disabled}
                    className="h-10 pl-7"
                    aria-invalid={errors?.declaredValue ? 'true' : 'false'}
                    {...register(p('declaredValue'))}
                  />
                </div>
                {errors?.declaredValue && (
                  <Typography variant="caption" color="error" role="alert" className="text-sm">
                    {errors.declaredValue.message}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface PackageDeliveryCardProps {
  itemIndex: number;
  register: UseFormRegister<PackageDeliveryFormData>;
  control: Control<PackageDeliveryFormData>;
  errors?: DeliveryItemErrors;
  setValue: UseFormSetValue<PackageDeliveryFormData>;
  watch: UseFormWatch<PackageDeliveryFormData>;
  disabled?: boolean;
  formErrors?: FieldErrors<PackageDeliveryFormData>;
  onRemoveStop?: () => void;
  canRemoveStop?: boolean;
  /** True after the user has saved this stop — collapses card and swaps Save Stop → Edit details. */
  isSaved?: boolean;
  /** Called when the user clicks Save Stop (parent runs validation via RHF `trigger`). */
  onSaveStop?: () => void;
  /** Called when the user clicks Edit details on a saved (collapsed) stop. */
  onEditStop?: () => void;
}

export default function PackageDeliveryCard({
  itemIndex,
  register,
  control,
  errors,
  setValue,
  watch,
  disabled = false,
  formErrors,
  onRemoveStop,
  canRemoveStop = false,
  isSaved = false,
  onSaveStop,
  onEditStop,
}: PackageDeliveryCardProps): React.JSX.Element {
  const dropOffPrefix = `deliveryItems.${itemIndex}` as const;
  const packagesPrefix = `deliveryItems.${itemIndex}.packages` as const;
  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: packagesPrefix,
  });

  const [stopExpanded, setStopExpanded] = useState(true);

  const getPackageErrors = (i: number): PackageFieldsErrors | undefined => {
    const itemErrors = formErrors?.deliveryItems?.[itemIndex];
    if (
      itemErrors &&
      typeof itemErrors === 'object' &&
      'packages' in itemErrors &&
      Array.isArray((itemErrors as { packages?: unknown[] }).packages)
    ) {
      return (itemErrors as { packages?: PackageFieldsErrors[] }).packages?.[i];
    }
    return undefined;
  };

  const city = watch(`${dropOffPrefix}.city`);
  const deliveryInstruction = watch(`${dropOffPrefix}.deliveryInstruction`);
  const deliveryPackage = watch(`${dropOffPrefix}.deliveryPackage`);
  const stopNotes = watch(`${dropOffPrefix}.stopNotes`) ?? '';
  const notesLen = String(stopNotes).length;

  // Live service tiers — no dummy data, sourced from /service-tiers/effective-for-org
  const orgId = useAppSelector((state) => state.auth.user?.organization_id ?? '');
  const {
    data: tiersResponse,
    isLoading: isTiersLoading,
    isFetching: isTiersFetching,
  } = useGetEffectiveServiceTiersForOrgQuery(orgId, { skip: !orgId });
  const permittedTiers = (tiersResponse?.data.items ?? []).filter(
    (tier) => tier.permitted === true
  );
  const tierOptions = permittedTiers.map(buildDeliveryPackageOption);
  const isTiersBusy = Boolean(orgId) && (isTiersLoading || isTiersFetching);

  // Auto-select default tier: prefer `is_default === true`, otherwise the first permitted tier.
  // Only fires when the form value is empty (i.e. the user hasn't picked / draft-restored yet).
  useEffect(() => {
    if (deliveryPackage) return;
    if (permittedTiers.length === 0) return;
    const preferred = permittedTiers.find((tier) => tier.is_default === true) ?? permittedTiers[0];
    setValue(`${dropOffPrefix}.deliveryPackage`, preferred.id, { shouldValidate: false });
  }, [deliveryPackage, permittedTiers, setValue, dropOffPrefix]);

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-[#f3f3f3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-[30px] shrink-0 rounded-md shadow-sm"
            disabled={disabled || isSaved}
            aria-expanded={!isSaved && stopExpanded}
            aria-label={
              !isSaved && stopExpanded ? 'Collapse delivery stop' : 'Expand delivery stop'
            }
            onClick={() => setStopExpanded((v) => !v)}
          >
            {!isSaved && stopExpanded ? (
              <ChevronUp className="size-4 text-form-subtitle" />
            ) : (
              <ChevronDown className="size-4 text-form-subtitle" />
            )}
          </Button>
          <span
            className="size-5 shrink-0 rounded-full border-4 border-primary shadow-[0_0_0_4px_rgba(174,34,36,0.1)]"
            aria-hidden
          />
          <Typography variant="body" weight="semibold" className="truncate text-xl text-form-title">
            Delivery Stop # {String(itemIndex + 1).padStart(2, '0')}
          </Typography>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canRemoveStop}
            onClick={onRemoveStop}
            className="h-[30px] gap-1 rounded-md border-[#ffd1d0] px-3 text-xs font-medium text-[#c11616] shadow-sm hover:bg-white hover:text-[#c11616] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Remove Stop
          </Button>
          {isSaved ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onEditStop}
              className="h-[30px] gap-1 rounded-md border-form-border px-3 text-xs font-medium text-form-title shadow-sm"
            >
              <PenLine className="size-4 shrink-0" aria-hidden />
              Edit details
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onSaveStop}
              className="h-[30px] gap-1 rounded-md border-form-border px-3 text-xs font-medium text-form-title shadow-sm"
            >
              <Save className="size-4 shrink-0" aria-hidden />
              Save Stop
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-border" />

      {!isSaved && stopExpanded && (
        <div className="flex flex-col gap-5">
          <Typography variant="body" weight="medium" className="text-base text-form-title">
            Drop-off Details
          </Typography>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <FormField
                  label="Recipient First name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="e.g. John"
                  disabled={disabled}
                  required
                  error={errors?.recipientFirstName}
                  {...register(`${dropOffPrefix}.recipientFirstName`)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <FormField
                  label="Recipient Last name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="e.g. Marshal"
                  disabled={disabled}
                  required
                  error={errors?.recipientLastName}
                  {...register(`${dropOffPrefix}.recipientLastName`)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 lg:max-w-[min(100%,20rem)]">
                <FormPhoneField<PackageDeliveryFormData>
                  control={control}
                  name={`${dropOffPrefix}.contactNumber`}
                  label="Recipient Contact number"
                  placeholder="e.g. 1254-4873837"
                  disabled={disabled}
                  required
                  defaultCountry="GB"
                  error={errors?.contactNumber}
                />
              </div>
              <div className="min-w-0 flex-1">
                <FormField
                  label="Recipient Email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. xyz@gmail.com"
                  disabled={disabled}
                  required
                  error={errors?.recipientEmail}
                  {...register(`${dropOffPrefix}.recipientEmail`)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <FormField
                  label="First Line of Address"
                  type="text"
                  autoComplete="address-line1"
                  placeholder="e.g. Street address, P.O. box, company name"
                  disabled={disabled}
                  required
                  error={errors?.addressLine1}
                  {...register(`${dropOffPrefix}.addressLine1`)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <FormField
                  label="Second Line of Address"
                  type="text"
                  autoComplete="address-line2"
                  placeholder="e.g. Apartment, suite, unit, building, floor"
                  disabled={disabled}
                  error={errors?.addressLine2}
                  {...register(`${dropOffPrefix}.addressLine2`)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Typography
                      variant="label"
                      htmlFor={`${dropOffPrefix}-city`}
                      className="text-sm font-medium leading-none text-form-title"
                    >
                      City / Town
                    </Typography>
                    <Typography
                      variant="body"
                      className="text-sm font-medium leading-none text-error"
                    >
                      *
                    </Typography>
                  </div>
                  <SearchableCitySelect
                    id={`${dropOffPrefix}-city`}
                    value={city ?? ''}
                    onValueChange={(next) =>
                      setValue(`${dropOffPrefix}.city`, next, { shouldValidate: true })
                    }
                    disabled={disabled}
                    error={errors?.city}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <FormField
                  label="Postal Code / ZIP Code"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="e.g. 90210"
                  disabled={disabled}
                  required
                  error={errors?.postalCode}
                  {...register(`${dropOffPrefix}.postalCode`)}
                />
              </div>
            </div>

            <FormTextareaField
              label="Add notes"
              labelRight={
                <Typography variant="caption" className="text-xs font-medium text-form-subtitle">
                  {notesLen}/250 Characters
                </Typography>
              }
              placeholder="Write here..."
              disabled={disabled}
              maxLength={250}
              rows={4}
              className="min-h-[80px] resize-y"
              error={errors?.stopNotes}
              {...register(`${dropOffPrefix}.stopNotes`)}
            />
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-col gap-5">
            <Typography variant="body" weight="medium" className="text-base text-form-title">
              Delivery Service{' '}
              <span className="font-medium italic text-form-title">(Required)</span>
            </Typography>
            {isTiersBusy ? (
              <div className="flex items-center justify-center rounded-xl border border-form-border bg-white py-10">
                <LoadingSpinner size="sm" />
              </div>
            ) : tierOptions.length === 0 ? (
              <div className="rounded-xl border border-form-border bg-white p-4 text-sm text-muted-foreground">
                No delivery services are available for your organization.
              </div>
            ) : (
              <RadioGroup
                value={deliveryPackage ?? ''}
                onValueChange={(value) =>
                  setValue(`${dropOffPrefix}.deliveryPackage`, value, {
                    shouldValidate: true,
                  })
                }
                className="flex flex-col gap-[18px]"
              >
                {tierOptions.map((opt) => {
                  const selected = deliveryPackage === opt.value;
                  return (
                    <Typography
                      key={opt.value}
                      variant="label"
                      htmlFor={`${dropOffPrefix}-pkg-${opt.value}`}
                      className={cn(
                        'flex cursor-pointer gap-[18px] rounded-xl border bg-white p-4 transition-colors',
                        selected ? 'border-[#5d5567]' : 'border-form-border'
                      )}
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`${dropOffPrefix}-pkg-${opt.value}`}
                        disabled={disabled}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                              style={{
                                backgroundColor: `${opt.badgeColor}20`,
                                color: opt.badgeColor,
                              }}
                            >
                              {opt.badge}
                            </span>
                            <span className="text-sm font-medium text-form-title">{opt.line}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{opt.estimate}</span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:text-sm">
                          <div>
                            <div className="text-sm font-medium text-form-subtitle">Base Price</div>
                            <div className="mt-2 text-base font-medium text-form-title">
                              {opt.basePrice}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-form-subtitle">
                              Price per package
                            </div>
                            <div className="mt-2 text-base font-medium text-form-title">
                              {opt.perPackage}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-form-subtitle">
                              Price per KG
                            </div>
                            <div className="mt-2 text-base font-medium text-form-title">
                              {opt.perKg}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Typography>
                  );
                })}
              </RadioGroup>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <Typography variant="body" weight="medium" className="text-base text-form-title">
              Delivery Preferences
            </Typography>
            <RadioGroup
              value={deliveryInstruction ?? ''}
              onValueChange={(value) =>
                setValue(
                  `${dropOffPrefix}.deliveryInstruction`,
                  value as 'signature' | 'safe_place',
                  {
                    shouldValidate: true,
                  }
                )
              }
              className="flex flex-col gap-[18px]"
            >
              {DELIVERY_PREFERENCE_OPTIONS.map((opt) => {
                const Icon = opt.Icon;
                return (
                  <Typography
                    key={opt.value}
                    variant="label"
                    htmlFor={`${dropOffPrefix}-pref-${opt.value}`}
                    className="flex cursor-pointer items-start gap-4"
                  >
                    <RadioGroupItem
                      value={opt.value}
                      id={`${dropOffPrefix}-pref-${opt.value}`}
                      disabled={disabled}
                      className="mt-1 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 gap-3.5">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-200/80">
                        <Icon className="size-5 text-form-title" aria-hidden />
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <Typography
                          variant="body"
                          weight="medium"
                          className="text-base text-form-title"
                        >
                          {opt.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-sm leading-5 text-muted-foreground"
                        >
                          {opt.description}
                        </Typography>
                      </div>
                    </div>
                  </Typography>
                );
              })}
            </RadioGroup>
            {deliveryInstruction === 'safe_place' && (
              <div className="flex gap-1.5 rounded-md bg-blue-500/10 px-1.5 py-1 text-xs font-medium leading-5 text-blue-950">
                <Info className="mt-0.5 size-3.5 shrink-0 text-blue-950" aria-hidden />
                <Typography
                  variant="caption"
                  className="text-xs font-medium leading-5 text-blue-950"
                >
                  Images will always be captured when a package is left in a safe place.
                </Typography>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {packageFields.map((field, packageIndex) => (
              <PackageAccordionItem
                key={field.id}
                packageIndex={packageIndex}
                packagesPrefix={packagesPrefix}
                register={register}
                errors={getPackageErrors(packageIndex)}
                disabled={disabled}
                onRemovePackage={() => removePackage(packageIndex)}
                canRemovePackage={packageFields.length > 1}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-center border-[#5d5567] text-sm font-medium shadow-sm"
              onClick={() => appendPackage({ ...DEFAULT_PACKAGE_FIELDS })}
              disabled={disabled}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              {PACKAGE_ADD_NEW_PACKAGE_LABEL}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
