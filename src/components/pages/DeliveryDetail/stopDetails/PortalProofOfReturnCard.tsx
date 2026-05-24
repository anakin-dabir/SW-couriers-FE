import React from 'react';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import PortalImagePreviewModal from '@/components/common/PortalImagePreviewModal';
import type { StopReturnEvidenceSummaryDto } from '@/store/api/ordersApi';

interface PortalProofOfReturnCardProps {
  evidence?: StopReturnEvidenceSummaryDto | null;
}

export default function PortalProofOfReturnCard({
  evidence,
}: PortalProofOfReturnCardProps): React.JSX.Element | null {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewInitialIndex, setPreviewInitialIndex] = React.useState(0);

  const photoUrls = React.useMemo(
    () => (evidence?.photos ?? []).map((p) => p.image_url).filter((u): u is string => Boolean(u)),
    [evidence?.photos]
  );

  if (!evidence || photoUrls.length === 0) return null;

  const openPreview = (index = 0): void => {
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
          Proof of Return
        </Typography>
      </div>
      <div className="space-y-6 px-5 py-4">
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
                aria-label={`View return image ${idx + 1}`}
              >
                <img src={url} alt={`Return ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
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
