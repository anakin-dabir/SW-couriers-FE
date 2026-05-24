/**
 * Validation against per-org delivery limits from GET /organizations/{org_id}:
 *   max_package_weight, max_package_length, max_package_width, max_package_height,
 *   min_charge_per_booking
 *
 * Used by Step 2 (Package & Delivery) on Save Stop and on Next to prevent the user
 * from moving forward with stops that violate the org's configured limits.
 */
import type { DeliveryItemFormData, PackageFieldsFormData } from '@/schemas/pickup.schema';
import type { ServiceTier } from '@/store/api';

export interface OrgOrderLimits {
  max_package_weight?: number | null;
  max_package_length?: number | null;
  max_package_width?: number | null;
  max_package_height?: number | null;
  min_charge_per_booking?: string | number | null;
}

export interface PackageLimitIssue {
  stopIndex: number;
  packageIndex: number;
  field: 'weight' | 'length' | 'width' | 'height';
  /** The value the user entered, in the same unit as the limit. */
  value: number;
  /** The org's configured maximum for this field. */
  limit: number;
}

export interface StopMinChargeIssue {
  stopIndex: number;
  /** Computed pre-VAT subtotal for the stop (base + perPackage·n + Σ weight·perKg). */
  subtotal: number;
  /** Org minimum (`min_charge_per_booking`) parsed as a number. */
  minimum: number;
}

export interface MissingTierIssue {
  stopIndex: number;
}

export interface OrderLimitsValidationResult {
  packageIssues: PackageLimitIssue[];
  stopIssues: StopMinChargeIssue[];
  tierIssues: MissingTierIssue[];
  hasErrors: boolean;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[£,\s]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : fallback;
}

function checkPackageLimits(
  stopIndex: number,
  packageIndex: number,
  pkg: PackageFieldsFormData,
  limits: OrgOrderLimits
): PackageLimitIssue[] {
  const issues: PackageLimitIssue[] = [];
  const fields: Array<{
    field: PackageLimitIssue['field'];
    value: unknown;
    limit: number | null | undefined;
  }> = [
    { field: 'weight', value: pkg.weight, limit: limits.max_package_weight },
    { field: 'length', value: pkg.length, limit: limits.max_package_length },
    { field: 'width', value: pkg.width, limit: limits.max_package_width },
    { field: 'height', value: pkg.height, limit: limits.max_package_height },
  ];
  for (const { field, value, limit } of fields) {
    if (limit == null) continue;
    const num = toNumber(value, 0);
    if (num > limit) {
      issues.push({ stopIndex, packageIndex, field, value: num, limit });
    }
  }
  return issues;
}

function computeStopSubtotal(item: DeliveryItemFormData, tier: ServiceTier | undefined): number {
  if (!tier) return 0;
  const base = toNumber(tier.base_price, 0);
  const perPackage = toNumber(tier.price_per_package, 0);
  const perKg = toNumber(tier.price_per_kg, 0);
  const packages = item.packages ?? [];
  const packageFee = perPackage * packages.length;
  const weightTotal = packages.reduce((acc, pkg) => acc + toNumber(pkg.weight, 0) * perKg, 0);
  return base + packageFee + weightTotal;
}

/**
 * Validate a single delivery stop against the org's limits.
 * Pass `stopIndex` so the caller can show errors keyed by position.
 */
export function validateStopAgainstLimits(
  stopIndex: number,
  item: DeliveryItemFormData,
  tier: ServiceTier | undefined,
  limits: OrgOrderLimits
): OrderLimitsValidationResult {
  const packageIssues: PackageLimitIssue[] = [];
  (item.packages ?? []).forEach((pkg, packageIndex) => {
    packageIssues.push(...checkPackageLimits(stopIndex, packageIndex, pkg, limits));
  });

  const stopIssues: StopMinChargeIssue[] = [];
  const tierIssues: MissingTierIssue[] = [];

  if (!tier) {
    // No tier resolved → fail fast. Without a tier we can't compute the stop subtotal,
    // so the min-charge check is skipped and the user is told to pick a tier instead.
    tierIssues.push({ stopIndex });
  } else {
    const minimum = toNumber(limits.min_charge_per_booking, 0);
    if (minimum > 0) {
      const subtotal = computeStopSubtotal(item, tier);
      if (subtotal > 0 && subtotal < minimum) {
        stopIssues.push({ stopIndex, subtotal, minimum });
      }
    }
  }

  return {
    packageIssues,
    stopIssues,
    tierIssues,
    hasErrors: packageIssues.length + stopIssues.length + tierIssues.length > 0,
  };
}

/** Validate every stop in the form; aggregates issues across all stops. */
export function validateAllStopsAgainstLimits(
  items: DeliveryItemFormData[],
  tiers: ServiceTier[],
  limits: OrgOrderLimits
): OrderLimitsValidationResult {
  const tierById = new Map(tiers.map((tier) => [tier.id, tier]));
  const packageIssues: PackageLimitIssue[] = [];
  const stopIssues: StopMinChargeIssue[] = [];
  const tierIssues: MissingTierIssue[] = [];
  items.forEach((item, stopIndex) => {
    const result = validateStopAgainstLimits(
      stopIndex,
      item,
      tierById.get(item.deliveryPackage),
      limits
    );
    packageIssues.push(...result.packageIssues);
    stopIssues.push(...result.stopIssues);
    tierIssues.push(...result.tierIssues);
  });
  return {
    packageIssues,
    stopIssues,
    tierIssues,
    hasErrors: packageIssues.length + stopIssues.length + tierIssues.length > 0,
  };
}

/** Human-readable message for a package field that exceeds the org limit. */
export function formatPackageIssue(issue: PackageLimitIssue): string {
  const unit = issue.field === 'weight' ? 'kg' : 'cm';
  const fieldLabel =
    issue.field === 'weight'
      ? 'weight'
      : issue.field === 'length'
        ? 'length'
        : issue.field === 'width'
          ? 'width'
          : 'height';
  return `Stop ${issue.stopIndex + 1}, Package ${String(issue.packageIndex + 1).padStart(2, '0')}: ${fieldLabel} ${issue.value}${unit} exceeds the ${issue.limit}${unit} limit.`;
}

/** Human-readable message for a stop subtotal under the org's minimum. */
export function formatStopIssue(issue: StopMinChargeIssue): string {
  return `Stop ${issue.stopIndex + 1}: subtotal £${issue.subtotal.toFixed(2)} is below the £${issue.minimum.toFixed(2)} minimum charge per booking.`;
}

/** Human-readable message for a stop missing a service tier selection. */
export function formatTierIssue(issue: MissingTierIssue): string {
  return `Stop ${issue.stopIndex + 1}: select a delivery service before continuing.`;
}
