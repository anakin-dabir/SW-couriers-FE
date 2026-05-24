import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export type NotificationEvent =
  | 'BOOKING_CONFIRMATION'
  | 'PICKUP_SCHEDULED'
  | 'PICKUP_ON_THE_WAY'
  | 'PICKUP_COMPLETED'
  | 'IN_TRANSIT_TO_WAREHOUSE'
  | 'PACKAGE_IN_WAREHOUSE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_SUCCESSFUL'
  | 'DELIVERY_PARTIAL'
  | 'DELIVERY_FAILED_ATTEMPT'
  | 'DELIVERY_FAILED_FINAL'
  | 'RETURN_INITIATED'
  | 'RETURN_SCHEDULED'
  | 'RETURN_IN_TRANSIT'
  | 'RETURN_COMPLETED'
  | 'RETURNED_TO_SENDER'
  | 'BOOKING_DISPOSED'
  | 'INVOICE_GENERATED'
  | 'INVOICE_OVERDUE'
  | 'PAYMENT_RECEIVED'
  | 'CREDIT_LIMIT_WARNING'
  | 'CREDIT_LIMIT_REACHED'
  | 'RECIPIENT_PENDING_PICKUP'
  | 'RECIPIENT_PICKUP_SCHEDULED'
  | 'RECIPIENT_AT_WAREHOUSE'
  | 'RECIPIENT_DELIVERY_SCHEDULED'
  | 'RECIPIENT_OUT_FOR_DELIVERY'
  | 'RECIPIENT_PARTIALLY_DELIVERED'
  | 'RECIPIENT_DELIVERY_FAILED_ATTEMPT'
  | 'RECIPIENT_DELIVERY_FAILED_FINAL'
  | 'RECIPIENT_DELIVERED'
  | 'RECIPIENT_CANCELLED';

export type NotificationTypeFilter = 'ADMIN_INTERNAL' | 'B2B_CUSTOMER' | 'RECIPIENT';
export type NotificationCategory = 'SHIPMENT' | 'BILLING' | 'RECIPIENT_DELIVERY';

export interface ChannelResolved {
  enabled: boolean;
  default: boolean;
}

export interface EventResolved {
  event: NotificationEvent;
  event_display_name: string;
  email: ChannelResolved;
  sms: ChannelResolved;
  template_customized: boolean;
}

export interface CategoryGroup {
  category: NotificationCategory;
  category_display_name: string;
  preferences: EventResolved[];
}

export interface ChannelToggle {
  enabled: boolean | null;
}

export interface EventPreferenceUpdate {
  event: NotificationEvent;
  email?: ChannelToggle | null;
  sms?: ChannelToggle | null;
}

export interface BulkUpdateRecipientPreferencesRequest {
  preferences: EventPreferenceUpdate[];
}

export type TemplateChannel = 'EMAIL' | 'SMS';

export interface ResolvedOrganizationTemplate {
  subject: string;
  body: string;
  variables: string[];
  source: string;
  is_custom: boolean;
}

export interface UpdateOrganizationTemplateRequest {
  subject: string;
  body: string;
}

export type TestNotificationScope = 'ORGANIZATION' | 'B2B_DASHBOARD';

export interface SendTestNotificationRequest {
  scope: TestNotificationScope;
  notification_type: NotificationTypeFilter;
  event: NotificationEvent;
  channels: Array<'EMAIL' | 'SMS'>;
  email?: string;
  phone_number?: string;
  organization_id?: string;
}

export interface SendTestNotificationResult {
  channel: string;
  status: string;
  error?: string;
}

export interface SendTestNotificationResponse {
  results: SendTestNotificationResult[];
}

export interface InboxNotificationItem {
  id: string;
  event: NotificationEvent;
  notification_type: NotificationTypeFilter;
  subject: string;
  body: string;
  created_at: string;
  is_read?: boolean;
  read_at?: string | null;
}

