import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { FormSelect } from '@/components/molecules';
import {
  DashboardCardHeader,
  DeliveryStatusPieChart,
  DeliveryStatusLegend,
} from '@/components/molecules';
import {
  DELIVERY_OVERVIEW_TIME_PERIODS,
  DELIVERY_STATUS_DATA,
  DELIVERY_RATE_PERCENTAGE,
  DELIVERY_STATUS_TITLE,
} from '@/lib/data';
import { cn } from '@/lib/utils';

interface DeliveryStatusCardProps {
  /** Optional className */
  className?: string;
}

export default function DeliveryStatusCard({
  className,
}: DeliveryStatusCardProps): React.JSX.Element {
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('today');

  const TIME_PERIOD_OPTIONS = DELIVERY_OVERVIEW_TIME_PERIODS.map((period) => ({
    value: period.value,
    label: period.label,
  }));

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedPeriod(event.target.value);
  };

  // Calculate total for percentage calculations
  const total = DELIVERY_STATUS_DATA.reduce((sum, item) => sum + item.value, 0);

  const headerActions = (
    <FormSelect
      options={TIME_PERIOD_OPTIONS}
      value={selectedPeriod}
      onChange={handlePeriodChange}
      className="w-32"
      wrapperClassName="flex flex-row items-center"
    />
  );

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="pb-4">
        <DashboardCardHeader title={DELIVERY_STATUS_TITLE} actions={headerActions} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex flex-col sm:flex-row h-full flex-1 items-start sm:items-center gap-6 min-h-[300px] sm:min-h-0">
          <DeliveryStatusLegend items={DELIVERY_STATUS_DATA} />
          <DeliveryStatusPieChart
            data={DELIVERY_STATUS_DATA}
            deliveryRatePercentage={DELIVERY_RATE_PERCENTAGE}
            total={total}
          />
        </div>
      </CardContent>
    </Card>
  );
}
