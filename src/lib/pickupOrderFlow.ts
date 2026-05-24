import type { PickupConfirmationMock, PickupConfirmationPackageMock } from '@/lib/data';
import type {
  CreateOrderDeliveryStopDto,
  CreateOrderPackageDto,
  CreateOrderRequestDto,
} from '@/store/api/ordersApi';
import { resolvePickupAddressId } from '@/lib/pickupAddressForm';
import type { PackageDeliveryFormData, PickupRequestFormData } from '@/schemas/pickup.schema';

export type PickupPaymentMethodKind = 'card' | 'bank_transfer' | 'credit_account' | 'cash';

export interface PickupPaymentSelection {
  method: PickupPaymentMethodKind;
  methodId: string;
  cardId?: string;
  nonce?: string;
}

export interface PickupConfirmationRouteState {
  orderId: string;
  confirmation: PickupConfirmationMock;
}

const STORAGE_KEY = 'pickup-confirmation-v1';

function asOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asOptionalNumber(value: string | undefined): number | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return undefined;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function ensurePackageValues(pkg: CreateOrderPackageDto): CreateOrderPackageDto {
  return {
    length_cm: Number.isFinite(pkg.length_cm) ? pkg.length_cm : 0,
    width_cm: Number.isFinite(pkg.width_cm) ? pkg.width_cm : 0,
    height_cm: Number.isFinite(pkg.height_cm) ? pkg.height_cm : 0,
    declared_weight_kg: Number.isFinite(pkg.declared_weight_kg) ? pkg.declared_weight_kg : 0,
    declared_value: Number.isFinite(pkg.declared_value ?? Number.NaN)
      ? pkg.declared_value
      : undefined,
  };
}

/**
 * Map step-2 form data to the create-order / price-breakdown stop DTOs.
 *
 * Callers should pass a tier-name resolver so we can send both `service_tier_id`
 * (UUID) and `service_tier_name` to the server — the BE accepts either but we
 * send both so it can render snapshots and discount labels without re-resolving.
 */
export function buildDeliveryStops(
  packageDeliveryData: PackageDeliveryFormData | null,
  resolveTierName?: (tierId: string) => string | undefined
): CreateOrderDeliveryStopDto[] {
  return (
    packageDeliveryData?.deliveryItems?.map((item) => {
      const tierId = asOptionalString(item.deliveryPackage);
      const tierName = tierId && resolveTierName ? resolveTierName(tierId) : undefined;
      return {
        recipient_first_name: asOptionalString(item.recipientFirstName) ?? '',
        recipient_last_name: asOptionalString(item.recipientLastName) ?? '',
        recipient_phone: asOptionalString(item.contactNumber) ?? '',
        recipient_email: asOptionalString(item.recipientEmail),
        line_1: asOptionalString(item.addressLine1) ?? '',
        line_2: asOptionalString(item.addressLine2),
        city: asOptionalString(item.city) ?? '',
        postcode: asOptionalString(item.postalCode) ?? '',
        service_tier_id: tierId,
        service_tier_name: tierName,
        signature_required: item.deliveryInstruction === 'signature',
        safe_place_allowed: item.deliveryInstruction === 'safe_place',
        customer_note: asOptionalString(item.stopNotes),
        packages:
          item.packages?.map((pkg) =>
            ensurePackageValues({
              length_cm: asOptionalNumber(pkg.length) ?? 0,
              width_cm: asOptionalNumber(pkg.width) ?? 0,
              height_cm: asOptionalNumber(pkg.height) ?? 0,
              declared_weight_kg: asOptionalNumber(pkg.weight) ?? 0,
              declared_value: asOptionalNumber(pkg.declaredValue),
            })
          ) ?? [],
      };
    }) ?? []
  );
}

/**
 * Reconstruct `PackageDeliveryFormData` from a draft's canonical `delivery_stops`.
 *
 * The BE schema (`OrderDraftPayload`) drops unknown keys, so the FE's previous
 * `package_delivery_data` snapshot doesn't survive a round-trip. We rebuild Step 2's
 * form data straight from the validated `delivery_stops`, which is what the server
 * actually persists. Numeric package fields come back as numbers — we coerce them
 * to strings to match the form's text-input schema.
 */
