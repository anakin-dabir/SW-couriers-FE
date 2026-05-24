import { useNavigate } from 'react-router-dom';
import NotificationButton from './NotificationButton';
import ProfileDropdown from './ProfileDropdown';

interface HeaderActionsProps {
  /** User data */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Logout handler */
  onLogout?: () => void;
}

/**
 * Molecule component for header action buttons (notification + profile)
 */
export default function HeaderActions({ user, onLogout }: HeaderActionsProps): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4-5">
      <NotificationButton
        onClick={() => navigate('/notifications')}
        className="relative rounded-full focus-visible:ring-gray-200"
      />
      <ProfileDropdown user={user} onLogout={onLogout} />
    </div>
  );
}
