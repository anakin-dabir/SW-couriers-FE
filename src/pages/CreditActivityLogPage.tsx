import * as React from 'react';
import { ArrowLeft, Copy, Laptop, Monitor, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type DateRange } from 'react-day-picker';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/badge';
import Typography from '@/components/atoms/Typography';
import { Pagination } from '@/components/molecules';
import { Drawer, DrawerContent } from '@/components/molecules/drawer';
import { CreditActivityLogToolbar } from '@/components/pages/CreditActivity/CreditActivityLogToolbar';
import { CreditActivityTable } from '@/components/pages/CreditActivity/CreditActivityTable';
import { cn } from '@/lib/utils';
import type { CreditActivityTimePreset } from '@/lib/creditActivityUi';
import {
  mapCreditActivityItemToRow,
  SEVERITY_BADGE_CLASS_EXTENDED,
  USER_TYPE_BADGE_CLASS_EXTENDED,
  type CreditActivityTableRow,
} from '@/lib/creditPresentation';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { useGetCreditActivityQuery } from '@/store/api/creditOverviewApi';

function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    const payloadText = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    const payload = JSON.parse(payloadText) as
      | { organization_id?: unknown; org_id?: unknown }
      | undefined;
    const raw = payload?.organization_id ?? payload?.org_id;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

function presetToInclusiveRangeUtc(
  preset: CreditActivityTimePreset
): { fromIso: string; toIso: string } | undefined {
  if (preset === 'All Time') return undefined;
  const now = new Date();
  switch (preset) {
    case 'Yesterday': {
      const y = subDays(now, 1);
      return {
        fromIso: startOfDay(y).toISOString(),
        toIso: endOfDay(y).toISOString(),
      };
    }
    case 'Last 7 Days':
      return {
        fromIso: startOfDay(subDays(now, 6)).toISOString(),
        toIso: endOfDay(now).toISOString(),
      };
    case 'Last 30 Days':
      return {
        fromIso: startOfDay(subDays(now, 29)).toISOString(),
        toIso: endOfDay(now).toISOString(),
      };
    case 'Today':
    default:
      return {
        fromIso: startOfDay(now).toISOString(),
        toIso: endOfDay(now).toISOString(),
      };
  }
}

function calendarRangeToIso(
  range: DateRange | undefined
): { fromIso: string; toIso: string } | undefined {
  if (!range?.from) return undefined;
  const start = range.to ? range.from : startOfDay(range.from);
  const end = range.to ? range.to : endOfDay(range.from);
  return { fromIso: start.toISOString(), toIso: endOfDay(end).toISOString() };
}

