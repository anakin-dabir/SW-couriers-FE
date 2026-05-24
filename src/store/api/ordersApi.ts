import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export type OrdersSummaryPeriod =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_WEEK'
  | 'LAST_30_DAYS'
  | 'LAST_MONTH';

export type OrderStatus =
  | 'PENDING_PICKUP'
  | 'PICKUP_SCHEDULED'
  | 'ENROUTE_PICKUP'
  | 'ENROUTE_WAREHOUSE'
  | 'AT_WAREHOUSE'
  | 'SORTING_IN_PROGRESS'
  | 'DELIVERY_IN_PROGRESS'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURN_IN_PROGRESS'
  | 'RETURN_IN_TRANSIT'
  | 'RETURNED'
  | 'CANCELLED';

export type DeliveryPackageStatus =
  | 'PENDING_PICKUP'
  | 'PICKUP_SCHEDULED'
  | 'ENROUTE_PICKUP'
  | 'ENROUTE_WAREHOUSE'
  | 'AT_WAREHOUSE'
  | 'SORTING_IN_PROGRESS'
  | 'DELIVERY_SCHEDULED'
  | 'LOADED_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED_TO_CUSTOMER'
  | 'CUSTOMER_NOT_HOME'
  | 'REFUSED_BY_CUSTOMER'
  | 'MISSING'
  | 'DAMAGED'
  | 'LEFT_AT_SAFE_PLACE'
  | 'RETURN_INITIATED'
  | 'RETURN_IN_TRANSIT'
  | 'RETURNED'
  | 'CANCELLED'
  | 'DISPOSED';

export interface OrderListCreatedByDto {
  id: string;
  name: string;
}

export interface OrderListItemDto {
  id: string;
  created_at: string;
  order_id: string;
  organization_id: string;
  pickup_address_id?: string | null;
  contact_name?: string | null;
  pickup_address?: string | null;
  pickup_postcode?: string | null;
  total_amount?: string | null;
  created_by?: OrderListCreatedByDto | null;
  status: OrderStatus;
  package_count: number;
  delivery_stop_count: number;
}

