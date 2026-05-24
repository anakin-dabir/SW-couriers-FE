import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * Atom component for loading spinner
 * Animated circular loader matching Figma design
 */
export default function LoadingSpinner({
  size = 'lg',
  className,
}: LoadingSpinnerProps): React.JSX.Element {
  const SIZE_CLASSES = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={cn('relative', SIZE_CLASSES[size], className)}>
      <div className="absolute inset-0 animate-spin">
        {/* Top bar - Full opacity */}
        <div className="absolute left-1/2 top-0 w-2 h-6 bg-error rounded-full -translate-x-1/2" />

        {/* Top-right */}
        <div className="absolute top-[15%] right-[15%] w-2 h-6 bg-error/70 rounded-full origin-center rotate-45" />

        {/* Right */}
        <div className="absolute right-0 top-1/2 w-2 h-6 bg-error/40 rounded-full -translate-y-1/2 origin-center rotate-90" />

        {/* Bottom-right */}
        <div className="absolute bottom-[15%] right-[15%] w-2 h-6 bg-error/20 rounded-full origin-center rotate-135" />

        {/* Bottom - Lightest */}
        <div className="absolute left-1/2 bottom-0 w-2 h-6 bg-error/10 rounded-full -translate-x-1/2" />

        {/* Bottom-left */}
        <div className="absolute bottom-[15%] left-[15%] w-2 h-6 bg-error/20 rounded-full origin-center -rotate-135" />

        {/* Left */}
        <div className="absolute left-0 top-1/2 w-2 h-6 bg-error/40 rounded-full -translate-y-1/2 origin-center -rotate-90" />

        {/* Top-left */}
        <div className="absolute top-[15%] left-[15%] w-2 h-6 bg-error/70 rounded-full origin-center -rotate-45" />
      </div>
    </div>
  );
}
