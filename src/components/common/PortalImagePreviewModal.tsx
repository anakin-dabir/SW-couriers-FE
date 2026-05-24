import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { cn } from '@/lib/utils';

export interface PortalImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export default function PortalImagePreviewModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = 'Image Preview',
}: PortalImagePreviewModalProps): React.JSX.Element | null {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!h-auto !max-h-[90vh] !w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-[18px] border border-[#CBCBD8] bg-white p-0 shadow-2xl sm:!max-w-3xl">
        <div className="flex items-center justify-between border-b border-[#EEF0F4] px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold text-gray-900">
              {title}
              <span className="ml-2 text-xs font-normal text-gray-500">
                {currentIndex + 1} / {images.length}
              </span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center bg-[#F9FAFB] px-4 py-6">
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-full rounded-lg object-contain shadow"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className={cn(
                  'absolute left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow hover:bg-[#F3F4F6] disabled:opacity-30',
                  currentIndex === 0 && 'pointer-events-none'
                )}
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                disabled={currentIndex === images.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className={cn(
                  'absolute right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow hover:bg-[#F3F4F6] disabled:opacity-30',
                  currentIndex === images.length - 1 && 'pointer-events-none'
                )}
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex items-center justify-center gap-2 border-t border-[#EEF0F4] px-6 py-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to image ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-[#AE2224]' : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                )}
              />
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