export interface OrdersListDataDto {
  items: OrderListItemDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetOrdersArgs {
  organization_id?: string | null;
  search?: string | null;
  status?: OrderStatus[];
  date_from?: string | null;
  date_to?: string | null;
  page?: number;
  size?: number;
}

export interface CreateOrderPackageDto {
  length_cm: number;
  width_cm: number;
  height_cm: number;
  declared_weight_kg: number;
  declared_value?: number;
}

export interface CreateOrderDeliveryStopDto {
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_phone: string;
  recipient_email?: string;
  line_1: string;
  line_2?: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  service_tier_name?: string;
  service_tier_id?: string;
  signature_required?: boolean;
  safe_place_allowed?: boolean;
  customer_note?: string;
  packages: CreateOrderPackageDto[];
}

export interface CreateOrderRequestDto {
  client_type?: 'B2B' | 'B2C';
  organization_id?: string;
  contact_user_id: string;
  requested_pickup_date?: string;
  pickup_address_id: string;
  payment_method: string;
  payment_method_id: string;
  credit_card_id?: string;
  payment_method_nonce?: string;
  delivery_stops: CreateOrderDeliveryStopDto[];
}

export type CreateOrderResponseDto = Record<string, unknown>;

// ── Price breakdown ──────────────────────────────────────────────────────────
// Mirrors `app/modules/orders/v1/schemas.py::OrderPriceBreakdown*`.

export interface OrderPriceBreakdownRequestDto {
  client_type?: 'B2B' | 'B2C';
  organization_id?: string | null;
  delivery_stops: CreateOrderDeliveryStopDto[];
}

export interface OrderPriceBreakdownPlanSnapshotDto {
  id_price_tier?: string | null;
  plain_name?: string | null;
  plain_type?: string | null;
  base_price: string;
  price_per_package: string;
  price_per_kg: string;
  tier_name_at_order_time?: string | null;
  // Presentation metadata mirrored from the live effective-tier row.
  service_tier_id?: string | null;
  global_tier_id?: string | null;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  duration_days?: number | null;
  error_margin_kg?: number | null;
  available_for?: string | null;
  scope_type?: string | null;
  source_scope_type?: string | null;
  scope_org_id?: string | null;
  is_default?: boolean | null;
  is_override?: boolean | null;
}

export interface OrderPriceBreakdownWeightChargeDto {
  price_per_kg: string;
  weight_kg?: number | null;
  amount: string;
}

export interface OrderPriceBreakdownPackageDto {
  id?: string | null;
  package_id?: string | null;
  package_index: number;
  declared_weight_kg?: number | null;
  per_package_charge: string;
  weight_charge: OrderPriceBreakdownWeightChargeDto;
  total: string;
}

export interface OrderPriceBreakdownDiscountDto {
  type: string;
  service_tier_id?: string | null;
  value: string;
  amount: string;
  order_count?: number | null;
}

export interface OrderPriceBreakdownStopDto {
  id?: string | null;
  tracking_id?: string | null;
  stop_index: number;
  service_tier?: string | null;
  service_tier_id?: string | null;
  pricing_plan: OrderPriceBreakdownPlanSnapshotDto;
  base_price: string;
  packages: OrderPriceBreakdownPackageDto[];
  packages_count: number;
  packages_subtotal: string;
  pre_discount_subtotal: string;
  discounts: OrderPriceBreakdownDiscountDto[];
  total_discount: string;
  subtotal_after_discount: string;
  min_charge: string;
  min_charge_applied: boolean;
  subtotal: string;
  vat_rate: string;
  vat_rate_pct: string;
  vat_amount: string;
  total: string;
}

export interface OrderMasterLabelDto {
  master_label_id: string;
  pickup_address: string;
  barcode_value?: string | null;
  qr_value?: string | null;
  delivery_stops_count?: number | null;
  total_packages?: number | null;
  total_weight_kg?: number | string | null;
  total_volume_m3?: number | string | null;
}

export interface OrderPickupLabelDto {
  package_id: string;
  tracking_id: string;
  recipient_name: string;
  recipient_address: string;
  pickup_address: string;
  return_address?: string | null;
  signature_required: boolean;
  weight_kg: number | string | null;
  dimensions_cm: string | null;
  volume_m3?: number | string | null;
  delivery_days?: number | null;
  delivery_label?: string | null;
}

export interface OrderLabelsResponseDto {
  order_id: string;
  master_label?: OrderMasterLabelDto | null;
  pickup_labels?: OrderPickupLabelDto[];
}

export interface OrderPriceBreakdownDetailDto {
  id?: string | null;
  order_id?: string | null;
  currency: string;
  computed_at: string;
  stops: OrderPriceBreakdownStopDto[];
  packages_count: number;
  subtotal: string;
  vat_amount: string;
  total: string;
}

export interface OrderPriceBreakdownResponseDto {
  subtotal: string;
  vat_amount: string;
  total_amount: string;
  breakdown: OrderPriceBreakdownDetailDto;
}

export interface OrdersSummaryMetricDto {
  current: number;
  previous: number;
  change_pct: number;
}

export interface OrdersSummaryDataDto {
  period_from: string;
  period_to: string;
  previous_period_from: string;
  previous_period_to: string;
  comparison_label: string;
  total_orders: OrdersSummaryMetricDto;
  pickups_on_route: OrdersSummaryMetricDto;
  delivered: OrdersSummaryMetricDto;
  cancelled: OrdersSummaryMetricDto;
  failed: OrdersSummaryMetricDto;
  returned: OrdersSummaryMetricDto;
}

export interface GetOrdersSummaryArgs {
  period?: OrdersSummaryPeriod;
  date_from?: string | null;
  date_to?: string | null;
  organization_id?: string | null;
}

export interface FailedDeliveriesSummaryDataDto {
  period_from: string;
  period_to: string;
  previous_period_from: string;
  previous_period_to: string;
  comparison_label: string;
  total_failed: OrdersSummaryMetricDto;
  missing: OrdersSummaryMetricDto;
  damaged: OrdersSummaryMetricDto;
  cancelled: OrdersSummaryMetricDto;
  customer_not_home: OrdersSummaryMetricDto;
  refused: OrdersSummaryMetricDto;
  disposed: OrdersSummaryMetricDto;
}

export interface GetFailedDeliveriesSummaryArgs {
  period?: OrdersSummaryPeriod;
  date_from?: string | null;
  date_to?: string | null;
  organization_id?: string | null;
}

export interface DeliveryStatusEventDto {
  id: string;
  created_at: string;
  from_status: string;
  to_status: string;
  display_label: string;
  actor_user_id?: string | null;
}

export interface FailedDeliveryPackageDto {
  id: string;
  package_id: string;
  status: DeliveryPackageStatus;
  reason: string | null;
  status_events: DeliveryStatusEventDto[];
}

export interface FailedDeliveryItemDto {
  delivery_stop_id: string;
  tracking_id: string;
  postcode: string;
  order_id: string;
  order_reference: string;
  stop_status: string;
  attempt_number: number;
  max_attempts: number;
  previous_attempt_at: string | null;
  stop_status_events: DeliveryStatusEventDto[];
  packages: FailedDeliveryPackageDto[];
}

export interface FailedDeliveriesListDataDto {
  items: FailedDeliveryItemDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetFailedDeliveriesArgs {
  page?: number;
  size?: number;
  organization_id?: string | null;
  search?: string | null;
  package_status?: DeliveryPackageStatus[];
  attempt_number?: number[];
  date_from?: string | null;
  date_to?: string | null;
}

export interface ReturnPackageDto {
  id: string;
  package_id: string;
  status: DeliveryPackageStatus;
  return_reason: string | null;
  initiated_at: string | null;
  status_events: DeliveryStatusEventDto[];
}

export interface ReturnsListItemDto {
  delivery_stop_id: string;
  tracking_id: string;
  postcode: string;
  order_id: string;
  order_reference: string;
  initiated_at: string | null;
  stop_status_events: DeliveryStatusEventDto[];
  packages: ReturnPackageDto[];
}

export interface ReturnsListDataDto {
  items: ReturnsListItemDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetReturnsArgs {
  page?: number;
  size?: number;
  organization_id?: string | null;
  search?: string | null;
  status?: DeliveryPackageStatus[];
  date_from?: string | null;
  date_to?: string | null;
}

export interface OrderReturnsSummaryDataDto {
  period_from: string;
  period_to: string;
  previous_period_from: string;
  previous_period_to: string;
  comparison_label: string;
  total_returns: OrdersSummaryMetricDto;
  returns_in_transit: OrdersSummaryMetricDto;
  disposed_packages: OrdersSummaryMetricDto;
  returned_packages: OrdersSummaryMetricDto;
  initiated: OrdersSummaryMetricDto;
  avg_resolution_days: OrdersSummaryMetricDto;
}

export interface GetOrderReturnsSummaryArgs {
  period?: OrdersSummaryPeriod;
  date_from?: string | null;
  date_to?: string | null;
  organization_id?: string | null;
}

export interface OrderDraftListItemDto {
  id: string;
  created_at: string;
  draft_id: string;
  organization_id: string;
  customer_id: string;
  created_by?: string | null;
  contact_name: string;
  pickup_address: string;
  package_count: number;
  delivery_stop_count: number;
  total_value: string;
}

export interface OrderDraftsListDataDto {
  items: OrderDraftListItemDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetOrderDraftsArgs {
  page?: number;
  size?: number;
  organization_id?: string | null;
  search?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}

export type OrderDraftPayloadDto = Record<string, unknown>;

export interface OrderDraftContactUserDto {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_role?: string | null;
}

export interface OrderDraftDetailDto {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  organization_id: string;
  customer_id: string;
  payload: OrderDraftPayloadDto;
  contact_user?: OrderDraftContactUserDto | null;
  /** Step-4 price-breakdown grand total snapshot (draft-only). */
  total_amount?: string | number | null;
}

export interface GetOrderDraftByIdArgs {
  draft_id: string;
  organization_id?: string | null;
}

export interface CreateOrderDraftArgs {
  organization_id?: string | null;
  body: Partial<CreateOrderRequestDto> & Record<string, unknown>;
}

export interface UpdateOrderDraftArgs {
  draft_id: string;
  organization_id?: string | null;
  body: Partial<CreateOrderRequestDto> & Record<string, unknown>;
}

export interface DeleteOrderDraftArgs {
  draft_id: string;
  organization_id?: string | null;
}

export interface SubmitOrderDraftArgs {
  draft_id: string;
  organization_id?: string | null;
  body?: CreateOrderRequestDto | (Partial<CreateOrderRequestDto> & Record<string, unknown>);
}

export type SubmitOrderDraftResponseDto = Record<string, unknown>;

export interface OrderDetailPackageDto {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  version?: number | null;
  order_id?: string | null;
  delivery_stop_id?: string | null;
  package_id?: string | null;
  status?: string | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  declared_weight_kg?: number | null;
  weight_kg?: number | null;
  declared_value?: string | null;
  is_damaged?: boolean | null;
}

export interface OrderDetailDeliveryStopDto {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  version?: number | null;
  order_id?: string | null;
  tracking_id?: string | null;
  recipient_first_name?: string | null;
  recipient_last_name?: string | null;
  recipient_phone?: string | null;
  recipient_email?: string | null;
  line_1?: string | null;
  line_2?: string | null;
  city?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  service_tier?: string | null;
  signature_required?: boolean | null;
  safe_place_allowed?: boolean | null;
  status?: string | null;
  packages_count?: number | null;
  scheduled_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  delivery_attempts?: number | null;
  max_delivery_attempts?: number | null;
  packages?: OrderDetailPackageDto[];
}

export interface OrderDetailPriceBreakdownWeightChargeDto {
  price_per_kg?: string | null;
  weight_kg?: number | null;
  amount?: string | null;
}

export interface OrderDetailPriceBreakdownPackageDto {
  id: string;
  package_id?: string | null;
  package_index?: number | null;
  declared_weight_kg?: number | null;
  per_package_charge?: string | null;
  weight_charge?: OrderDetailPriceBreakdownWeightChargeDto | null;
  total?: string | null;
}

export interface OrderDetailPriceBreakdownDiscountDto {
  type?: string | null;
  service_tier_id?: string | null;
  value?: string | null;
  amount?: string | null;
}

export interface OrderDetailPriceBreakdownPlanDto {
  id_price_tier?: string | null;
  plain_name?: string | null;
  plain_type?: string | null;
  base_price?: string | null;
  price_per_package?: string | null;
  price_per_kg?: string | null;
  tier_name_at_order_time?: string | null;
  service_tier_id?: string | null;
  global_tier_id?: string | null;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  duration_days?: number | null;
  days?: number | null;
}

export interface OrderDetailPriceBreakdownStopDto {
  id: string;
  tracking_id?: string | null;
  stop_index?: number | null;
  service_tier?: string | null;
  pricing_plan?: OrderDetailPriceBreakdownPlanDto | null;
  base_price?: string | null;
  packages_subtotal?: string | null;
  pre_discount_subtotal?: string | null;
  total_discount?: string | null;
  subtotal_after_discount?: string | null;
  subtotal?: string | null;
  vat_rate?: string | null;
  vat_rate_pct?: string | null;
  vat_amount?: string | null;
  total?: string | null;
  packages_count?: number | null;
  discounts?: OrderDetailPriceBreakdownDiscountDto[];
  packages?: OrderDetailPriceBreakdownPackageDto[];
}

export interface OrderDetailPriceBreakdownDto {
  id?: string | null;
  order_id?: string | null;
  currency?: string | null;
  computed_at?: string | null;
  packages_count?: number | null;
  subtotal?: string | null;
  vat_amount?: string | null;
  total?: string | null;
  stops?: OrderDetailPriceBreakdownStopDto[];
}

export interface OrderDetailCreatedByDto {
  id?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface OrderDetailContactUserDto {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface OrderDetailDto {
  id: string;
  created_at: string;
  updated_at?: string | null;
  version?: number | null;
  order_id: string;
  master_label_id?: string | null;
  organization_id?: string | null;
  customer_id?: string | null;
  pickup_address_id?: string | null;
  /** Denormalized pickup address when returned on the order (no profile lookup). */
  pickup_address?: string | null;
  pickup_line_1?: string | null;
  pickup_line_2?: string | null;
  pickup_city?: string | null;
  pickup_state?: string | null;
  pickup_country?: string | null;
  pickup_postcode?: string | null;
  status: string;
  created_by_id?: string | null;
  created_by?: OrderDetailCreatedByDto | string | null;
  contact_user_id?: string | null;
  contact_user?: OrderDetailContactUserDto | null;
  payment_method?: string | null;
  payment_method_id?: string | null;
  payment_status?: string | null;
  card_last_four?: string | null;
  linked_invoice_id?: string | null;
  linked_invoice_number?: string | null;
  requested_pickup_date?: string | null;
  actual_pickup_date?: string | null;
  pickup_driver?: string | null;
  pickup_route_id?: string | null;
  pickup_vehicle?: string | null;
  pickup_contact_name?: string | null;
  pickup_contact_phone?: string | null;
  subtotal?: string | null;
  vat_amount?: string | null;
  total_amount?: string | null;
  price_breakdown?: OrderDetailPriceBreakdownDto | null;
  delivery_stops: OrderDetailDeliveryStopDto[];
}

export interface GetOrderDetailArgs {
  order_id: string;
}

export interface StopTimelineEventDto {
  id: string;
  created_at: string;
  from_status?: string | null;
  to_status: string;
  display_label: string;
  actor_user_id?: string | null;
}

export interface DeliveryStopDetailPackageDto {
  id: string;
  order_id: string;
  delivery_stop_id?: string | null;
  package_id?: string | null;
  status: string;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  declared_weight_kg?: number | null;
  weight_kg?: number | null;
  declared_value?: number | string | null;
  is_damaged?: boolean;
  events: StopTimelineEventDto[];
}

export interface PortalStopNoteImage {
  id: string;
  stop_note_id?: string;
  image_key?: string;
  image_url?: string | null;
  sort_order?: number;
}

export interface PortalStopNoteResponse {
  id: string;
  delivery_stop_id?: string;
  note_type: string;
  message: string;
  is_blocking?: boolean;
  sort_order?: number;
  package_ids?: string[];
  images?: PortalStopNoteImage[];
  created_at?: string;
  updated_at?: string;
  created_by?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}

export interface StopPodPhotoDto {
  id: string;
  image_key?: string;
  image_url?: string | null;
  sort_order?: number;
}

export interface StopPodSummaryDto {
  photos_count?: number;
  signature_image_key?: string | null;
  signature_image_url?: string | null;
  signature_required_snapshot?: boolean;
  completed_at?: string | null;
  photos?: StopPodPhotoDto[];
}

export interface StopReturnEvidenceEntryDto {
  id: string;
  image_key?: string;
  image_url?: string | null;
  sort_order?: number;
}

export interface StopReturnEvidenceSummaryDto {
  photos_count?: number;
  photos?: StopReturnEvidenceEntryDto[];
}

export interface StopAttemptEntryDto {
  id: string;
  attempt_number: number;
  attempted_at: string;
  driver_id?: string | null;
  driver_name?: string | null;
  vehicle_id?: string | null;
  vehicle_name?: string | null;
  route_id?: string | null;
  failure_reason?: string | null;
  notes?: string | null;
  is_final?: boolean;
}

export interface DeliveryStopDetailDto {
  id: string;
  order_id: string;
  order_reference?: string | null;
  organization_id?: string | null;
  stop_index?: number | null;
  tracking_id?: string | null;
  recipient_first_name?: string | null;
  recipient_last_name?: string | null;
  recipient_phone?: string | null;
  recipient_email?: string | null;
  line_1?: string | null;
  line_2?: string | null;
  city?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  service_tier?: string | null;
  service_tier_id?: string | null;
  pricing_plan?: {
    color?: string | null;
    plain_name?: string | null;
    [key: string]: unknown;
  } | null;
  signature_required?: boolean;
  safe_place_allowed?: boolean;
  status: string;
  scheduled_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  delivery_attempts?: number;
  max_delivery_attempts?: number;
  packages_count: number;
  packages: DeliveryStopDetailPackageDto[];
  events: StopTimelineEventDto[];
  pod?: StopPodSummaryDto | null;
  return_evidence?: StopReturnEvidenceSummaryDto | null;
  failed_attempts?: StopAttemptEntryDto[];
  return_attempts?: StopAttemptEntryDto[];
}

function assertObject(raw: unknown, message: string): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') throw new Error(message);
  return raw as Record<string, unknown>;
}

function assertString(value: unknown, message: string): string {
  if (typeof value !== 'string') throw new Error(message);
  return value;
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

function asNullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function parseOrderDetailPackage(raw: unknown, index: number): OrderDetailPackageDto {
  const row = assertObject(raw, `Invalid order detail: delivery_stops[].packages[${index}]`);
  return {
    id: assertString(row.id, `Invalid order detail: packages[${index}].id`),
    created_at: asNullableString(row.created_at),
    updated_at: asNullableString(row.updated_at),
    version: asNullableNumber(row.version),
    order_id: asNullableString(row.order_id),
    delivery_stop_id: asNullableString(row.delivery_stop_id),
    package_id: asNullableString(row.package_id),
    status: asNullableString(row.status),
    length_cm: asNullableNumber(row.length_cm),
    width_cm: asNullableNumber(row.width_cm),
    height_cm: asNullableNumber(row.height_cm),
    declared_weight_kg: asNullableNumber(row.declared_weight_kg),
    weight_kg: asNullableNumber(row.weight_kg),
    declared_value: asNullableString(row.declared_value),
    is_damaged: asNullableBoolean(row.is_damaged),
  };
}

function parseOrderDetailDeliveryStop(raw: unknown, index: number): OrderDetailDeliveryStopDto {
  const row = assertObject(raw, `Invalid order detail: delivery_stops[${index}]`);
  const packagesRaw = Array.isArray(row.packages) ? row.packages : [];
  return {
    id: assertString(row.id, `Invalid order detail: delivery_stops[${index}].id`),
    created_at: asNullableString(row.created_at),
    updated_at: asNullableString(row.updated_at),
    version: asNullableNumber(row.version),
    order_id: asNullableString(row.order_id),
    tracking_id: asNullableString(row.tracking_id),
    recipient_first_name: asNullableString(row.recipient_first_name),
    recipient_last_name: asNullableString(row.recipient_last_name),
    recipient_phone: asNullableString(row.recipient_phone),
    recipient_email: asNullableString(row.recipient_email),
    line_1: asNullableString(row.line_1),
    line_2: asNullableString(row.line_2),
    city: asNullableString(row.city),
    postcode: asNullableString(row.postcode),
    latitude: asNullableNumber(row.latitude),
    longitude: asNullableNumber(row.longitude),
    service_tier: asNullableString(row.service_tier),
    signature_required: asNullableBoolean(row.signature_required),
    safe_place_allowed: asNullableBoolean(row.safe_place_allowed),
    status: asNullableString(row.status),
    packages_count: asNullableNumber(row.packages_count),
    scheduled_delivery_date: asNullableString(row.scheduled_delivery_date),
    actual_delivery_date: asNullableString(row.actual_delivery_date),
    delivery_attempts: asNullableNumber(row.delivery_attempts),
    max_delivery_attempts: asNullableNumber(row.max_delivery_attempts),
    packages: packagesRaw.map((pkg, pkgIndex) => parseOrderDetailPackage(pkg, pkgIndex)),
  };
}

function parseOrderDetailCreatedBy(raw: unknown): OrderDetailCreatedByDto | string | null {
  if (raw == null) return null;
  if (typeof raw === 'string') return raw.trim() || null;
  if (typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  return {
    id: asNullableString(row.id),
    name: asNullableString(row.name),
    first_name: asNullableString(row.first_name),
    last_name: asNullableString(row.last_name),
    email: asNullableString(row.email),
    phone: asNullableString(row.phone),
  };
}

function parseOrderDetailContactUser(raw: unknown): OrderDetailContactUserDto | null {
  if (raw == null || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  return {
    id: asNullableString(row.id),
    first_name: asNullableString(row.first_name),
    last_name: asNullableString(row.last_name),
    email: asNullableString(row.email),
    phone: asNullableString(row.phone),
  };
}

function parseOrderDetailPriceBreakdown(raw: unknown): OrderDetailPriceBreakdownDto | null {
  if (raw == null) return null;
  const row = assertObject(raw, 'Invalid order detail: price_breakdown');
  const stopsRaw = Array.isArray(row.stops) ? row.stops : [];
  const stops = stopsRaw.map((stopRaw, stopIndex) => {
    const stop = assertObject(stopRaw, `Invalid order detail: price_breakdown.stops[${stopIndex}]`);
    const packagesRaw = Array.isArray(stop.packages) ? stop.packages : [];
    const discountsRaw = Array.isArray(stop.discounts) ? stop.discounts : [];
    const planRaw =
      stop.pricing_plan && typeof stop.pricing_plan === 'object'
        ? (stop.pricing_plan as Record<string, unknown>)
        : null;
    const pricingPlan: OrderDetailPriceBreakdownPlanDto | null = planRaw
      ? {
          id_price_tier: asNullableString(planRaw.id_price_tier),
          plain_name: asNullableString(planRaw.plain_name),
          plain_type: asNullableString(planRaw.plain_type),
          base_price: asNullableString(planRaw.base_price),
          price_per_package: asNullableString(planRaw.price_per_package),
          price_per_kg: asNullableString(planRaw.price_per_kg),
          tier_name_at_order_time: asNullableString(planRaw.tier_name_at_order_time),
          service_tier_id: asNullableString(planRaw.service_tier_id),
          global_tier_id: asNullableString(planRaw.global_tier_id),
          color: asNullableString(planRaw.color),
          icon: asNullableString(planRaw.icon),
          description: asNullableString(planRaw.description),
          duration_days: asNullableNumber(planRaw.duration_days),
          days: asNullableNumber(planRaw.days),
        }
      : null;
    return {
      id: assertString(stop.id, `Invalid order detail: price_breakdown.stops[${stopIndex}].id`),
      tracking_id: asNullableString(stop.tracking_id),
      stop_index: asNullableNumber(stop.stop_index),
      service_tier: asNullableString(stop.service_tier),
      pricing_plan: pricingPlan,
      base_price: asNullableString(stop.base_price),
      packages_subtotal: asNullableString(stop.packages_subtotal),
      pre_discount_subtotal: asNullableString(stop.pre_discount_subtotal),
      total_discount: asNullableString(stop.total_discount),
      subtotal_after_discount: asNullableString(stop.subtotal_after_discount),
      subtotal: asNullableString(stop.subtotal),
      vat_rate: asNullableString(stop.vat_rate),
      vat_rate_pct: asNullableString(stop.vat_rate_pct),
      vat_amount: asNullableString(stop.vat_amount),
      total: asNullableString(stop.total),
      packages_count: asNullableNumber(stop.packages_count),
      discounts: discountsRaw.map((discountRaw, discountIndex) => {
        const discount = assertObject(
          discountRaw,
          `Invalid order detail: price_breakdown.stops[${stopIndex}].discounts[${discountIndex}]`
        );
        return {
          type: asNullableString(discount.type),
          service_tier_id: asNullableString(discount.service_tier_id),
          value: asNullableString(discount.value),
          amount: asNullableString(discount.amount),
        };
      }),
      packages: packagesRaw.map((pkgRaw, pkgIndex) => {
        const pkg = assertObject(
          pkgRaw,
          `Invalid order detail: price_breakdown.stops[${stopIndex}].packages[${pkgIndex}]`
        );
        return {
          id: assertString(
            pkg.id,
            `Invalid order detail: price_breakdown.stops[${stopIndex}].packages[${pkgIndex}].id`
          ),
          package_id: asNullableString(pkg.package_id),
          package_index: asNullableNumber(pkg.package_index),
          declared_weight_kg: asNullableNumber(pkg.declared_weight_kg),
          per_package_charge: asNullableString(pkg.per_package_charge),
          total: asNullableString(pkg.total),
        };
      }),
    };
  });

  return {
    id: asNullableString(row.id),
    order_id: asNullableString(row.order_id),
    currency: asNullableString(row.currency),
    computed_at: asNullableString(row.computed_at),
    packages_count: asNullableNumber(row.packages_count),
    subtotal: asNullableString(row.subtotal),
    vat_amount: asNullableString(row.vat_amount),
    total: asNullableString(row.total),
    stops,
  };
}

function parseOrderDetailResponse(raw: unknown): OrderDetailDto {
  const obj = assertObject(raw, 'Invalid order detail response');
  if (obj.success !== true) throw new Error('Invalid order detail response: success is not true');
  const data = assertObject(obj.data, 'Invalid order detail response: missing data');
  const deliveryStopsRaw = Array.isArray(data.delivery_stops) ? data.delivery_stops : [];

  return {
    id: assertString(data.id, 'Invalid order detail response: data.id'),
    created_at: assertString(data.created_at, 'Invalid order detail response: data.created_at'),
    updated_at: asNullableString(data.updated_at),
    version: asNullableNumber(data.version),
    order_id: assertString(data.order_id, 'Invalid order detail response: data.order_id'),
    master_label_id: asNullableString(data.master_label_id),
    organization_id: asNullableString(data.organization_id),
    customer_id: asNullableString(data.customer_id),
    pickup_address_id: asNullableString(data.pickup_address_id),
    pickup_address: asNullableString(data.pickup_address),
    pickup_line_1: asNullableString(data.pickup_line_1),
    pickup_line_2: asNullableString(data.pickup_line_2),
    pickup_city: asNullableString(data.pickup_city),
    pickup_state: asNullableString(data.pickup_state),
    pickup_country: asNullableString(data.pickup_country),
    pickup_postcode: asNullableString(data.pickup_postcode),
    status: assertString(data.status, 'Invalid order detail response: data.status'),
    created_by_id: asNullableString(data.created_by_id),
    created_by: parseOrderDetailCreatedBy(data.created_by),
    contact_user_id: asNullableString(data.contact_user_id),
    contact_user: parseOrderDetailContactUser(data.contact_user),
    payment_method: asNullableString(data.payment_method),
    payment_method_id: asNullableString(data.payment_method_id),
    payment_status: asNullableString(data.payment_status),
    card_last_four: asNullableString(data.card_last_four),
    linked_invoice_id: asNullableString(data.linked_invoice_id),
    linked_invoice_number: asNullableString(data.linked_invoice_number),
    requested_pickup_date: asNullableString(data.requested_pickup_date),
    actual_pickup_date: asNullableString(data.actual_pickup_date),
    pickup_driver: asNullableString(data.pickup_driver),
    pickup_route_id: asNullableString(data.pickup_route_id),
    pickup_vehicle: asNullableString(data.pickup_vehicle),
    pickup_contact_name: asNullableString(data.pickup_contact_name),
    pickup_contact_phone: asNullableString(data.pickup_contact_phone),
    subtotal: asNullableString(data.subtotal),
    vat_amount: asNullableString(data.vat_amount),
    total_amount: asNullableString(data.total_amount),
    price_breakdown: parseOrderDetailPriceBreakdown(data.price_breakdown),
    delivery_stops: deliveryStopsRaw.map((stop, index) =>
      parseOrderDetailDeliveryStop(stop, index)
    ),
  };
}

function compactQueryParams<T extends object>(args: T): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args as Record<string, unknown>)) {
    if (value == null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) params[key] = trimmed;
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value;
      continue;
    }
    params[key] = value;
  }
  return params;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<ApiResponse<OrdersListDataDto>, GetOrdersArgs>({
      query: (args) => ({
        url: '/orders',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrdersList', id: args.organization_id ?? 'self' },
      ],
    }),

    createOrder: build.mutation<ApiResponse<CreateOrderResponseDto>, CreateOrderRequestDto>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      // Only invalidate when the order was actually created. A failed POST keeps the
      // user on the payment step (so we don't want to trigger refetches that move the
      // org's orders list/summary off-screen) and the existing caches are still valid.
      invalidatesTags: (_result, error, body) =>
        error
          ? []
          : [
              { type: 'OrdersList', id: body.organization_id ?? 'self' },
              { type: 'OrdersSummary', id: body.organization_id ?? 'self' },
            ],
    }),

