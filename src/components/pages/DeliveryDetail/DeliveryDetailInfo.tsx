import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import {
  DeliveryTimeline,
  DeliveryProgressBar,
  FormTextareaField,
  DeliveryInfoBar,
  type TimelineStep,
} from '@/components/molecules';
import { cn } from '@/lib/utils';

interface DeliveryDetailInfoProps {
  /** Optional className */
  className?: string;
  detail: {
    timeRemaining: string;
    notes: string;
    status: string;
  };
  customerInfoCards: ReadonlyArray<{
    id: number;
    iconType: 'user' | 'phone' | 'mapPin';
    title: string;
    value: string;
  }>;
  timelineSteps: ReadonlyArray<TimelineStep>;
  progressLocations: readonly string[];
}

/**
 * DeliveryDetailInfo molecule component.
 * Displays delivery information in the left column of delivery detail page.
 * Contains delivery status card with progress bar, route steps, and notes.
 * Matches Figma designs: 3840-26961 (full component), 3840-26532 (header), 3840-27038 (progress bar),
 * 3840-26962 (steps container), 3840-26970 (single step).
 */
export default function DeliveryDetailInfo({
  className,
  detail,
  customerInfoCards,
  timelineSteps,
  progressLocations,
}: DeliveryDetailInfoProps): React.JSX.Element {
  const IS_DELIVERED = detail.status.toLowerCase() === 'delivered';
  const handleRefresh = (): void => {
    // TODO: Implement refresh functionality
    console.log('Refresh delivery status');
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Delivery Status Card */}
      <DeliveryInfoBar items={customerInfoCards} />
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Typography variant="h4" weight="bold" className="text-gray-900">
            Delivery Status
          </Typography>
          <Button variant="default" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </CardHeader>

        {/* Features section */}

        <CardContent className="flex flex-col gap-6 pt-0">
          {/* Progress Bar Section */}
          <DeliveryProgressBar
            locations={progressLocations}
            timeRemaining={IS_DELIVERED ? '' : detail.timeRemaining}
            timelineSteps={timelineSteps}
            isDelivered={IS_DELIVERED}
          />

          {/* Route Steps Section */}
          <DeliveryTimeline steps={timelineSteps} />

          {/* Notes Section */}
          <div className="pt-2">
            <FormTextareaField
              label="Notes"
              placeholder="note...."
              defaultValue={detail.notes}
              className="min-h-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
