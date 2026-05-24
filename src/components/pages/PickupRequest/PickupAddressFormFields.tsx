import { useEffect, useMemo, useRef } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Loader2, Search } from 'lucide-react';
import FormField from '@/components/molecules/FormField';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { PickupRequestFormData } from '@/schemas/pickup.schema';
import type { PickupAddressFormData } from '@/schemas/pickup.schema';
import {
  PICKUP_ADDRESS_HELPER_TEXT,
  PICKUP_CITY_OPTIONS,
  PICKUP_COUNTRY_OPTIONS,
  PICKUP_REGION_OPTIONS,
} from '@/lib/data';
import {
  applyOrganizationPickupAddressToForm,
  formatPickupAddressOptionLabel,
  isPickupAddressUuid,
} from '@/lib/pickupAddressForm';
import { useOrganizationId } from '@/lib/organizationContext';
import { cn } from '@/lib/utils';
import { useGetOrganizationPickupAddressesQuery } from '@/store/api/organizationProfileApi';

interface PickupAddressFormFieldsProps {
  register: UseFormRegister<PickupRequestFormData>;
  control: Control<PickupRequestFormData>;
  errors?: FieldErrors<PickupAddressFormData>;
  setValue: UseFormSetValue<PickupRequestFormData>;
  watch: UseFormWatch<PickupRequestFormData>;
  disabled?: boolean;
}

function optionLabel(opts: ReadonlyArray<{ value: string; label: string }>, v: unknown): string {
  const s = typeof v === 'string' ? v : '';
  return opts.find((o) => o.value === s)?.label ?? s;
}

const READONLY_INPUT_CLASS = 'cursor-default bg-muted/40';

