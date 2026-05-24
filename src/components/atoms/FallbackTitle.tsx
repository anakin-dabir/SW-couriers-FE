import Typography from './Typography';
import { cn } from '@/lib/utils';

interface FallbackTitleProps {
  /** Title text */
  children: string;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for fallback screen title
 */
export default function FallbackTitle({
  children,
  className,
}: FallbackTitleProps): React.JSX.Element {
  return (
    <Typography
      variant="h1"
      weight="semibold"
      className={cn('text-form-title text-center', className)}
    >
      {children}
    </Typography>
  );
}
