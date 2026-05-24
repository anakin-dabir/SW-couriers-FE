import Typography from './Typography';
import { cn } from '@/lib/utils';

interface HeroDescriptionProps {
  /** Description text */
  description: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for hero section description
 */
export default function HeroDescription({
  description,
  className,
}: HeroDescriptionProps): React.JSX.Element {
  return (
    <Typography variant="body" weight="medium" className={cn('text-white/75', className)}>
      {description}
    </Typography>
  );
}
