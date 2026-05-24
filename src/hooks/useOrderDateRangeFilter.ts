import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import {
  buildOrdersDateQueryKey,
  getDefaultOrderDateRangeState,
  ORDER_QUICK_RANGE_OPTIONS,
  resolveListDateQuery,
  resolveSummaryDateQuery,
  toOrderDateString,
} from '@/lib/orderQuickDateRange';
export function useOrderDateRangeFilter(): {
  orderDateRange: DateRange | undefined;
  quickRangeLabel: string;
  quickRangeOpen: boolean;
  setQuickRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateFrom: string | undefined;
  dateTo: string | undefined;
  summaryQuery: ReturnType<typeof resolveSummaryDateQuery>;
  listQuery: ReturnType<typeof resolveListDateQuery>;
  dateQueryKey: string;
  handleOrderDateRangeChange: (range: DateRange | undefined) => void;
  selectQuickRange: (label: string) => void;
} {
  const defaults = React.useMemo(() => getDefaultOrderDateRangeState(), []);
  const [orderDateRange, setOrderDateRange] = React.useState<DateRange | undefined>(
    defaults.orderDateRange
  );
  const [quickRangeLabel, setQuickRangeLabel] = React.useState(defaults.quickRangeLabel);
  const [quickRangeOpen, setQuickRangeOpen] = React.useState(false);

  const dateFrom = toOrderDateString(orderDateRange?.from);
  const dateTo = toOrderDateString(orderDateRange?.to);

  const summaryQuery = React.useMemo(
    () =>
      resolveSummaryDateQuery({
        quickRangeLabel,
        dateFrom,
        dateTo,
      }),
    [quickRangeLabel, dateFrom, dateTo]
  );

  const listQuery = React.useMemo(
    () =>
      resolveListDateQuery({
        quickRangeLabel,
        dateFrom,
        dateTo,
      }),
    [quickRangeLabel, dateFrom, dateTo]
  );

  const dateQueryKey = React.useMemo(
    () => buildOrdersDateQueryKey(summaryQuery, listQuery),
    [summaryQuery, listQuery]
  );

  const handleOrderDateRangeChange = React.useCallback((range: DateRange | undefined): void => {
    setOrderDateRange(range);
    if (!range?.from) {
      setQuickRangeLabel('Any Date');
      return;
    }
    setQuickRangeLabel('Custom');
  }, []);

  const selectQuickRange = React.useCallback((label: string): void => {
    const option = ORDER_QUICK_RANGE_OPTIONS.find((o) => o.label === label);
    if (!option) return;
    setOrderDateRange(option.resolve());
    setQuickRangeLabel(option.label);
    setQuickRangeOpen(false);
  }, []);

  return {
    orderDateRange,
    quickRangeLabel,
    quickRangeOpen,
    setQuickRangeOpen,
    dateFrom,
    dateTo,
    summaryQuery,
    listQuery,
    dateQueryKey,
    handleOrderDateRangeChange,
    selectQuickRange,
  };
}