export function buildPackageDeliveryDataFromDraftStops(
  stops: unknown
): PackageDeliveryFormData | null {
  if (!Array.isArray(stops) || stops.length === 0) return null;
  const items = stops
    .map((raw): PackageDeliveryFormData['deliveryItems'][number] | null => {
      if (!raw || typeof raw !== 'object') return null;
      const stop = raw as Record<string, unknown>;
      const packagesRaw = Array.isArray(stop.packages) ? stop.packages : [];
      const packages = packagesRaw
        .map((p): PackageDeliveryFormData['deliveryItems'][number]['packages'][number] | null => {
          if (!p || typeof p !== 'object') return null;
          const pkg = p as Record<string, unknown>;
          return {
            length: toFormString(pkg.length_cm),
            width: toFormString(pkg.width_cm),
            height: toFormString(pkg.height_cm),
            weight: toFormString(pkg.declared_weight_kg),
            declaredValue: toFormString(pkg.declared_value),
          };
        })
        .filter((p): p is NonNullable<typeof p> => p != null);
      const signature = stop.signature_required === true;
      const safePlace = stop.safe_place_allowed === true;
      return {
        recipientFirstName: toFormString(stop.recipient_first_name),
        recipientLastName: toFormString(stop.recipient_last_name),
        recipientEmail: toFormString(stop.recipient_email),
        addressLine1: toFormString(stop.line_1),
        addressLine2: toFormString(stop.line_2),
        city: toFormString(stop.city),
        postalCode: toFormString(stop.postcode),
        contactNumber: toFormString(stop.recipient_phone),
        stopNotes: toFormString(stop.customer_note),
        deliveryInstruction: signature ? 'signature' : safePlace ? 'safe_place' : 'signature',
        deliveryPackage: toFormString(stop.service_tier_id),
        packages: packages.length
          ? packages
          : [{ length: '', width: '', height: '', weight: '', declaredValue: '' }],
      };
    })
    .filter((i): i is NonNullable<typeof i> => i != null);
  if (items.length === 0) return null;
  return { deliveryItems: items };
}

function toFormString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  // Anything else (object, array, function, symbol) would stringify to
  // '[object Object]' / similar — not useful for a form field. Drop it.
  return '';
}

export function buildOrderDraftPayload(
  requestorData: PickupRequestFormData,
  packageDeliveryData: PackageDeliveryFormData | null,
  organizationId: string | null,
  contactUserId: string | null,
  resolveTierName?: (tierId: string) => string | undefined,
  /**
   * Live price-breakdown grand total from Step 4. Persisted on the draft so the
   * drafts-list API can surface the order value without re-running the breakdown.
   * Pass `undefined` when saving from an earlier step.
   */
  priceBreakdownTotal?: number
): Record<string, unknown> {
  const pickupAddressId = resolvePickupAddressId(requestorData.pickupAddress);
  const deliveryStops = buildDeliveryStops(packageDeliveryData, resolveTierName);
  const totalAmount =
    priceBreakdownTotal != null && Number.isFinite(priceBreakdownTotal) && priceBreakdownTotal > 0
      ? priceBreakdownTotal
      : undefined;

  return {
    client_type: 'B2B',
    organization_id: organizationId ?? undefined,
    contact_user_id: contactUserId ?? '',
    pickup_address_id: pickupAddressId,
    delivery_stops: deliveryStops,
    total_amount: totalAmount,
    // UI snapshots for draft restore (backend may ignore unknown keys).
    pickup_details: {
      contact_name: asOptionalString(requestorData.contactName),
      phone: asOptionalString(requestorData.phone),
      email: asOptionalString(requestorData.email),
      company_name: asOptionalString(requestorData.companyName),
      reference: asOptionalString(requestorData.reference),
      special_instructions: asOptionalString(requestorData.specialInstructions),
    },
    pickup_address: {
      pickup_info: pickupAddressId,
      person_first_name: asOptionalString(requestorData.pickupAddress.personFirstName),
      person_second_name: asOptionalString(requestorData.pickupAddress.personSecondName),
      line_1: asOptionalString(requestorData.pickupAddress.addressLine),
      line_2: asOptionalString(requestorData.pickupAddress.addressLine2),
      city: asOptionalString(requestorData.pickupAddress.city),
      state: asOptionalString(requestorData.pickupAddress.state),
      postcode: asOptionalString(requestorData.pickupAddress.postalCode),
      country: asOptionalString(requestorData.pickupAddress.country),
    },
    package_delivery_data: packageDeliveryData ?? undefined,
  };
}

