export interface PortalDeliveryStopApi {
  id: string;
  recipient_first_name?: string | null;
  recipient_last_name?: string | null;
  recipient_phone?: string | null;
  recipient_email?: string | null;
  line_1?: string | null;
  line_2?: string | null;
  city?: string | null;
  postcode?: string | null;
  status?: string | null;
  packages_count?: number | null;
  scheduled_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  delivery_attempts?: number | null;
  max_delivery_attempts?: number | null;
}

export interface PortalPriceBreakdownWeightCharge {
  price_per_kg?: string | number | null;
  weight_kg?: number | null;
  amount?: string | number | null;
}

export interface PortalPriceBreakdownPackage {
  id: string;
  package_id?: string;
  package_index?: number | null;
  declared_weight_kg?: number | null;
  per_package_charge?: string | number | null;
  weight_charge?: PortalPriceBreakdownWeightCharge | null;
  total?: string | number | null;
}

export interface PortalPriceBreakdownDiscount {
  type?: string;
  value?: string | number | null;
  amount?: string | number | null;
}

export interface PortalPriceBreakdownPricingPlan {
  plain_name?: string | null;
  price_per_kg?: string | number | null;
  price_per_package?: string | number | null;
  color?: string | null;
}

export interface PortalPriceBreakdownStop {
  id: string;
  stop_index?: number;
  service_tier?: string;
  pricing_plan?: PortalPriceBreakdownPricingPlan | null;
  base_price?: string | number | null;
  packages_subtotal?: string | number | null;
  subtotal?: string | number | null;
  vat_amount?: string | number | null;
  total?: string | number | null;
  vat_rate_pct?: string | number | null;
  discounts?: PortalPriceBreakdownDiscount[];
  packages?: PortalPriceBreakdownPackage[];
}

export interface PortalPriceBreakdown {
  subtotal?: string | number | null;
  vat_amount?: string | number | null;
  total?: string | number | null;
  stops?: PortalPriceBreakdownStop[];
}

export interface PortalOrderDetail {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  created_by: string;
  requested_pickup_date: string | null;
  actual_pickup_date: string | null;
  pickup_driver: string | null;
  pickup_route_id: string | null;
  pickup_vehicle: string | null;
  payment_method: string | null;
  payment_status: string | null;
  card_last_four: string | null;
  linked_invoice_id: string | null;
  linked_invoice_number: string | null;
  pickup_postcode: string | null;
  pickup_address: string | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  pickup_contact_email: string | null;
  price_breakdown: PortalPriceBreakdown;
  delivery_stops: PortalDeliveryStopApi[];
}

export function getPortalOrderDetailByRouteId(routeId: string): PortalOrderDetail {
  const order_id = decodeURIComponent(routeId).trim();
  return {
    id: order_id || 'unknown',
    order_id,
    status: 'PENDING_PICKUP',
    created_at: '',
    created_by: '',
    requested_pickup_date: null,
    actual_pickup_date: null,
    pickup_driver: null,
    pickup_route_id: null,
    pickup_vehicle: null,
    payment_method: null,
    payment_status: null,
    card_last_four: null,
    linked_invoice_id: null,
    linked_invoice_number: null,
    pickup_postcode: null,
    pickup_address: null,
    pickup_contact_name: null,
    pickup_contact_phone: null,
    pickup_contact_email: null,
    price_breakdown: { stops: [] },
    delivery_stops: [],
  };
}
