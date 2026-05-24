import * as React from 'react';
import { toast } from 'sonner';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { NotificationList } from '@/components/molecules';
import Pagination from '@/components/molecules/Pagination';
import type { Notification } from '@/components/atoms/NotificationItem';
import {
  useGetInboxNotificationsQuery,
  useMarkAllInboxNotificationsReadMutation,
  useMarkInboxNotificationReadMutation,
} from '@/store/api/notificationsApi';

interface InboxQueryResult {
  data?: {
    data?: {
      items?: Array<{
        id: string;
        subject: string;
        body: string;
        created_at: string;
        is_read?: boolean;
        read_at?: string | null;
      }>;
      total?: number;
      page?: number;
      size?: number;
      pages?: number;
    };
  };
  isFetching: boolean;
}

type MarkInboxNotificationReadMutationFn = (arg: { notification_id: string }) => {
  unwrap: () => Promise<unknown>;
};

type MarkAllInboxNotificationsReadMutationFn = () => {
  unwrap: () => Promise<unknown>;
};

/**
 * Notifications Page
 * Displays all notifications grouped by date with filtering options
 * Matches Figma design 425-65247
 */
export default function NotificationsPage(): React.JSX.Element {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const markAllReadHook = useMarkAllInboxNotificationsReadMutation() as unknown as [
    MarkAllInboxNotificationsReadMutationFn,
    { isLoading: boolean },
  ];
  const [markAllInboxNotificationsRead, { isLoading: isMarkingAllRead }] = markAllReadHook;

  const markSingleReadHook = useMarkInboxNotificationReadMutation() as unknown as [
    MarkInboxNotificationReadMutationFn,
  ];
  const [markInboxNotificationRead] = markSingleReadHook;

  const inboxNotificationsHook = useGetInboxNotificationsQuery({
    page: currentPage,
    size: pageSize,
    unread_only: false,
  }) as unknown as InboxQueryResult;
  const { data: inboxResponse, isFetching } = inboxNotificationsHook;

  const notifications = React.useMemo<Notification[]>(() => {
    const inboxItems = inboxResponse?.data?.items ?? [];
    return inboxItems.map((item) => ({
      id: item.id,
      message: item.subject || item.body || 'Notification',
      timestamp: new Date(item.created_at),
      isRead: Boolean(item.is_read ?? item.read_at != null),
      type: 'other',
    }));
  }, [inboxResponse]);

  const hasUnreadNotifications = React.useMemo(
    () => notifications.some((notification) => !notification.isRead),
    [notifications]
  );
  const totalEntries = inboxResponse?.data?.total ?? notifications.length;
  const serverPage = inboxResponse?.data?.page ?? currentPage;
  const serverPageSize = inboxResponse?.data?.size ?? pageSize;
  const totalPages =
    inboxResponse?.data?.pages ?? Math.max(1, Math.ceil(totalEntries / serverPageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleNotificationClick = (notification: Notification): void => {
    // TODO: Implement notification click handler
    // Could navigate to related page (delivery details, invoice, etc.)
    console.log('Notification clicked:', notification);
  };

  const handleMarkAllAsRead = (): void => {
    void (async () => {
      try {
        await markAllInboxNotificationsRead().unwrap();
      } catch {
        toast.error('Failed to mark all notifications as read.');
      }
    })();
  };

  const handleMarkAsRead = async (notification: Notification): Promise<void> => {
    try {
      await markInboxNotificationRead({ notification_id: notification.id }).unwrap();
    } catch {
      toast.error('Failed to mark notification as read.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <Typography
            variant="h4"
            className="text-[34px] font-semibold leading-none text-[#18181B]"
          >
            Notifications
          </Typography>
          <Typography variant="caption" className="text-xs text-[#71717A]">
            Manage your notifications
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-md border-[#D4D4D8] px-3.5 text-[#18181B] hover:bg-[#FAFAFA]"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead || !hasUnreadNotifications}
          >
            ✓ Mark All As Read
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-6">
          <span className="text-sm text-gray-500">Loading notifications...</span>
        </div>
      ) : (
        <>
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={(notification) => {
              void handleMarkAsRead(notification);
            }}
          />
          {totalEntries > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
              <div className="flex items-center gap-2">
                <Typography variant="caption" className="text-sm text-[#52525B]">
                  Show
                </Typography>
                <select
                  value={String(serverPageSize)}
                  onChange={(e) => {
                    const nextSize = Number.parseInt(e.target.value, 10);
                    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
                    setPageSize(nextSize);
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-md border border-[#E4E4E7] bg-white px-2.5 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {[10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Typography variant="caption" className="text-sm text-[#71717A]">
                  {`${totalEntries === 0 ? 0 : (serverPage - 1) * serverPageSize + 1}-${Math.min(
                    serverPage * serverPageSize,
                    totalEntries
                  )} entries out of ${totalEntries}`}
                </Typography>
              </div>
              <Pagination
                currentPage={serverPage}
                totalPages={Math.max(1, totalPages)}
                onPageChange={(next) => {
                  const safe = Math.min(Math.max(next, 1), Math.max(1, totalPages));
                  setCurrentPage(safe);
                }}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