function mapPaymentMethod(kind: PickupPaymentMethodKind): string {
  if (kind === 'bank_transfer') return 'BANK_TRANSFER';
  if (kind === 'credit_account') return 'CREDIT_ACCOUNT';
  if (kind === 'cash') return 'CASH';
  return 'CARD';
}

export function buildCreateOrderPayload(args: {
  requestorData: PickupRequestFormData;
  packageDeliveryData: PackageDeliveryFormData | null;
  organizationId: string | null;
  contactUserId: string | null;
  payment: PickupPaymentSelection;
  resolveTierName?: (tierId: string) => string | undefined;
}): CreateOrderRequestDto {
  const { requestorData, packageDeliveryData, organizationId, contactUserId, payment } = args;
  const pickupAddressId = resolvePickupAddressId(requestorData.pickupAddress) ?? 'manual-entry';
  const methodId = payment.methodId.trim() || mapPaymentMethod(payment.method);

  return {
    client_type: 'B2B',
    organization_id: organizationId ?? undefined,
    contact_user_id: contactUserId ?? '',
    pickup_address_id: pickupAddressId,
    payment_method: mapPaymentMethod(payment.method),
    payment_method_id: methodId,
    credit_card_id: payment.cardId,
    payment_method_nonce: payment.nonce,
    delivery_stops: buildDeliveryStops(packageDeliveryData, args.resolveTierName),
  };
}

function countTotalPackages(packageDeliveryData: PackageDeliveryFormData | null): number {
  return (packageDeliveryData?.deliveryItems ?? []).reduce(
    (sum, item) => sum + item.packages.length,
    0
  );
}

