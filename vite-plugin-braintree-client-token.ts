/**
 * Vite plugin: in dev, respond to GET /api/braintree/client-token with a Braintree client token.
 * Uses BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY from env.
 * Private key is never exposed to the client (no VITE_ prefix).
 * @see https://developer.paypal.com/braintree/docs/start/hello-server/node
 */

import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const BRAINTREE_CLIENT_TOKEN_PATH = '/api/braintree/client-token';

export function braintreeClientTokenPlugin(): Plugin {
  return {
    name: 'vite-plugin-braintree-client-token',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (req.method !== 'GET' || pathname !== BRAINTREE_CLIENT_TOKEN_PATH) {
          next();
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), '');
        const merchantId = env.BRAINTREE_MERCHANT_ID?.trim();
        const publicKey = env.BRAINTREE_PUBLIC_KEY?.trim();
        const privateKey = env.BRAINTREE_PRIVATE_KEY?.trim();
        const environment = env.BRAINTREE_ENVIRONMENT?.trim()?.toLowerCase();

        if (!merchantId || !publicKey || !privateKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Missing Braintree credentials',
              hint: 'Add BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY to your .env file.',
            })
          );
          return;
        }

        // Dynamic import so braintree (Node SDK) is only loaded in dev server
        import('braintree')
          .then((braintree) => {
            const envValue =
              environment === 'production'
                ? braintree.Environment.Production
                : braintree.Environment.Sandbox;

            const gateway = new braintree.BraintreeGateway({
              environment: envValue,
              merchantId,
              publicKey,
              privateKey,
            });

            return gateway.clientToken.generate({});
          })
          .then((response) => {
            const clientToken = response.clientToken;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ clientToken }));
          })
          .catch((err: Error) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Failed to generate Braintree client token',
                message: err?.message ?? String(err),
              })
            );
          });
      });
    },
  };
}
