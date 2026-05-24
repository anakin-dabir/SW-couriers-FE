import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/atoms/UserAvatar';

interface ProfileDropdownProps {
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
 * Molecule component for profile dropdown menu
 */
export default function ProfileDropdown({
  user,
  onLogout,
}: ProfileDropdownProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="gap-3 rounded-full px-3 py-2 focus-visible:ring-gray-200"
        >
          <UserAvatar avatar={user?.avatar} name={user?.name} className="size-8" />
          <ChevronDown className="size-4 text-gray-500" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn('w-48 rounded-lg border border-gray-200/70 bg-white p-1.5', 'shadow-lg')}
      >
        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            className={cn(
              'flex cursor-pointer items-center px-3 py-2',
              'text-sm font-semibold leading-6 text-gray-800',
              'transition-colors hover:bg-gray-50 rounded-md'
            )}
          >
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            onClick={() => onLogout?.()}
            className={cn(
              'flex w-full cursor-pointer items-center px-3 py-2',
              'text-left text-sm font-semibold leading-6 text-gray-800',
              'transition-colors hover:bg-gray-50 rounded-md'
            )}
          >
            Log Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
