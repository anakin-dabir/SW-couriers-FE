import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/molecules/tabs';
import {
  CustomerNotificationsPreferences,
  InternalNotificationsPreferences,
  type NotificationPreferencesTabKey,
} from '@/components/pages/NotificationPreferences';

interface NotificationPreferencesTabsProps {
  /** Active tab value */
  activeTab?: NotificationPreferencesTabKey;
  /** Tab change handler */
  onTabChange?: (value: NotificationPreferencesTabKey) => void;
  /** Organization ID for API-backed preferences */
  organizationId?: string | null;
  /** Additional className */
  className?: string;
}

/**
 * NotificationPreferencesTabs component
 * Tabs for switching between Internal and Customer notification preferences
 */
export default function NotificationPreferencesTabs({
  activeTab = 'internal_notifications',
  onTabChange,
  organizationId = null,
  className,
}: NotificationPreferencesTabsProps): React.JSX.Element {
  const [internalTab, setInternalTab] = React.useState<NotificationPreferencesTabKey>(activeTab);

  const handleValueChange = (value: string): void => {
    const tab = value as NotificationPreferencesTabKey;
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <Tabs value={internalTab} onValueChange={handleValueChange} className={className}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="internal_notifications">Internal Notifications</TabsTrigger>
        <TabsTrigger value="customer_notifications">Recipient Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="internal_notifications" className="mt-6">
        <InternalNotificationsPreferences
          organizationId={organizationId}
          isActive={internalTab === 'internal_notifications'}
        />
      </TabsContent>
      <TabsContent value="customer_notifications" className="mt-6">
        <CustomerNotificationsPreferences
          organizationId={organizationId}
          isActive={internalTab === 'customer_notifications'}
        />
      </TabsContent>
    </Tabs>
  );
}
