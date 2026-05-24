import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export interface OrganizationPricingPlanDto {
  id_price_tier?: string | null;
  plain_type?: string | null;
  plain_name?: string | null;
  selected?: boolean | null;
  permitted?: boolean | null;
  is_default?: boolean | null;
}

export interface OrganizationDetailsDto {
  id: string;
  reference?: string | null;
  trading_name?: string | null;
  legal_entity_name?: string | null;
  industry?: string | null;
  company_size?: string | null;
  date_of_incorporation?: string | null;
  website?: string | null;
  description?: string | null;
  phone?: string | null;
  companies_house_number?: string | null;
  status?: string | null;
  logo_url?: string | null;
  pricing_plans?: OrganizationPricingPlanDto[];
  /** Per-package limits enforced when creating orders. */
  max_package_weight?: number | null;
  max_package_length?: number | null;
  max_package_width?: number | null;
  max_package_height?: number | null;
  /** Minimum stop subtotal (excl. VAT) the org accepts. Stored as a decimal string. */
  min_charge_per_booking?: string | null;
}

export interface OrganizationPaymentMethodDto {
  id?: string | null;
  payment_model?: string | null;
  billing_schedule?: string | null;
  billing_day_of_month?: number | null;
  billing_days_after_order?: number | null;
  credit_limit?: string | null;
  is_default?: boolean | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_sort_code?: string | null;
}

export interface PaymentMethodDistributionDto {
  model?: string | null;
  usage_percentage?: number | null;
  total_charged?: string | null;
  order_count?: number | null;
}

export interface OrganizationPaymentDetailsDto {
  total_charged?: string | null;
  total_orders?: number | null;
  successful_payments?: number | null;
  failed_payments?: number | null;
  payment_success_rate?: number | null;
  total_invoiced?: string | null;
  paid_invoices_amount?: string | null;
  unpaid_invoices_amount?: string | null;
  overdue_amount?: string | null;
  invoice_count?: number | null;
  credit_limit?: string | null;
  used_credit?: string | null;
  available_credit?: string | null;
  credit_utilization_pct?: number | null;
  next_due_date?: string | null;
  payment_methods?: OrganizationPaymentMethodDto[];
  method_distribution?: PaymentMethodDistributionDto[];
}

export interface GetOrganizationByIdArgs {
  organizationId: string;
}

