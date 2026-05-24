import * as React from 'react';
import { ArrowRight, Bell } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import type { HomeFeedListItem } from '@/lib/homeDashboard';
import { formatRelativeTime } from '@/lib/homeDashboard';
import { cn } from '@/lib/utils';

export type TeamActivityNotificationsTab = 'activity' | 'notifications';

export interface TeamActivityNotificationsPanelProps {
  activeTab: TeamActivityNotificationsTab;
  onTabChange: (tab: TeamActivityNotificationsTab) => void;
  activityItems: HomeFeedListItem[];
  notificationItems: HomeFeedListItem[];
  activityLoading?: boolean;
  notificationsLoading?: boolean;
  onViewAll: () => void;
  className?: string;
}

function FeedListItem({ item }: { item: HomeFeedListItem }): React.JSX.Element {
  return (
    <div className="flex gap-4 border-b border-[#E5E5EC] py-5 last:border-b-0">
      <div
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#F2F2F6]"
        aria-hidden
      >
        <Bell className="h-5 w-5 text-[#9C9CAB]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Typography component="div" className="text-base font-medium leading-5 text-form-title">
            {item.message}
          </Typography>
          {item.unread ? (
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3B82F6]"
              aria-label="Unread"
            />
          ) : null}
        </div>
        <Typography component="div" className="mt-1 text-xs leading-5 text-[#9C9CAB]">
          {formatRelativeTime(item.timestamp)}
        </Typography>
      </div>
    </div>
  );
}

function FeedEmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-[#E5E5EC] px-6 py-10 text-center">
      <Typography component="div" className="text-base font-semibold text-form-title">
        {title}
      </Typography>
      <Typography component="div" className="mt-1 text-sm text-[#9C9CAB]">
        {subtitle}
      </Typography>
    </div>
  );
}

function FeedLoadingState({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-[#E5E5EC] px-6 py-10 text-center text-sm text-[#9C9CAB]">
      {label}
    </div>
  );
}

export function TeamActivityNotificationsPanel({
  activeTab,
  onTabChange,
  activityItems,
  notificationItems,
  activityLoading = false,
  notificationsLoading = false,
  onViewAll,
  className,
}: TeamActivityNotificationsPanelProps): React.JSX.Element {
  const items = activeTab === 'activity' ? activityItems : notificationItems;
  const isLoading = activeTab === 'activity' ? activityLoading : notificationsLoading;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex h-7 items-center justify-between gap-3 my-3">
        <Typography component="div" className="text-xl font-semibold leading-5 text-form-title">
          Team Activity & Notifications
        </Typography>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 gap-2 border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#18181B]"
          onClick={onViewAll}
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-px w-full bg-[#F1F5F9]" />

      <div className="flex h-10 gap-3 rounded border border-[#E5E5EC] bg-[#F2F2F6] p-1">
        <button
          type="button"
          className={cn(
            'flex h-8 flex-1 items-center justify-center rounded-sm px-5 text-sm font-medium transition',
            activeTab === 'activity' ? 'bg-white text-[#18181B] shadow-sm' : 'text-form-subtitle'
          )}
          onClick={() => onTabChange('activity')}
        >
          Team Activity
        </button>
        <button
          type="button"
          className={cn(
            'flex h-8 flex-1 items-center justify-center rounded-sm px-5 text-sm font-medium transition',
            activeTab === 'notifications'
              ? 'bg-white text-[#18181B] shadow-sm'
              : 'text-form-subtitle'
          )}
          onClick={() => onTabChange('notifications')}
        >
          Notifications
        </button>
      </div>

      {isLoading ? (
        <FeedLoadingState
          label={activeTab === 'activity' ? 'Loading team activity…' : 'Loading notifications…'}
        />
      ) : items.length > 0 ? (
        <div className="flex flex-col">
          {items.map((item) => (
            <FeedListItem key={item.id} item={item} />
          ))}
        </div>
      ) : activeTab === 'activity' ? (
        <FeedEmptyState
          title="Quiet team... for now!"
          subtitle="When your team starts creating orders and making updates, activity appears here."
        />
      ) : (
        <FeedEmptyState
          title="No notifications yet!"
          subtitle="You will see updates about orders, billing, and account changes here."
        />
      )}
    </div>
  );
}
