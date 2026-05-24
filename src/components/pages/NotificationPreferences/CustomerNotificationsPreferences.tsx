import * as React from 'react';
import { Typography } from '@/components/atoms';
import CustomizeNotificationDialog from './CustomizeNotificationDialog';
import NotificationGroupTable from './NotificationGroupTable';
import { useNotificationPreferenceTab } from './useNotificationPreferenceTab';
import type { NotificationRow, NotificationTestRow } from './notificationPreferences.types';

export interface CustomerNotificationsPreferencesProps {
  organizationId: string | null;
  isActive: boolean;
  onTestRowsChange?: (rows: NotificationTestRow[]) => void;
}

/**
 * Recipient notification preferences tab — matches Figma recipient booking table (node 29:37843).
 */
export default function CustomerNotificationsPreferences({
  organizationId,
  isActive,
  onTestRowsChange,
}: CustomerNotificationsPreferencesProps): React.JSX.Element {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
  const [selectedCustomizeEvent, setSelectedCustomizeEvent] = React.useState<{
    id: string;
    eventType: string;
  } | null>(null);

  const {
    groups,
    isFetching,
    testRows,
    isTogglePending,
    handleChannelToggle,
    handleThresholdChange,
    handleThresholdSave,
  } = useNotificationPreferenceTab({
    tab: 'customer_notifications',
    organizationId,
    isActive,
  });

  React.useEffect(() => {
    if (isActive) {
      onTestRowsChange?.(testRows);
    }
  }, [isActive, onTestRowsChange, testRows]);

  const handleCustomizeTemplate = (row: NotificationRow): void => {
    setSelectedCustomizeEvent({
      id: row.id,
      eventType: row.eventType,
    });
    setIsCustomizeModalOpen(true);
  };

  return (
    <>
      <CustomizeNotificationDialog
        open={isCustomizeModalOpen}
        onOpenChange={setIsCustomizeModalOpen}
        organizationId={organizationId}
        selectedEvent={
          selectedCustomizeEvent
            ? {
                ...selectedCustomizeEvent,
                notificationType: 'RECIPIENT',
              }
            : null
        }
      />

      <div className="mt-5 w-full max-w-[1000px] space-y-5">
        <div className="space-y-1">
          <Typography component="div" className="text-sm font-semibold text-form-title">
            Recipient Notifications
          </Typography>
          <Typography component="div" className="text-sm text-[#71717A]">
            Configure email and SMS notifications sent to recipients for booking lifecycle events.
          </Typography>
        </div>

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
                variant="recipient"
                group={group}
                isTogglePending={isTogglePending}
                showCustomizeButton
                onCustomizeTemplate={handleCustomizeTemplate}
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
    </>
  );
}
