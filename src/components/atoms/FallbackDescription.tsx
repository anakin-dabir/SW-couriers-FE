import Typography from './Typography';
import { cn } from '@/lib/utils';

interface FallbackDescriptionProps {
  /** Description text */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for fallback screen description
 */
export default function FallbackDescription({
  children,
  className,
}: FallbackDescriptionProps): React.JSX.Element {
  return (
    <Typography variant="body" align="center" className={cn('text-form-body max-w-md', className)}>
      {children}
    </Typography>
  );
}
