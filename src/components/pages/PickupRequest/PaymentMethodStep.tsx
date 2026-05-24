import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Repeat2, Info, ArrowRight } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { PaymentAlert } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import PickupFormFooter from '@/components/molecules/PickupFormFooter';
import { Separator } from '@/components/atoms/separator';
import ChangePaymentMethodModal, {
  type PaymentMethodKind,
} from '@/components/pages/PickupRequest/ChangePaymentMethodModal';
import { useOrganizationId } from '@/lib/organizationContext';
import {
  mapActivePaymentCards,
  resolveDefaultCardId,
  type SavedCardOption,
} from '@/lib/paymentCards';
import { cn } from '@/lib/utils';
import {
  PAY_COMPLETE_FORM_TITLE,
  PAY_COMPLETE_FORM_SUBTITLE,
  PAY_COMPLETE_CHANGE_PAYMENT_MODEL_LABEL,
  PAY_COMPLETE_PAYMENT_MODEL_CARD_HEADER,
  PAY_COMPLETE_PAYMENT_MODEL_FIELD_LABEL,
  PAY_COMPLETE_CARD_PAYMENT_BADGE,
  PAY_COMPLETE_BANK_TRANSFER_BADGE,
  PAY_COMPLETE_CREDIT_ACCOUNT_BADGE,
  PAY_COMPLETE_CASH_BADGE,
  PAY_COMPLETE_BILLING_SCHEDULE_LABEL,
  PAY_COMPLETE_BILLING_IMMEDIATE_VALUE,
  PAY_COMPLETE_BILLING_MONTHLY_VALUE,
  PAY_COMPLETE_CLIENT_CHARGE_INFO,
  PAY_COMPLETE_CHARGE_INFO_CASH,
  PAY_COMPLETE_SELECTED_CARD_LABEL,
  PAY_COMPLETE_CONFIRM_ORDER_BUTTON_LABEL,
  PAY_COMPLETE_PRICE_BREAKDOWN_TITLE,
  PAY_COMPLETE_STOP_LABEL_PREFIX,
  PAY_COMPLETE_TABLE_CHARGE_TYPE,
  PAY_COMPLETE_TABLE_CALCULATION,
  PAY_COMPLETE_TABLE_AMOUNT,
  PAY_COMPLETE_ROW_BASE_PRICE,
  PAY_COMPLETE_ROW_PACKAGES_TOTAL,
  PAY_COMPLETE_ROW_FIXED_DISCOUNT,
  PAY_COMPLETE_ROW_SUBTOTAL_EX_VAT,
  PAY_COMPLETE_ROW_GRAND_TOTAL,
  PAY_COMPLETE_DELIVERY_COST_LABEL,
  PAY_COMPLETE_VAT_LABEL,
  PAY_COMPLETE_TOTAL_COST_LABEL,
} from '@/lib/data';
import { toast } from 'sonner';
import { notifyApiError } from '@/lib/notify';
import { getErrorMessage } from '@/store/api/utils';
import {
  useGetOrganizationPaymentCardsQuery,
  useRequestCardPaymentNonceMutation,
} from '@/store/api/paymentsApi';
import {
  useGetCreditAccountOverviewQuery,
  useGetEffectiveServiceTiersForOrgQuery,
  useGetOrganizationPaymentDetailsQuery,
  useGetOrderPriceBreakdownMutation,
} from '@/store/api';
import { useAppSelector } from '@/store/hooks';
import { buildBreakdownStopsFromServer, type BreakdownStop } from '@/lib/paymentBreakdown';
import { buildDeliveryStops } from '@/lib/pickupOrderFlow';
import type { PackageDeliveryFormData } from '@/schemas/pickup.schema';
import type { PickupPaymentSelection } from '@/lib/pickupOrderFlow';

type PaymentMode = 'immediate' | 'monthly';

const PAYMENT_MODEL_BADGE: Record<PaymentMethodKind, string> = {
  card: PAY_COMPLETE_CARD_PAYMENT_BADGE,
  bank_transfer: PAY_COMPLETE_BANK_TRANSFER_BADGE,
  credit_account: PAY_COMPLETE_CREDIT_ACCOUNT_BADGE,
  cash: PAY_COMPLETE_CASH_BADGE,
};

const PAYMENT_MODEL_BADGE_TINT: Record<PaymentMethodKind, string> = {
  card: 'bg-violet-600',
  bank_transfer: 'bg-teal-700',
  credit_account: 'bg-blue-700',
  cash: 'bg-orange-600',
};

interface PaymentMethodStepProps {
  paymentMode?: PaymentMode;
  /** Step-2 delivery items. Used to compute the live price breakdown against the org's tiers. */
  packageDeliveryData?: PackageDeliveryFormData | null;
  onCancel: () => void;
  onSaveDraft: () => void;
  onConfirmPay: (selection: PickupPaymentSelection) => void;
  onBack?: () => void;
  /**
   * Surface the breakdown grand total to the page so save-as-draft from this step can
   * persist it on the draft (the drafts-list API returns it as the order's `total_amount`).
   */
  onBreakdownTotalChange?: (total: number | undefined) => void;
  /**
   * Pre-selection ids carried over from an edited draft. When `initialPaymentMethodId`
   * matches an `org_payment_methods` row we override the org-default seed to honour the
   * user's previous choice; `initialCreditCardId` is forwarded to the confirm payload so
   * the card the draft was saved with is the one charged.
   */
  initialPaymentMethodId?: string;
  initialCreditCardId?: string;
  isSubmitting?: boolean;
}

