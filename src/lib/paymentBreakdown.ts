/**
 * Pure helpers that turn the wizard's step-2 delivery items + live service tiers
 * into the price breakdown shape rendered by Step 4 (Payment Method).
 *
 * Mirrors the per-stop row model in the admin portal's `PricingPaymentStep`:
 *   Base price                                     = tier.base_price
 *   Packages Total Price (perPackage × n)          = packageFeeAmount
 *   Per-package row: Weight × perKg (each pkg)     = packageWeightAmount
 *   Subtotal (excl. VAT) = base + packageFee + Σ weightCost − discount
 *   VAT (20%)            = subtotal × 0.20
 *   Grand Total          = subtotal + vat
 */
import type { DeliveryItemFormData } from '@/schemas/pickup.schema';
import type {
  OrderPriceBreakdownResponseDto,
  OrderPriceBreakdownStopDto,
  ServiceTier,
} from '@/store/api';

/**
 * Per-package detail rendered as three rows under a "PACKAGE NN" header:
 *   Price per Package    Standard → £5      £5
 *   Package Weight Price 12kg × £2          £24
 *   Total Package price  £5 + £24           £29
 */
export interface BreakdownPackageLine {
  /** UI label e.g. "PACKAGE 01" */
  label: string;
  /** "Standard → £5" — tier name + the tier's per-package fee. */
  perPackageCalc: string;
  perPackageAmount: number;
  /** "12kg × £2" — declared weight × tier.price_per_kg. */
  weightCalc: string;
  weightAmount: number;
  /** "£5 + £24" — sum of the two rows above. */
  totalCalc: string;
  totalAmount: number;
}

/** One discount row under the per-stop pricing table. */
export interface BreakdownDiscountLine {
  /** Server discount type — drives the row label and amount-prefix. */
  kind: 'FIXED_PER_BOOKING' | 'PERCENTAGE' | 'VOLUME_TIERED';
  /** UI label e.g. "Fixed Discount", "Percentage Discount", "Volume Discount". */
  label: string;
  /** "Standard → £10" or "Standard → 10%". */
  calculation: string;
  /** Positive amount; the renderer formats it with a leading "-". */
  amount: number;
}

export interface BreakdownStop {
  /** Tier id (UUID) or empty string when not resolved. */
  tierId: string;
  /** Display name e.g. "STANDARD" — used for the badge label. */
  tierName: string;
  /** Tier hex color used to tint the badge (`${color}20` bg + `color` text). */
  tierColor: string;
  /** Base price calc fields */
  baseCalc: string;
  baseAmount: number;
  /**
   * Aggregate "Packages Total Price" row: sum of per-package totals.
   * `packageFeeCalc` shows "£a + £b + … + £z" so the user can see the contribution
   * of each package without expanding the per-package detail.
   */
  packageFeeCalc: string;
  packageFeeAmount: number;
  /** Per-package detail rows shown when the Packages Total Price row is expanded. */
  packageLines: BreakdownPackageLine[];
  /** All discounts applied to this stop (empty when none apply). */
  discounts: BreakdownDiscountLine[];
  /** base + Σ package_totals − Σ discounts */
  subtotalExVat: number;
  vatLabel: string;
  vatAmount: number;
  grandTotal: number;
}

const VAT_PCT = 0.2;

