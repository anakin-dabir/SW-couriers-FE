/**
 * Payment card for Settings > Accounts Details > Available Cards carousel.
 * Matches credit/debit card UI: dark background, brand logo, number, name, expiry.
 */
export interface Account {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  /** Raw card type from API (e.g. visa, mastercard, amex). */
  card_type: string;
  isDefault: boolean;
  /** Card background pattern for visual variety */
  pattern?: 'diagonal' | 'lines' | 'circles';
}
