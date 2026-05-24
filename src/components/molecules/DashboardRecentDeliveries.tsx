import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Typography } from '@/components/atoms';
import { DataTable, getDeliveriesTableColumns } from '@/components/molecules';
import { EmptyState, ErrorState } from '@/components/atoms';
import type { Delivery } from '@/types/delivery';
import { RECENT_DELIVERIES_TITLE, VIEW_ALL_LABEL } from '@/lib/data';
import { cn } from '@/lib/utils';

interface DashboardRecentDeliveriesProps {
  /** Table data */
  data: Delivery[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Route for "View All" button */
  viewAllTo?: string;
  /** Optional className */
  className?: string;
}

/**
 * Dashboard "Recent Deliveries" section.
 * Card with title, View All, and DataTable or loading/empty/error states.
 */
export default function DashboardRecentDeliveries({
  data,
  isLoading = false,
  error = null,
  onRetry,
  viewAllTo = '/deliveries/list',
  className,
}: DashboardRecentDeliveriesProps): React.JSX.Element {
  const navigate = useNavigate();
  const columnOptions = React.useMemo(() => ({ statusVariant: 'chip' as const }), []);
  const columns = React.useMemo(() => getDeliveriesTableColumns(columnOptions), [columnOptions]);

  const handleViewAll = (): void => {
    void navigate(viewAllTo);
  };

  return (
    <Card className={cn(className)}>
      <CardHeader
        className={cn('flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4')}
      >
        <Typography variant="h5" weight="semibold" className="text-base text-gray-900">
          {RECENT_DELIVERIES_TITLE}
        </Typography>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleViewAll}
          className="gap-1.5"
        >
          {VIEW_ALL_LABEL}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <ErrorState
            message="Failed to load deliveries"
            description="Unable to fetch recent deliveries. Please try again."
            onRetry={onRetry}
          />
        )}
        {!error && isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}
        {!error && !isLoading && data.length === 0 && (
          <EmptyState
            message="No recent deliveries"
            description="There are no deliveries to show yet."
          />
        )}
        {!error && !isLoading && data.length > 0 && (
          <DataTable<Delivery>
            columns={columns}
            data={data}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            showPagination={false}
            getRowKey={(row) => String(row.id)}
          />
        )}
      </CardContent>
    </Card>
  );
}