export interface GetOrganizationPaymentDetailsArgs {
  organizationId: string;
  start_date?: string | null;
  end_date?: string | null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseOrganizationDetails(data: unknown): OrganizationDetailsDto {
  const row = asObject(data);
  const pricingPlansRaw = Array.isArray(row.pricing_plans) ? row.pricing_plans : [];
  const pricing_plans = pricingPlansRaw.map((entry) => {
    const plan = asObject(entry);
    return {
      id_price_tier: asNullableString(plan.id_price_tier),
      plain_type: asNullableString(plan.plain_type),
      plain_name: asNullableString(plan.plain_name),
      selected: typeof plan.selected === 'boolean' ? plan.selected : null,
      permitted: typeof plan.permitted === 'boolean' ? plan.permitted : null,
      is_default: typeof plan.is_default === 'boolean' ? plan.is_default : null,
    };
  });

  return {
    id: asNullableString(row.id) ?? '',
    reference: asNullableString(row.reference),
    trading_name: asNullableString(row.trading_name),
    legal_entity_name: asNullableString(row.legal_entity_name),
    industry: asNullableString(row.industry),
    company_size: asNullableString(row.company_size),
    date_of_incorporation: asNullableString(row.date_of_incorporation),
    website: asNullableString(row.website),
    description: asNullableString(row.description),
    phone: asNullableString(row.phone),
    companies_house_number: asNullableString(row.companies_house_number),
    status: asNullableString(row.status),
    logo_url: asNullableString(row.logo_url),
    pricing_plans,
    max_package_weight: asNullableNumber(row.max_package_weight),
    max_package_length: asNullableNumber(row.max_package_length),
    max_package_width: asNullableNumber(row.max_package_width),
    max_package_height: asNullableNumber(row.max_package_height),
    min_charge_per_booking: asNullableString(row.min_charge_per_booking),
  };
}

function parseOrganizationPaymentDetails(data: unknown): OrganizationPaymentDetailsDto {
  const row = asObject(data);

  const paymentConfig = asObject(row.payment_config);
  const paymentMethodsRawDirect = Array.isArray(row.payment_methods) ? row.payment_methods : [];
  const paymentMethodsRawFromConfig = Array.isArray(paymentConfig.payment_methods)
    ? paymentConfig.payment_methods
    : [];
  const paymentMethodsRaw =
    paymentMethodsRawDirect.length > 0 ? paymentMethodsRawDirect : paymentMethodsRawFromConfig;
  const payment_methods = paymentMethodsRaw.map((entry) => {
    const method = asObject(entry);
    return {
      id: asNullableString(method.id),
      payment_model: asNullableString(method.payment_model),
      billing_schedule: asNullableString(method.billing_schedule),
      billing_day_of_month: asNullableNumber(method.billing_day_of_month),
      billing_days_after_order: asNullableNumber(method.billing_days_after_order),
      credit_limit: asNullableString(method.credit_limit),
      is_default: typeof method.is_default === 'boolean' ? method.is_default : null,
      bank_account_name: asNullableString(method.bank_account_name),
      bank_account_number: asNullableString(method.bank_account_number),
      bank_sort_code: asNullableString(method.bank_sort_code),
    };
  });

  const methodDistributionRaw = Array.isArray(row.method_distribution)
    ? row.method_distribution
    : [];
  const method_distribution = methodDistributionRaw.map((entry) => {
    const item = asObject(entry);
    return {
      model: asNullableString(item.model),
      usage_percentage: asNullableNumber(item.usage_percentage),
      total_charged: asNullableString(item.total_charged),
      order_count: asNullableNumber(item.order_count),
    };
  });

  return {
    total_charged: asNullableString(row.total_charged),
    total_orders: asNullableNumber(row.total_orders),
    successful_payments: asNullableNumber(row.successful_payments),
    failed_payments: asNullableNumber(row.failed_payments),
    payment_success_rate: asNullableNumber(row.payment_success_rate),
    total_invoiced: asNullableString(row.total_invoiced),
    paid_invoices_amount: asNullableString(row.paid_invoices_amount),
    unpaid_invoices_amount: asNullableString(row.unpaid_invoices_amount),
    overdue_amount: asNullableString(row.overdue_amount),
    invoice_count: asNullableNumber(row.invoice_count),
    credit_limit: asNullableString(row.credit_limit),
    used_credit: asNullableString(row.used_credit),
    available_credit: asNullableString(row.available_credit),
    credit_utilization_pct: asNullableNumber(row.credit_utilization_pct),
    next_due_date: asNullableString(row.next_due_date),
    payment_methods,
    method_distribution,
  };
}

function compactQueryParams<T extends object>(args: T): Record<string, unknown> {
  const entries = Object.entries(args).filter(([, value]) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  });
  return Object.fromEntries(entries);
}

export const homeDashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizationById: build.query<ApiResponse<OrganizationDetailsDto>, GetOrganizationByIdArgs>({
      query: ({ organizationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}`,
        method: 'GET',
      }),
      transformResponse(raw: unknown) {
        const root = asObject(raw);
        if (!asBoolean(root.success) || !('data' in root)) {
          throw new Error('Organization details response is invalid.');
        }
        const message = asNullableString(root.message) ?? undefined;
        return {
          success: true,
          message,
          data: parseOrganizationDetails(root.data),
        };
      },
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrganizationDetails', id: organizationId },
      ],
    }),
    getOrganizationPaymentDetails: build.query<
      ApiResponse<OrganizationPaymentDetailsDto>,
      GetOrganizationPaymentDetailsArgs
    >({
      query: ({ organizationId, ...params }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-details`,
        method: 'GET',
        params: compactQueryParams(params),
      }),
      transformResponse(raw: unknown) {
        const root = asObject(raw);
        if (!asBoolean(root.success) || !('data' in root)) {
          throw new Error('Organization payment details response is invalid.');
        }
        const message = asNullableString(root.message) ?? undefined;
        return {
          success: true,
          message,
          data: parseOrganizationPaymentDetails(root.data),
        };
      },
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrganizationPaymentDetails', id: organizationId },
      ],
    }),
  }),
});

export const { useGetOrganizationByIdQuery, useGetOrganizationPaymentDetailsQuery } =
  homeDashboardApi;
