import UserText from '@/components/atoms/UserText';

interface UserInfoProps {
  /** User's name */
  name: string;
  /** User's email */
  email: string;
  /** Truncated name */
  truncatedName: string;
  /** Truncated email */
  truncatedEmail: string;
  /** Whether name should be truncated */
  shouldTruncateName: boolean;
  /** Whether email should be truncated */
  shouldTruncateEmail: boolean;
}

/**
 * Molecule component for displaying user information (name and email)
 */
export default function UserInfo({
  name,
  email,
  truncatedName,
  truncatedEmail,
  shouldTruncateName,
  shouldTruncateEmail,
}: UserInfoProps): React.JSX.Element {
  return (
    <div className="flex flex-col min-w-0">
      <UserText
        text={name}
        truncatedText={truncatedName}
        showTooltip={shouldTruncateName}
        size="sm"
        colorClass="text-sidebar-text"
      />
      <UserText
        text={email}
        truncatedText={truncatedEmail}
        showTooltip={shouldTruncateEmail}
        size="xs"
        colorClass="text-sidebar-muted"
      />
    </div>
  );
}
