import * as React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { notificationTriggersSchema } from '@/schemas/notification.schema';
import { NotificationPreferencesSection, NotificationPreferenceItem } from '@/components/molecules';
import { Switch } from '@/components/atoms/switch';

/**
 * NotificationTriggersSection component
 * Displays notification trigger preferences with select all/unselect all functionality
 */
export default function NotificationTriggersSection(): React.JSX.Element {
  const { watch, setValue } = useFormValidation<typeof notificationTriggersSchema>({
    schema: notificationTriggersSchema,
    defaultValues: {
      notificationTriggersEnabled: false,
      pickupScanned: false,
      inboundToHub: true,
      locationAssigned: true,
      loadedToVehicle: false,
      outForDelivery: true,
      delivered: false,
      failedWithReason: false,
    },
    mode: 'onChange',
  });

  // Watch form values
  const notificationTriggersEnabled = watch('notificationTriggersEnabled');

  // Notification trigger items configuration
  const notificationTriggers = [
    { label: 'Pickup Scanned', field: 'pickupScanned' as const },
    { label: 'Inbound To Hub', field: 'inboundToHub' as const },
    { label: 'Location Assigned', field: 'locationAssigned' as const },
    { label: 'Loaded To Vehicle', field: 'loadedToVehicle' as const },
    { label: 'Out For Delivery', field: 'outForDelivery' as const },
    { label: 'Delivered', field: 'delivered' as const },
    { label: 'Failed (With Reason)', field: 'failedWithReason' as const },
  ];

  // Handle Notification Triggers switch toggle
  const handleNotificationTriggersToggle = (checked: boolean): void => {
    setValue('notificationTriggersEnabled', checked);
    // When switch is ON, select all; when OFF, uncheck all
    notificationTriggers.forEach((trigger) => {
      setValue(trigger.field, checked);
    });
  };

  return (
    <NotificationPreferencesSection
      title="Notification Triggers"
      action={
        <Switch
          checked={notificationTriggersEnabled}
          onCheckedChange={handleNotificationTriggersToggle}
        />
      }
    >
      <div className="flex flex-col gap-2">
        {notificationTriggers.map((trigger) => (
          <NotificationPreferenceItem
            key={trigger.field}
            label={trigger.label}
            checked={watch(trigger.field)}
            onCheckedChange={(checked) => setValue(trigger.field, checked)}
            type="checkbox"
          />
        ))}
      </div>
    </NotificationPreferencesSection>
  );
}
