import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';

interface LoginFormActionsProps {
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isFormValid: boolean;
}

/**
 * Molecule component for login form actions
 * Combines remember device checkbox and submit button
 */
export default function LoginFormActions({
  isSubmitting,
  isFormValid,
}: LoginFormActionsProps): React.JSX.Element {
  return (
    <>
      {/* Remember Device Checkbox */}
      <Checkbox id="remember-device" label="Remember this device" />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        disabled={isSubmitting || !isFormValid}
        className="w-full h-10"
        aria-label={isSubmitting ? 'Signing in, please wait' : 'Sign in to your account'}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </>
  );
}
