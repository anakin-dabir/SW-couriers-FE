import type { CreditIndustry } from '@/store/api/creditApplicationsApi';

/** Values accepted by credit application / draft APIs (POST/PATCH publish). */
export const CREDIT_APPLICATION_INDUSTRY_VALUES = [
  'AGRICULTURE_AND_FARMING',
  'AUTOMOTIVE',
  'CONSTRUCTION_AND_BUILDING',
  'EDUCATION',
  'ENERGY_AND_UTILITIES',
  'FINANCIAL_SERVICES',
  'FOOD_AND_BEVERAGE',
  'HEALTHCARE_AND_PHARMACEUTICALS',
  'HOME_AND_LIFESTYLE',
  'HOSPITALITY_AND_TOURISM',
  'IT_AND_TECHNOLOGY',
  'LOGISTICS_AND_TRANSPORT',
  'MANUFACTURING',
  'MEDIA_AND_ENTERTAINMENT',
  'PROFESSIONAL_SERVICES',
  'REAL_ESTATE',
  'RETAIL',
  'TELECOMMUNICATIONS',
  'WHOLESALE_AND_DISTRIBUTION',
  'OTHER',
] as const satisfies readonly CreditIndustry[];

const CREDIT_INDUSTRY_SET = new Set<string>(CREDIT_APPLICATION_INDUSTRY_VALUES);

/**
 * Organization profile (`IndustryType`) uses a smaller enum than credit applications.
 * Map profile / legacy values to the credit API enum before save or submit.
 */
const PROFILE_AND_LEGACY_INDUSTRY_TO_CREDIT: Record<string, CreditIndustry> = {
  ECOMMERCE: 'RETAIL',
  RETAIL: 'RETAIL',
  WHOLESALE_DISTRIBUTION: 'WHOLESALE_AND_DISTRIBUTION',
  LOGISTICS_TRANSPORT: 'LOGISTICS_AND_TRANSPORT',
  TECHNOLOGY_SOFTWARE: 'IT_AND_TECHNOLOGY',
  OTHER: 'OTHER',
  HOME_LIFESTYLE: 'HOME_AND_LIFESTYLE',
  HEALTHCARE_PHARMA: 'HEALTHCARE_AND_PHARMACEUTICALS',
  CONSTRUCTION: 'CONSTRUCTION_AND_BUILDING',
  FOOD_BEVERAGE: 'FOOD_AND_BEVERAGE',
  FINANCE_INSURANCE: 'FINANCIAL_SERVICES',
  MEDIA_ENTERTAINMENT: 'MEDIA_AND_ENTERTAINMENT',
};

export function toCreditApplicationIndustry(
  value: string | null | undefined
): CreditIndustry | null {
  const normalized = (value ?? '').trim().toUpperCase();
  if (!normalized) return null;
  if (CREDIT_INDUSTRY_SET.has(normalized)) {
    return normalized as CreditIndustry;
  }
  return PROFILE_AND_LEGACY_INDUSTRY_TO_CREDIT[normalized] ?? null;
}

export function creditApplicationIndustryOrNull(
  value: string | null | undefined
): CreditIndustry | null {
  return toCreditApplicationIndustry(value);
}
