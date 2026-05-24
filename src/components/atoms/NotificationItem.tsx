import * as React from 'react';
import { cn } from '@/lib/utils';
import Typography from './Typography';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'delivery' | 'billing' | 'system' | 'other';
}

interface NotificationItemProps {
  /** Notification data */
  notification: Notification;
  /** Click handler */
  onClick?: (notification: Notification) => void;
  /** Mark as read handler */
  onMarkAsRead?: (notification: Notification) => void;
  /** Additional className */
  className?: string;
}

/**
 * NotificationItem component
 * Displays a single notification with unread indicator, message, and timestamp
 * Matches Figma design 425-65247
 */
export default function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  className,
}: NotificationItemProps): React.JSX.Element {
  const handleClick = (): void => {
    onClick?.(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleMarkAsReadClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onMarkAsRead?.(notification);
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    return `${diffInDays} days ago`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5',
        'cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20',
        !notification.isRead ? 'bg-white' : 'bg-transparent',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="shrink-0">
        <div className="size-5 rounded-full bg-[#D4D4D8]" />
      </div>

      <div className="min-w-0 flex-1">
        <Typography
          variant="body"
          className={cn(
            'text-base leading-6 text-[#3F3F46]',
            !notification.isRead && 'font-medium'
          )}
        >
          {notification.message}
        </Typography>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        {!notification.isRead && (
          <div className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1">
            <button type="button" onClick={handleMarkAsReadClick}>
              <Typography variant="caption" color="muted" className="text-[10px] font-medium">
                Mark as read
              </Typography>
            </button>
          </div>
        )}
        <Typography
          variant="caption"
          color="muted"
          className="whitespace-nowrap text-xs text-[#A1A1AA]"
        >
          {formatTimestamp(notification.timestamp)}
        </Typography>
      </div>
    </div>
  );
}
