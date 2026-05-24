import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { DeliveryOverviewCard } from '@/components/atoms';
import { FormSelect } from '@/components/molecules';
import { DashboardCardHeader } from '@/components/molecules';
import {
  DELIVERY_OVERVIEW_CARDS,
  DELIVERY_OVERVIEW_TIME_PERIODS,
  DELIVERIES_OVERVIEW_TITLE,
} from '@/lib/data';
import { cn } from '@/lib/utils';

interface DashboardOverviewStatsProps {
  /** Optional className */
  className?: string;
}

/**
 * Dashboard "Deliveries Overview" section.
 * Displays a grid of DeliveryOverviewCard components (2 rows, 4 columns).
 */
export default function DashboardOverviewStats({
  className,
}: DashboardOverviewStatsProps): React.JSX.Element {
  const CARDS_TO_SHOW = DELIVERY_OVERVIEW_CARDS.slice(0, 8);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('today');

  const TIME_PERIOD_OPTIONS = DELIVERY_OVERVIEW_TIME_PERIODS.map((period) => ({
    value: period.value,
    label: period.label,
  }));

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedPeriod(event.target.value);
  };

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
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <DashboardCardHeader title={DELIVERIES_OVERVIEW_TITLE} actions={headerActions} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARDS_TO_SHOW.map((card) => (
            <DeliveryOverviewCard
              key={card.label}
              label={card.label}
              value={card.value}
              delta={card.delta}
              deltaType={card.deltaType}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