function parseKg(weight: string): number {
  const parsed = Number.parseFloat(weight.replace(/[^0-9.-]/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function calcVolumeCm3(length: string, width: string, height: string): number {
  const l = Number.parseFloat(length.replace(/[^0-9.-]/g, '').trim());
  const w = Number.parseFloat(width.replace(/[^0-9.-]/g, '').trim());
  const h = Number.parseFloat(height.replace(/[^0-9.-]/g, '').trim());
  if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return 0;
  return l * w * h;
}

function packageSlaLabel(value: string | undefined): string {
  if (value === '4day') return '4 DAYS DELIVERY';
  if (value === '8day') return '8 DAYS DELIVERY';
  return '5 DAYS DELIVERY';
}

function buildPackageRows(
  orderId: string,
  requestorData: PickupRequestFormData,
  packageDeliveryData: PackageDeliveryFormData | null
): PickupConfirmationPackageMock[] {
  const rows: PickupConfirmationPackageMock[] = [];
  const pickupName = requestorData.contactName?.trim() || 'Pickup Contact';
  const fromAddress = [
    pickupName,
    requestorData.pickupAddress.addressLine,
    requestorData.pickupAddress.city,
    requestorData.pickupAddress.postalCode,
  ]
    .filter(Boolean)
    .join('\n');

  (packageDeliveryData?.deliveryItems ?? []).forEach((item, stopIndex) => {
    const toAddress = [
      `${item.recipientFirstName} ${item.recipientLastName}`.trim(),
      item.addressLine1,
      item.city,
      item.postalCode,
      'UK',
    ]
      .filter(Boolean)
      .join('\n');

    item.packages.forEach((pkg, packageIndex) => {
      const packageNumber = rows.length + 1;
      const packageCode = `${orderId}-P${String(packageNumber).padStart(3, '0')}`;
      rows.push({
        id: `pkg-${stopIndex + 1}-${packageIndex + 1}`,
        packageIdDisplay: `#${packageCode}`,
        trackingIdDisplay: `#${orderId}`,
        fromAddress,
        toAddress,
        weight: `${pkg.weight.trim()} kg`,
        dimensions: `${pkg.length.trim()} x ${pkg.width.trim()} x ${pkg.height.trim()} cm`,
        volume: `${(calcVolumeCm3(pkg.length, pkg.width, pkg.height) / 1_000_000).toFixed(2)} m3`,
        signatureRequiredValue: item.deliveryInstruction === 'signature' ? 'YES' : 'NO',
        deliverySla: packageSlaLabel(item.deliveryPackage),
        barcodeValue: packageCode.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
        qrValue: `https://www.swcouriers.co.uk/track?pkg=${encodeURIComponent(packageCode)}`,
      });
    });
  });

  return rows;
}

function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

function formatVolumeM3(volumeCm3: number): string {
  return `${(volumeCm3 / 1_000_000).toFixed(2)} m3`;
}

function pickPrimaryDimensions(packageDeliveryData: PackageDeliveryFormData | null): string {
  const firstPackage = packageDeliveryData?.deliveryItems?.[0]?.packages?.[0];
  if (!firstPackage) return '—';
  return `${firstPackage.length.trim()} x ${firstPackage.width.trim()} x ${firstPackage.height.trim()} cm`;
}

export function buildPickupConfirmationData(args: {
  orderId: string;
  requestorData: PickupRequestFormData;
  packageDeliveryData: PackageDeliveryFormData | null;
}): PickupConfirmationMock {
  const { orderId, requestorData, packageDeliveryData } = args;
  const packages = buildPackageRows(orderId, requestorData, packageDeliveryData);
  const totalPackages = countTotalPackages(packageDeliveryData);
  const totalWeight = (packageDeliveryData?.deliveryItems ?? []).reduce(
    (sum, item) =>
      sum + item.packages.reduce((packageSum, pkg) => packageSum + parseKg(pkg.weight), 0),
    0
  );
  const totalVolumeCm3 = (packageDeliveryData?.deliveryItems ?? []).reduce(
    (sum, item) =>
      sum +
      item.packages.reduce(
        (packageSum, pkg) => packageSum + calcVolumeCm3(pkg.length, pkg.width, pkg.height),
        0
      ),
    0
  );
  const pickupAddress = [
    requestorData.contactName?.trim() ?? '',
    requestorData.pickupAddress.addressLine,
    requestorData.pickupAddress.addressLine2,
    `${requestorData.pickupAddress.city}, ${requestorData.pickupAddress.postalCode}`,
    'UK',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    orderIdDisplay: `# ${orderId}`,
    pickupAddress,
    masterLabelCode: `${orderId}-MASTER`,
    masterBarcodeValue: `${orderId.replace(/[^A-Z0-9]/gi, '').toUpperCase()}MASTER`,
    masterQrValue: `https://www.swcouriers.co.uk/track?order=${encodeURIComponent(orderId)}&type=master`,
    verticalBarcodeValue: `${orderId}-MASTER`,
    deliveryStops: String(packageDeliveryData?.deliveryItems.length ?? 0).padStart(2, '0'),
    totalPackagesCount: String(totalPackages).padStart(2, '0'),
    totalWeight: formatWeight(totalWeight),
    totalVolume: formatVolumeM3(totalVolumeCm3),
    totalDimensions: pickPrimaryDimensions(packageDeliveryData),
    returnAddress: pickupAddress,
    packages,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function extractOrderId(value: unknown): string | null {
  const data = asObject(value);
  const directKeys = ['order_id', 'orderId', 'id', 'reference'];
  for (const key of directKeys) {
    const candidate = data[key];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  const nestedData = asObject(data.data);
  for (const key of directKeys) {
    const candidate = nestedData[key];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

/**
 * Extracts the order UUID from a create-order response. Distinct from
 * extractOrderId, which returns the human-readable reference (SWC-ORD-…)
 * needed for display. The master-label and invoice endpoints want this UUID.
 */
export function extractOrderUuid(value: unknown): string | null {
  const data = asObject(value);
  const candidate = data.id;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }
  const nestedCandidate = asObject(data.data).id;
  if (typeof nestedCandidate === 'string' && nestedCandidate.trim().length > 0) {
    return nestedCandidate.trim();
  }
  return null;
}

type ConfirmationStore = Record<string, PickupConfirmationMock>;

function readStore(): ConfirmationStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ConfirmationStore;
  } catch {
    return {};
  }
}

export function savePickupConfirmation(
  orderId: string,
  confirmation: PickupConfirmationMock
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = readStore();
    existing[orderId] = confirmation;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    window.sessionStorage.setItem(`${STORAGE_KEY}:latest`, orderId);
  } catch {
    // Ignore browser storage failures.
  }
}

export function getPickupConfirmation(orderId: string): PickupConfirmationMock | null {
  const store = readStore();
  return store[orderId] ?? null;
}

export function getLatestPickupConfirmation(): PickupConfirmationMock | null {
  if (typeof window === 'undefined') return null;
  const latestOrderId = window.sessionStorage.getItem(`${STORAGE_KEY}:latest`);
  if (!latestOrderId) return null;
  return getPickupConfirmation(latestOrderId);
}