function toNumber(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[£,\s]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Render "£a + £b + … + £z" for a list of per-package totals. We collapse the
 * middle when there are more than four packages to keep the row width sane.
 */
function buildPackageSumCalc(totals: number[]): string {
  if (totals.length === 0) return '—';
  if (totals.length <= 4) {
    return totals.map((t) => `£${t.toFixed(0)}`).join(' + ');
  }
  const head = totals.slice(0, 3).map((t) => `£${t.toFixed(0)}`);
  const tail = `£${totals[totals.length - 1].toFixed(0)}`;
  return `${head.join(' + ')} + … + ${tail}`;
}

export function buildBreakdownStop(
  item: DeliveryItemFormData,
  tier: ServiceTier | undefined
): BreakdownStop {
  const baseAmount = toNumber(tier?.base_price, 0);
  const perPackage = toNumber(tier?.price_per_package, 0);
  const perKg = toNumber(tier?.price_per_kg, 0);
  const tierName = (tier?.tier_name ?? '').toUpperCase();
  const tierLabel = tier?.tier_name ?? 'Service';

  const packages = item.packages ?? [];
  const packageLines: BreakdownPackageLine[] = packages.map((pkg, idx) => {
    const weight = toNumber(pkg.weight, 0);
    const weightAmount = weight * perKg;
    const totalAmount = perPackage + weightAmount;
    return {
      label: `PACKAGE ${String(idx + 1).padStart(2, '0')}`,
      perPackageCalc: `${tierLabel} → £${perPackage.toFixed(0)}`,
      perPackageAmount: perPackage,
      weightCalc: `${weight}kg × £${perKg.toFixed(0)}`,
      weightAmount,
      totalCalc: `£${perPackage.toFixed(0)} + £${weightAmount.toFixed(0)}`,
      totalAmount,
    };
  });

  const packageFeeAmount = packageLines.reduce((acc, line) => acc + line.totalAmount, 0);
  const packageFeeCalc = buildPackageSumCalc(packageLines.map((line) => line.totalAmount));

  // Local fallback path doesn't apply server discounts.
  const subtotalExVat = baseAmount + packageFeeAmount;
  const vatAmount = subtotalExVat * VAT_PCT;
  const grandTotal = subtotalExVat + vatAmount;

  return {
    tierId: tier?.id ?? '',
    tierName,
    tierColor: tier?.color || '#525252',
    baseCalc: tier ? `${tier.tier_name} Service` : 'Service',
    baseAmount,
    packageFeeCalc,
    packageFeeAmount,
    packageLines,
    discounts: [],
    subtotalExVat,
    vatLabel: 'VAT (20%)',
    vatAmount,
    grandTotal,
  };
}

export function buildBreakdownStops(
  deliveryItems: DeliveryItemFormData[],
  tiers: ServiceTier[]
): BreakdownStop[] {
  const tierById = new Map(tiers.map((tier) => [tier.id, tier]));
  return deliveryItems.map((item) => buildBreakdownStop(item, tierById.get(item.deliveryPackage)));
}

export function aggregateBreakdownTotals(stops: BreakdownStop[]): {
  basePrice: number;
  packageFee: number;
  weightTotal: number;
  discount: number;
  subtotalExVat: number;
  vat: number;
  grandTotal: number;
} {
  return stops.reduce(
    (acc, stop) => {
      const stopWeight = stop.packageLines.reduce((s, l) => s + l.weightAmount, 0);
      const stopDiscount = stop.discounts.reduce((s, d) => s + d.amount, 0);
      return {
        basePrice: acc.basePrice + stop.baseAmount,
        packageFee: acc.packageFee + stop.packageFeeAmount,
        weightTotal: acc.weightTotal + stopWeight,
        discount: acc.discount + stopDiscount,
        subtotalExVat: acc.subtotalExVat + stop.subtotalExVat,
        vat: acc.vat + stop.vatAmount,
        grandTotal: acc.grandTotal + stop.grandTotal,
      };
    },
    {
      basePrice: 0,
      packageFee: 0,
      weightTotal: 0,
      discount: 0,
      subtotalExVat: 0,
      vat: 0,
      grandTotal: 0,
    }
  );
}

// ── Server-driven breakdown ──────────────────────────────────────────────────
// Adapters that turn POST /orders/price-breakdown responses into the UI shape above.

const DISCOUNT_LABELS: Record<BreakdownDiscountLine['kind'], string> = {
  FIXED_PER_BOOKING: 'Fixed Discount',
  PERCENTAGE: 'Percentage Discount',
  VOLUME_TIERED: 'Volume Discount',
};

function discountKind(type: string): BreakdownDiscountLine['kind'] | null {
  if (type === 'FIXED_PER_BOOKING' || type === 'PERCENTAGE' || type === 'VOLUME_TIERED') {
    return type;
  }
  return null;
}

export function buildBreakdownStopFromServer(
  stop: OrderPriceBreakdownStopDto,
  tier: ServiceTier | undefined
): BreakdownStop {
  const baseAmount = toNumber(stop.base_price, 0);
  const perKg = toNumber(stop.pricing_plan.price_per_kg, 0);
  const perPackage = toNumber(stop.pricing_plan.price_per_package, 0);
  const rawTierName =
    stop.service_tier ??
    stop.pricing_plan.tier_name_at_order_time ??
    stop.pricing_plan.plain_name ??
    tier?.tier_name ??
    '';
  const tierName = rawTierName.toUpperCase();
  const tierLabel = rawTierName || 'Service';

  const packageLines: BreakdownPackageLine[] = stop.packages.map((pkg, idx) => {
    const perPackageAmount = toNumber(pkg.per_package_charge, perPackage);
    const weight = toNumber(pkg.declared_weight_kg, 0);
    const weightAmount = toNumber(pkg.weight_charge.amount, 0);
    const totalAmount = toNumber(pkg.total, perPackageAmount + weightAmount);
    // The server's `package_index` is already 1-based (orders/service.py enumerates from 1),
    // so we use the array position to keep the labels 01,02,03 regardless of the server's
    // indexing choice.
    return {
      label: `PACKAGE ${String(idx + 1).padStart(2, '0')}`,
      perPackageCalc: `${tierLabel} → £${perPackageAmount.toFixed(0)}`,
      perPackageAmount,
      weightCalc: `${weight}kg × £${perKg.toFixed(0)}`,
      weightAmount,
      totalCalc: `£${perPackageAmount.toFixed(0)} + £${weightAmount.toFixed(0)}`,
      totalAmount,
    };
  });

  const packageFeeAmount = packageLines.reduce((acc, line) => acc + line.totalAmount, 0);
  const packageFeeCalc = buildPackageSumCalc(packageLines.map((line) => line.totalAmount));

  // Map each server discount into a row the UI can render verbatim. Percentage and volume
  // share the same "Tier → N%" shape; fixed shows the GBP value instead.
  const discounts: BreakdownDiscountLine[] = [];
  for (const d of stop.discounts ?? []) {
    const kind = discountKind(d.type);
    if (!kind) continue;
    const amount = toNumber(d.amount, 0);
    if (amount <= 0) continue;
    const valueLabel =
      kind === 'FIXED_PER_BOOKING'
        ? `£${toNumber(d.value, 0).toFixed(0)}`
        : `${toNumber(d.value, 0).toFixed(0)}%`;
    discounts.push({
      kind,
      label: DISCOUNT_LABELS[kind],
      calculation: `${tierLabel} → ${valueLabel}`,
      amount,
    });
  }

  return {
    tierId: stop.service_tier_id ?? tier?.id ?? '',
    tierName,
    // Prefer color baked into the server snapshot; fall back to the tier list lookup.
    tierColor: stop.pricing_plan.color || tier?.color || '#525252',
    baseCalc: tier ? `${tier.tier_name} Service` : 'Service',
    baseAmount,
    packageFeeCalc,
    packageFeeAmount,
    packageLines,
    discounts,
    subtotalExVat: toNumber(stop.subtotal, 0),
    vatLabel: `VAT (${toNumber(stop.vat_rate_pct, 20).toFixed(0)}%)`,
    vatAmount: toNumber(stop.vat_amount, 0),
    grandTotal: toNumber(stop.total, 0),
  };
}

export function buildBreakdownStopsFromServer(
  response: OrderPriceBreakdownResponseDto | undefined,
  tiers: ServiceTier[]
): BreakdownStop[] {
  if (!response) return [];
  const tierById = new Map(tiers.map((t) => [t.id, t]));
  return response.breakdown.stops.map((stop) =>
    buildBreakdownStopFromServer(
      stop,
      stop.service_tier_id ? tierById.get(stop.service_tier_id) : undefined
    )
  );
}
