import type { PaymentMethodResponse } from '@/store/api/paymentsApi';
import type { Account } from '@/types/account';

export type SavedCardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface SavedCardOption {
  id: string;
  brand: SavedCardBrand;
  label: string;
  lastFour: string;
  isDefault: boolean;
  expiryLabel: string | null;
}

const CARD_PATTERNS: NonNullable<Account['pattern']>[] = ['diagonal', 'lines', 'circles'];

export function detectCardBrand(cardType: string | null | undefined): SavedCardBrand {
  const normalized = cardType?.trim().toUpperCase() ?? '';
  if (normalized.includes('MASTER') || normalized === 'MC') return 'mastercard';
  if (normalized.includes('VISA')) return 'visa';
  if (normalized.includes('AMEX') || normalized.includes('AMERICAN')) return 'amex';
  return 'unknown';
}

export function formatCardBrandLabel(brand: SavedCardBrand): string {
  switch (brand) {
    case 'mastercard':
      return 'Mastercard';
    case 'visa':
      return 'Visa';
    case 'amex':
      return 'American Express';
    default:
      return 'Card';
  }
}

export function formatCardExpiry(month: number | null, year: number | null): string {
  if (month == null || year == null) return '--/--';
  const m = String(month).padStart(2, '0');
  const y = year >= 100 ? String(year).slice(-2) : String(year).padStart(2, '0');
  return `${m}/${y}`;
}

export function isActivePaymentCard(card: PaymentMethodResponse): boolean {
  const status = card.status?.trim().toUpperCase();
  if (!status) return true;
  return status === 'ACTIVE';
}

export function mapPaymentMethodToAccount(pm: PaymentMethodResponse, index: number): Account {
  const last = pm.last_four?.trim() || '****';
  const cardType = pm.card_type?.trim().toUpperCase() || 'CARD';
  return {
    id: pm.id,
    cardholderName: pm.cardholder_name?.trim() || 'Cardholder',
    cardNumber: `**** **** **** ${last}`,
    expiry: formatCardExpiry(pm.expiry_month, pm.expiry_year),
    card_type: cardType,
    isDefault: pm.is_default,
    pattern: CARD_PATTERNS[index % CARD_PATTERNS.length],
  };
}

export function mapPaymentMethodToSavedCardOption(card: PaymentMethodResponse): SavedCardOption {
  const brand = detectCardBrand(card.card_type);
  const lastFour = card.last_four?.trim() || '****';
  return {
    id: card.id,
    brand,
    label: formatCardBrandLabel(brand),
    lastFour,
    isDefault: card.is_default,
    expiryLabel: formatCardExpiry(card.expiry_month, card.expiry_year),
  };
}

export function mapActivePaymentCards(
  cards: PaymentMethodResponse[] | undefined
): SavedCardOption[] {
  return (cards ?? [])
    .filter(isActivePaymentCard)
    .map(mapPaymentMethodToSavedCardOption)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export function resolveDefaultCardId(
  cards: readonly SavedCardOption[],
  selectedId: string
): string {
  if (cards.some((card) => card.id === selectedId)) return selectedId;
  return cards.find((card) => card.isDefault)?.id ?? cards[0]?.id ?? '';
}
