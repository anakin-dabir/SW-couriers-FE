import { useState, useCallback } from 'react';
import {
  Info,
  PenLine,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  DollarSign,
  PackageOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import PickupFormFooter from '@/components/molecules/PickupFormFooter';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/Button';
import { cn, formatCurrency } from '@/lib/utils';
import type { PickupRequestFormData } from '@/schemas/pickup.schema';
import type {
  PackageDeliveryFormData,
  DeliveryItemFormData,
  PackageFieldsFormData,
} from '@/schemas/pickup.schema';
import {
  PICKUP_FORM_FOOTER_SUBMIT_REQUEST_LABEL,
  PICKUP_REVIEW_DETAILS_SUBTITLE,
  PICKUP_REVIEW_DETAILS_TITLE,
  REVIEW_DETAILS_BOOKING_EMAIL_BANNER,
  REVIEW_DETAILS_CLIENT_NOTE_LABEL,
  REVIEW_DETAILS_DECLARED_VALUE_LABEL,
  REVIEW_DETAILS_DECLARED_WEIGHT_LABEL,
  REVIEW_DETAILS_DELIVERY_PREFERENCE_LABEL,
  REVIEW_DETAILS_DELIVERY_SERVICE_LABEL,
  REVIEW_DETAILS_DELIVERY_STOP_PREFIX,
  REVIEW_DETAILS_DIMENSIONS_LABEL,
  REVIEW_DETAILS_EDIT_BUTTON_LABEL,
  REVIEW_DETAILS_NO_OF_PACKAGES_LABEL,
  REVIEW_DETAILS_PACKAGE_HEADING,
  REVIEW_DETAILS_PICKUP_ADDRESS_LABEL,
  REVIEW_DETAILS_PICKUP_SECTION_TITLE,
  REVIEW_DETAILS_POSTAL_ADDRESS_LABEL,
  REVIEW_DETAILS_POSTAL_CODE_LABEL,
  REVIEW_DETAILS_RECIPIENT_CONTACT_NUMBER_LABEL,
  REVIEW_DETAILS_RECIPIENT_EMAIL_LABEL,
  REVIEW_DETAILS_RECIPIENT_NAME_LABEL,
  REVIEW_DETAILS_DELIVERY_STOPS_SECTION_TITLE,
  REVIEW_DETAILS_CONTACT_NAME_LABEL,
  REVIEW_SUBMIT_COMPANY_NAME_LABEL,
  REVIEW_SUBMIT_CONTACT_NUMBER_LABEL,
  REVIEW_SUBMIT_EMAIL_LABEL,
  REVIEW_SUBMIT_NOT_PROVIDED,
  DELIVERY_PACKAGE_BADGE_LABEL,
  DELIVERY_INSTRUCTION_REVIEW_LABEL,
} from '@/lib/data';

interface ReviewSubmitStepProps {
  requestorData: PickupRequestFormData;
  packageDeliveryData: PackageDeliveryFormData | null;
  onEditStep: (step: 1 | 2 | 3 | 4) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onBack?: () => void;
  /** Primary footer label (e.g. "Next" before payment, "Submit pickup request" on final step). */
  footerNextLabel?: string;
  isSubmitting?: boolean;
}

function formatPickupAddressReviewLine(pickup: PickupRequestFormData['pickupAddress']): string {
  const countryLabel = pickup.country === 'GB' ? 'United Kingdom' : pickup.country;
  const rest = [pickup.addressLine, pickup.addressLine2, pickup.city, countryLabel]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .join(' ');
  const pc = pickup.postalCode?.trim();
  if (!pc && !rest) return '';
  if (!rest) return pc ?? '';
  if (!pc) return rest;
  return `${pc} - ${rest}`;
}

function formatPostalStreet(item: DeliveryItemFormData): string {
  const line12 = [item.addressLine1, item.addressLine2].filter(Boolean).join(', ');
  const city = item.city?.trim();
  if (line12 && city) return `${line12}, ${city}`;
  return line12 || city || '';
}

function formatDimensions(pkg: PackageFieldsFormData): string {
  const parts = [pkg.length, pkg.width, pkg.height].filter(Boolean);
  return parts.length === 3
    ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm`
    : REVIEW_SUBMIT_NOT_PROVIDED;
}

function parseDeclaredValue(val: string): number {
  const cleaned = String(val || '').replace(/[£,\s]/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

function formatDeclaredValueDisplay(val: string): string {
  const n = parseDeclaredValue(val);
  if (n <= 0 && !String(val || '').trim()) return REVIEW_SUBMIT_NOT_PROVIDED;
  if (n > 0) return formatCurrency(n);
  return String(val).trim() || REVIEW_SUBMIT_NOT_PROVIDED;
}

function formatWeightDisplay(weight: string): string {
  const t = String(weight || '').trim();
  if (!t) return REVIEW_SUBMIT_NOT_PROVIDED;
  if (/\bkg\b/i.test(t)) return t;
  return `${t} kg`;
}

const PACKAGE_BADGE_ICONS: Record<'4day' | '5day' | '8day', LucideIcon> = {
  '4day': Zap,
  '5day': Clock,
  '8day': DollarSign,
};

function ReviewFieldPair({
  left,
  right,
}: {
  left: { label: string; value: string; valueClassName?: string };
  right: { label: string; value: string; valueClassName?: string };
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Typography variant="caption" weight="medium" className="text-sm text-form-subtitle">
          {left.label}
        </Typography>
        <Typography
          variant="body"
          weight="medium"
          className={cn('text-base text-form-title', left.valueClassName)}
        >
          {left.value || REVIEW_SUBMIT_NOT_PROVIDED}
        </Typography>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Typography variant="caption" weight="medium" className="text-sm text-form-subtitle">
          {right.label}
        </Typography>
        <Typography
          variant="body"
          weight="medium"
          className={cn('text-base text-form-title', right.valueClassName)}
        >
          {right.value || REVIEW_SUBMIT_NOT_PROVIDED}
        </Typography>
      </div>
    </div>
  );
}

function ReviewFieldFull({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2">
      <Typography variant="caption" weight="medium" className="text-sm text-form-subtitle">
        {label}
      </Typography>
      <Typography
        variant="body"
        weight="medium"
        className={cn('text-base text-form-title', valueClassName)}
      >
        {value || REVIEW_SUBMIT_NOT_PROVIDED}
      </Typography>
    </div>
  );
}

function SectionEditHeader({
  title,
  onEdit,
  disabled,
}: {
  title: string;
  onEdit: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <Typography variant="h5" weight="medium" className="text-xl leading-5 text-form-title">
        {title}
      </Typography>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onEdit}
        className="h-[30px] gap-1 rounded-md border-form-border bg-white px-3 text-xs font-medium text-form-title shadow-sm"
      >
        <PenLine className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {REVIEW_DETAILS_EDIT_BUTTON_LABEL}
      </Button>
    </div>
  );
}

function ReviewSectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-lg border border-form-border bg-[#fbfbfb] px-4 py-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export default function ReviewSubmitStep({
  requestorData,
  packageDeliveryData,
  onEditStep,
  onCancel,
  onSaveDraft,
  onSubmit,
  onBack,
  footerNextLabel,
  isSubmitting = false,
}: ReviewSubmitStepProps): React.JSX.Element {
  const pickup = requestorData.pickupAddress;
  const pickupAddressLine = formatPickupAddressReviewLine(pickup);
  const deliveryItems = packageDeliveryData?.deliveryItems ?? [];
  const totalStops = deliveryItems.length;

  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const isStopOpen = useCallback(
    (index: number): boolean => openMap[index] ?? index === 0,
    [openMap]
  );

  const toggleStop = useCallback((index: number): void => {
    setOpenMap((m) => {
      const cur = m[index] ?? index === 0;
      return { ...m, [index]: !cur };
    });
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <Typography variant="h4" weight="semibold" className="text-xl text-form-title">
            {PICKUP_REVIEW_DETAILS_TITLE}
          </Typography>
          <Typography variant="body" className="text-sm leading-5 text-muted-foreground">
            {PICKUP_REVIEW_DETAILS_SUBTITLE}
          </Typography>
        </div>
        <Separator className="bg-form-border" />
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="flex w-full items-center gap-3 rounded-lg border border-[#d2e4ff] bg-[#fafcff] px-2.5 py-1.5"
          role="status"
        >
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(210, 228, 255, 0.4)' }}
          >
            <Info className="size-[18px] text-[#0f54c7]" strokeWidth={1.75} aria-hidden />
          </div>
          <Typography variant="body" weight="medium" className="text-sm leading-5 text-[#0f54c7]">
            {REVIEW_DETAILS_BOOKING_EMAIL_BANNER}
          </Typography>
        </div>

        <ReviewSectionCard>
          <SectionEditHeader
            title={REVIEW_DETAILS_PICKUP_SECTION_TITLE}
            onEdit={() => onEditStep(1)}
            disabled={isSubmitting}
          />
          <Separator className="bg-form-border" />
          <div className="flex flex-col gap-5">
            <ReviewFieldPair
              left={{
                label: REVIEW_SUBMIT_COMPANY_NAME_LABEL,
                value: requestorData.companyName ?? '',
              }}
              right={{
                label: REVIEW_SUBMIT_CONTACT_NUMBER_LABEL,
                value: requestorData.phone ?? '',
              }}
            />
            <ReviewFieldPair
              left={{
                label: REVIEW_DETAILS_CONTACT_NAME_LABEL,
                value: requestorData.contactName ?? '',
              }}
              right={{
                label: REVIEW_SUBMIT_EMAIL_LABEL,
                value: requestorData.email ?? '',
                valueClassName: 'underline decoration-solid underline-offset-2',
              }}
            />
            <ReviewFieldFull
              label={REVIEW_DETAILS_PICKUP_ADDRESS_LABEL}
              value={pickupAddressLine}
            />
          </div>
        </ReviewSectionCard>

        <ReviewSectionCard className="gap-[34px]">
          <div className="flex flex-col gap-6">
            <SectionEditHeader
              title={REVIEW_DETAILS_DELIVERY_STOPS_SECTION_TITLE}
              onEdit={() => onEditStep(2)}
              disabled={isSubmitting}
            />
            <Separator className="bg-form-border" />
          </div>

          {totalStops === 0 ? (
            <Typography variant="body" className="text-sm text-muted-foreground">
              {REVIEW_SUBMIT_NOT_PROVIDED}
            </Typography>
          ) : (
            <div className="flex flex-col gap-[34px]">
              {deliveryItems.map((item, stopIndex) => {
                const recipientName = [item.recipientFirstName, item.recipientLastName]
                  .filter(Boolean)
                  .join(' ');
                const pkgCount = item.packages?.length ?? 0;
                const pkgCountLabel =
                  pkgCount > 0 ? String(pkgCount).padStart(2, '0') : REVIEW_SUBMIT_NOT_PROVIDED;
                const postalStreet = formatPostalStreet(item);
                const deliveryPackage = item.deliveryPackage ?? '5day';
                const deliveryInstruction = item.deliveryInstruction ?? 'signature';
                const badgeKey = deliveryPackage as keyof typeof PACKAGE_BADGE_ICONS;
                const BadgeIcon = PACKAGE_BADGE_ICONS[badgeKey] ?? Clock;
                const badgeLabel = DELIVERY_PACKAGE_BADGE_LABEL[badgeKey] ?? 'STANDARD';
                const prefLabel =
                  DELIVERY_INSTRUCTION_REVIEW_LABEL[deliveryInstruction] ??
                  REVIEW_SUBMIT_NOT_PROVIDED;
                const clientNote = item.stopNotes?.trim();
                const open = isStopOpen(stopIndex);

                return (
                  <div
                    key={stopIndex}
                    className="flex flex-col overflow-hidden rounded-[10px] border border-form-border bg-[rgba(248,248,250,0.7)] px-5 pb-5 pt-3.5"
                  >
                    <div className="-mx-5 -mt-3.5 flex items-center justify-between border-b border-form-border-light bg-[#f6f6f7] px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span
                          className="size-5 shrink-0 rounded-full border-4 border-primary shadow-[0_0_0_4px_rgba(174,34,36,0.1)]"
                          aria-hidden
                        />
                        <Typography
                          variant="body"
                          weight="semibold"
                          className="truncate text-xl text-form-title"
                        >
                          {REVIEW_DETAILS_DELIVERY_STOP_PREFIX} {stopIndex + 1} of {totalStops}
                        </Typography>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-[30px] shrink-0 rounded-md border-form-border bg-white shadow-sm"
                        aria-expanded={open}
                        aria-label={open ? 'Collapse delivery stop' : 'Expand delivery stop'}
                        disabled={isSubmitting}
                        onClick={() => toggleStop(stopIndex)}
                      >
                        {open ? (
                          <ChevronUp className="size-4 text-form-subtitle" aria-hidden />
                        ) : (
                          <ChevronDown className="size-4 text-form-subtitle" aria-hidden />
                        )}
                      </Button>
                    </div>

                    {open ? (
                      <div className="flex flex-col gap-5 pt-5">
                        <ReviewFieldPair
                          left={{
                            label: REVIEW_DETAILS_RECIPIENT_NAME_LABEL,
                            value: recipientName,
                          }}
                          right={{
                            label: REVIEW_DETAILS_RECIPIENT_CONTACT_NUMBER_LABEL,
                            value: item.contactNumber?.trim() ?? '',
                          }}
                        />
                        <ReviewFieldPair
                          left={{
                            label: REVIEW_DETAILS_RECIPIENT_EMAIL_LABEL,
                            value: item.recipientEmail?.trim() ?? '',
                          }}
                          right={{
                            label: REVIEW_DETAILS_NO_OF_PACKAGES_LABEL,
                            value: pkgCountLabel,
                          }}
                        />
                        <ReviewFieldPair
                          left={{
                            label: REVIEW_DETAILS_POSTAL_CODE_LABEL,
                            value: item.postalCode?.trim() ?? '',
                          }}
                          right={{
                            label: REVIEW_DETAILS_POSTAL_ADDRESS_LABEL,
                            value: postalStreet,
                          }}
                        />

                        <div className="flex flex-wrap gap-3 sm:gap-4">
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <Typography
                              variant="caption"
                              weight="medium"
                              className="text-sm text-form-subtitle"
                            >
                              {REVIEW_DETAILS_DELIVERY_SERVICE_LABEL}
                            </Typography>
                            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-transparent bg-[rgba(17,24,39,0.08)] px-2.5 py-1">
                              <BadgeIcon className="size-3.5 shrink-0 text-gray-900" aria-hidden />
                              <Typography
                                variant="caption"
                                weight="semibold"
                                className="text-xs uppercase leading-4 tracking-normal text-gray-900"
                              >
                                {badgeLabel}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <Typography
                              variant="caption"
                              weight="medium"
                              className="text-sm text-form-subtitle"
                            >
                              {REVIEW_DETAILS_DELIVERY_PREFERENCE_LABEL}
                            </Typography>
                            <Typography
                              variant="body"
                              weight="medium"
                              className="text-base text-form-title"
                            >
                              {prefLabel}
                            </Typography>
                          </div>
                        </div>

                        {clientNote ? (
                          <ReviewFieldFull
                            label={REVIEW_DETAILS_CLIENT_NOTE_LABEL}
                            value={clientNote}
                          />
                        ) : null}

                        <div className="flex flex-col gap-4">
                          {(item.packages ?? []).map((pkg, pkgIndex) => (
                            <div
                              key={pkgIndex}
                              className="flex gap-5 rounded-xl border border-form-border bg-white p-[18px]"
                            >
                              <div className="flex size-[77px] shrink-0 items-center justify-center">
                                <PackageOpen
                                  className="size-14 text-form-subtitle"
                                  strokeWidth={1.25}
                                  aria-hidden
                                />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-4">
                                <Typography
                                  variant="body"
                                  weight="semibold"
                                  className="text-lg text-form-title"
                                >
                                  {REVIEW_DETAILS_PACKAGE_HEADING}{' '}
                                  {String(pkgIndex + 1).padStart(2, '0')}
                                </Typography>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div className="flex min-w-28 flex-col gap-2">
                                    <Typography
                                      variant="caption"
                                      weight="medium"
                                      className="text-sm text-form-subtitle"
                                    >
                                      {REVIEW_DETAILS_DECLARED_WEIGHT_LABEL}
                                    </Typography>
                                    <Typography
                                      variant="body"
                                      weight="medium"
                                      className="text-base text-form-title"
                                    >
                                      {formatWeightDisplay(pkg.weight ?? '')}
                                    </Typography>
                                  </div>
                                  <div className="flex min-w-28 flex-col gap-2">
                                    <Typography
                                      variant="caption"
                                      weight="medium"
                                      className="text-sm text-form-subtitle"
                                    >
                                      {REVIEW_DETAILS_DIMENSIONS_LABEL}
                                    </Typography>
                                    <Typography
                                      variant="body"
                                      weight="medium"
                                      className="text-base text-form-title"
                                    >
                                      {formatDimensions(pkg)}
                                    </Typography>
                                  </div>
                                  <div className="flex min-w-28 flex-col gap-2">
                                    <Typography
                                      variant="caption"
                                      weight="medium"
                                      className="text-sm text-form-subtitle"
                                    >
                                      {REVIEW_DETAILS_DECLARED_VALUE_LABEL}
                                    </Typography>
                                    <Typography
                                      variant="body"
                                      weight="medium"
                                      className="text-base text-form-title"
                                    >
                                      {formatDeclaredValueDisplay(pkg.declaredValue ?? '')}
                                    </Typography>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </ReviewSectionCard>
      </div>

      <PickupFormFooter
        onCancel={onCancel}
        onSaveDraft={onSaveDraft}
        onNext={onSubmit}
        onBack={onBack}
        nextLabel={footerNextLabel ?? PICKUP_FORM_FOOTER_SUBMIT_REQUEST_LABEL}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
