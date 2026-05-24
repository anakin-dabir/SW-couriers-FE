import * as React from 'react';
import {
  ProgressBarLocationLabel,
  ProgressBarSegment,
  ProgressBarTimeLabel,
} from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { TimelineStep } from './DeliveryTimeline';

interface DeliveryProgressBarProps {
  /** Array of location labels */
  locations: readonly string[];
  /** Time remaining text */
  timeRemaining: string;
  /** Timeline steps to calculate progress from */
  timelineSteps: Array<TimelineStep> | ReadonlyArray<TimelineStep>;
  /** Whether delivery is completed (all steps done, 100%, green) */
  isDelivered?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * DeliveryProgressBar molecule component.
 * Displays a progress bar with location labels, progress segments, and time remaining.
 * Progress is calculated from timeline steps: completed steps = progress, active step = red line position.
 */
export default function DeliveryProgressBar({
  locations,
  timeRemaining,
  timelineSteps,
  isDelivered = false,
  className,
}: DeliveryProgressBarProps): React.JSX.Element {
  // Calculate progress from completed steps only
  const completedStepsCount = timelineSteps.filter((step) => step.status === 'completed').length;
  const PROGRESS_PERCENTAGE = isDelivered ? 100 : (completedStepsCount / locations.length) * 100;

  // Find the active step index to position the red dotted line
  // The red line should be at the end of the active step's segment (right below the active step)
  // For 4 locations evenly divided: step 0 ends at 25%, step 1 ends at 50%, step 2 ends at 75%, step 3 ends at 100%
  const activeStepIndex = timelineSteps.findIndex((step) => step.status === 'active');
  // Calculate position: (activeStepIndex + 1) / totalLocations * 100
  // For Birmingham (index 1): (1 + 1) / 4 * 100 = 50%
  const ACTIVE_STEP_POSITION =
    activeStepIndex >= 0 ? ((activeStepIndex + 1) / locations.length) * 100 : 0;

  const isLocationActive = (index: number): boolean => {
    const step = timelineSteps[index];
    return step?.status === 'completed' || step?.status === 'active';
  };
  const isFirstLocation = (index: number): boolean => index === 0;
  const isLastLocation = (index: number): boolean => index === locations.length - 1;
  const inactivePercentage = 100 - PROGRESS_PERCENTAGE;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Location Labels */}
      <div className="relative flex items-start justify-between">
        {locations.map((location, index) => (
          <ProgressBarLocationLabel
            key={location}
            location={location}
            isActive={isLocationActive(index)}
            isFirst={isFirstLocation(index)}
            isLast={isLastLocation(index)}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 w-full rounded-lg overflow-hidden">
        <ProgressBarSegment
          width={PROGRESS_PERCENTAGE}
          isActive={true}
          isLeft={true}
          isRight={PROGRESS_PERCENTAGE === 100}
          color={isDelivered ? 'green' : 'red'}
        />
        {PROGRESS_PERCENTAGE < 100 && (
          <ProgressBarSegment
            width={inactivePercentage}
            isActive={false}
            isLeft={false}
            isRight={true}
          />
        )}
        {/* Single dotted line at the boundary (right below the active step) - only show if not delivered */}
        {!isDelivered && activeStepIndex >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 z-30 pointer-events-none"
            style={{
              left: `${ACTIVE_STEP_POSITION}%`,
              transform: 'translateX(-50%)',
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent, transparent 2px, #CA0000 2px, #CA0000 4px)',
            }}
          />
        )}
        {timeRemaining ? <ProgressBarTimeLabel timeRemaining={timeRemaining} /> : null}
      </div>
    </div>
  );
}
