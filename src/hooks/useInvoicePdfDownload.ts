import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';
import { openPdfDownloadUrl } from '@/lib/pdfDownload';
import {
  useGetInvoicePdfSignedUrlMutation,
  useGetInvoicePdfStatusQuery,
  useRequestInvoicePdfMutation,
} from '@/store/api';

const PDF_POLL_MS = 2000;
const PDF_POLL_MAX_ATTEMPTS = 45;

/** Normalize API / job status strings for invoice PDF polling. */
export function normalizeInvoicePdfJobStatus(status?: string | null): string | undefined {
  if (!status?.trim()) return undefined;
  const u = status.trim().toUpperCase().replace(/-/g, '_');
  if (u === 'READY' || u === 'COMPLETED' || u === 'COMPLETE') return 'READY';
  if (u === 'FAILED' || u === 'ERROR') return 'FAILED';
  if (
    u === 'GENERATING' ||
    u === 'IN_PROGRESS' ||
    u === 'PROCESSING' ||
    u === 'PENDING' ||
    u === 'QUEUED'
  ) {
    return 'GENERATING';
  }
  return u;
}

/**
 * Server-side invoice PDF download:
 * READY → signed URL; GENERATING → poll only (no repeat POST); otherwise request once then poll.
 */
export function useInvoicePdfDownload(invoiceId: string | undefined): {
  download: (knownPdfStatus?: string | null) => Promise<void>;
  isDownloading: boolean;
  pdfJobStatus: string | undefined;
} {
  const [pollingId, setPollingId] = React.useState<string | null>(null);
  const pollAttemptsRef = React.useRef(0);
  const requestStartedRef = React.useRef(false);

  const { data: pdfStatus } = useGetInvoicePdfStatusQuery(invoiceId ? { invoiceId } : skipToken, {
    pollingInterval: pollingId ? PDF_POLL_MS : 0,
    skipPollingIfUnfocused: true,
  });

  const [requestInvoicePdf, { isLoading: requestLoading }] = useRequestInvoicePdfMutation();
  const [getSignedUrl, { isLoading: signedUrlLoading }] = useGetInvoicePdfSignedUrlMutation();

  const clearPolling = React.useCallback(() => {
    setPollingId(null);
    pollAttemptsRef.current = 0;
    requestStartedRef.current = false;
  }, []);

  const openSignedUrl = React.useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await getSignedUrl({ invoiceId: id, disposition: 'attachment' }).unwrap();
        if (res.signed_url) {
          openPdfDownloadUrl(res.signed_url);
          toast.success('Invoice PDF download started.');
          return true;
        }
        toast.error('Invoice PDF link was empty. Please try again.');
        return false;
      } catch {
        toast.error('Failed to fetch invoice PDF download link. Please try again.');
        return false;
      }
    },
    [getSignedUrl]
  );

  React.useEffect(() => {
    if (!pollingId) return;

    pollAttemptsRef.current += 1;
    const status = normalizeInvoicePdfJobStatus(pdfStatus?.status);

    if (status === 'READY') {
      void openSignedUrl(pollingId).finally(() => clearPolling());
      return;
    }

    if (status === 'FAILED') {
      toast.error('Invoice PDF generation failed. Please retry.');
      clearPolling();
      return;
    }

    if (pollAttemptsRef.current >= PDF_POLL_MAX_ATTEMPTS) {
      toast.error(
        'Invoice PDF is taking longer than expected. Please wait a moment and try Download again.'
      );
      clearPolling();
    }
  }, [pdfStatus, pollingId, openSignedUrl, clearPolling]);

  React.useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  const download = React.useCallback(
    async (knownPdfStatus?: string | null): Promise<void> => {
      if (!invoiceId) return;

      if (pollingId === invoiceId) {
        toast.message('Invoice PDF is already being prepared…');
        return;
      }

      const normalized = normalizeInvoicePdfJobStatus(knownPdfStatus);

      if (normalized === 'READY') {
        await openSignedUrl(invoiceId);
        return;
      }

      if (normalized === 'GENERATING') {
        pollAttemptsRef.current = 0;
        setPollingId(invoiceId);
        toast.message('Invoice PDF is being prepared…');
        return;
      }

      if (requestStartedRef.current) {
        toast.message('Invoice PDF request already submitted. Please wait…');
        pollAttemptsRef.current = 0;
        setPollingId(invoiceId);
        return;
      }

      requestStartedRef.current = true;
      try {
        const res = await requestInvoicePdf({
          invoiceId,
          idempotencyKey: crypto.randomUUID(),
        }).unwrap();
        const next = normalizeInvoicePdfJobStatus(res.status);
        if (next === 'READY') {
          await openSignedUrl(invoiceId);
          clearPolling();
          return;
        }
        toast.success('Invoice PDF request submitted. Preparing download…');
        pollAttemptsRef.current = 0;
        setPollingId(invoiceId);
      } catch {
        requestStartedRef.current = false;
        toast.error('Could not request invoice PDF. Please try again.');
      }
    },
    [invoiceId, pollingId, openSignedUrl, requestInvoicePdf, clearPolling]
  );

  return {
    download,
    isDownloading: requestLoading || signedUrlLoading || pollingId != null,
    pdfJobStatus: normalizeInvoicePdfJobStatus(pdfStatus?.status),
  };
}
