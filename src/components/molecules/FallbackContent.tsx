import { cn } from '@/lib/utils';
import FallbackTitle from '@/components/atoms/FallbackTitle';
import FallbackDescription from '@/components/atoms/FallbackDescription';

interface FallbackContentProps {
  /** Title text */
  title: string;
  /** Description text */
  description: React.ReactNode;
  /** Actions/buttons */
  actions?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for fallback content section
 * Combines title, description, and actions
 */
export default function FallbackContent({
  title,
  description,
  actions,
  className,
}: FallbackContentProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center gap-10', className)}>
      <div className="flex flex-col items-center gap-5">
        <FallbackTitle>{title}</FallbackTitle>
        <FallbackDescription>{description}</FallbackDescription>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
