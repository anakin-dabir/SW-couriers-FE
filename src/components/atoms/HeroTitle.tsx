import Typography from './Typography';
import { cn } from '@/lib/utils';

interface HeroTitleProps {
  /** Title text */
  title: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for hero section title
 */
export default function HeroTitle({ title, className }: HeroTitleProps): React.JSX.Element {
  return (
    <Typography variant="h2" className={cn('text-white', className)}>
      {title}
    </Typography>
  );
}
