import Typography from '@/components/atoms/Typography';
import AuthLink from './AuthLink';

interface AuthFooterProps {
  /** Text before the link */
  text: string;
  /** Link text */
  linkText: string;
  /** Link destination */
  linkTo: string;
}

/**
 * Molecule component for auth form footer
 * Combines text and navigation link
 * Reusable across login, register, reset password pages
 */
export default function AuthFooter({ text, linkText, linkTo }: AuthFooterProps): React.JSX.Element {
  return (
    <div className="flex items-center">
      <Typography variant="caption" className="leading-5 text-form-title">
        {text}
      </Typography>
      <AuthLink to={linkTo} className="flex h-9 items-center justify-center px-3 py-2">
        {linkText}
      </AuthLink>
    </div>
  );
}
