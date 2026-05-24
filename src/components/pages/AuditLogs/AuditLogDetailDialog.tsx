import * as React from 'react';
import { Copy, X } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/Button';
import { Drawer, DrawerContent } from '@/components/molecules/drawer';
import { useGetAuditLogDetailQuery } from '@/store/api/auditLogsApi';
import { getErrorMessage } from '@/store/api/utils';

interface AuditLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
  auditLogId: string | null;
}

function toPrettyJson(value: unknown): string {
  if (value == null) return '{}';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function displayText(value: string | null | undefined): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : '—';
}

function severityBadgeClass(severityRaw: string | null | undefined): string {
  const s = (severityRaw ?? '').toUpperCase();
  if (s === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'WARNING') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s === 'NOTICE') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'INFO') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function prettyLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export default function AuditLogDetailDialog({
  open,
  onOpenChange,
  organizationId,
  auditLogId,
}: AuditLogDetailDialogProps): React.JSX.Element {
  const detailArg =
    open && organizationId && auditLogId
      ? { organizationId, auditLogId }
      : ({ organizationId: '', auditLogId: '' } as const);
  const { data, isFetching, isError, error } = useGetAuditLogDetailQuery(detailArg, {
    skip: !open || !organizationId || !auditLogId,
  });
  const detail = data?.data;
  const auditRef = detail?.audit_ref ?? '—';
  const severityLabel = prettyLabel(detail?.severity);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        maxWidthClass="sm:max-w-3xl"
        showClose={false}
        className="h-full w-full overflow-x-hidden overflow-y-auto rounded-l-2xl border-l border-[#CBCBD8] bg-[#FBFBFC] p-0 shadow-[-9px_0px_20px_rgba(0,0,0,0.02)]"
      >
        <div className="flex h-full flex-col overflow-x-hidden">
          <div className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <Typography component="div" className="text-xl font-semibold text-[#030303]">
                  Event Details
                </Typography>
                <div className="flex items-center gap-1">
                  <Typography component="div" className="text-xs font-medium text-[#71717A]">
                    Audit Ref: {auditRef}
                  </Typography>
                  <Copy className="size-3 text-[#A1A1AA]" />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {isFetching ? (
            <div className="m-5 rounded-md border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-6 text-center">
              <Typography className="text-sm text-[#71717A]">Loading audit detail...</Typography>
            </div>
          ) : isError || !detail ? (
            <div className="m-5 rounded-md border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-6 text-center">
              <Typography className="text-sm font-medium text-[#18181B]">
                Could not load audit detail.
              </Typography>
              <Typography className="mt-1 text-sm text-[#71717A]">
                {error ? getErrorMessage(error) : 'Please try again.'}
              </Typography>
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="border-b border-[#E2E8F0] pb-5">
                <Typography
                  component="div"
                  className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                >
                  Meta Data
                </Typography>
                <div className="space-y-2.5 pl-3">
                  <MetaRow label="Audit Ref" value={displayText(detail.audit_ref)} />
                  <MetaRow label="Timestamp" value={displayText(detail.created_at)} />
                  <MetaRow
                    label="Category"
                    value={displayText(detail.display_category || detail.category)}
                  />
                  <MetaRow
                    label="Severity"
                    value={
                      <Badge className={`w-fit border ${severityBadgeClass(detail.severity)}`}>
                        {severityLabel}
                      </Badge>
                    }
                  />
                  <MetaRow label="Event Type" value={displayText(detail.event_type)} />
                  <MetaRow label="Summary" value={displayText(detail.event || detail.resource)} />
                  <MetaRow label="Actor" value={displayText(detail.actor)} />
                  <MetaRow label="Session ID" value={displayText(detail.session_id)} />
                  <MetaRow label="IP Address" value={displayText(detail.ip_address)} />
                  <MetaRow
                    label="User Agent"
                    value={displayText(detail.user_agent || detail.browser)}
                  />
                </div>
              </div>

              <div className="border-b border-[#E2E8F0] pb-5">
                <Typography
                  component="div"
                  className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                >
                  Entity Information
                </Typography>
                <div className="space-y-2.5 pl-3 text-sm">
                  <MetaRow label="Entity Type" value={displayText(detail.entity_type)} />
                  <MetaRow label="Entity Ref" value={displayText(detail.entity_ref)} />
                  <MetaRow label="Entity ID" value={displayText(detail.entity_id)} />
                </div>
              </div>

              <div className="border-b border-[#E2E8F0] pb-5">
                <Typography
                  component="div"
                  className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                >
                  Action Details
                </Typography>
                <div className="space-y-3 text-sm">
                  <MetaRow
                    label="Action"
                    value={displayText(detail.action || detail.action_label)}
                  />
                  <MetaRow label="Reason" value={displayText(detail.reason)} />
                  <div>
                    <Typography component="div" className="mb-1 text-xs font-medium text-[#71717A]">
                      Before:
                    </Typography>
                    <pre className="rounded-[3px] border border-[rgba(239,68,68,0.13)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-xs text-[#464649] whitespace-pre-wrap">
                      {toPrettyJson(detail.old_value)}
                    </pre>
                  </div>
                  <div>
                    <Typography component="div" className="mb-1 text-xs font-medium text-[#71717A]">
                      After:
                    </Typography>
                    <pre className="rounded-[3px] border border-[rgba(59,130,246,0.13)] bg-[rgba(59,130,246,0.05)] px-3 py-2 text-xs text-[#464649] whitespace-pre-wrap">
                      {toPrettyJson(detail.new_value)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pb-3">
                <Typography
                  component="div"
                  className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                >
                  Integrity Verification
                </Typography>
                <div className="space-y-2">
                  <div className="break-all rounded-[3px] border border-[#CBCBD8] bg-[rgba(203,203,216,0.44)] px-3 py-2 text-xs font-medium text-[#71717A]">
                    SHA-256: {displayText(detail.integrity_hash)}
                  </div>
                  <div className="break-all rounded-[3px] border border-[#CBCBD8] bg-[rgba(203,203,216,0.2)] px-3 py-2 text-xs font-medium text-[#71717A]">
                    Prev Hash: {displayText(detail.prev_hash)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
      <span className="text-right text-[#18181B]">{label}</span>
      <span className="text-[#030303]">{value}</span>
    </div>
  );
}
