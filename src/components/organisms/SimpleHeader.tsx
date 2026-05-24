import { Bell, Search, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';
import { SwCouriersLogo } from '@/assets/svg';
import HeaderBreadcrumb from '@/components/atoms/HeaderBreadcrumb';
interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface SimpleHeaderProps {
  showBackButton?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
  breadcrumbItems?: BreadcrumbItem[];
}

function SimpleHeader({
  showBackButton = false,
  user,
  onLogout,
  className,
  breadcrumbItems,
}: SimpleHeaderProps): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center">
          <img src={SwCouriersLogo} alt="SW Couriers" className="h-8 w-auto" />
        </Link>
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <HeaderBreadcrumb items={breadcrumbItems} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search deliveries, invoices..."
            className="w-72 pl-10 text-sm"
          />
        </div>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
          onClick={() => {
            void navigate('/notifications');
          }}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-warning text-white text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <Typography variant="caption" weight="medium" className="text-gray-900">
                {user?.name || 'John Doe'}
              </Typography>
              <Typography variant="caption" className="text-xs text-gray-500">
                {user?.email || 'john_doe@taskhub.com'}
              </Typography>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onLogout?.()} className="text-error focus:text-error">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => {
              void navigate(-1);
            }}
            className="border-gray-300"
          >
            Back
          </Button>
        )}
      </div>
    </header>
  );
}

export default SimpleHeader;
