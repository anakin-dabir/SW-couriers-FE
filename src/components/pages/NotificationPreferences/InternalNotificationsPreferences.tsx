import * as React from 'react';
import { Typography } from '@/components/atoms';
import NotificationGroupTable from './NotificationGroupTable';
import { useNotificationPreferenceTab } from './useNotificationPreferenceTab';
import type { NotificationTestRow } from './notificationPreferences.types';

export interface InternalNotificationsPreferencesProps {
  organizationId: string | null;
  isActive: boolean;
  onTestRowsChange?: (rows: NotificationTestRow[]) => void;
}

/**
 * Internal (B2B customer) notification preferences tab content.
 */
export default function InternalNotificationsPreferences({
  organizationId,
  isActive,
  onTestRowsChange,
}: InternalNotificationsPreferencesProps): React.JSX.Element {
  const {
    groups,
    isFetching,
    testRows,
    isTogglePending,
    handleChannelToggle,
    handleThresholdChange,
    handleThresholdSave,
  } = useNotificationPreferenceTab({
    tab: 'internal_notifications',
    organizationId,
    isActive,
  });

  React.useEffect(() => {
    if (isActive) {
      onTestRowsChange?.(testRows);
    }
  }, [isActive, onTestRowsChange, testRows]);

  return (
    <div className="mt-5 w-[80%] space-y-5">
      <div className="flex flex-col gap-5">
        {!organizationId ? (
          <div className="rounded-xl bg-white px-5 py-6">
            <Typography component="div" className="text-sm text-[#71717A]">
              Organization not found in session. Please log in again.
            </Typography>
          </div>
        ) : isFetching && groups.length === 0 ? (
          <div className="rounded-xl bg-white px-5 py-6">
            <Typography component="div" className="text-sm text-[#71717A]">
              Loading notification preferences...
            </Typography>
          </div>
        ) : (
          groups.map((group) => (
            <NotificationGroupTable
              key={group.id}
              group={group}
              isTogglePending={isTogglePending}
              onThresholdChange={(rowId, value) => handleThresholdChange(group.id, rowId, value)}
              onThresholdSave={() => handleThresholdSave()}
              onChannelToggle={(rowId, channel, checked) =>
                void handleChannelToggle(group.id, rowId, channel, checked)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
