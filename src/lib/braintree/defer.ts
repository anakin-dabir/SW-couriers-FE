/** Wait for modal paint / animation so Braintree iframes attach reliably (e.g. Radix Dialog). */
export function deferForDialogFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, 100);
      });
    });
  });
}
