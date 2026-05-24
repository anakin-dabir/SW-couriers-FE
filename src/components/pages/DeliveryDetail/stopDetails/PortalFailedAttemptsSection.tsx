import type React from 'react';
import { Copy } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { toast } from 'sonner';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import type { StopAttemptEntryDto } from '@/store/api/ordersApi';

export interface PortalFailedAttemptsSectionProps {
  attempts: StopAttemptEntryDto[];
  totalAttempts?: number;
  title?: string;
  className?: string;
}

function formatAttemptDate(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'd MMM') : '—';
}

function formatAttemptTime(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'h:mm a') : '—';
}

export default function PortalFailedAttemptsSection({
  attempts,
  totalAttempts,
  title = 'FAILED ATTEMPT',
  className,
}: PortalFailedAttemptsSectionProps): React.JSX.Element | null {
  if (!attempts || attempts.length === 0) return null;

  const total = totalAttempts ?? attempts.length;

  const handleCopy = (
    e: React.MouseEvent | React.KeyboardEvent,
    text: string,
    label: string
  ): void => {
    e.stopPropagation();
    void navigator.clipboard.writeText(text).catch(() => undefined);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
            <Typography
              variant="label"
              className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
            >
              {title} # {attempt.attempt_number}
              {attempt.is_final ? ' (FINAL)' : ''}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-5 px-5 py-4 md:grid-cols-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Typography
                  variant="caption"
                  className="text-[11px] font-medium leading-none text-gray-400"
                >
                  Attempts
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border border-white ring-1 ring-gray-100',
                        attempt.attempt_number >= 1 ? 'bg-[#F59E0B]' : 'bg-white'
                      )}
                    />
                    <div
                      className={cn(
                        'h-2.5 w-2.5 -ml-1 rounded-full border border-white ring-1 ring-gray-100',
                        attempt.attempt_number >= 2 ? 'bg-[#FB923C]' : 'bg-white'
                      )}
                    />
                    <div
                      className={cn(
                        'h-2.5 w-2.5 -ml-1 rounded-full border border-white ring-1 ring-gray-100',
                        attempt.attempt_number >= 3 ? 'bg-[#EF4444]' : 'bg-white'
                      )}
                    />
                  </div>
                  <Typography
                    variant="body"
                    className="pt-0.5 text-[13px] font-bold leading-none text-gray-800"
                  >
                    {attempt.attempt_number} of {total}
                  </Typography>
                </div>
              </div>
              <div className="space-y-1.5">
                <Typography
                  variant="caption"
                  className="text-[11px] font-medium leading-none text-gray-400"
                >
                  Failure Reason
                </Typography>
                <Typography
                  variant="body"
                  className="pt-1 text-[13px] font-bold leading-none text-gray-800"
                >
                  {attempt.failure_reason || '—'}
                </Typography>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Typography
                  variant="caption"
                  className="text-[11px] font-medium leading-none text-gray-400"
                >
                  Date & Time
                </Typography>
                <Typography
                  variant="body"
                  className="pt-1 text-[13px] font-bold leading-none text-gray-800"
                >
                  {formatAttemptDate(attempt.attempted_at)} at{' '}
                  {formatAttemptTime(attempt.attempted_at)}
                </Typography>
              </div>
              <div className="space-y-1.5">
                <Typography
                  variant="caption"
                  className="text-[11px] font-medium leading-none text-gray-400"
                >
                  Driver Notes
                </Typography>
                <Typography
                  variant="body"
                  className="pt-1 text-[13px] font-bold leading-none text-gray-800"
                >
                  {attempt.notes ? `"${attempt.notes}"` : '—'}
                </Typography>
              </div>
            </div>

            <div className="space-y-1.5">
              <Typography
                variant="caption"
                className="text-[11px] font-medium leading-none text-gray-400"
              >
                Driver name
              </Typography>
              <Typography
                variant="body"
                className="pt-1 text-[13px] font-bold leading-none text-gray-800"
              >
                {attempt.driver_name || '—'}
              </Typography>
            </div>

            <div className="space-y-1.5">
              <Typography
                variant="caption"
                className="text-[11px] font-medium leading-none text-gray-400"
              >
                Vehicle
              </Typography>
              <Typography
                variant="body"
                className="pt-1 text-[13px] font-bold leading-none text-gray-800"
              >
                {attempt.vehicle_name || '—'}
              </Typography>
            </div>

            <div className="space-y-1.5">
              <Typography
                variant="caption"
                className="text-[11px] font-medium leading-none text-gray-400"
              >
                Route ID
              </Typography>
              {attempt.route_id ? (
                <button
                  type="button"
                  className="group flex cursor-pointer items-center gap-1.5 pt-1 text-left"
                  onClick={(e) => handleCopy(e, attempt.route_id ?? '', 'Route ID')}
                >
                  <Typography
                    variant="body"
                    className="text-[13px] font-bold leading-none text-gray-800 underline underline-offset-2 transition-colors group-hover:text-[#CD1111]"
                  >
                    {attempt.route_id}
                  </Typography>
                  <Copy className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-gray-900" />
                </button>
              ) : (
                <Typography
                  variant="body"
                  className="pt-1 text-[13px] font-bold leading-none text-gray-800"
                >
                  —
                </Typography>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