    /**
     * POST /orders/price-breakdown — server-side authoritative pricing for the wizard.
     * Mirrors `OrderPriceBreakdownRequest/Response` in `app/modules/orders/v1/schemas.py`.
     */
    getOrderPriceBreakdown: build.mutation<
      ApiResponse<OrderPriceBreakdownResponseDto>,
      OrderPriceBreakdownRequestDto
    >({
      query: (body) => ({
        url: '/orders/price-breakdown',
        method: 'POST',
        body,
      }),
    }),

    getOrdersSummary: build.query<ApiResponse<OrdersSummaryDataDto>, GetOrdersSummaryArgs>({
      query: (args) => ({
        url: '/orders/summary',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrdersSummary', id: args.organization_id ?? 'self' },
      ],
    }),

    getOrderDetail: build.query<ApiResponse<OrderDetailDto>, GetOrderDetailArgs>({
      query: ({ order_id }) => ({
        url: `/orders/detail/${encodeURIComponent(order_id)}`,
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => ({
        success: true as const,
        data: parseOrderDetailResponse(raw),
      }),
      providesTags: (_result, _error, arg) => [{ type: 'OrderDetail', id: arg.order_id }],
    }),

    getDeliveryStopDetail: build.query<
      ApiResponse<DeliveryStopDetailDto>,
      { order_id: string; stop_id: string }
    >({
      query: ({ order_id, stop_id }) => ({
        url: `/orders/${encodeURIComponent(order_id)}/stops/${encodeURIComponent(stop_id)}/detail`,
        method: 'GET',
      }),
      providesTags: (_r, _e, arg) => [{ type: 'OrderDetail', id: `stop-${arg.stop_id}` }],
    }),

    getStopNotes: build.query<
      ApiResponse<{ items: PortalStopNoteResponse[] }>,
      { orderId: string; stopId: string }
    >({
      query: ({ orderId, stopId }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/notes`,
        method: 'GET',
      }),
      providesTags: (_r, _e, arg) => [{ type: 'OrderDetail', id: `notes-${arg.stopId}` }],
    }),

    createStopNote: build.mutation<
      ApiResponse<PortalStopNoteResponse>,
      { orderId: string; stopId: string; payload: Record<string, unknown>; images?: File[] }
    >({
      query: ({ orderId, stopId, payload, images }) => {
        const fd = new FormData();
        if (images?.length) {
          for (const f of images) fd.append('images', f);
        }
        fd.append('note_data', JSON.stringify(payload));
        return {
          url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/notes`,
          method: 'POST',
          body: fd,
        };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'OrderDetail', id: `notes-${arg.stopId}` }],
    }),

    updateStopNote: build.mutation<
      ApiResponse<PortalStopNoteResponse>,
      {
        orderId: string;
        stopId: string;
        noteId: string;
        payload: Record<string, unknown>;
        images?: File[];
        deletedImageIds?: string[];
      }
    >({
      query: ({ orderId, stopId, noteId, payload, images, deletedImageIds }) => {
        const fd = new FormData();
        if (images?.length) {
          for (const f of images) fd.append('images', f);
        }
        fd.append('note_data', JSON.stringify(payload));
        if (deletedImageIds?.length) {
          fd.append('deleted_image_ids', JSON.stringify(deletedImageIds));
        }
        return {
          url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/notes/${encodeURIComponent(noteId)}`,
          method: 'PATCH',
          body: fd,
        };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'OrderDetail', id: `notes-${arg.stopId}` }],
    }),

    deleteStopNote: build.mutation<
      ApiResponse<{ deleted: boolean }>,
      { orderId: string; stopId: string; noteId: string }
    >({
      query: ({ orderId, stopId, noteId }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/notes/${encodeURIComponent(noteId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'OrderDetail', id: `notes-${arg.stopId}` }],
    }),

    updateStopPreferences: build.mutation<
      ApiResponse<{ signature_required: boolean; safe_place_allowed: boolean }>,
      {
        orderId: string;
        stopId: string;
        signature_required?: boolean;
        safe_place_allowed?: boolean;
      }
    >({
      query: ({ orderId, stopId, ...body }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/preferences`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: `stop-${arg.stopId}` },
        { type: 'OrderDetail', id: arg.orderId },
      ],
    }),

    updateStopServiceTier: build.mutation<
      ApiResponse<Record<string, unknown>>,
      { orderId: string; stopId: string; service_tier_id: string }
    >({
      query: ({ orderId, stopId, service_tier_id }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/service-tier`,
        method: 'PATCH',
        body: { service_tier_id },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: `stop-${arg.stopId}` },
        { type: 'OrderDetail', id: arg.orderId },
      ],
    }),

    updateStopDetails: build.mutation<
      ApiResponse<Record<string, unknown>>,
      {
        orderId: string;
        stopId: string;
        recipient_first_name?: string;
        recipient_last_name?: string;
        recipient_phone?: string;
        recipient_email?: string;
        line_1?: string;
        line_2?: string;
        city?: string;
        postcode?: string;
      }
    >({
      query: ({ orderId, stopId, ...body }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: `stop-${arg.stopId}` },
        { type: 'OrderDetail', id: arg.orderId },
      ],
    }),

    updateStopPackages: build.mutation<
      ApiResponse<Record<string, unknown>>,
      {
        orderId: string;
        stopId: string;
        packages: Array<{
          id: string;
          length_cm?: number;
          width_cm?: number;
          height_cm?: number;
          declared_weight_kg?: number;
          declared_value?: number;
        }>;
      }
    >({
      query: ({ orderId, stopId, packages }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/packages`,
        method: 'PATCH',
        body: { packages },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: `stop-${arg.stopId}` },
        { type: 'OrderDetail', id: arg.orderId },
      ],
    }),