export default function CreditActivityLogPage(): React.JSX.Element {
  const navigate = useNavigate();

  const organizationIdFromUser = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = React.useMemo(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [timePreset, setTimePreset] = React.useState<CreditActivityTimePreset>('All Time');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [selectedEventTypes, setSelectedEventTypes] = React.useState<string[]>([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CreditActivityTableRow | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const windowIso = React.useMemo(() => {
    const fromCal = calendarRangeToIso(dateRange);
    if (fromCal) return fromCal;
    return presetToInclusiveRangeUtc(timePreset);
  }, [dateRange, timePreset]);

  const queryArgs = React.useMemo(() => {
    if (!organizationId) return undefined;
    return {
      organizationId,
      page: currentPage,
      size: pageSize,
      search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
      event_type: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
      from_date: windowIso?.fromIso,
      to_date: windowIso?.toIso,
    };
  }, [organizationId, currentPage, pageSize, debouncedSearch, selectedEventTypes, windowIso]);

  const {
    data: activityResponse,
    isFetching,
    isLoading,
    error,
  } = useGetCreditActivityQuery(queryArgs ?? { organizationId: '', page: 1, size: 10 }, {
    skip: !organizationId,
  });

  const list = activityResponse?.data;
  const tableRows = list?.items.map((dto) => mapCreditActivityItemToRow(dto)) ?? [];
  const totalItems = typeof list?.total === 'number' ? list.total : 0;
  const totalPages =
    typeof list?.pages === 'number' && list.pages > 0
      ? list.pages
      : Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const selectedEventRef =
    selectedEvent?.auditRefDisplay && selectedEvent.auditRefDisplay !== '—'
      ? selectedEvent.auditRefDisplay
      : '—';

  const renderDeviceIcon = (device: CreditActivityTableRow['device']): React.JSX.Element => {
    if (device === 'Desktop') return <Monitor className="size-4 text-muted-foreground" />;
    if (device === 'Laptop') return <Laptop className="size-4 text-muted-foreground" />;
    return <Smartphone className="size-4 text-muted-foreground" />;
  };

  if (!organizationId) {
    return (
      <div className="flex flex-col gap-4">
        <Typography className="text-sm text-[#71717A]">
          Sign in again to load activity for your organisation.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              void navigate('/credit-request');
            }}
            className="size-8 shrink-0 text-[#18181B] hover:bg-[#F4F4F5]"
            aria-label="Back to credit request"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Typography
            component="h1"
            className="text-xl font-semibold tracking-tight text-[#030303]"
          >
            Recent Credit Activity
          </Typography>
        </div>

        <CreditActivityLogToolbar
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setCurrentPage(1);
          }}
          timePreset={timePreset}
          onTimePresetChange={(preset) => {
            setTimePreset(preset);
            setCurrentPage(1);
          }}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
          windowIso={windowIso}
          selectedEventTypes={selectedEventTypes}
          onApplyEventTypes={(types) => {
            setSelectedEventTypes(types);
            setCurrentPage(1);
          }}
        />

        {error ? (
          <div className="border-b border-[#E5E7EB] bg-[#FEF2F2] px-5 py-3">
            <Typography className="text-sm text-[#B91C1C]">
              Unable to load activity. Refresh the page after checking your permissions.
            </Typography>
          </div>
        ) : null}

        <CreditActivityTable
          rows={tableRows}
          isLoading={isLoading || isFetching}
          emptyMessage="No activity matches these filters yet."
          onRowClick={(row) => {
            setSelectedEvent(row);
            setIsEventDrawerOpen(true);
          }}
        />

        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#E5E7EB] px-5 py-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm text-[#52525B]">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 min-w-[52px] rounded-md border border-[#E4E4E7] bg-white px-2 text-sm font-medium text-[#18181B]"
              aria-label="Entries per page"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              entries out of <span className="font-semibold text-[#18181B]">{totalItems}</span>
              {isFetching ? <span className="text-[#9CA3AF]"> · updating…</span> : null}
            </span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            activePageClassName="bg-[#F3F4F6] text-[#18181B] hover:bg-[#F3F4F6]"
          />
        </div>
      </div>

      <Drawer open={isEventDrawerOpen} onOpenChange={setIsEventDrawerOpen} direction="right">
        <DrawerContent
          maxWidthClass="sm:max-w-3xl"
          showClose={false}
          className="h-full w-full overflow-x-hidden overflow-y-auto rounded-l-2xl border-l border-[#CBCBD8] bg-[#FBFBFC] p-0 shadow-[-9px_0px_20px_rgba(0,0,0,0.02)]"
        >
          {selectedEvent && (
            <div className="flex h-full flex-col overflow-x-hidden">
              <div className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white px-5 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setIsEventDrawerOpen(false)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div className="flex flex-col">
                    <Typography component="div" className="text-xl font-semibold text-[#030303]">
                      Event Details
                    </Typography>
                    <div className="flex items-center gap-1">
                      <Typography component="div" className="text-xs font-medium text-[#71717A]">
                        Audit Ref: {selectedEventRef}
                      </Typography>
                      <Copy className="size-3 text-[#A1A1AA]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-5 py-5">
                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Meta Data
                  </Typography>
                  <div className="space-y-2.5 pl-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Audit Ref</span>
                      <span className="text-[#030303]">{selectedEventRef}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Timestamp</span>
                      <span className="text-[#030303]">{selectedEvent.timestampDisplay}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">User Type</span>
                      <Badge
                        className={cn(
                          'w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          USER_TYPE_BADGE_CLASS_EXTENDED[selectedEvent.userType]
                        )}
                      >
                        {selectedEvent.userType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Status</span>
                      <Badge
                        className={cn(
                          'w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          SEVERITY_BADGE_CLASS_EXTENDED[selectedEvent.severity]
                        )}
                      >
                        {selectedEvent.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Event Type</span>
                      <span className="text-[#18181B]">{selectedEvent.eventType}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Summary</span>
                      <span className="text-[#18181B]">{selectedEvent.description}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Actor</span>
                      <span className="text-[#18181B]">{selectedEvent.actedBy}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Session ID</span>
                      <span className="text-[#18181B]">{selectedEvent.id}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">IP Address</span>
                      <span className="text-[#18181B]">{selectedEvent.ipAddress}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">User Agent</span>
                      <span className="inline-flex items-center gap-2 text-[#18181B]">
                        {renderDeviceIcon(selectedEvent.device)}
                        {selectedEvent.browser} on {selectedEvent.os} ({selectedEvent.device})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
