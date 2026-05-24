import { Button } from '@/components/atoms/Button';

interface SubmitButtonProps {
  /** Button text when idle */
  text: string;
  /** Button text when loading */
  loadingText: string;
  /** Whether the button is in loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Accessible label for idle state */
  ariaLabel?: string;
  /** Accessible label for loading state */
  ariaLabelLoading?: string;
}

/**
 * Atomic component for form submit button
 * Provides consistent styling and loading state handling
 */
export default function SubmitButton({
  text,
  loadingText,
  isLoading = false,
  disabled = false,
  className,
  ariaLabel,
  ariaLabelLoading,
}: SubmitButtonProps): React.JSX.Element {
  return (
    <Button
      type="submit"
      variant="default"
      disabled={disabled || isLoading}
      className={className || 'w-full h-10'}
      aria-label={isLoading ? ariaLabelLoading || loadingText : ariaLabel || text}
      aria-busy={isLoading}
    >
      {isLoading ? loadingText : text}
    </Button>
  );
}
