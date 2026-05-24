import { Bell } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import NotificationBadge from '@/components/atoms/NotificationBadge';

interface NotificationButtonProps {
  /** Additional className */
  className?: string;
  onClick?: () => void | Promise<void>;
}

/**
 * Molecule component for notification button with badge indicator
 */
export default function NotificationButton({
  className,
  onClick,
}: NotificationButtonProps): React.JSX.Element {
  const handleClick = (): void => {
    if (!onClick) return;
    void onClick();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Notifications"
      onClick={handleClick}
    >
      <Bell className="size-5 text-gray-700" strokeWidth={1.5} />
      <NotificationBadge />
    </Button>
  );
}