export default function PickupAddressFormFields({
  register,
  control,
  errors,
  setValue,
  watch,
  disabled = false,
}: PickupAddressFormFieldsProps): React.JSX.Element {
  const organizationId = useOrganizationId();
  const contactName = watch('contactName');
  const pickupInfo = watch('pickupAddress.pickupInfo');
  const autoSelectedRef = useRef(false);

  const { data: pickupAddressesResponse, isFetching: profileLoading } =
    useGetOrganizationPickupAddressesQuery(organizationId ? { organizationId } : skipToken);

  const pickupAddresses = useMemo(() => {
    const data = pickupAddressesResponse?.data;
    if (Array.isArray(data)) return data;
    return data?.pickup_addresses ?? [];
  }, [pickupAddressesResponse?.data]);

  const savedAddressItems = useMemo(
    () =>
      pickupAddresses.map((address) => ({
        value: address.id,
        label: formatPickupAddressOptionLabel(address),
        address,
      })),
    [pickupAddresses]
  );

  const selectedAddress = useMemo(
    () => pickupAddresses.find((row) => row.id === pickupInfo) ?? null,
    [pickupAddresses, pickupInfo]
  );

  const showAddressCard = Boolean(
    pickupInfo?.trim() && (selectedAddress || isPickupAddressUuid(pickupInfo))
  );

  useEffect(() => {
    if (autoSelectedRef.current || profileLoading) return;
    if (pickupInfo?.trim()) return;
    if (pickupAddresses.length === 0) return;

    const defaultAddress =
      pickupAddresses.find((row) => row.is_default) ?? pickupAddresses[0] ?? null;
    if (!defaultAddress) return;

    applyOrganizationPickupAddressToForm(setValue, defaultAddress, contactName);
    autoSelectedRef.current = true;
  }, [contactName, pickupAddresses, pickupInfo, profileLoading, setValue]);

  // Whenever the dropdown's pickupInfo resolves to a saved address, mirror that address
  // onto the read-only detail fields. Covers the draft-edit case where the parent's
  // reset() puts a pickup_address_id into pickupInfo but the saved field snapshot is
  // blank, *and* covers the regular dropdown change (idempotent re-apply is harmless).
  // We key off the matched address id so this only fires once per address selection
  // and contactName edits don't re-clobber personFirst/SecondName.
  const hydratedAddressIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (profileLoading || !selectedAddress) return;
    if (hydratedAddressIdRef.current === selectedAddress.id) return;
    hydratedAddressIdRef.current = selectedAddress.id;
    applyOrganizationPickupAddressToForm(setValue, selectedAddress, contactName);
  }, [contactName, profileLoading, selectedAddress, setValue]);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <Typography
            variant="label"
            htmlFor="pickupAddress-pickupInfo"
            className="text-sm font-medium leading-none text-form-title"
          >
            Pickup Address
          </Typography>
          <Typography variant="body" className="text-sm font-medium leading-none text-destructive">
            *
          </Typography>
        </div>
        <Select
          value={pickupInfo && isPickupAddressUuid(pickupInfo) ? pickupInfo : undefined}
          onValueChange={(id) => {
            const match = pickupAddresses.find((row) => row.id === id);
            if (match) {
              applyOrganizationPickupAddressToForm(setValue, match, contactName);
            } else {
              setValue('pickupAddress.pickupInfo', id, { shouldValidate: true });
            }
          }}
          disabled={disabled || profileLoading || pickupAddresses.length === 0}
        >
          <SelectTrigger
            id="pickupAddress-pickupInfo"
            className={cn(
              'h-10 w-full',
              errors?.pickupInfo && 'border-destructive focus:ring-destructive'
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              {profileLoading ? (
                <Loader2
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden
                />
              ) : (
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <SelectValue
                placeholder={
                  profileLoading
                    ? 'Loading saved addresses…'
                    : pickupAddresses.length === 0
                      ? 'No saved addresses — add one in Settings'
                      : 'Select a saved pickup address'
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-72 overflow-y-auto">
            {savedAddressItems.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-sm text-form-title">{option.label}</span>
                  {option.address.is_default ? (
                    <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Default
                    </span>
                  ) : null}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.pickupInfo && (
          <Typography variant="caption" color="error" role="alert" className="text-sm text-error">
            {errors.pickupInfo.message}
          </Typography>
        )}
        <Typography variant="caption" className="text-sm leading-5 text-form-subtitle">
          {PICKUP_ADDRESS_HELPER_TEXT}
        </Typography>
        {!profileLoading && pickupAddresses.length === 0 ? (
          <Typography variant="caption" className="text-sm text-amber-700">
            Add at least one pickup address under Settings → General Settings before creating an
            order.
          </Typography>
        ) : null}
      </div>

      {showAddressCard ? (
        <div className="flex flex-col gap-5 rounded-[10px] border border-form-border bg-white px-5 pb-6 pt-5">
          <div className="flex items-center gap-3">
            {selectedAddress?.is_default ? (
              <Badge
                variant="secondary"
                className="border-transparent bg-black px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-black"
              >
                Default
              </Badge>
            ) : null}
            {selectedAddress?.label ? (
              <Typography variant="caption" className="text-sm text-form-subtitle">
                {selectedAddress.label}
              </Typography>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <FormField
                label="Address Line 1"
                type="text"
                autoComplete="address-line1"
                readOnly
                className={READONLY_INPUT_CLASS}
                disabled={disabled}
                required
                error={errors?.addressLine}
                {...register('pickupAddress.addressLine')}
              />
            </div>
            <div className="min-w-0 flex-1">
              <FormField
                label="Address Line 2"
                type="text"
                autoComplete="address-line2"
                readOnly
                className={READONLY_INPUT_CLASS}
                disabled={disabled}
                error={errors?.addressLine2}
                {...register('pickupAddress.addressLine2')}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="pickupAddress.country"
                render={({ field }) => (
                  <FormField
                    label="Country"
                    type="text"
                    readOnly
                    className={READONLY_INPUT_CLASS}
                    disabled={disabled}
                    required
                    error={errors?.country}
                    {...field}
                    value={optionLabel(PICKUP_COUNTRY_OPTIONS, field.value) || field.value}
                  />
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="pickupAddress.state"
                render={({ field }) => (
                  <FormField
                    label="Region"
                    type="text"
                    readOnly
                    className={READONLY_INPUT_CLASS}
                    disabled={disabled}
                    required
                    error={errors?.state}
                    {...field}
                    value={optionLabel(PICKUP_REGION_OPTIONS, field.value) || field.value}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="pickupAddress.city"
                render={({ field }) => (
                  <FormField
                    label="City"
                    type="text"
                    readOnly
                    className={READONLY_INPUT_CLASS}
                    disabled={disabled}
                    required
                    error={errors?.city}
                    {...field}
                    value={optionLabel(PICKUP_CITY_OPTIONS, field.value) || field.value}
                  />
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <FormField
                label="Postcode"
                type="text"
                autoComplete="postal-code"
                readOnly
                className={READONLY_INPUT_CLASS}
                disabled={disabled}
                required
                error={errors?.postalCode}
                {...register('pickupAddress.postalCode')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