export interface InboxNotificationsData {
  items: InboxNotificationItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UnreadNotificationsCountData {
  unread_count: number;
}

function applyPreferenceUpdatesToGroups(
  groups: CategoryGroup[],
  updates: EventPreferenceUpdate[]
): void {
  const updatesByEvent = new Map<NotificationEvent, EventPreferenceUpdate>();
  for (const update of updates) {
    updatesByEvent.set(update.event, update);
  }

  for (const group of groups) {
    for (const pref of group.preferences) {
      const update = updatesByEvent.get(pref.event);
      if (!update) continue;
      if (update.email?.enabled != null) {
        pref.email.enabled = update.email.enabled;
      }
      if (update.sms?.enabled != null) {
        pref.sms.enabled = update.sms.enabled;
      }
    }
  }
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getB2BDashboardPreferences: build.query<ApiResponse<CategoryGroup[]>, void>({
      query: () => ({
        url: '/notifications/preferences/b2b_dashboard/B2B_CUSTOMER',
        method: 'GET',
      }),
      providesTags: [{ type: 'NotificationPreference', id: 'b2b_dashboard_B2B_CUSTOMER' }],
    }),
    updateB2BDashboardPreferences: build.mutation<
      ApiResponse<{ message: string }>,
      { body: BulkUpdateRecipientPreferencesRequest }
    >({
      query: ({ body }) => ({
        url: '/notifications/preferences/b2b_dashboard/B2B_CUSTOMER',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData(
            'getB2BDashboardPreferences',
            undefined,
            (draft) => {
              if (!draft.data) return;
              applyPreferenceUpdatesToGroups(draft.data, body.preferences);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    getOrganizationPreferences: build.query<
      ApiResponse<CategoryGroup[]>,
      {
        organizationId: string;
        notificationType: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
      }
    >({
      query: ({ organizationId, notificationType }) => ({
        url: `/notifications/preferences/organization/${organizationId}/${notificationType}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId, notificationType }) => [
        { type: 'NotificationPreference', id: `${organizationId}_${notificationType}` },
      ],
    }),
    updateOrganizationPreferences: build.mutation<
      ApiResponse<{ message: string }>,
      {
        organizationId: string;
        notificationType: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
        body: BulkUpdateRecipientPreferencesRequest;
      }
    >({
      query: ({ organizationId, notificationType, body }) => ({
        url: `/notifications/preferences/organization/${organizationId}/${notificationType}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(
        { organizationId, notificationType, body },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData(
            'getOrganizationPreferences',
            { organizationId, notificationType },
            (draft) => {
              if (!draft.data) return;
              applyPreferenceUpdatesToGroups(draft.data, body.preferences);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    getOrganizationTemplate: build.query<
      ApiResponse<ResolvedOrganizationTemplate>,
      {
        organizationId: string;
        notificationType: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
        event: NotificationEvent;
        channel: TemplateChannel;
      }
    >({
      query: ({ organizationId, notificationType, event, channel }) => ({
        url: `/notifications/templates/organization/${organizationId}/${notificationType}/${event}/${channel}`,
        method: 'GET',
      }),
    }),
    updateOrganizationTemplate: build.mutation<
      ApiResponse<ResolvedOrganizationTemplate>,
      {
        organizationId: string;
        notificationType: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
        event: NotificationEvent;
        channel: TemplateChannel;
        body: UpdateOrganizationTemplateRequest;
      }
    >({
      query: ({ organizationId, notificationType, event, channel, body }) => ({
        url: `/notifications/templates/organization/${organizationId}/${notificationType}/${event}/${channel}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { organizationId, notificationType }) => [
        { type: 'NotificationPreference', id: `${organizationId}_${notificationType}` },
      ],
    }),
    sendTestNotification: build.mutation<
      ApiResponse<SendTestNotificationResponse>,
      SendTestNotificationRequest
    >({
      query: (body) => ({
        url: '/notifications/test',
        method: 'POST',
        body,
      }),
    }),
    getInboxNotifications: build.query<
      ApiResponse<InboxNotificationsData>,
      { page?: number; size?: number; unread_only?: boolean } | void
    >({
      query: (params) => ({
        url: '/notifications/inbox',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          size: params?.size ?? 20,
          unread_only: params?.unread_only ?? false,
        },
      }),
      providesTags: [{ type: 'NotificationInbox', id: 'LIST' }],
    }),
    getUnreadNotificationCount: build.query<ApiResponse<UnreadNotificationsCountData>, void>({
      query: () => ({
        url: '/notifications/inbox/unread/count',
        method: 'GET',
      }),
      providesTags: [{ type: 'UnreadNotificationCount', id: 'COUNT' }],
    }),
    markInboxNotificationRead: build.mutation<
      ApiResponse<{ message: string }>,
      { notification_id: string }
    >({
      query: ({ notification_id }) => ({
        url: `/notifications/inbox/${notification_id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'NotificationInbox', id: 'LIST' },
        { type: 'UnreadNotificationCount', id: 'COUNT' },
      ],
    }),
    markAllInboxNotificationsRead: build.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/notifications/inbox/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'NotificationInbox', id: 'LIST' },
        { type: 'UnreadNotificationCount', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useGetOrganizationPreferencesQuery,
  useUpdateOrganizationPreferencesMutation,
  useGetOrganizationTemplateQuery,
  useUpdateOrganizationTemplateMutation,
  useSendTestNotificationMutation,
  useGetInboxNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkInboxNotificationReadMutation,
  useMarkAllInboxNotificationsReadMutation,
} = notificationsApi;
