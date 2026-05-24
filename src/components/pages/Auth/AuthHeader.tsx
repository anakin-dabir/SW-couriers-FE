import FormLogo from './FormLogo';
import FormTitle from './FormTitle';
import FormSubtitle from './FormSubtitle';

interface AuthHeaderProps {
  /** Header title */
  title: string;
  /** Header subtitle/description */
  subtitle: string;
  /** Whether to show logo */
  showLogo?: boolean;
}

/**
 * Molecule component for auth form header
 * Combines logo, title, and subtitle atoms
 * Reusable across all auth pages
 */
export default function AuthHeader({
  title,
  subtitle,
  showLogo = false,
}: AuthHeaderProps): React.JSX.Element {
  return (
    <>
      {showLogo && <FormLogo />}
      <div className="flex w-full flex-col items-center gap-1.5 text-center">
        <FormTitle title={title} />
        <FormSubtitle subtitle={subtitle} />
      </div>
    </>
  );
}
