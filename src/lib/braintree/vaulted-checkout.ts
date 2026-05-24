import type { Client } from 'braintree-web';

import {
  verifyPaymentNonceWithEphemeralThreeDSecure,
  type ThreeDSecureVerifiedCard,
} from './three-d-secure';

/** Args for 3DS after your backend returns a nonce for a vaulted `card_id`. */
export interface VerifyVaultedCardNonceInput {
  client: Client;
  /** `data.nonce` from POST …/cards/prepare-payment (body: `{ card_id }`). */
  paymentMethodNonce: string;
  /** `data.bin` from the same response (required for Braintree `verifyCard`). */
  bin: string;
  /** Charge amount / verification amount as a decimal string, e.g. order total. */
  amount: string;
  billingAddress: { givenName: string; surname: string };
}

/** Run 3DS v2 on a server-issued vaulted-card nonce; use `result.nonce` for the sale/transaction call. */
export function verifyVaultedCardPaymentNonce(
  input: VerifyVaultedCardNonceInput
): Promise<ThreeDSecureVerifiedCard> {
  return verifyPaymentNonceWithEphemeralThreeDSecure(input.client, {
    nonce: input.paymentMethodNonce,
    bin: input.bin,
    amount: input.amount,
    billingAddress: input.billingAddress,
  });
}
