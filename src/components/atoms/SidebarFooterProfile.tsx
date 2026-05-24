import { Button } from '@/components/atoms/Button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/atoms/UserAvatar';
import UserInfo from '@/components/molecules/UserInfo';
import { truncateText } from '@/lib/utils';

interface SidebarFooterProfileProps {
  /** User data */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
}

/**
 * Atomic component for sidebar footer user profile section
 */
export default function SidebarFooterProfile({
  user,
  isCollapsed,
}: SidebarFooterProfileProps): React.JSX.Element {
  const USER_NAME = user?.name || 'John Doe';
  const USER_EMAIL = user?.email || 'john_doe@taskhub.com';
  const TRUNCATED_NAME = truncateText(USER_NAME, 10);
  const TRUNCATED_EMAIL = truncateText(USER_EMAIL, 14);
  const SHOULD_TRUNCATE_NAME = USER_NAME.length > 10;
  const SHOULD_TRUNCATE_EMAIL = USER_EMAIL.length > 14;

  return (
    <div
      className={cn(
        'flex items-center transition-all duration-300',
        isCollapsed ? 'justify-center' : 'justify-between w-full'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 transition-all duration-300',
          isCollapsed && 'justify-center'
        )}
      >
        <UserAvatar avatar={user?.avatar} name={user?.name} className="size-8 shrink-0" />
        {!isCollapsed && (
          <UserInfo
            name={USER_NAME}
            email={USER_EMAIL}
            truncatedName={TRUNCATED_NAME}
            truncatedEmail={TRUNCATED_EMAIL}
            shouldTruncateName={SHOULD_TRUNCATE_NAME}
            shouldTruncateEmail={SHOULD_TRUNCATE_EMAIL}
          />
        )}
      </div>
      {!isCollapsed && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-4 text-sidebar-muted hover:text-sidebar-text"
          aria-label="More options"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      )}
    </div>
  );
}
