import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/molecules/tabs';
import {
  notificationsApi,
  type NotificationEvent,
  type NotificationTypeFilter,
} from '@/store/api/notificationsApi';
import type { SerializedEditorState } from 'lexical';
import CustomizeNotificationEmailTab from './CustomizeNotificationEmailTab';
import CustomizeNotificationTextTab from './CustomizeNotificationTextTab';

interface CustomizeNotificationTabsProps {
  /** Default active tab */
  defaultValue?: string;
  /** Active tab value */
  value?: string;
  /** Tab change handler */
  onValueChange?: (value: string) => void;
  /** Additional className */
  className?: string;
  /** Cancel button handler */
  onCancel?: () => void;
  organizationId?: string | null;
  notificationType?: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
  event?: NotificationEvent | null;
}

/**
 * CustomizeNotificationTabs Molecule
 *
 * Tabs component for customizing notification text by Email and Text
 */
export default function CustomizeNotificationTabs({
  defaultValue = 'email',
  value,
  onValueChange,
  className = 'w-full',
  onCancel,
  organizationId,
  notificationType,
  event,
}: CustomizeNotificationTabsProps): React.JSX.Element {
  const canFetchTemplates = Boolean(organizationId && notificationType && event);
  const [updateOrganizationTemplate, { isLoading: isSavingTemplate }] =
    notificationsApi.useUpdateOrganizationTemplateMutation();

  const extractPlainText = React.useCallback((state?: SerializedEditorState): string => {
    if (!state?.root?.children) return '';

    const extractTextFromNode = (node: unknown): string => {
      if (!node || typeof node !== 'object') return '';
      const maybeNode = node as { text?: string; children?: unknown[] };
      if (typeof maybeNode.text === 'string') return maybeNode.text;
      if (!Array.isArray(maybeNode.children)) return '';
      return maybeNode.children.map(extractTextFromNode).join('');
    };

    return state.root.children
      .map((node) => extractTextFromNode(node))
      .join('\n')
      .trim();
  }, []);

  const handleSaveEmailTemplate = React.useCallback(
    async (subject: string, editorState: SerializedEditorState | undefined): Promise<void> => {
      if (!organizationId || !notificationType || !event) return;
      const bodyText = extractPlainText(editorState);
      await updateOrganizationTemplate({
        organizationId,
        notificationType,
        event,
        channel: 'EMAIL',
        body: {
          subject,
          body: bodyText,
        },
      }).unwrap();
    },
    [organizationId, notificationType, event, extractPlainText, updateOrganizationTemplate]
  );

  const handleSaveSmsTemplate = React.useCallback(
    async (editorState: SerializedEditorState | undefined): Promise<void> => {
      if (!organizationId || !notificationType || !event) return;
      const bodyText = extractPlainText(editorState);
      await updateOrganizationTemplate({
        organizationId,
        notificationType,
        event,
        channel: 'SMS',
        body: {
          subject: '',
          body: bodyText,
        },
      }).unwrap();
    },
    [organizationId, notificationType, event, extractPlainText, updateOrganizationTemplate]
  );
  const { data: emailTemplateResponse, isFetching: isFetchingEmailTemplate } =
    notificationsApi.useGetOrganizationTemplateQuery(
      {
        organizationId: organizationId ?? '',
        notificationType: notificationType ?? 'RECIPIENT',
        event: event ?? 'RECIPIENT_OUT_FOR_DELIVERY',
        channel: 'EMAIL',
      },
      { skip: !canFetchTemplates }
    );

  const { data: smsTemplateResponse, isFetching: isFetchingSmsTemplate } =
    notificationsApi.useGetOrganizationTemplateQuery(
      {
        organizationId: organizationId ?? '',
        notificationType: notificationType ?? 'RECIPIENT',
        event: event ?? 'RECIPIENT_OUT_FOR_DELIVERY',
        channel: 'SMS',
      },
      { skip: !canFetchTemplates }
    );

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className ?? 'flex min-h-0 flex-1 flex-col'}
    >
      <TabsList className="grid w-full shrink-0 grid-cols-2">
        <TabsTrigger value="email">By Email</TabsTrigger>
        <TabsTrigger value="text">By Text</TabsTrigger>
      </TabsList>
      <TabsContent
        value="email"
        className="mt-4 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <CustomizeNotificationEmailTab
          className="flex min-h-0 flex-1 flex-col"
          onCancel={onCancel}
          onSave={(subject, editorState) => {
            void handleSaveEmailTemplate(subject, editorState);
          }}
          initialSubject={emailTemplateResponse?.data?.subject}
          initialBody={emailTemplateResponse?.data?.body}
          variables={emailTemplateResponse?.data?.variables}
          isLoadingTemplate={isFetchingEmailTemplate || isSavingTemplate}
        />
      </TabsContent>
      <TabsContent
        value="text"
        className="mt-4 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <CustomizeNotificationTextTab
          className="flex min-h-0 flex-1 flex-col"
          onCancel={onCancel}
          onSave={(editorState) => {
            return handleSaveSmsTemplate(editorState);
          }}
          initialBody={smsTemplateResponse?.data?.body}
          variables={smsTemplateResponse?.data?.variables}
          isLoadingTemplate={isFetchingSmsTemplate}
          isSavingTemplate={isSavingTemplate}
        />
      </TabsContent>
    </Tabs>
  );
}
