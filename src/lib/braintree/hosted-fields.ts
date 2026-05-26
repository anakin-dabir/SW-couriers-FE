import { hostedFields } from 'braintree-web';
import type { Client, HostedFields } from 'braintree-web';

import { hostedFieldStyles } from './constants';

export function newHostedFieldIds(): { number: string; expiration: string; cvv: string } {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : String(Date.now());
  return {
    number: `braintree-hf-number-${suffix}`,
    expiration: `braintree-hf-exp-${suffix}`,
    cvv: `braintree-hf-cvv-${suffix}`,
  };
}

export function getHostedFieldsPreflightError(hf: HostedFields): string | null {
  const { fields } = hf.getState();
  const labels: Record<string, string> = {
    number: 'Card number',
    expirationDate: 'Expiry date',
    cvv: 'Security code',
  };
  for (const key of ['number', 'expirationDate', 'cvv'] as const) {
    const field = fields[key];
    if (!field) continue;
    if (!field.isValid) {
      return field.isEmpty
        ? `${labels[key]} is required.`
        : `Please enter a valid ${labels[key].toLowerCase()}.`;
    }
  }
  return null;
}

export function createHostedFields(
  clientInstance: Client,
  ids: { number: string; expiration: string; cvv: string }
): Promise<HostedFields> {
  return hostedFields.create({
    client: clientInstance,
    styles: hostedFieldStyles,
    fields: {
      number: {
        selector: `#${ids.number}`,
        placeholder: '•••• •••• •••• ••••',
        formatInput: true,
        maxLength: 19,
      },
      expirationDate: {
        selector: `#${ids.expiration}`,
        placeholder: 'MM / YY',
        formatInput: true,
        maxLength: 5,
      },
      cvv: {
        selector: `#${ids.cvv}`,
        placeholder: '•••',
        maxLength: 4,
      },
    },
  });
}
