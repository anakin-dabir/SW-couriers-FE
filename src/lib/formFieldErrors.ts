/**
 * Slice flat dot-path errors (`registeredAddress.line1`) into a shallow map for one prefix.
 */
export function sliceErrorsByPrefix(
  errors: Record<string, string>,
  prefix: string
): Record<string, string> {
  const dotPrefix = `${prefix}.`;
  const out: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    if (key.startsWith(dotPrefix)) {
      out[key.slice(dotPrefix.length)] = message;
    }
  }
  return out;
}

export function collectRootServerMessages(errors: Record<string, string>): string[] {
  const messages: string[] = [];
  for (const [key, message] of Object.entries(errors)) {
    if (key === '__root' || key.startsWith('__root.')) {
      messages.push(message);
    }
  }
  return messages;
}
