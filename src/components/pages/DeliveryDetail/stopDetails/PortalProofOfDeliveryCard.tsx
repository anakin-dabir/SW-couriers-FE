import React from 'react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import PortalImagePreviewModal from '@/components/common/PortalImagePreviewModal';
import type { StopPodSummaryDto } from '@/store/api/ordersApi';

interface PortalProofOfDeliveryCardProps {
  pod?: StopPodSummaryDto | null;
  recipientName?: string | null;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '-';
  }
}

export default function PortalProofOfDeliveryCard({
  pod,
  recipientName,
}: PortalProofOfDeliveryCardProps): React.JSX.Element | null {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewInitialIndex, setPreviewInitialIndex] = React.useState(0);

  const photoUrls = React.useMemo(
    () => (pod?.photos ?? []).map((p) => p.image_url).filter((u): u is string => Boolean(u)),
    [pod?.photos]
  );

  if (!pod) return null;
  if (photoUrls.length === 0 && !pod.signature_image_url && !pod.completed_at) return null;

  const openPreview = (index: number = 0): void => {
    setPreviewInitialIndex(index);
    setIsPreviewOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          Proof of Delivery
        </Typography>
      </div>
      <div className="space-y-6 px-5 py-4">
        {photoUrls.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography
                variant="label"
                className="text-[13px] font-medium leading-none text-gray-900"
              >
                Package Photos
              </Typography>
              <Button
                variant="link"
                className="h-auto p-0 text-[12px] font-medium text-gray-600 underline"
                onClick={() => openPreview(0)}
              >
                Show Images
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {photoUrls.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => openPreview(idx)}
                  className="h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-gray-200 p-0 transition-opacity hover:opacity-90"
                  aria-label={`View proof image ${idx + 1}`}
                >
                  <img src={url} alt={`Proof ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {pod.signature_image_url ? (
          <div className="space-y-4">
            <Typography
              variant="label"
              className="text-[13px] font-medium leading-none text-gray-900"
            >
              Customer signature
            </Typography>
            <div className="flex min-h-[20px] w-full items-center justify-center rounded-[10px] border border-gray-200 p-0">
              <img
                src={pod.signature_image_url}
                alt="Customer signature"
                className="max-h-[300px] w-full object-contain mix-blend-multiply"
              />
            </div>
          </div>
        ) : null}

        {recipientName || pod.completed_at ? (
          <div className="flex items-center justify-between border-t border-gray-200 pt-2">
            <div className="space-y-2">
              <Typography className="text-[11px] font-medium leading-none text-gray-400">
                Recipient Signed
              </Typography>
              <Typography className="text-[13px] font-medium leading-none text-gray-800">
                {recipientName ?? '-'}
              </Typography>
            </div>
            <div className="space-y-2 text-right">
              <Typography className="text-[11px] font-medium leading-none text-gray-400">
                Delivered At
              </Typography>
              <Typography className="text-[13px] font-medium leading-none text-gray-800">
                {formatDateTime(pod.completed_at)}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>

      <PortalImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={photoUrls}
        initialIndex={previewInitialIndex}
      />
    </div>
  );
}
