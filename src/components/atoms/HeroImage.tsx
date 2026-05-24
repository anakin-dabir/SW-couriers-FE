import { DashboardMockup } from '@/assets/img';
import { cn } from '@/lib/utils';

interface HeroImageProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for hero section dashboard mockup image
 */
export default function HeroImage({ className }: HeroImageProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-1 items-center justify-center py-12', className)}>
      <img
        src={DashboardMockup}
        alt="Dashboard Preview - Tracking Deliveries"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
