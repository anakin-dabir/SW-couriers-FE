import * as React from 'react';
import { Info } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Dialog, DialogContent } from '@/components/molecules/dialog';
import { CustomizeNotificationTabs } from '@/components/molecules';
import type { NotificationEvent } from '@/store/api/notificationsApi';
import type { OrganizationNotificationType } from './notificationPreferences.types';

export interface CustomizeNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
  selectedEvent: {
    id: string;
    eventType: string;
    notificationType: OrganizationNotificationType;
  } | null;
}

export default function CustomizeNotificationDialog({
  open,
  onOpenChange,
  organizationId,
  selectedEvent,
}: CustomizeNotificationDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex max-h-[90vh] max-w-[1000px] !flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-[#E5E7EB] px-6 py-5">
            <Typography variant="h2" className="text-base font-semibold text-gray-900">
              {selectedEvent
                ? `Customize Notification - ${selectedEvent.eventType}`
                : 'Customize Notification'}
            </Typography>
            <Typography variant="caption" className="mt-1 text-sm text-gray-500">
              Personalize the notification template for this event.
            </Typography>
          </div>

          <div className="shrink-0 border-b border-[#E5E7EB] bg-[#F8FAFC] px-6 py-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 text-[#64748B]" />
              <Typography variant="caption" className="text-sm text-gray-600">
                This template inherits from system defaults. Saving changes will create a custom
                version for your organization.
              </Typography>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
            <CustomizeNotificationTabs
              className="flex min-h-0 flex-1 flex-col"
              onCancel={() => onOpenChange(false)}
              organizationId={organizationId}
              notificationType={selectedEvent?.notificationType}
              event={(selectedEvent?.id as NotificationEvent | undefined) ?? null}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
