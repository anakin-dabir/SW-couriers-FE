import HeroLogo from '@/components/atoms/HeroLogo';
import HeroImage from '@/components/atoms/HeroImage';
import HeroText from './HeroText';
import { cn } from '@/lib/utils';

interface HeroVisualSectionProps {
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Logo position */
  logoPosition?: 'left' | 'right';
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for hero visual section (logo + image + text)
 */
export default function HeroVisualSection({
  title,
  description,
  logoPosition = 'left',
  className,
}: HeroVisualSectionProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative hidden overflow-hidden rounded-lg bg-linear-to-b from-primary-200 via-primary-300 to-primary-400 md:flex md:flex-1',
        className
      )}
    >
      <div className="relative flex h-full w-full flex-col items-center gap-12 p-8!">
        <HeroLogo position={logoPosition} />
        <HeroImage />
        <HeroText title={title} description={description} />
      </div>
    </div>
  );
}