    cancelOrder: build.mutation<
      ApiResponse<Record<string, unknown>>,
      { orderId: string; notes?: string }
    >({
      query: ({ orderId, notes }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/cancel`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: arg.orderId },
        { type: 'OrdersList', id: 'self' },
      ],
    }),

    cancelDeliveryStop: build.mutation<
      ApiResponse<Record<string, unknown>>,
      { orderId: string; stopId: string; notes?: string }
    >({
      query: ({ orderId, stopId, notes }) => ({
        url: `/orders/${encodeURIComponent(orderId)}/stops/${encodeURIComponent(stopId)}/cancel`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'OrderDetail', id: `stop-${arg.stopId}` },
        { type: 'OrderDetail', id: arg.orderId },
      ],
    }),

    /**
     * GET /orders/{order_id}/master-label — returns master + per-package labels.
     * Mirrors the admin portal's query so the client labels page can share the
     * same view-model. Untyped response (just `Record<string, unknown>`) keeps the
     * coupling loose; the page narrows fields at the use-site.
     */
    getOrderMasterLabel: build.query<ApiResponse<OrderLabelsResponseDto>, string>({
      query: (orderId) => ({
        url: `/orders/${encodeURIComponent(orderId)}/master-label`,
        method: 'GET',
      }),
      providesTags: (_r, _e, orderId) => [{ type: 'OrderDetail', id: `label-${orderId}` }],
    }),

    getFailedDeliveriesSummary: build.query<
      ApiResponse<FailedDeliveriesSummaryDataDto>,
      GetFailedDeliveriesSummaryArgs
    >({
      query: (args) => ({
        url: '/orders/failed-deliveries/summary',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrderFailedDeliveriesSummary', id: args.organization_id ?? 'self' },
      ],
    }),

    getFailedDeliveries: build.query<
      ApiResponse<FailedDeliveriesListDataDto>,
      GetFailedDeliveriesArgs
    >({
      query: (args) => ({
        url: '/orders/failed-deliveries',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrderFailedDeliveriesList', id: args.organization_id ?? 'self' },
      ],
    }),

    getOrderReturns: build.query<ApiResponse<ReturnsListDataDto>, GetReturnsArgs>({
      query: (args) => ({
        url: '/orders/returns',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrderReturnsList', id: args.organization_id ?? 'self' },
      ],
    }),

    getOrderReturnsSummary: build.query<
      ApiResponse<OrderReturnsSummaryDataDto>,
      GetOrderReturnsSummaryArgs
    >({
      query: (args) => ({
        url: '/orders/returns/summary',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrderReturnsSummary', id: args.organization_id ?? 'self' },
      ],
    }),

    getOrderDrafts: build.query<ApiResponse<OrderDraftsListDataDto>, GetOrderDraftsArgs>({
      query: (args) => ({
        url: '/orders/drafts',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      providesTags: (_result, _error, args) => [
        { type: 'OrderDraftsList', id: args.organization_id ?? 'self' },
      ],
    }),

    getOrderDraftById: build.query<ApiResponse<OrderDraftDetailDto>, GetOrderDraftByIdArgs>({
      query: ({ draft_id, organization_id }) => ({
        url: `/orders/drafts/${encodeURIComponent(draft_id)}`,
        method: 'GET',
        params: compactQueryParams({ organization_id }),
      }),
      providesTags: (_result, _error, args) => [{ type: 'OrderDraftDetail', id: args.draft_id }],
    }),

    createOrderDraft: build.mutation<ApiResponse<OrderDraftDetailDto>, CreateOrderDraftArgs>({
      query: ({ organization_id, body }) => ({
        url: '/orders/drafts',
        method: 'POST',
        body,
        params: compactQueryParams({ organization_id }),
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: 'OrderDraftsList', id: args.organization_id ?? 'self' },
      ],
    }),

    updateOrderDraft: build.mutation<ApiResponse<OrderDraftDetailDto>, UpdateOrderDraftArgs>({
      query: ({ draft_id, organization_id, body }) => ({
        url: `/orders/drafts/${encodeURIComponent(draft_id)}`,
        method: 'PATCH',
        body,
        params: compactQueryParams({ organization_id }),
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: 'OrderDraftDetail', id: args.draft_id },
        { type: 'OrderDraftsList', id: args.organization_id ?? 'self' },
      ],
    }),

    deleteOrderDraft: build.mutation<
      ApiResponse<{ success: boolean; message?: string }>,
      DeleteOrderDraftArgs
    >({
      query: ({ draft_id, organization_id }) => ({
        url: `/orders/drafts/${encodeURIComponent(draft_id)}`,
        method: 'DELETE',
        params: compactQueryParams({ organization_id }),
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: 'OrderDraftDetail', id: args.draft_id },
        { type: 'OrderDraftsList', id: args.organization_id ?? 'self' },
      ],
    }),

    submitOrderDraft: build.mutation<
      ApiResponse<SubmitOrderDraftResponseDto>,
      SubmitOrderDraftArgs
    >({
      query: ({ draft_id, organization_id, body }) => ({
        url: `/orders/drafts/${encodeURIComponent(draft_id)}/submit`,
        method: 'POST',
        body: body ?? {},
        params: compactQueryParams({ organization_id }),
      }),
      // Only invalidate on success. A failed final submit keeps the user on the
      // payment step; the draft + lists in cache are still authoritative.
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : [
              { type: 'OrderDraftDetail', id: args.draft_id },
              { type: 'OrderDraftsList', id: args.organization_id ?? 'self' },
              { type: 'OrdersList', id: args.organization_id ?? 'self' },
            ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useGetDeliveryStopDetailQuery,
  useGetStopNotesQuery,
  useCreateStopNoteMutation,
  useUpdateStopNoteMutation,
  useDeleteStopNoteMutation,
  useUpdateStopPreferencesMutation,
  useUpdateStopServiceTierMutation,
  useUpdateStopDetailsMutation,
  useUpdateStopPackagesMutation,
  useCancelOrderMutation,
  useCancelDeliveryStopMutation,
  useGetOrderMasterLabelQuery,
  useCreateOrderMutation,
  useGetOrderPriceBreakdownMutation,
  useGetOrdersSummaryQuery,
  useGetFailedDeliveriesSummaryQuery,
  useGetFailedDeliveriesQuery,
  useGetOrderReturnsQuery,
  useGetOrderReturnsSummaryQuery,
  useGetOrderDraftsQuery,
  useGetOrderDraftByIdQuery,
  useCreateOrderDraftMutation,
  useUpdateOrderDraftMutation,
  useDeleteOrderDraftMutation,
  useSubmitOrderDraftMutation,
} = ordersApi;