function formatGbp(value: number): string {
  return `£ ${value.toFixed(2)}`;
}

/** "5" → "5th", "1" → "1st", "22" → "22nd", with English ordinal suffix rules. */
function formatDayOfMonthLabel(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  const tail = day % 10;
  if (tail === 1) return `${day}st`;
  if (tail === 2) return `${day}nd`;
  if (tail === 3) return `${day}rd`;
  return `${day}th`;
}

/** Map the API `payment_model` enum value to the modal/step's FE kind union. */
function apiPaymentModelToKind(model: string | null | undefined): PaymentMethodKind | null {
  switch ((model ?? '').toUpperCase()) {
    case 'CARD':
      return 'card';
    case 'BANK_TRANSFER':
      return 'bank_transfer';
    case 'CREDIT_ACCOUNT':
      return 'credit_account';
    case 'CASH':
      return 'cash';
    default:
      return null;
  }
}

function ServiceTierBadge({
  tierName,
  tierColor,
}: {
  tierName: string;
  tierColor: string;
}): React.JSX.Element {
  return (
    <div
      className="inline-flex h-[23px] items-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
    >
      <span className="text-xs font-semibold uppercase leading-4">{tierName}</span>
    </div>
  );
}

function VisaIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex h-6 w-9 items-center justify-center rounded border border-gray-200 bg-white',
        className
      )}
    >
      <Typography variant="caption" weight="bold" className="text-xs text-blue-800">
        VISA
      </Typography>
    </div>
  );
}

function MastercardIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex h-6 w-9 items-center justify-center rounded border border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex">
        <div className="size-3 rounded-full bg-red-500 opacity-80" />
        <div className="-ml-1.5 size-3 rounded-full bg-yellow-500 opacity-80" />
      </div>
    </div>
  );
}

function CardIcon({ brand }: { brand: SavedCardOption['brand'] }): React.JSX.Element {
  if (brand === 'mastercard') return <MastercardIcon />;
  if (brand === 'visa') return <VisaIcon />;
  return (
    <div className="flex h-6 w-9 items-center justify-center rounded border border-gray-200 bg-white text-[10px] font-bold text-gray-700">
      CARD
    </div>
  );
}

function TableHeaderRow(): React.JSX.Element {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_6.5rem] border-b border-form-border bg-form-background">
      <div className="h-12" />
      <div className="flex h-12 items-center px-4">
        <Typography variant="caption" weight="medium" className="text-sm text-muted-foreground">
          {PAY_COMPLETE_TABLE_CHARGE_TYPE}
        </Typography>
      </div>
      <div className="flex h-12 items-center px-4">
        <Typography variant="caption" weight="medium" className="text-sm text-muted-foreground">
          {PAY_COMPLETE_TABLE_CALCULATION}
        </Typography>
      </div>
      <div className="flex h-12 items-center justify-end px-4">
        <Typography variant="caption" weight="medium" className="text-sm text-muted-foreground">
          {PAY_COMPLETE_TABLE_AMOUNT}
        </Typography>
      </div>
    </div>
  );
}

function PriceRow({
  leadToggle,
  chargeType,
  calculation,
  amount,
  amountClassName,
  rowClassName,
}: {
  leadToggle?: React.ReactNode;
  chargeType: string;
  calculation: string;
  amount: string;
  amountClassName?: string;
  /** Optional background class — used to tint per-package sub-rows. */
  rowClassName?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_6.5rem] border-b border-form-border',
        rowClassName
      )}
    >
      <div className="flex min-h-[52px] items-center justify-center px-1">{leadToggle}</div>
      <div className="flex min-h-[52px] items-center px-4">
        <Typography variant="body" weight="medium" className="truncate text-sm text-form-body">
          {chargeType}
        </Typography>
      </div>
      <div className="flex min-h-[52px] items-center px-4">
        <Typography variant="body" weight="medium" className="truncate text-sm text-form-subtitle">
          {calculation}
        </Typography>
      </div>
      <div className="flex min-h-[52px] items-center justify-end px-4">
        <Typography
          variant="body"
          weight="medium"
          className={cn('text-right text-sm text-form-title', amountClassName)}
        >
          {amount}
        </Typography>
      </div>
    </div>
  );
}

