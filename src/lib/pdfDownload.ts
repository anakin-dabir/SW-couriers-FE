/**
 * Shared helpers for server-generated PDFs (signed R2/S3 URLs).
 * APIs may return `data.url` or legacy `data.signed_url`.
 */

export function extractPdfDownloadUrl(data: Record<string, unknown>): string | null {
  const url = data.url;
  if (typeof url === 'string' && url.trim().length > 0) return url.trim();
  const signedUrl = data.signed_url;
  if (typeof signedUrl === 'string' && signedUrl.trim().length > 0) return signedUrl.trim();
  return null;
}

/** Opens a signed PDF URL (attachment disposition is set server-side on the URL). */
export function openPdfDownloadUrl(downloadUrl: string): void {
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
