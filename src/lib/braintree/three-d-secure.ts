import { threeDSecure } from 'braintree-web';
import type { Client, ThreeDSecure } from 'braintree-web';

export function attachThreeDSLookupCompleteListener(tds: ThreeDSecure): void {
  tds.on('lookup-complete', (_data, next) => {
    if (typeof next === 'function') next();
  });
}

export async function createThreeDSecureV2(client: Client): Promise<ThreeDSecure> {
  const instance = await threeDSecure.create({ client, version: 2 });
  attachThreeDSLookupCompleteListener(instance);
  return instance;
}

export interface VerifyCardThreeDSecureParams {
  nonce: string;
  /** First six digits of the PAN; required by Braintree 3DS v2 (`verifyCard`). */
  bin: string;
  amount: string;
  billingAddress: { givenName: string; surname: string };
}

/** Payload we use after verifyCard (Braintree returns additional fields). */
export interface ThreeDSecureVerifiedCard {
  nonce: string;
}

export async function verifyCardWithThreeDSecure(
  tds: ThreeDSecure,
  params: VerifyCardThreeDSecureParams
): Promise<ThreeDSecureVerifiedCard> {
  const result = await tds.verifyCard({
    nonce: params.nonce,
    bin: params.bin,
    amount: params.amount,
    billingAddress: params.billingAddress,
  });

  if (!result || typeof result !== 'object' || typeof result.nonce !== 'string') {
    throw new Error('3D Secure verification returned an unexpected response');
  }

  return { nonce: result.nonce };
}

/**
 * 3DS v2 verify using a server-issued payment method nonce (e.g. after
 * POST …/cards/prepare-payment). Creates a ThreeDSecure instance,
 * runs verifyCard, then tears down.
 */
export async function verifyPaymentNonceWithEphemeralThreeDSecure(
  braintreeClient: Client,
  params: VerifyCardThreeDSecureParams
): Promise<ThreeDSecureVerifiedCard> {
  const tds = await createThreeDSecureV2(braintreeClient);
  try {
    return await verifyCardWithThreeDSecure(tds, params);
  } finally {
    void tds.teardown();
  }
}
