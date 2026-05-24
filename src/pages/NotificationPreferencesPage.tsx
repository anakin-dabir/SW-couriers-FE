import * as React from 'react';
import { PageHeader } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/molecules/tabs';
import CustomerNotificationsPreferences from '@/components/pages/NotificationPreferences/CustomerNotificationsPreferences';
import InternalNotificationsPreferences from '@/components/pages/NotificationPreferences/InternalNotificationsPreferences';
import {
  TAB_TO_NOTIFICATION_TYPE,
  type NotificationPreferencesTabKey,
  type NotificationTestRow,
} from '@/components/pages/NotificationPreferences/notificationPreferences.types';
import { parseOrganizationIdFromToken } from '@/components/pages/NotificationPreferences/notificationPreferences.utils';
import TestNotificationDialog from '@/components/pages/NotificationPreferences/TestNotificationDialog';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

/**
 * Notification Preferences Page
 * Displays notification preferences and settings
 */
export default function NotificationPreferencesPage(): React.JSX.Element {
  const [activeTab, setActiveTab] =
    React.useState<NotificationPreferencesTabKey>('internal_notifications');
  const [isTestDialogOpen, setIsTestDialogOpen] = React.useState(false);
  const [testRows, setTestRows] = React.useState<NotificationTestRow[]>([]);

  const organizationIdFromUser = useAppSelector(
    (state: RootState) => state.auth.user?.organization_id ?? null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = React.useMemo<string | null>(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );

  const activeNotificationType = TAB_TO_NOTIFICATION_TYPE[activeTab];

  const handleTestRowsChange = React.useCallback((rows: NotificationTestRow[]) => {
    setTestRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <TestNotificationDialog
        open={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
        allRows={testRows}
        notificationType={activeNotificationType}
        organizationId={organizationId}
      />

      <PageHeader
        title="Notification Preferences"
        subtitle="Manage your notification preferences"
        subtitleClassName="text-sm text-[#71717A]"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-10 border-[#E4E4E7] px-4 text-sm font-medium text-[#18181B]"
            onClick={() => setIsTestDialogOpen(true)}
          >
            Send Test Notification
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as NotificationPreferencesTabKey)}
        className="space-y-5"
      >
        <TabsList className="inline-flex h-auto w-max gap-1 rounded-lg border border-[#E5E5EC] bg-[#F2F2F6] p-1">
          <TabsTrigger
            value="internal_notifications"
            className="rounded-md px-4 py-2 text-sm font-medium text-[#71717A] transition-colors data-[state=active]:bg-white data-[state=active]:text-form-title data-[state=active]:shadow-sm"
          >
            Internal Notifications
          </TabsTrigger>
          <TabsTrigger
            value="customer_notifications"
            className="rounded-md px-4 py-2 text-sm font-medium text-[#71717A] transition-colors data-[state=active]:bg-white data-[state=active]:text-form-title data-[state=active]:shadow-sm"
          >
            Recipient Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal_notifications">
          <InternalNotificationsPreferences
            organizationId={organizationId}
            isActive={activeTab === 'internal_notifications'}
            onTestRowsChange={handleTestRowsChange}
          />
        </TabsContent>

        <TabsContent value="customer_notifications">
          <CustomerNotificationsPreferences
            organizationId={organizationId}
            isActive={activeTab === 'customer_notifications'}
            onTestRowsChange={handleTestRowsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
