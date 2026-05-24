import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';

interface UserAvatarProps {
  /** User's avatar image URL */
  avatar?: string;
  /** User's name for alt text and fallback */
  name?: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for displaying user avatar
 */
export default function UserAvatar({
  avatar,
  name = 'User',
  className,
}: UserAvatarProps): React.JSX.Element {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback className="bg-warning text-white text-sm font-medium">
        {name?.charAt(0) || 'J'}
      </AvatarFallback>
    </Avatar>
  );
}
