import {
  normalizeApiValidationField,
  type ApiValidationErrorDetail,
} from '@/store/api/validationErrors';

/**
 * Dot-path keys aligned with {@link GeneralSettingsState} shape used on Company Details.
 * Examples: `companiesHouseNumber`, `registeredAddress.line1`, `pickupAddresses.0.postcode`.
 */
export type OrgProfileFormErrorPath = string;

const TOP_LEVEL: Record<string, OrgProfileFormErrorPath> = {
  trading_name: 'tradingName',
  legal_entity_name: 'legalEntityName',
  industry: 'industry',
  company_size: 'companySize',
  date_of_incorporation: 'dateOfIncorporation',
  description: 'businessDescription',
  phone: 'phone',
  website: 'website',
  companies_house_number: 'companiesHouseNumber',
  eori_number: 'eoriNumber',
  vat_number: 'vatNumber',
  trading_same_as_registered_address: '__root.trading_same_as_registered_address',
};

const ADDRESS_LINE_TO_UI: Record<string, string> = {
  address_line_1: 'line1',
  address_line_2: 'line2',
  line_1: 'line1',
  line_2: 'line2',
  city: 'city',
  postcode: 'postcode',
  country: 'country',
  region: 'region',
  state: 'region',
};

const PICKUP_BRACKET_RE = /^pickup_addresses\[(\d+)\]\.(.+)$/;
const PICKUP_DOT_RE = /^pickup_addresses\.(\d+)\.(.+)$/;

/**
 * Canonical API field path for matching: strips `body.` / `payload.`, lowercases,
 * normalizes `pickup_addresses[0].x` → `pickup_addresses.0.x`, collapses underscores.
 */
export function canonicalizeOrgProfileApiField(field: string): string {
  let f = normalizeApiValidationField(field).trim().toLowerCase();
  f = f.replace(/\[(\d+)\]/g, '.$1');
  f = f.replace(/\s+/g, '_');
  f = f.replace(/_+/g, '_');
  f = f.replace(/\.+/g, '.');
  return f.replace(/^\.+|\.+$/g, '');
}

function mapAddressSuffix(
  prefix: 'registeredAddress' | 'tradingAddress',
  suffix: string
): OrgProfileFormErrorPath | null {
  const uiKey = ADDRESS_LINE_TO_UI[suffix];
  if (!uiKey) return null;
  return `${prefix}.${uiKey}`;
}

/**
 * Map a single normalized API `field` string to a form dot-path, or `null` if unknown.
 */
export function mapOrgProfileApiFieldToFormPath(rawField: string): OrgProfileFormErrorPath | null {
  const normalizedField = canonicalizeOrgProfileApiField(rawField);
  if (TOP_LEVEL[normalizedField]) {
    return TOP_LEVEL[normalizedField];
  }

  if (normalizedField.startsWith('registered_address.')) {
    const suffix = normalizedField.slice('registered_address.'.length);
    return mapAddressSuffix('registeredAddress', suffix);
  }

  if (normalizedField.startsWith('trading_address.')) {
    const suffix = normalizedField.slice('trading_address.'.length);
    return mapAddressSuffix('tradingAddress', suffix);
  }

  const pickupMatch =
    PICKUP_BRACKET_RE.exec(normalizedField) ?? PICKUP_DOT_RE.exec(normalizedField);
  if (pickupMatch) {
    const index = pickupMatch[1];
    const rest = pickupMatch[2];
    if (rest === 'line_1') return `pickupAddresses.${index}.line1`;
    if (rest === 'line_2') return `pickupAddresses.${index}.line2`;
    if (rest === 'city') return `pickupAddresses.${index}.city`;
    if (rest === 'state' || rest === 'region') return `pickupAddresses.${index}.region`;
    if (rest === 'postcode') return `pickupAddresses.${index}.postcode`;
    if (rest === 'country') return `pickupAddresses.${index}.country`;
    if (rest === 'label') return `pickupAddresses.${index}.label`;
    if (rest === 'is_default') return `pickupAddresses.${index}.isDefault`;
    if (rest === 'same_as_registered_address') return `pickupAddresses.${index}.sameAsRegistered`;
    if (rest === 'same_as_trading_address') return `pickupAddresses.${index}.sameAsTrading`;
    return `pickupAddresses.${index}.${rest}`;
  }

  return null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turn a canonical API path (`vat_number`, `registered_address.postcode`) into a URL-style slug
 * for user-visible copy (`vat-number`, `registered-address.postcode`).
 */
export function apiFieldPathToKebabSlug(canonicalField: string): string {
  return canonicalField.replace(/_/g, '-');
}

/**
 * Replace snake_case API path tokens in a validation `message` with kebab slugs (toast + inline).
 */
export function detailMessageWithApiFieldAsKebabSlug(detail: ApiValidationErrorDetail): string {
  const canon = canonicalizeOrgProfileApiField(detail.field);
  if (canon.length === 0 || canon.startsWith('__')) {
    return detail.message;
  }
  const slug = apiFieldPathToKebabSlug(canon);
  if (slug === canon) {
    return detail.message;
  }
  return detail.message.replace(new RegExp(escapeRegExp(canon), 'gi'), slug);
}

/**
 * Join validation detail lines for a toast: each line has API field paths shown as kebab slugs.
 */
export function summarizeOrgProfileValidationDetailsForToast(
  details: ApiValidationErrorDetail[],
  fallbackMessage?: string
): string {
  if (details.length === 0) {
    const fb = fallbackMessage?.trim();
    return fb && fb.length > 0 ? fb : 'Validation error';
  }
  const lines = details.map((d) => detailMessageWithApiFieldAsKebabSlug(d));
  return joinUniqueMessages(lines);
}

function joinUniqueMessages(messages: string[]): string {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const m of messages) {
    const t = m.trim();
    if (t.length === 0 || seen.has(t)) {
      continue;
    }
    seen.add(t);
    ordered.push(t);
  }
  return ordered.join(' · ');
}

/**
 * Build a flat map path → message for UI. Multiple API rows for the same field are merged.
 * Unmapped fields are merged into `__root.__unmapped`.
 */
export function buildOrgProfileServerFieldErrorMap(
  details: ApiValidationErrorDetail[]
): Record<string, string> {
  const buckets: Record<string, string[]> = {};
  const unmapped: string[] = [];

  for (const d of details) {
    const path = mapOrgProfileApiFieldToFormPath(d.field);
    if (path) {
      if (!buckets[path]) {
        buckets[path] = [];
      }
      buckets[path].push(detailMessageWithApiFieldAsKebabSlug(d));
    } else {
      unmapped.push(detailMessageWithApiFieldAsKebabSlug(d));
    }
  }

  const out: Record<string, string> = {};
  for (const [path, messages] of Object.entries(buckets)) {
    out[path] = joinUniqueMessages(messages);
  }

  if (unmapped.length > 0) {
    out['__root.__unmapped'] = joinUniqueMessages(unmapped);
  }

  return out;
}
