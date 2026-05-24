/**
 * Manual / dev helper: run 3DS verifyCard on a nonce + BIN from `prepare-payment`.
 * Do not ship this in user-facing flows — use `verifyVaultedCardPaymentNonce` instead.
 *
 * @example
 * ```ts
 * await testVerifyCardFromPreparePayment({
 *   clientToken: '<from GET/Lazy client-token>',
 *   nonce: '4083f319-c4d5-1378-795d-6ff048dc979e',
 *   bin: '520000',
 * });
 * ```
 */
import { createBraintreeClient } from './client';
import { BRAINTREE_3DS_VERIFICATION_AMOUNT_DEFAULT } from './constants';
import { createThreeDSecureV2 } from './three-d-secure';

export interface TestVerifyCardFromPreparePaymentArgs {
  clientToken: string;
  nonce: string;
  bin: string;
  amount?: string;
  billingAddress?: { givenName: string; surname: string };
  /** Set false to skip `console.log` (result is still returned). @default true */
  logResult?: boolean;
}

/**
 * @returns Raw verifyCard payload from Braintree (includes `nonce` and other fields).
 */
export async function testVerifyCardFromPreparePayment(
  args: TestVerifyCardFromPreparePaymentArgs
): Promise<unknown> {
  const {
    clientToken,
    nonce,
    bin,
    amount = BRAINTREE_3DS_VERIFICATION_AMOUNT_DEFAULT,
    billingAddress = { givenName: 'Test', surname: 'User' },
    logResult = true,
  } = args;

  const client = await createBraintreeClient(clientToken);
  const tds = await createThreeDSecureV2(client);

  try {
    const result: unknown = await tds.verifyCard({
      nonce,
      bin,
      amount,
      billingAddress,
    });

    if (logResult) {
      console.log('[testVerifyCardFromPreparePayment]', result);
    }

    return result;
  } finally {
    void tds.teardown();
  }
}
