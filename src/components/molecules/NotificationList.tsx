import * as React from 'react';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';
import NotificationItem, { type Notification } from '@/components/atoms/NotificationItem';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

interface NotificationListProps {
  /** Array of notifications */
  notifications: Notification[];
  /** Click handler for notification items */
  onNotificationClick?: (notification: Notification) => void;
  /** Mark as read handler for notification items */
  onMarkAsRead?: (notification: Notification) => void;
  /** Additional className */
  className?: string;
}

/**
 * NotificationList component
 * Groups notifications by date (Today, Yesterday, etc.) and displays them
 * Matches Figma design 425-65247
 */
export default function NotificationList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  className,
}: NotificationListProps): React.JSX.Element {
  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const groups: NotificationGroup[] = [];
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.timestamp);

      if (isToday(notificationDate)) {
        today.push(notification);
      } else if (isYesterday(notificationDate)) {
        yesterday.push(notification);
      } else {
        older.push(notification);
      }
    });

    if (today.length > 0) {
      groups.push({ label: 'Today', notifications: today });
    }
    if (yesterday.length > 0) {
      groups.push({ label: 'Yesterday', notifications: yesterday });
    }
    if (older.length > 0) {
      // Group older notifications by date
      const olderByDate = new Map<string, Notification[]>();
      older.forEach((notification) => {
        const dateKey = format(startOfDay(new Date(notification.timestamp)), 'yyyy-MM-dd');
        if (!olderByDate.has(dateKey)) {
          olderByDate.set(dateKey, []);
        }
        olderByDate.get(dateKey)!.push(notification);
      });

      olderByDate.forEach((notifs, dateKey) => {
        const date = new Date(dateKey);
        const label = format(date, 'MMMM d, yyyy');
        groups.push({ label, notifications: notifs });
      });
    }

    return groups;
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Typography variant="body" color="muted" className="text-center">
          No notifications
        </Typography>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {groupedNotifications.map((group, index) => (
        <div
          key={group.label}
          className={cn('flex flex-col gap-3 rounded-xl bg-[#F5F5F6] p-4', index > 0 && 'mt-5')}
        >
          <Typography variant="h6" weight="semibold" className="text-base text-[#3F3F46]">
            {group.label}
          </Typography>

          <div className="flex flex-col gap-2">
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