function StopPriceCard({
  stop,
  stopIndex,
  expanded,
  packagesExpanded,
  onToggleStop,
  onTogglePackages,
}: {
  stop: BreakdownStop;
  stopIndex: number;
  expanded: boolean;
  packagesExpanded: boolean;
  onToggleStop: () => void;
  onTogglePackages: () => void;
}): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-form-border bg-white">
      <div className="relative flex h-[50px] items-start gap-2.5 border-b border-form-border-light bg-form-surface px-5 pt-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-5 shrink-0 rounded border-form-border bg-white p-0 shadow-sm"
            onClick={onToggleStop}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse stop pricing' : 'Expand stop pricing'}
          >
            {expanded ? (
              <ChevronUp className="size-4 text-form-subtitle" aria-hidden />
            ) : (
              <ChevronDown className="size-4 text-form-subtitle" aria-hidden />
            )}
          </Button>
          <Typography
            variant="body"
            weight="medium"
            className="truncate text-base tracking-wide text-form-title"
          >
            {PAY_COMPLETE_STOP_LABEL_PREFIX}
            {stopIndex + 1}
          </Typography>
        </div>
        <div className="shrink-0 pt-0.5">
          <ServiceTierBadge tierName={stop.tierName} tierColor={stop.tierColor} />
        </div>
      </div>

      {expanded && (
        <div className="relative flex flex-col">
          <TableHeaderRow />

          <PriceRow
            chargeType={PAY_COMPLETE_ROW_BASE_PRICE}
            calculation={stop.baseCalc}
            amount={formatGbp(stop.baseAmount)}
          />

          <PriceRow
            leadToggle={
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded border border-transparent text-form-subtitle hover:bg-muted/60"
                onClick={onTogglePackages}
                aria-expanded={packagesExpanded}
                aria-label={packagesExpanded ? 'Collapse package lines' : 'Expand package lines'}
              >
                {packagesExpanded ? (
                  <ChevronUp className="size-4" aria-hidden />
                ) : (
                  <ChevronDown className="size-4" aria-hidden />
                )}
              </button>
            }
            chargeType={PAY_COMPLETE_ROW_PACKAGES_TOTAL}
            calculation={stop.packageFeeCalc}
            amount={formatGbp(stop.packageFeeAmount)}
          />

          {packagesExpanded &&
            stop.packageLines.map((pkg, i) => (
              <React.Fragment key={i}>
                <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_6.5rem] border-b border-form-border-light bg-[#D8D8DF]">
                  <div />
                  <div className="flex items-center px-4 py-1.5">
                    <Typography
                      variant="caption"
                      weight="semibold"
                      className="text-[11px] uppercase tracking-wide text-form-subtitle"
                    >
                      {pkg.label}
                    </Typography>
                  </div>
                  <div />
                  <div />
                </div>
                <PriceRow
                  chargeType="Price per Package"
                  calculation={pkg.perPackageCalc}
                  amount={formatGbp(pkg.perPackageAmount)}
                  rowClassName="bg-[#F6F6F9]"
                />
                <PriceRow
                  chargeType="Package Weight Price"
                  calculation={pkg.weightCalc}
                  amount={formatGbp(pkg.weightAmount)}
                  rowClassName="bg-[#F6F6F9]"
                />
                <PriceRow
                  chargeType="Total Package price"
                  calculation={pkg.totalCalc}
                  amount={formatGbp(pkg.totalAmount)}
                  rowClassName="bg-[#F6F6F9]"
                />
              </React.Fragment>
            ))}

          {stop.discounts.length === 0 ? (
            <PriceRow chargeType={PAY_COMPLETE_ROW_FIXED_DISCOUNT} calculation="—" amount="—" />
          ) : (
            stop.discounts.map((d, i) => (
              <PriceRow
                key={`${d.kind}-${i}`}
                chargeType={d.label}
                calculation={d.calculation}
                amount={`-${formatGbp(d.amount)}`}
                // `!` prefix wins against the row's default `text-form-title` — that's a
                // custom theme token twMerge doesn't dedupe against `text-emerald-600`.
                amountClassName="font-semibold !text-emerald-600"
              />
            ))
          )}

          <PriceRow
            chargeType={PAY_COMPLETE_ROW_SUBTOTAL_EX_VAT}
            calculation="—"
            amount={formatGbp(stop.subtotalExVat)}
          />

          <PriceRow chargeType={stop.vatLabel} calculation="—" amount={formatGbp(stop.vatAmount)} />

          <PriceRow
            chargeType={PAY_COMPLETE_ROW_GRAND_TOTAL}
            calculation="—"
            amount={formatGbp(stop.grandTotal)}
            amountClassName="font-semibold"
          />
        </div>
      )}
    </div>
  );
}

