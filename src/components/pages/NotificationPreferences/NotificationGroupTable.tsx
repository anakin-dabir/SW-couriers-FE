import * as React from 'react';
import { BellRing } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Switch } from '@/components/atoms/switch';
import type { NotificationGroup, NotificationRow } from './notificationPreferences.types';

const NOTIFICATION_SWITCH_CLASS =
  'h-6 w-11 data-[state=checked]:bg-[#AE2224] data-[state=unchecked]:bg-[#CBCBD8]';

function TableColumnHeader({
  label,
  align = 'start',
}: {
  label: string;
  align?: 'start' | 'center';
}): React.JSX.Element {
  return (
    <div
      className={`flex h-12 shrink-0 items-center border-b border-[#E4E4E7] px-4 ${
        align === 'center' ? 'justify-center' : ''
      }`}
    >
      <Typography component="span" className="text-sm font-medium leading-5 text-[#71717A]">
        {label}
      </Typography>
    </div>
  );
}

export type NotificationGroupTableVariant = 'internal' | 'recipient';

export interface NotificationGroupTableProps {
  group: NotificationGroup;
  variant?: NotificationGroupTableVariant;
  onChannelToggle: (rowId: string, channel: 'email' | 'sms', checked: boolean) => void;
  onThresholdChange?: (rowId: string, value: string) => void;
  onThresholdSave?: (rowId: string) => void;
  showCustomizeButton?: boolean;
  onCustomizeTemplate?: (row: NotificationRow) => void;
  isTogglePending?: (rowId: string, channel: 'email' | 'sms') => boolean;
}

const RECIPIENT_CUSTOMIZE_BUTTON_CLASS =
  'h-[30px] shrink-0 rounded-md border border-[#E5E5EC] bg-white px-3 py-1.5 text-xs font-medium text-form-title shadow-sm hover:bg-[#F9FAFB]';

function getRowMinHeight(hasThreshold: boolean, isMultiLineEvent: boolean): string {
  if (hasThreshold || isMultiLineEvent) return 'min-h-[72px]';
  return 'min-h-[52px]';
}

export default function NotificationGroupTable({
  group,
  variant = 'internal',
  onChannelToggle,
  onThresholdChange,
  onThresholdSave,
  showCustomizeButton = false,
  onCustomizeTemplate,
  isTogglePending,
}: NotificationGroupTableProps): React.JSX.Element {
  const isRecipientVariant = variant === 'recipient';
  const templateColumnWidth = isRecipientVariant ? 'w-[254px]' : 'min-w-[254px] flex-1';

  return (
    <div className="relative overflow-hidden rounded-xl bg-white pb-6 pt-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[50px] rounded-xl bg-[#F2F2F6]" />

      <div className="relative flex items-center gap-1.5 px-5">
        <BellRing className="h-5 w-5 shrink-0 text-[#030303]" strokeWidth={1.75} />
        <Typography
          component="span"
          className="text-base font-medium uppercase tracking-[0.16px] text-[#030303]"
        >
          {group.title}
        </Typography>
      </div>

      <div className="relative mt-5 overflow-x-auto px-5">
        <div className="flex min-w-[960px]">
          <div className="w-[304px] shrink-0">
            <TableColumnHeader label="Event Type" />
            {group.rows.map((row) => {
              const hasThreshold = row.thresholdValue !== undefined;
              const isMultiLineEvent = row.eventType.includes('(Final');
              return (
                <div
                  key={row.id}
                  className={`flex flex-col justify-center border-b border-[#E4E4E7] px-4 py-4 ${getRowMinHeight(
                    hasThreshold,
                    isMultiLineEvent
                  )}`}
                >
                  <Typography
                    component="span"
                    className={`text-sm font-medium leading-5 text-[#18181B] ${
                      isMultiLineEvent ? 'whitespace-pre-wrap' : 'truncate'
                    }`}
                  >
                    {row.eventType}
                  </Typography>
                  {hasThreshold ? (
                    <div className="mt-2 flex w-fit items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#F8FAFC] px-2 py-1">
                      <Typography component="span" className="text-xs font-medium text-[#18181B]">
                        Threshold:
                      </Typography>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.thresholdValue}
                        onChange={(e) => onThresholdChange?.(row.id, e.target.value)}
                        className="h-6 w-10 border-none bg-transparent p-0 text-xs text-[#18181B] outline-none"
                      />
                      <Typography component="span" className="text-xs text-[#71717A]">
                        %
                      </Typography>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onThresholdSave?.(row.id)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="w-[201px] shrink-0">
            <TableColumnHeader label="Email" />
            {group.rows.map((row) => {
              const hasThreshold = row.thresholdValue !== undefined;
              const isMultiLineEvent = row.eventType.includes('(Final');
              return (
                <div
                  key={row.id}
                  className={`flex items-center border-b border-[#E4E4E7] px-4 ${getRowMinHeight(
                    hasThreshold,
                    isMultiLineEvent
                  )}`}
                >
                  <Switch
                    checked={row.emailEnabled}
                    className={NOTIFICATION_SWITCH_CLASS}
                    disabled={isTogglePending?.(row.id, 'email') ?? false}
                    onCheckedChange={(checked) => onChannelToggle(row.id, 'email', checked)}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-[201px] shrink-0">
            <TableColumnHeader label="SMS" />
            {group.rows.map((row) => {
              const hasThreshold = row.thresholdValue !== undefined;
              const isMultiLineEvent = row.eventType.includes('(Final');
              return (
                <div
                  key={row.id}
                  className={`flex items-center border-b border-[#E4E4E7] px-4 ${getRowMinHeight(
                    hasThreshold,
                    isMultiLineEvent
                  )}`}
                >
                  <Switch
                    checked={row.smsEnabled}
                    className={NOTIFICATION_SWITCH_CLASS}
                    disabled={isTogglePending?.(row.id, 'sms') ?? false}
                    onCheckedChange={(checked) => onChannelToggle(row.id, 'sms', checked)}
                  />
                </div>
              );
            })}
          </div>

          <div className={`${templateColumnWidth} shrink-0`}>
            <TableColumnHeader
              label="Notification Template"
              align={isRecipientVariant ? 'start' : 'center'}
            />
            {group.rows.map((row) => {
              const hasThreshold = row.thresholdValue !== undefined;
              const isMultiLineEvent = row.eventType.includes('(Final');

              if (isRecipientVariant && showCustomizeButton) {
                return (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between gap-2 border-b border-[#E4E4E7] px-4 ${getRowMinHeight(
                      hasThreshold,
                      isMultiLineEvent
                    )}`}
                  >
                    <span className="inline-flex h-[22px] shrink-0 items-center justify-center rounded-full bg-[#E5E5EC] px-2.5 text-xs font-semibold text-black">
                      {row.template}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={RECIPIENT_CUSTOMIZE_BUTTON_CLASS}
                      onClick={() => onCustomizeTemplate?.(row)}
                    >
                      Customize
                    </Button>
                  </div>
                );
              }

              return (
                <div
                  key={row.id}
                  className={`flex items-center justify-center border-b border-[#E4E4E7] px-4 ${getRowMinHeight(
                    hasThreshold,
                    isMultiLineEvent
                  )}`}
                >
                  <span className="inline-flex h-[22px] items-center justify-center rounded-full bg-[#E5E5EC] px-2.5 text-xs font-semibold text-black">
                    {row.template}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
