import * as React from 'react';
import { toast } from 'sonner';
import {
  notificationsApi,
  type CategoryGroup,
  type NotificationEvent,
} from '@/store/api/notificationsApi';
import {
  TAB_TO_NOTIFICATION_TYPE,
  type NotificationGroup,
  type NotificationPreferencesTabKey,
  type NotificationTestRow,
} from './notificationPreferences.types';
import { mapGroupsToTestRows, mapPreferencesToGroups } from './notificationPreferences.utils';

interface B2BDashboardPreferencesQueryResult {
  data?: {
    data?: CategoryGroup[];
  };
  isFetching: boolean;
}

type UpdateB2BDashboardPreferencesMutationFn = (arg: {
  body: {
    preferences: Array<{
      event: NotificationEvent;
      email: { enabled: boolean };
      sms: { enabled: boolean };
    }>;
  };
}) => { unwrap: () => Promise<unknown> };

interface UseNotificationPreferenceTabOptions {
  tab: NotificationPreferencesTabKey;
  organizationId: string | null;
  isActive: boolean;
}

export interface UseNotificationPreferenceTabResult {
  groups: NotificationGroup[];
  isFetching: boolean;
  testRows: NotificationTestRow[];
  isTogglePending: (rowId: string, channel: 'email' | 'sms') => boolean;
  handleChannelToggle: (
    groupId: string,
    rowId: string,
    channel: 'email' | 'sms',
    checked: boolean
  ) => Promise<void>;
  handleThresholdChange: (groupId: string, rowId: string, value: string) => void;
  handleThresholdSave: () => void;
}

export function useNotificationPreferenceTab({
  tab,
  organizationId,
  isActive,
}: UseNotificationPreferenceTabOptions): UseNotificationPreferenceTabResult {
  const [groups, setGroups] = React.useState<NotificationGroup[]>([]);
  const [pendingToggleKeys, setPendingToggleKeys] = React.useState<Set<string>>(new Set());

  const updateB2BDashboardPreferencesHook =
    notificationsApi.useUpdateB2BDashboardPreferencesMutation() as unknown as [
      UpdateB2BDashboardPreferencesMutationFn,
    ];
  const [updateB2BDashboardPreferences] = updateB2BDashboardPreferencesHook;
  const [updateOrganizationPreferences] =
    notificationsApi.useUpdateOrganizationPreferencesMutation();

  const internalPreferencesHook = notificationsApi.useGetB2BDashboardPreferencesQuery(undefined, {
    skip: tab !== 'internal_notifications' || !isActive,
  }) as unknown as B2BDashboardPreferencesQueryResult;
  const { data: internalPreferencesResponse, isFetching: isFetchingInternal } =
    internalPreferencesHook;

  const { data: customerPreferencesResponse, isFetching: isFetchingCustomer } =
    notificationsApi.useGetOrganizationPreferencesQuery(
      {
        organizationId: organizationId ?? '',
        notificationType: TAB_TO_NOTIFICATION_TYPE[tab],
      },
      {
        skip: !organizationId || tab !== 'customer_notifications' || !isActive,
      }
    );

  React.useEffect(() => {
    const responseData =
      tab === 'internal_notifications'
        ? internalPreferencesResponse?.data
        : customerPreferencesResponse?.data;
    if (!responseData) return;

    setGroups(mapPreferencesToGroups(responseData));
  }, [tab, internalPreferencesResponse, customerPreferencesResponse]);

  const makeToggleKey = React.useCallback(
    (rowId: string, channel: 'email' | 'sms') => `${tab}:${rowId}:${channel}`,
    [tab]
  );

  const lastToggleSuccessToastAtRef = React.useRef(0);
  const showToggleSuccessToast = React.useCallback((): void => {
    const now = Date.now();
    if (now - lastToggleSuccessToastAtRef.current < 1200) return;
    lastToggleSuccessToastAtRef.current = now;
    toast.success('Notification preference updated.');
  }, []);

  const handleChannelToggle = async (
    groupId: string,
    rowId: string,
    channel: 'email' | 'sms',
    checked: boolean
  ): Promise<void> => {
    const toggleKey = makeToggleKey(rowId, channel);
    if (pendingToggleKeys.has(toggleKey)) return;

    const currentRow = groups
      .find((group) => group.id === groupId)
      ?.rows.find((row) => row.id === rowId);

    if (!currentRow) return;

    const nextEmailEnabled = channel === 'email' ? checked : currentRow.emailEnabled;
    const nextSmsEnabled = channel === 'sms' ? checked : currentRow.smsEnabled;
    const previousGroups = groups;

    setGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              rows: group.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : { ...row, [channel === 'email' ? 'emailEnabled' : 'smsEnabled']: checked }
              ),
            }
      )
    );
    setPendingToggleKeys((prev) => {
      const next = new Set(prev);
      next.add(toggleKey);
      return next;
    });

    try {
      const body = {
        preferences: [
          {
            event: rowId as NotificationEvent,
            email: { enabled: nextEmailEnabled },
            sms: { enabled: nextSmsEnabled },
          },
        ],
      };

      if (tab === 'internal_notifications') {
        await updateB2BDashboardPreferences({ body }).unwrap();
      } else {
        if (!organizationId) {
          throw new Error('Organization ID not available.');
        }

        await updateOrganizationPreferences({
          organizationId,
          notificationType: TAB_TO_NOTIFICATION_TYPE[tab],
          body,
        }).unwrap();
      }
      showToggleSuccessToast();
    } catch {
      setGroups(previousGroups);
      toast.error('Failed to update preference. Reverted to previous state.');
    } finally {
      setPendingToggleKeys((prev) => {
        const next = new Set(prev);
        next.delete(toggleKey);
        return next;
      });
    }
  };

  const handleThresholdChange = (groupId: string, rowId: string, value: string): void => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              rows: group.rows.map((row) =>
                row.id !== rowId ? row : { ...row, thresholdValue: value.replace(/[^\d]/g, '') }
              ),
            }
      )
    );
  };

  const handleThresholdSave = (): void => {
    // TODO: Wire threshold API when backend endpoint is available.
  };

  const isFetching = tab === 'internal_notifications' ? isFetchingInternal : isFetchingCustomer;

  const testRows = React.useMemo<NotificationTestRow[]>(
    () => mapGroupsToTestRows(groups),
    [groups]
  );

  return {
    groups,
    isFetching,
    testRows,
    isTogglePending: (rowId: string, channel: 'email' | 'sms') =>
      pendingToggleKeys.has(makeToggleKey(rowId, channel)),
    handleChannelToggle,
    handleThresholdChange,
    handleThresholdSave,
  };
}