export default function PaymentMethodStep({
  paymentMode = 'immediate',
  packageDeliveryData,
  onCancel,
  onSaveDraft,
  onConfirmPay,
  onBack,
  onBreakdownTotalChange,
  initialPaymentMethodId,
  initialCreditCardId,
  isSubmitting = false,
}: PaymentMethodStepProps): React.JSX.Element {
  // Server-authoritative price breakdown via POST /orders/price-breakdown.
  // The wizard's step-2 form data is mapped to the same DTO `createOrder` uses, then sent
  // to the backend which returns per-stop pricing (base + per-package + weight + discounts + VAT).
  const breakdownOrgId = useAppSelector((state) => state.auth.user?.organization_id ?? '');
  const { data: tiersResponse } = useGetEffectiveServiceTiersForOrgQuery(breakdownOrgId, {
    skip: !breakdownOrgId,
  });
  const [fetchPriceBreakdown, { data: priceBreakdownResult, isLoading: isBreakdownLoading }] =
    useGetOrderPriceBreakdownMutation();
  /**
   * Tracks the JSON-stringified payload we last sent. React 18's StrictMode mounts effects
   * twice in dev, and the parent stepper re-renders whenever any sibling field changes — both
   * would otherwise re-POST the same breakdown. We compare keys instead of object references
   * so we only hit the server when the actual delivery stops / org changed.
   */
  const lastBreakdownKey = useRef<string | null>(null);

  useEffect(() => {
    if (!breakdownOrgId) return;
    const tiers = tiersResponse?.data.items ?? [];
    const tierNameById = new Map(tiers.map((t) => [t.id, t.tier_name]));
    const deliveryStops = buildDeliveryStops(packageDeliveryData ?? null, (tierId) =>
      tierNameById.get(tierId)
    );
    if (deliveryStops.length === 0) return;
    // Only price stops that have a tier selected; otherwise the server rejects them.
    const allHaveTier = deliveryStops.every((s) => s.service_tier_id || s.service_tier_name);
    if (!allHaveTier) return;
    const payload = {
      client_type: 'B2B' as const,
      organization_id: breakdownOrgId,
      delivery_stops: deliveryStops,
    };
    const key = JSON.stringify(payload);
    if (key === lastBreakdownKey.current) return;
    lastBreakdownKey.current = key;
    void fetchPriceBreakdown(payload);
  }, [breakdownOrgId, packageDeliveryData, fetchPriceBreakdown, tiersResponse]);

  const breakdownStops = useMemo<BreakdownStop[]>(() => {
    const tiers = tiersResponse?.data.items ?? [];
    return buildBreakdownStopsFromServer(priceBreakdownResult?.data, tiers);
  }, [priceBreakdownResult, tiersResponse]);

  const breakdownTotals = useMemo(() => {
    const detail = priceBreakdownResult?.data?.breakdown;
    if (!detail) {
      return { subtotalExVat: 0, vat: 0, grandTotal: 0 };
    }
    return {
      subtotalExVat: Number(detail.subtotal) || 0,
      vat: Number(detail.vat_amount) || 0,
      grandTotal: Number(detail.total) || 0,
    };
  }, [priceBreakdownResult]);

  // Lift the grand total to the page so save-as-draft can persist it on the draft.
  useEffect(() => {
    onBreakdownTotalChange?.(
      breakdownTotals.grandTotal > 0 ? breakdownTotals.grandTotal : undefined
    );
  }, [breakdownTotals.grandTotal, onBreakdownTotalChange]);

  // Read org payment configuration from /organizations/{org_id}/payment-details
  // so the modal lists only methods the org has set up + flags the API-default one.
  const { data: orgPaymentDetails } = useGetOrganizationPaymentDetailsQuery(
    { organizationId: breakdownOrgId },
    { skip: !breakdownOrgId }
  );
  const orgPaymentMethods = useMemo(
    () => orgPaymentDetails?.data?.payment_methods ?? [],
    [orgPaymentDetails]
  );

  const configuredKinds = useMemo<PaymentMethodKind[]>(() => {
    const out: PaymentMethodKind[] = [];
    const seen = new Set<PaymentMethodKind>();
    for (const method of orgPaymentMethods) {
      const kind = apiPaymentModelToKind(method.payment_model);
      if (kind && !seen.has(kind)) {
        seen.add(kind);
        out.push(kind);
      }
    }
    return out;
  }, [orgPaymentMethods]);

  const defaultKind = useMemo<PaymentMethodKind | undefined>(() => {
    const flagged = orgPaymentMethods.find((m) => m.is_default);
    return flagged ? (apiPaymentModelToKind(flagged.payment_model) ?? undefined) : undefined;
  }, [orgPaymentMethods]);

  // Selected payment method is *derived* state rather than a useState seeded by an
  // effect: the page's draft hydration is asynchronous, so any seed-once flag races
  // against the late arrival of `initialPaymentMethodId`. By computing the kind from
  // its inputs every render we always land on the right value once both org methods
  // and (for draft edit) the saved id are available. User overrides via the Change
  // Payment Method modal live in `userSelectedKind` and take precedence over the seed.
  const [userSelectedKind, setUserSelectedKind] = useState<PaymentMethodKind | undefined>(
    undefined
  );
  const paymentMethodKind = useMemo<PaymentMethodKind>(() => {
    if (userSelectedKind) return userSelectedKind;
    if (initialPaymentMethodId && orgPaymentMethods.length > 0) {
      const fromDraft = orgPaymentMethods.find((m) => m.id === initialPaymentMethodId);
      const fromDraftKind = fromDraft ? apiPaymentModelToKind(fromDraft.payment_model) : null;
      if (fromDraftKind) return fromDraftKind;
    }
    return (
      defaultKind ?? configuredKinds[0] ?? (paymentMode === 'monthly' ? 'bank_transfer' : 'card')
    );
  }, [
    userSelectedKind,
    initialPaymentMethodId,
    orgPaymentMethods,
    defaultKind,
    configuredKinds,
    paymentMode,
  ]);
  const setPaymentMethodKind = setUserSelectedKind;

  const [paymentModelModalOpen, setPaymentModelModalOpen] = useState(false);
  // No user-selectable card — the client portal locks to the org's default card.
  const selectedCardId = '';
  const organizationId = useOrganizationId();
  const {
    data: paymentCards,
    isFetching: isCardsFetching,
    isLoading: isCardsLoading,
    isError: isCardsError,
    error: cardsError,
    refetch: refetchCards,
  } = useGetOrganizationPaymentCardsQuery(organizationId ?? '', {
    skip: !organizationId || paymentMethodKind !== 'card',
  });
  const [requestCardPaymentNonce, { isLoading: isPreparingNonce }] =
    useRequestCardPaymentNonceMutation();

  const savedCards = useMemo(() => mapActivePaymentCards(paymentCards), [paymentCards]);

  const effectiveSelectedCardId = useMemo(() => {
    // When the user is editing a draft and the draft's saved card is still in the org's
    // active list, honour that choice; otherwise fall back to the org default.
    if (initialCreditCardId && savedCards.some((c) => c.id === initialCreditCardId)) {
      return initialCreditCardId;
    }
    return resolveDefaultCardId(savedCards, selectedCardId);
  }, [savedCards, selectedCardId, initialCreditCardId]);

  // Dedicated credit-account snapshot for the overview card + the available-credit gate.
  // Only fetched when the user has actually selected credit account, so orgs without one
  // don't get a 404 toast just by landing on the step.
  const {
    data: creditOverviewResponse,
    error: creditOverviewError,
    isFetching: isCreditOverviewFetching,
  } = useGetCreditAccountOverviewQuery(
    { organizationId: breakdownOrgId },
    { skip: !breakdownOrgId || paymentMethodKind !== 'credit_account' }
  );
  const creditAccountOverview = creditOverviewResponse?.data;
  /** Number-coerced available credit for the affordability check on Confirm. */
  const creditAvailableNumber = Number(creditAccountOverview?.available_credit ?? 0);
  const creditAccountMissing =
    paymentMethodKind === 'credit_account' &&
    !isCreditOverviewFetching &&
    Boolean(creditOverviewError);

  // Per-method availability: mirrors the admin portal's logic so the user sees the same
  // gating + red error banner when their selected method is blocked by overdue payments,
  // missing card, etc.
  const paymentDetails = orgPaymentDetails?.data;
  const paymentAvailability = useMemo(() => {
    const outstanding = Number(paymentDetails?.unpaid_invoices_amount ?? 0);
    const overdue = Number(paymentDetails?.overdue_amount ?? 0);
    const hasOverdueBlock = overdue > 0 || outstanding > 0;
    const configuredSet = new Set(configuredKinds);
    const hasCards = savedCards.length > 0;
    const grandTotal = breakdownTotals.grandTotal;

    const creditAccountState = (() => {
      if (!configuredSet.has('credit_account')) {
        return {
          available: false,
          reason: 'Credit account is not configured for this organization.',
        };
      }
      if (creditOverviewError) {
        return {
          available: false,
          reason:
            'No credit account is set up for this organization yet. Contact support to configure one or pick another payment method.',
        };
      }
      if (!creditAccountOverview) {
        // Still loading — treat as available to avoid a flash of red.
        return { available: true, reason: '' };
      }
      if (creditAccountOverview.status !== 'ACTIVE') {
        return {
          available: false,
          reason: `Credit account is currently ${creditAccountOverview.status.replace(/_/g, ' ').toLowerCase()}. Resolve the account status before paying on credit.`,
        };
      }
      if (hasOverdueBlock) {
        return {
          available: false,
          reason:
            'Payment unavailable. Your credit account has exceeded its limits or has overdue invoices. Please clear outstanding dues or contact support.',
        };
      }
      if (grandTotal > 0 && grandTotal > creditAvailableNumber) {
        return {
          available: false,
          reason: `Order total £${grandTotal.toFixed(2)} exceeds your available credit of £${creditAvailableNumber.toFixed(2)}. Pick another payment method or contact support.`,
        };
      }
      return { available: true, reason: '' };
    })();

    return {
      card: configuredSet.has('card')
        ? hasCards
          ? { available: true, reason: '' }
          : {
              available: false,
              reason:
                'Card payment is currently unavailable. Please check your card details, ensure sufficient funds, or use a different payment method.',
            }
        : { available: false, reason: 'Card payment is not configured for this organization.' },
      bank_transfer: configuredSet.has('bank_transfer')
        ? hasOverdueBlock
          ? {
              available: false,
              reason:
                'Bank transfer unavailable due to outstanding payments or failed transfer limits. Please resolve pending issues or select another payment method.',
            }
          : { available: true, reason: '' }
        : { available: false, reason: 'Bank transfer is not configured for this organization.' },
      credit_account: creditAccountState,
      cash: configuredSet.has('cash')
        ? hasOverdueBlock
          ? {
              available: false,
              reason:
                'Cash payment is unavailable due to account restrictions or outstanding balances. Please resolve pending issues or select another payment method.',
            }
          : { available: true, reason: '' }
        : { available: false, reason: 'Cash payment is not configured for this organization.' },
    } as const;
  }, [
    configuredKinds,
    savedCards.length,
    paymentDetails?.overdue_amount,
    paymentDetails?.unpaid_invoices_amount,
    breakdownTotals.grandTotal,
    creditAccountOverview,
    creditAvailableNumber,
    creditOverviewError,
  ]);
  const selectedAvailability = paymentAvailability[paymentMethodKind];

  // Track explicit expand/collapse overrides. Defaults are computed at render: first stop open,
  // packages within a stop open.
  const [stopExpanded, setStopExpanded] = useState<Record<number, boolean>>({});
  const [packagesExpanded, setPackagesExpanded] = useState<Record<number, boolean>>({});

  const billingMode: PaymentMode = paymentMethodKind === 'bank_transfer' ? 'monthly' : 'immediate';

  const hasCards = savedCards.length > 0;
  const cardsLoading = isCardsLoading || isCardsFetching;
  // Default first stop expanded; explicit user toggles override.
  const isStopOpen = useCallback((i: number) => stopExpanded[i] ?? i === 0, [stopExpanded]);
  const isPackagesOpen = useCallback(
    (i: number) => packagesExpanded[i] ?? true,
    [packagesExpanded]
  );

  const toggleStop = useCallback(
    (i: number): void => {
      setStopExpanded((m) => ({ ...m, [i]: !isStopOpen(i) }));
    },
    [isStopOpen]
  );

  const togglePackages = useCallback(
    (i: number): void => {
      setPackagesExpanded((m) => ({ ...m, [i]: !isPackagesOpen(i) }));
    },
    [isPackagesOpen]
  );

  const handleConfirm = useCallback((): void => {
    void (async () => {
      if (!selectedAvailability.available) {
        toast.error(selectedAvailability.reason);
        return;
      }
      // The BE expects `payment_method_id` to be the UUID of the org's configured
      // payment method row — not the kind/enum. Resolve it once for both branches.
      const apiKey =
        paymentMethodKind === 'card'
          ? 'CARD'
          : paymentMethodKind === 'bank_transfer'
            ? 'BANK_TRANSFER'
            : paymentMethodKind === 'credit_account'
              ? 'CREDIT_ACCOUNT'
              : 'CASH';
      const matchingMethod = orgPaymentMethods.find(
        (m) => (m.payment_model ?? '').toUpperCase() === apiKey
      );
      const paymentMethodConfigId = matchingMethod?.id;

      if (paymentMethodKind === 'card') {
        if (!organizationId) {
          toast.error('Organization context is missing. Please sign in again.');
          return;
        }
        if (!effectiveSelectedCardId) {
          toast.error('Please select a saved card before confirming.');
          return;
        }
        if (!paymentMethodConfigId) {
          toast.error('Card payment method is not configured. Pick another method.');
          return;
        }
        try {
          const nonceResponse = await requestCardPaymentNonce({
            organizationId,
            cardId: effectiveSelectedCardId,
          }).unwrap();
          onConfirmPay({
            method: 'card',
            methodId: paymentMethodConfigId,
            cardId: effectiveSelectedCardId,
            nonce: nonceResponse.nonce,
          });
          return;
        } catch (error) {
          notifyApiError(error);
          return;
        }
      }

      if (!paymentMethodConfigId) {
        toast.error('Selected payment method is not configured for this organization.');
        return;
      }
      onConfirmPay({
        method: paymentMethodKind,
        methodId: paymentMethodConfigId,
      });
    })();
  }, [
    effectiveSelectedCardId,
    onConfirmPay,
    organizationId,
    orgPaymentMethods,
    paymentMethodKind,
    requestCardPaymentNonce,
    selectedAvailability,
  ]);

  const paymentModelBadge = PAYMENT_MODEL_BADGE[paymentMethodKind];
  const paymentModelBadgeTint = PAYMENT_MODEL_BADGE_TINT[paymentMethodKind];

  // Resolve the schedule string from the org's actual configured method
  // (e.g. "5th of Every Month", "Net 14 (14 days after Invoice date)") instead of the
  // generic "Immediate / Monthly" labels.
  const selectedMethodConfig = useMemo(() => {
    const apiKey = paymentMethodKind.toUpperCase();
    return orgPaymentMethods.find((m) => (m.payment_model ?? '').toUpperCase() === apiKey);
  }, [orgPaymentMethods, paymentMethodKind]);

  const billingScheduleValue = useMemo(() => {
    if (!selectedMethodConfig) {
      return billingMode === 'immediate'
        ? PAY_COMPLETE_BILLING_IMMEDIATE_VALUE
        : PAY_COMPLETE_BILLING_MONTHLY_VALUE;
    }
    const schedule = (selectedMethodConfig.billing_schedule ?? '').toUpperCase();
    if (schedule === 'IMMEDIATE') return PAY_COMPLETE_BILLING_IMMEDIATE_VALUE;
    if (schedule === 'FIXED_MONTHLY_DATE') {
      const day = selectedMethodConfig.billing_day_of_month ?? 1;
      return `${formatDayOfMonthLabel(day)} of Every Month`;
    }
    if (schedule === 'DAYS_AFTER_ORDER') {
      const daysAfter = selectedMethodConfig.billing_days_after_order ?? 30;
      return `Net ${daysAfter} (${daysAfter} days after Invoice date)`;
    }
    return billingMode === 'immediate'
      ? PAY_COMPLETE_BILLING_IMMEDIATE_VALUE
      : PAY_COMPLETE_BILLING_MONTHLY_VALUE;
  }, [selectedMethodConfig, billingMode]);

  const chargeInfoText = useMemo(() => {
    if (paymentMethodKind === 'card') return PAY_COMPLETE_CLIENT_CHARGE_INFO;
    if (paymentMethodKind === 'cash') return PAY_COMPLETE_CHARGE_INFO_CASH;
    // For bank transfer / credit account, weave the actual billing schedule into the message
    // (e.g. "Client will be charged on the 5th of Every Month.") instead of a generic
    // "configured billing date" placeholder.
    const schedule = (selectedMethodConfig?.billing_schedule ?? '').toUpperCase();
    if (schedule === 'IMMEDIATE') {
      return paymentMethodKind === 'credit_account'
        ? 'Client credit account will be charged immediately upon submission.'
        : 'Client will be charged immediately upon submission.';
    }
    return `Client will be charged on the ${billingScheduleValue}.`;
  }, [paymentMethodKind, selectedMethodConfig, billingScheduleValue]);

  const showBottomAlert = !hasCards;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 max-w-[443px] flex-col gap-2.5">
            <Typography variant="h4" weight="medium" className="text-xl text-form-title">
              {PAY_COMPLETE_FORM_TITLE}
            </Typography>
            <Typography variant="body" className="text-sm leading-5 text-muted-foreground">
              {PAY_COMPLETE_FORM_SUBTITLE}
            </Typography>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 gap-2 border-[#5d5567] px-3.5 text-sm font-medium shadow-sm"
            onClick={() => setPaymentModelModalOpen(true)}
            disabled={isSubmitting}
          >
            <Repeat2 className="size-4 shrink-0" aria-hidden />
            {PAY_COMPLETE_CHANGE_PAYMENT_MODEL_LABEL}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-form-border-light bg-white px-5 pb-6 pt-4 shadow-sm">
        <div className="relative -mx-5 -mt-4 mb-4 border-b border-form-border-light bg-form-surface px-5 py-3">
          <Typography
            variant="body"
            weight="medium"
            className="text-base uppercase tracking-wide text-form-title"
          >
            {PAY_COMPLETE_PAYMENT_MODEL_CARD_HEADER}
          </Typography>
        </div>
        <Separator className="mb-4 bg-form-border-light" />
        <div className="flex flex-wrap gap-x-16 gap-y-4">
          <div className="flex min-w-[140px] flex-col gap-2">
            <Typography variant="caption" weight="medium" className="text-sm text-form-subtitle">
              {PAY_COMPLETE_PAYMENT_MODEL_FIELD_LABEL}
            </Typography>
            <div
              className={cn(
                'inline-flex w-fit rounded-full border border-transparent px-2.5 py-0.5',
                paymentModelBadgeTint
              )}
            >
              <Typography variant="caption" weight="semibold" className="text-xs text-white">
                {paymentModelBadge}
              </Typography>
            </div>
          </div>
          <div className="flex min-w-[140px] flex-col gap-2">
            <Typography variant="caption" weight="medium" className="text-sm text-form-subtitle">
              {PAY_COMPLETE_BILLING_SCHEDULE_LABEL}
            </Typography>
            <Typography variant="body" weight="medium" className="text-base text-form-title">
              {billingScheduleValue}
            </Typography>
          </div>
        </div>
      </div>

      {selectedAvailability.available ? (
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
            {chargeInfoText}
          </Typography>
        </div>
      ) : (
        <div
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-2"
          role="alert"
        >
          <Info className="size-4 shrink-0 text-red-500" strokeWidth={1.75} aria-hidden />
          <Typography variant="body" weight="medium" className="text-sm leading-5 text-red-700">
            {selectedAvailability.reason}
          </Typography>
        </div>
      )}

      {paymentMethodKind === 'credit_account' && !creditAccountMissing && creditAccountOverview ? (
        <div className="overflow-hidden rounded-xl border border-form-border-light bg-white p-4 shadow-sm">
          <Typography variant="body" weight="semibold" className="text-sm text-form-title">
            Credit Account Overview
          </Typography>
          <Separator className="my-3 bg-form-border-light" />
          {(() => {
            const limit = Number(creditAccountOverview.credit_limit ?? 0);
            const used = Number(creditAccountOverview.outstanding_balance ?? 0);
            const available = Number(creditAccountOverview.available_credit ?? 0);
            const pct = Math.min(
              100,
              Math.round(Number(creditAccountOverview.credit_limit_used_percent ?? 0))
            );
            return (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Credit Limit
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-base text-form-title"
                    >
                      £ {limit.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Current Outstanding Balance
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-base text-form-title"
                    >
                      £ {used.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Available Credit
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-base text-form-title"
                    >
                      £ {available.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Typography variant="caption" className="shrink-0 text-xs text-form-subtitle">
                    Credit limit used
                  </Typography>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#E4E4E7]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <Typography
                    variant="caption"
                    weight="semibold"
                    className="shrink-0 text-xs text-form-title"
                  >
                    {pct}%
                  </Typography>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {paymentMethodKind === 'card' ? (
        <>
          {isCardsError ? (
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3">
              <Typography variant="body" className="text-sm text-red-700">
                {getErrorMessage(cardsError)}
              </Typography>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void refetchCards()}
                disabled={isSubmitting}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {cardsLoading ? (
            <Typography variant="body" className="text-sm text-muted-foreground">
              Loading saved cards…
            </Typography>
          ) : null}

          {!cardsLoading && hasCards
            ? (() => {
                const defaultCard =
                  savedCards.find((c) => c.id === effectiveSelectedCardId) ??
                  savedCards.find((c) => c.isDefault) ??
                  savedCards[0];
                if (!defaultCard) return null;
                return (
                  <div className="flex w-full flex-col gap-2">
                    <Typography
                      variant="label"
                      className="text-sm font-medium leading-none text-form-title"
                    >
                      {PAY_COMPLETE_SELECTED_CARD_LABEL}
                    </Typography>
                    <div className="flex h-12 w-full items-center gap-3 rounded-md border border-[#e4e4e7] bg-[#f8f8fa] px-3">
                      <CardIcon brand={defaultCard.brand} />
                      <Typography
                        variant="body"
                        className="min-w-0 flex-1 truncate text-left text-sm text-form-title"
                      >
                        {defaultCard.label} •••• {defaultCard.lastFour}
                      </Typography>
                      {defaultCard.isDefault ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                          Default
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })()
            : null}

          {!cardsLoading && !hasCards && !isCardsError ? (
            <div className="flex w-full flex-col gap-2">
              <Typography
                variant="label"
                className="text-sm font-medium leading-none text-form-title"
              >
                {PAY_COMPLETE_SELECTED_CARD_LABEL}
              </Typography>
              <div className="flex h-12 w-full items-center rounded-md border border-[#e4e4e7] bg-[#f8f8fa] px-3 text-sm text-muted-foreground">
                Select saved card
              </div>
              <Typography variant="caption" className="text-xs text-[#C26200]">
                No saved cards found for this organization.
              </Typography>
            </div>
          ) : null}
        </>
      ) : null}

      {paymentMethodKind === 'bank_transfer'
        ? (() => {
            const bankMethod = orgPaymentMethods.find((m) => m.payment_model === 'BANK_TRANSFER');
            if (!bankMethod) return null;
            return (
              <div className="overflow-hidden rounded-xl border border-form-border-light bg-white p-4 shadow-sm">
                <Typography variant="body" weight="semibold" className="text-sm text-form-title">
                  Company Billing Information
                </Typography>
                <Separator className="my-3 bg-form-border-light" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Account Name
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-sm text-form-title"
                    >
                      {bankMethod.bank_account_name || '—'}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Bank Account Number
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-sm text-form-title"
                    >
                      {bankMethod.bank_account_number || '—'}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography variant="caption" className="text-xs text-form-subtitle">
                      Sort code
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-sm text-form-title"
                    >
                      {bankMethod.bank_sort_code || '—'}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })()
        : null}

      <div className="flex flex-col gap-5">
        <Typography
          variant="body"
          weight="medium"
          className="text-base uppercase tracking-wide text-form-title"
        >
          {PAY_COMPLETE_PRICE_BREAKDOWN_TITLE}
        </Typography>
        <div className="flex flex-col gap-5">
          {isBreakdownLoading ? (
            <div className="rounded-xl border border-form-border bg-white p-6 text-center text-sm text-muted-foreground">
              Calculating price breakdown…
            </div>
          ) : breakdownStops.length === 0 ? (
            <div className="rounded-xl border border-form-border bg-white p-6 text-center text-sm text-muted-foreground">
              No price breakdown to show yet.
            </div>
          ) : (
            breakdownStops.map((stop, i) => (
              <StopPriceCard
                key={i}
                stop={stop}
                stopIndex={i}
                expanded={isStopOpen(i)}
                packagesExpanded={isPackagesOpen(i)}
                onToggleStop={() => toggleStop(i)}
                onTogglePackages={() => togglePackages(i)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 border-t border-form-border-light pt-2">
        <div className="flex items-center justify-between gap-4">
          <Typography variant="body" weight="medium" className="text-base text-form-body">
            {PAY_COMPLETE_DELIVERY_COST_LABEL}
          </Typography>
          <Typography variant="body" weight="semibold" className="text-base text-form-body">
            {formatGbp(breakdownTotals.subtotalExVat)}
          </Typography>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Typography variant="body" weight="medium" className="text-base text-form-body">
            {PAY_COMPLETE_VAT_LABEL}
          </Typography>
          <Typography variant="body" weight="semibold" className="text-base text-form-body">
            {formatGbp(breakdownTotals.vat)}
          </Typography>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Typography variant="body" weight="medium" className="text-lg text-form-title">
            {PAY_COMPLETE_TOTAL_COST_LABEL}
          </Typography>
          <Typography variant="body" weight="semibold" className="text-lg text-form-title">
            {formatGbp(breakdownTotals.grandTotal)}
          </Typography>
        </div>
      </div>

      {showBottomAlert && (
        <PaymentAlert
          variant={hasCards ? billingMode : 'required'}
          className="rounded-lg border border-blue-200/60"
        />
      )}

      <PickupFormFooter
        onCancel={onCancel}
        onSaveDraft={onSaveDraft}
        onNext={handleConfirm}
        onBack={onBack}
        nextLabel={PAY_COMPLETE_CONFIRM_ORDER_BUTTON_LABEL}
        nextIcon={<ArrowRight className="ml-2 size-4 shrink-0" aria-hidden />}
        isSubmitting={isSubmitting || isPreparingNonce}
      />

      <ChangePaymentMethodModal
        open={paymentModelModalOpen}
        onOpenChange={setPaymentModelModalOpen}
        value={paymentMethodKind}
        allowedKinds={configuredKinds}
        defaultKind={defaultKind}
        onConfirm={setPaymentMethodKind}
      />
    </div>
  );
}
