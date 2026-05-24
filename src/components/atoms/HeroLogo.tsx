import { WhiteLogo } from '@/assets/svg';
import { cn } from '@/lib/utils';

interface HeroLogoProps {
  /** Position of the logo */
  position?: 'left' | 'right';
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for hero section logo
 */
export default function HeroLogo({
  position = 'left',
  className,
}: HeroLogoProps): React.JSX.Element {
  const POSITION_CLASS = position === 'left' ? 'left-8' : 'right-8';
  return (
    <div className={cn('mb-auto absolute top-8', POSITION_CLASS, className)}>
      <img src={WhiteLogo} alt="SW Couriers" className="h-13 w-20" />
    </div>
  );
}
