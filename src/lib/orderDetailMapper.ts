import type { OrderDetailDto, OrderDetailCreatedByDto } from '@/store/api/ordersApi';
import type {
  PortalOrderDetail,
  PortalPriceBreakdown,
  PortalPriceBreakdownStop,
} from '@/lib/portalOrderDetailMock';
import type { OrganizationPickupAddressDto } from '@/store/api/organizationProfileApi';

function formatPickupAddressLine(address: OrganizationPickupAddressDto): string {
  return [address.line_1, address.line_2, address.city, address.postcode, address.country]
    .filter(Boolean)
    .join(' ');
}

function resolveInlinePickupAddress(detail: OrderDetailDto): string | null {
  const singleLine = detail.pickup_address?.trim();
  if (singleLine) return singleLine;
  const composed = [
    detail.pickup_line_1,
    detail.pickup_line_2,
    detail.pickup_city,
    detail.pickup_state,
    detail.pickup_postcode,
    detail.pickup_country,
  ]
    .filter(Boolean)
    .join(', ');
  return composed.trim() || null;
}

function resolvePickupPostcode(
  detail: OrderDetailDto,
  matchedPickup: OrganizationPickupAddressDto | undefined
): string | null {
  return detail.pickup_postcode?.trim() || matchedPickup?.postcode?.trim() || null;
}

function resolvePickupAddressLabel(
  detail: OrderDetailDto,
  pickupAddresses: OrganizationPickupAddressDto[] | undefined
): string | null {
  const inline = resolveInlinePickupAddress(detail);
  if (inline) return inline;
  const pickupAddressId = detail.pickup_address_id;
  if (!pickupAddressId?.trim()) return null;
  const match = (pickupAddresses ?? []).find((row) => row.id === pickupAddressId);
  if (!match) return null;
  return formatPickupAddressLine(match);
}

function resolveCreatedByLabel(createdBy?: OrderDetailCreatedByDto | string | null): string {
  if (!createdBy) return '—';
  if (typeof createdBy === 'string') return createdBy.trim() || '—';
  const email = createdBy.email?.trim();
  if (email) return email;
  const fullName = [createdBy.first_name, createdBy.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  const name = createdBy.name?.trim();
  return name || '—';
}

function mapPriceBreakdown(detail: OrderDetailDto): PortalPriceBreakdown {
  const breakdown = detail.price_breakdown;
  if (!breakdown) {
    return {
      subtotal: detail.subtotal,
      vat_amount: detail.vat_amount,
      total: detail.total_amount,
      stops: [],
    };
  }

  const stops: PortalPriceBreakdownStop[] = (breakdown.stops ?? []).map((stop) => ({
    id: stop.id,
    stop_index: stop.stop_index ?? undefined,
    service_tier: stop.service_tier ?? undefined,
    pricing_plan: stop.pricing_plan
      ? {
          plain_name: stop.pricing_plan.plain_name ?? null,
          price_per_kg: stop.pricing_plan.price_per_kg ?? null,
          price_per_package: stop.pricing_plan.price_per_package ?? null,
          color: stop.pricing_plan.color ?? null,
        }
      : null,
    base_price: stop.base_price ?? undefined,
    packages_subtotal: stop.packages_subtotal ?? undefined,
    subtotal: stop.subtotal ?? undefined,
    vat_amount: stop.vat_amount ?? undefined,
    total: stop.total ?? undefined,
    vat_rate_pct: stop.vat_rate_pct ?? undefined,
    discounts: stop.discounts?.map((d) => ({
      type: d.type ?? undefined,
      value: d.value ?? undefined,
      amount: d.amount ?? undefined,
    })),
    packages: stop.packages?.map((pkg) => ({
      id: pkg.id,
      package_id: pkg.package_id ?? undefined,
      declared_weight_kg: pkg.declared_weight_kg ?? undefined,
      per_package_charge: pkg.per_package_charge ?? undefined,
      weight_charge: pkg.weight_charge
        ? {
            price_per_kg: pkg.weight_charge.price_per_kg ?? null,
            weight_kg: pkg.weight_charge.weight_kg ?? null,
            amount: pkg.weight_charge.amount ?? null,
          }
        : null,
      total: pkg.total ?? undefined,
    })),
  }));

  return {
    subtotal: breakdown.subtotal ?? detail.subtotal,
    vat_amount: breakdown.vat_amount ?? detail.vat_amount,
    total: breakdown.total ?? detail.total_amount,
    stops,
  };
}

/** Maps API order detail into the portal order-details view model. */
export function mapOrderDetailToPortalView(
  detail: OrderDetailDto,
  options?: {
    pickupAddresses?: OrganizationPickupAddressDto[];
    createdByLabel?: string | null;
  }
): PortalOrderDetail {
  const pickupAddresses = options?.pickupAddresses;
  const matchedPickup = pickupAddresses?.find((row) => row.id === detail.pickup_address_id);
  const resolvedPickup = resolvePickupAddressLabel(detail, pickupAddresses);

  const createdBy =
    options?.createdByLabel?.trim() || resolveCreatedByLabel(detail.created_by) || '—';

  return {
    id: detail.id,
    order_id: detail.order_id,
    status: detail.status,
    created_at: detail.created_at,
    created_by: createdBy,
    requested_pickup_date: detail.requested_pickup_date ?? null,
    actual_pickup_date: detail.actual_pickup_date ?? null,
    pickup_driver: detail.pickup_driver ?? null,
    pickup_route_id: detail.pickup_route_id ?? null,
    pickup_vehicle: detail.pickup_vehicle ?? null,
    payment_method: detail.payment_method ?? null,
    payment_status: detail.payment_status ?? null,
    card_last_four: detail.card_last_four ?? null,
    linked_invoice_id: detail.linked_invoice_id ?? null,
    linked_invoice_number: detail.linked_invoice_number ?? null,
    pickup_postcode: resolvePickupPostcode(detail, matchedPickup),
    pickup_address: resolvedPickup,
    pickup_contact_name:
      [detail.contact_user?.first_name, detail.contact_user?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      detail.pickup_contact_name ||
      null,
    pickup_contact_phone: detail.contact_user?.phone ?? detail.pickup_contact_phone ?? null,
    pickup_contact_email: detail.contact_user?.email ?? null,
    price_breakdown: mapPriceBreakdown(detail),
    delivery_stops: (detail.delivery_stops ?? []).map((stop) => ({
      id: stop.id,
      recipient_first_name: stop.recipient_first_name,
      recipient_last_name: stop.recipient_last_name,
      recipient_phone: stop.recipient_phone,
      recipient_email: stop.recipient_email,
      line_1: stop.line_1,
      line_2: stop.line_2,
      city: stop.city,
      postcode: stop.postcode,
      status: stop.status,
      packages_count: stop.packages_count,
      scheduled_delivery_date: stop.scheduled_delivery_date ?? null,
      actual_delivery_date: stop.actual_delivery_date ?? null,
      delivery_attempts: stop.delivery_attempts ?? null,
      max_delivery_attempts: stop.max_delivery_attempts ?? null,
    })),
  };
}
