import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button text */
  text?: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for back navigation button
 * Used in multi-step forms
 */
export default function BackButton({
  onClick,
  disabled = false,
  text = 'Back',
  className,
}: BackButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-11 items-center gap-2 rounded-md border border-form-border-light bg-white px-8 py-2 text-sm font-medium text-form-title hover:bg-gray-50 transition-colors disabled:opacity-50',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {text}
    </button>
  );
}
