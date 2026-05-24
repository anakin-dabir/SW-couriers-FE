import { cn } from '@/lib/utils';

interface FallbackImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for fallback screen images
 */
export default function FallbackImage({
  src,
  alt,
  className,
}: FallbackImageProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <img src={src} alt={alt} className="max-w-full h-auto" />
    </div>
  );
}
