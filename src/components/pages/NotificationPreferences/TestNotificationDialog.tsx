import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Checkbox } from '@/components/atoms/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { cn } from '@/lib/utils';
import {
  useSendTestNotificationMutation,
  type SendTestNotificationRequest,
  type NotificationEvent,
  type NotificationTypeFilter,
} from '@/store/api/notificationsApi';

export interface TestNotificationRow {
  event: NotificationEvent;
  eventType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

interface TestNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  allRows: TestNotificationRow[];
  notificationType: Extract<NotificationTypeFilter, 'B2B_CUSTOMER' | 'RECIPIENT'>;
  organizationId?: string | null;
}

type SendTestMutationFn = (arg: SendTestNotificationRequest) => { unwrap: () => Promise<unknown> };

export default function TestNotificationDialog({
  open,
  onClose,
  allRows,
  notificationType,
  organizationId,
}: TestNotificationDialogProps): React.JSX.Element {
  const firstEvent = allRows[0]?.event;
  const [selectedEvent, setSelectedEvent] = React.useState<NotificationEvent | undefined>(
    firstEvent
  );
  const [sendEmail, setSendEmail] = React.useState(false);
  const [sendSms, setSendSms] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState('');
  const [testPhone, setTestPhone] = React.useState('');

  const sendTestHook = useSendTestNotificationMutation() as unknown as [
    SendTestMutationFn,
    { isLoading: boolean },
  ];
  const [sendTest, { isLoading }] = sendTestHook;

  const selectedRow = allRows.find((row) => row.event === selectedEvent);
  const emailEnabled = selectedRow?.emailEnabled ?? false;
  const smsEnabled = selectedRow?.smsEnabled ?? false;

  React.useEffect(() => {
    if (!open) return;
    const nextEvent = allRows[0]?.event;
    setSelectedEvent(nextEvent);
    const row = allRows.find((entry) => entry.event === nextEvent);
    setSendEmail(row?.emailEnabled ?? false);
    setSendSms(row?.smsEnabled ?? false);
  }, [open, allRows]);

  const handleEventChange = (event: NotificationEvent): void => {
    const row = allRows.find((entry) => entry.event === event);
    setSelectedEvent(event);
    setSendEmail(row?.emailEnabled ?? false);
    setSendSms(row?.smsEnabled ?? false);
  };

  const handleSend = async (): Promise<void> => {
    if (!selectedEvent || !organizationId) return;

    const channels: Array<'EMAIL' | 'SMS'> = [];
    if (sendEmail && testEmail) channels.push('EMAIL');
    if (sendSms && testPhone) channels.push('SMS');
    if (channels.length === 0) return;

    try {
      await sendTest({
        scope: 'ORGANIZATION',
        notification_type: notificationType,
        event: selectedEvent,
        channels,
        email: channels.includes('EMAIL') ? testEmail : undefined,
        phone_number: channels.includes('SMS') ? testPhone : undefined,
        organization_id: organizationId,
      }).unwrap();
      toast.success('Test notification sent successfully.');
      onClose();
    } catch {
      toast.error('Failed to send test notification.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="h-auto max-h-[90vh] max-w-[640px] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Test Notification</DialogTitle>
          <DialogDescription className="mt-1">
            Send a test notification using your current settings and templates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 px-6 py-5">
          <div className="h-px w-full bg-[#E5E7EB]" />

          <div className="space-y-1.5">
            <Typography variant="body" className="text-sm font-semibold text-gray-700">
              Select Event to Test:
            </Typography>
            <Typography variant="caption" className="text-xs text-gray-500">
              Event Type <span className="text-[#D90429]">*</span>
            </Typography>
            <Select
              value={selectedEvent}
              onValueChange={(value) => handleEventChange(value as NotificationEvent)}
            >
              <SelectTrigger className="h-9 border-gray-200 text-sm shadow-none">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {allRows.map((row) => (
                  <SelectItem key={row.event} value={row.event} className="text-sm">
                    {row.eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Typography variant="caption" className="text-xs text-gray-400">
              The test will use the current template and channel settings for this event.
            </Typography>
          </div>

          <div className="h-px w-full bg-[#E5E7EB]" />

          <div className="space-y-2.5 mb-2">
            <Typography variant="body" className="text-sm font-semibold text-gray-700">
              Select Delivery Channel:
            </Typography>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="test-channel-email"
                checked={sendEmail}
                disabled={!emailEnabled}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <Typography
                variant="body"
                className={
                  emailEnabled ? 'text-sm font-medium text-gray-700' : 'text-sm text-gray-400'
                }
              >
                Email
              </Typography>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  emailEnabled ? 'bg-green-50 text-emerald-600' : 'bg-red-50 text-rose-500'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    emailEnabled ? 'bg-emerald-500' : 'bg-rose-400'
                  )}
                />
                {emailEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="test-channel-sms"
                checked={sendSms}
                disabled={!smsEnabled}
                onChange={(e) => setSendSms(e.target.checked)}
              />
              <Typography
                variant="body"
                className={
                  smsEnabled ? 'text-sm font-medium text-gray-700' : 'text-sm text-gray-400'
                }
              >
                SMS
              </Typography>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  smsEnabled ? 'bg-green-50 text-emerald-600' : 'bg-red-50 text-rose-500'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    smsEnabled ? 'bg-emerald-500' : 'bg-rose-400'
                  )}
                />
                {smsEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            {!smsEnabled && (
              <Typography variant="caption" className="pl-6 text-xs text-gray-400">
                SMS is currently disabled for this event.{' '}
                <button
                  type="button"
                  className="font-medium text-[#D90429] underline underline-offset-2"
                  onClick={() => {
                    setSendSms(true);
                  }}
                >
                  Enable &amp; Test
                </button>
              </Typography>
            )}
          </div>

          <div className="h-px w-full bg-[#E5E7EB]" />

          <div className="space-y-2">
            <Typography variant="body" className="text-sm font-semibold text-gray-700">
              Enter Test Recipient:
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Typography variant="caption" className="text-xs text-gray-500">
                  Test Email Address <span className="text-[#D90429]">*</span>
                </Typography>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="h-9 border-gray-200 text-sm shadow-none"
                />
              </div>
              <div className="space-y-1">
                <Typography variant="caption" className="text-xs text-gray-500">
                  Test Mobile Number <span className="text-[#D90429]">*</span>
                </Typography>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
                    🇬🇧
                  </span>
                  <Input
                    type="tel"
                    placeholder="+44 1234 567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-9 border-gray-200 pl-8 text-sm shadow-none"
                  />
                </div>
              </div>
            </div>
            <Typography variant="caption" className="text-xs text-gray-400">
              This will not notify any real recipient. Only the entered address will receive the
              test.
            </Typography>
          </div>

          <div className="h-px w-full bg-[#E5E7EB]" />
        </div>

        <DialogFooter className="px-6 pb-6 pt-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleSend();
            }}
            disabled={
              isLoading ||
              !selectedEvent ||
              !organizationId ||
              (!sendEmail && !sendSms) ||
              (sendEmail && !testEmail) ||
              (sendSms && !testPhone)
            }
            className="bg-[#CA0000] text-white hover:bg-[#B00420]"
          >
            {isLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Send Test Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
