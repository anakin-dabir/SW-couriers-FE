import Typography from '@/components/atoms/Typography';
import AuthLink from './AuthLink';

interface SupportLinkProps {
  /** Text before the link */
  text?: string;
  /** Link text */
  linkText?: string;
  /** Link destination */
  linkTo?: string;
}

/**
 * Molecule component for support/help link section
 * Used in forgot password and similar flows
 */
export default function SupportLink({
  text = "Didn't receive the email?",
  linkText = 'Check spam or Contact support.',
  linkTo = '/support',
}: SupportLinkProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center">
      <Typography variant="caption" className="text-form-body">
        {text}
      </Typography>
      <AuthLink to={linkTo} className="py-2">
        {linkText}
      </AuthLink>
    </div>
  );
}
