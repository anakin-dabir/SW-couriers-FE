import * as React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { channelsSchema } from '@/schemas/notification.schema';
import { NotificationPreferencesSection } from '@/components/molecules';
import { Switch } from '@/components/atoms/switch';
import { Separator } from '@/components/atoms/separator';
import { Checkbox } from '@/components/atoms/checkbox';

/**
 * ChannelsSection component
 * Displays channel preferences for notifications with select all/unselect all functionality
 */
export default function ChannelsSection(): React.JSX.Element {
  const { watch, setValue } = useFormValidation<typeof channelsSchema>({
    schema: channelsSchema,
    defaultValues: {
      channelsEnabled: false,
      email: true,
      notification: true,
    },
    mode: 'onChange',
  });

  // Watch form values
  const channelsEnabled = watch('channelsEnabled');

  // Channel items configuration
  const channels = [
    {
      label: 'Email',
      field: 'email' as const,
      labelContent: (
        <>
          <span className="text-gray-500 text-xs">Verified email</span>
          <br />
          <span>Email</span>
        </>
      ),
    },
    {
      label: 'Notification',
      field: 'notification' as const,
      platformName: 'SW Carriers',
      labelContent: (
        <>
          <span className="text-gray-500 text-xs">Our Platform</span>
          <br />
          <span>Notification</span>
        </>
      ),
    },
  ];

  // Handle Channels switch toggle
  const handleChannelsToggle = (checked: boolean): void => {
    setValue('channelsEnabled', checked);
    // When switch is ON, select all; when OFF, uncheck all
    channels.forEach((channel) => {
      setValue(channel.field, checked);
    });
  };

  return (
    <NotificationPreferencesSection
      title="Channels"
      action={<Switch checked={channelsEnabled} onCheckedChange={handleChannelsToggle} />}
    >
      <Separator className="mb-4" />
      <div className="flex flex-col gap-2">
        {channels.map((channel) => (
          <div
            key={channel.field}
            className="flex items-center justify-between py-3 bg-white px-3 rounded-xl"
          >
            <div className="flex-1">{channel.labelContent}</div>
            {'platformName' in channel && channel.platformName && (
              <div className="flex-1 flex ">
                <span className="text-gray-600 font-bold text-md">{channel.platformName}</span>
              </div>
            )}
            <div className="flex items-center">
              <Checkbox
                checked={watch(channel.field)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue(channel.field, e.target.checked)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </NotificationPreferencesSection>
  );
}
