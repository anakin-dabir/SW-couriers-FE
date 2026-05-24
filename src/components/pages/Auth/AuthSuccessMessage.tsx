import { Button } from '@/components/atoms/Button';
import FormLogo from './FormLogo';
import FormTitle from './FormTitle';
import FormSubtitle from './FormSubtitle';
import AuthCard from './AuthCard';

interface AuthSuccessMessageProps {
  /** Success title */
  title: string;
  /** Success description */
  description: string;
  /** Button text */
  buttonText: string;
  /** Button click handler */
  onButtonClick: () => void;
  /** Whether to show logo */
  showLogo?: boolean;
}

/**
 * Molecule component for auth success screen
 * Displays success message with action button
 * Reusable for password reset, email verification success, etc.
 */
export default function AuthSuccessMessage({
  title,
  description,
  buttonText,
  onButtonClick,
  showLogo = true,
}: AuthSuccessMessageProps): React.JSX.Element {
  return (
    <AuthCard>
      {showLogo && <FormLogo />}
      <div className="flex w-full flex-col items-center gap-1.5 text-center">
        <FormTitle title={title} />
        <FormSubtitle subtitle={description} />
      </div>
      <Button type="button" variant="default" onClick={onButtonClick} className="w-full h-10">
        {buttonText}
      </Button>
    </AuthCard>
  );
}
