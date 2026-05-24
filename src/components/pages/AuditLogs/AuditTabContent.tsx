import * as React from 'react';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Laptop,
  Monitor,
  Search,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Calendar } from '@/components/molecules/calendar';
import { Input } from '@/components/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Card, CardContent } from '@/components/molecules/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { DataTable } from '@/components/molecules';
import { cn } from '@/lib/utils';
import type { Column } from '@/types/datatable';
import type { AuditLogRow, AuditTabKey, Severity } from './shared';
import {
  ITEMS_PER_PAGE,
  TAB_ROWS,
  TAB_STATS,
  TREND_STACKED_DATA,
  TREND_X_AXIS,
  TREND_Y_AXIS,
} from './shared';

const CATEGORY_OPTIONS = ['Security', 'Billing', 'Account', 'Configuration', 'System'] as const;
const BROWSER_OPTIONS = [
  { key: 'Chrome', label: 'Chrome', emoji: '🌐' },
  { key: 'Firefox', label: 'Firefox', emoji: '🦊' },
  { key: 'Microsoft Edge', label: 'Microsoft Edge', emoji: '🔵' },
  { key: 'Safari', label: 'Safari', emoji: '🧭' },
] as const;

export default function AuditTabContent({ tabKey }: { tabKey: AuditTabKey }): React.JSX.Element {
  const [search, setSearch] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<'all' | Severity>('all');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    CATEGORY_OPTIONS.map((item) => item)
  );
  const [selectedBrowsers, setSelectedBrowsers] = React.useState<string[]>(
    BROWSER_OPTIONS.map((item) => item.key)
  );
  const [draftCategories, setDraftCategories] = React.useState<string[]>(selectedCategories);
  const [draftBrowsers, setDraftBrowsers] = React.useState<string[]>(selectedBrowsers);
  const [currentPage, setCurrentPage] = React.useState(1);

  const stats = TAB_STATS[tabKey];
  const rows = TAB_ROWS[tabKey];
  const hideOverviewWidgets = tabKey === 'activity-log';

  const columns = React.useMemo<Column<AuditLogRow>[]>(
    () => [
      {
        key: 'auditRef',
        header: 'Audit Ref',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) =>
          `AUD-${String(row.id)
            .replace(/^[a-z]-/, '')
            .padStart(6, '0')}`,
      },
      { key: 'timestamp', header: 'Timestamp', headerAlign: 'left', cellAlign: 'left' },
      { key: 'ipAddress', header: 'IP Address', headerAlign: 'left', cellAlign: 'left' },
      { key: 'browser', header: 'Browser', headerAlign: 'left', cellAlign: 'left' },
      {
        key: 'device',
        header: 'Device',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) => (
          <div className="flex items-center gap-2">
            {row.device === 'Desktop' ? (
              <Monitor className="h-4 w-4 text-muted-foreground" />
            ) : row.device === 'Mobile' ? (
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Laptop className="h-4 w-4 text-muted-foreground" />
            )}
            <Typography variant="caption" className="text-form-title">
              {row.device}
            </Typography>
          </div>
        ),
      },
      { key: 'os', header: 'OS', headerAlign: 'left', cellAlign: 'left' },
      { key: 'category', header: 'Category', headerAlign: 'left', cellAlign: 'left' },
      { key: 'severity', header: 'Severity', headerAlign: 'left', cellAlign: 'left' },
      {
        key: 'eventType',
        header: 'Event Type',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) => row.event,
      },
      {
        key: 'email',
        header: 'Email',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) => row.emails,
      },
      { key: 'actor', header: 'Actor', headerAlign: 'left', cellAlign: 'left' },
      {
        key: 'entityRef',
        header: 'Entity Ref',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) =>
          `ENT-${String(row.id)
            .replace(/^[a-z]-/, '')
            .padStart(6, '0')}`,
      },
      {
        key: 'eventSummary',
        header: 'Event Summary',
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row) => `${row.category}: ${row.event}`,
      },
    ],
    []
  );

  React.useEffect(() => {
    if (!isFilterDialogOpen) return;
    setDraftCategories(selectedCategories);
    setDraftBrowsers(selectedBrowsers);
  }, [isFilterDialogOpen, selectedCategories, selectedBrowsers]);

  const filteredRows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const rowDate = new Date(row.timestamp.replace(' ', 'T'));
      const hasDateRange = dateRange?.from instanceof Date;
      const toDate = dateRange?.to instanceof Date ? dateRange.to : dateRange?.from;
      const normalizedToDate =
        toDate instanceof Date
          ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999)
          : undefined;
      const matchesSearch =
        !term ||
        row.ipAddress.toLowerCase().includes(term) ||
        row.browser.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term) ||
        row.actor.toLowerCase().includes(term);
      const matchesSeverity = severityFilter === 'all' || row.severity === severityFilter;
      const matchesCategory = selectedCategories.includes(row.category);
      const matchesBrowser = selectedBrowsers.includes(row.browser);
      const matchesDate =
        !hasDateRange ||
        (dateRange?.from instanceof Date &&
          normalizedToDate instanceof Date &&
          rowDate >= dateRange.from &&
          rowDate <= normalizedToDate);
      return matchesSearch && matchesSeverity && matchesCategory && matchesBrowser && matchesDate;
    });
  }, [rows, search, severityFilter, selectedCategories, selectedBrowsers, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const paginatedRows = React.useMemo(
    () => filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredRows, currentPage]
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, severityFilter, selectedCategories, selectedBrowsers, dateRange]);

  const dateRangeLabel = React.useMemo(() => {
    if (!dateRange?.from) return 'Date Range';
    if (!dateRange.to) return format(dateRange.from, 'MMM dd, yyyy');
    return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  }, [dateRange]);

  const toggleFilterItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    setter((previous) =>
      previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value]
    );
  };

  return (
    <>
      {!hideOverviewWidgets ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="border-border p-4">
                <CardContent className="p-4 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Typography variant="caption" className="mb-1 text-sm text-muted-foreground">
                    {stat.title}
                  </Typography>
                  <Typography variant="h6" className="text-xl font-semibold text-form-title">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" className="mt-1 text-xs text-muted-foreground">
                    {stat.note}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Card className="border-border p-4">
        <CardContent>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <Typography variant="h6" className="text-base font-semibold text-form-title">
                Audit Logs
              </Typography>
              <Typography variant="caption" className="text-sm text-muted-foreground">
                Review the most recent high-severity events requiring attention.
              </Typography>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <div className="min-w-[280px] flex-1">
              <Input
                type="search"
                value={search}
                leftIcon={Search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by actor, browser, category, or IP"
                className="h-10"
              />
            </div>
            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value as 'all' | Severity)}
            >
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {dateRangeLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="h-10 gap-2"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={paginatedRows}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={ITEMS_PER_PAGE}
              totalEntries={filteredRows.length}
              onPageChange={setCurrentPage}
              getRowKey={(row) => row.id}
              className="min-w-[2200px]"
            />
          </div>
        </CardContent>
      </Card>

      {!hideOverviewWidgets ? (
        <Card className="border-border p-4">
          <CardContent>
            <Typography variant="h6" className="text-base font-semibold text-form-title">
              Activity Trend (Last 30 Days)
            </Typography>
            <Typography variant="caption" className="text-sm text-muted-foreground">
              Track patterns and spikes in audit events by severity level.
            </Typography>
            <div className="mt-4 bg-white p-3">
              <div className="relative h-[260px]">
                <div className="absolute inset-0 left-8">
                  {TREND_Y_AXIS.map((tick, index) => (
                    <div
                      key={tick}
                      className={cn(
                        'absolute left-0 right-0 border-t border-dashed border-[#E4E4E7]',
                        index === TREND_Y_AXIS.length - 1 && 'border-solid'
                      )}
                      style={{ top: `${(index / (TREND_Y_AXIS.length - 1)) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="absolute inset-y-0 left-0 flex w-8 flex-col justify-between">
                  {TREND_Y_AXIS.map((tick) => (
                    <Typography
                      key={tick}
                      variant="caption"
                      className="text-[12px] leading-[15px] text-[#71717A]"
                    >
                      {tick}
                    </Typography>
                  ))}
                </div>

                <div className="absolute inset-y-0 left-10 right-0 flex items-end gap-1.5">
                  {TREND_STACKED_DATA.map((entry, index) => {
                    const total = entry.info + entry.notice + entry.warning + entry.critical;
                    const totalHeight = (total / 400) * 100;
                    const infoHeight = total > 0 ? (entry.info / total) * 100 : 0;
                    const noticeHeight = total > 0 ? (entry.notice / total) * 100 : 0;
                    const warningHeight = total > 0 ? (entry.warning / total) * 100 : 0;
                    const criticalHeight = total > 0 ? (entry.critical / total) * 100 : 0;

                    return (
                      <div
                        key={`trend-bar-${index}`}
                        className="flex h-full min-w-0 flex-1 items-end"
                      >
                        <div
                          className="flex w-full flex-col-reverse overflow-hidden rounded-t-[3px]"
                          style={{ height: `${totalHeight}%` }}
                        >
                          <div
                            className="w-full bg-[#D4D7E4]"
                            style={{ height: `${infoHeight}%` }}
                          />
                          <div
                            className="w-full bg-[#4A90FF]"
                            style={{ height: `${noticeHeight}%` }}
                          />
                          <div
                            className="w-full bg-[#F5AE2F]"
                            style={{ height: `${warningHeight}%` }}
                          />
                          <div
                            className="w-full bg-[#F16862]"
                            style={{ height: `${criticalHeight}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ml-10 mt-2 flex justify-between pr-1">
                {TREND_X_AXIS.map((label) => (
                  <Typography key={label} variant="caption" className="text-[12px] text-[#71717A]">
                    {label}
                  </Typography>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                {[
                  { label: 'Info', color: 'bg-[#D4D7E4]' },
                  { label: 'Notice', color: 'bg-[#4A90FF]' },
                  { label: 'Warning', color: 'bg-[#F5AE2F]' },
                  { label: 'Critical', color: 'bg-[#F16862]' },
                ].map((legend) => (
                  <div key={legend.label} className="flex items-center gap-1.5">
                    <span className={cn('h-3 w-3 rounded-sm', legend.color)} />
                    <Typography variant="caption" className="text-xs text-[#52525B]">
                      {legend.label}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="fixed! left-1/2! top-1/2! h-auto! max-h-[90vh]! w-[calc(100vw-2rem)]! max-w-[760px]! -translate-x-1/2! -translate-y-1/2! overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 shadow-xl">
          <DialogHeader className="border-b border-[#E4E4EA] px-6 py-4">
            <DialogTitle className="text-[34px] font-semibold text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="sr-only">
              Filter recent activity by category and browser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-5">
            <div className="space-y-3 border-b border-[#E4E4EA] pb-5">
              <Typography variant="caption" className="text-xl font-medium text-[#252525]">
                Select Category:
              </Typography>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((category) => {
                  const active = draftCategories.includes(category);
                  return (
                    <Button
                      key={category}
                      type="button"
                      variant="outline"
                      onClick={() => toggleFilterItem(category, setDraftCategories)}
                      className={cn(
                        'h-9 rounded-full border-[#7D7D8F] bg-white px-4 text-base text-[#30303B] hover:bg-white',
                        active && 'border-[#7D7D8F]'
                      )}
                    >
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#BE1E2D] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 border-b border-[#E4E4EA] pb-5">
              <Typography variant="caption" className="text-xl font-medium text-[#252525]">
                Select Browser:
              </Typography>
              <div className="flex flex-wrap gap-3">
                {BROWSER_OPTIONS.map((browser) => {
                  const active = draftBrowsers.includes(browser.key);
                  return (
                    <Button
                      key={browser.key}
                      type="button"
                      variant="outline"
                      onClick={() => toggleFilterItem(browser.key, setDraftBrowsers)}
                      className={cn(
                        'h-9 rounded-full border-[#7D7D8F] bg-white px-4 text-base text-[#30303B] hover:bg-white',
                        active && 'border-[#7D7D8F]'
                      )}
                    >
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#BE1E2D] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="mr-1.5 text-sm">{browser.emoji}</span>
                      {browser.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#D9D9E4] bg-white px-5 text-base text-[#30303B] hover:bg-[#F2F2F7]"
                onClick={() => {
                  const allCategories = CATEGORY_OPTIONS.map((item) => item);
                  const allBrowsers = BROWSER_OPTIONS.map((item) => item.key);
                  setDraftCategories(allCategories);
                  setDraftBrowsers(allBrowsers);
                  setSelectedCategories(allCategories);
                  setSelectedBrowsers(allBrowsers);
                }}
              >
                Reset Filters
              </Button>
              <Button
                type="button"
                className="h-11 bg-[#BE1E2D] px-6 text-base text-white hover:bg-[#A21926]"
                onClick={() => {
                  setSelectedCategories(draftCategories.length ? draftCategories : []);
                  setSelectedBrowsers(draftBrowsers.length ? draftBrowsers : []);
                  setIsFilterDialogOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
