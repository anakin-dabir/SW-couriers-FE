import * as React from 'react';
import { TimelineStepIndicator, TimelineStepContent } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  id: string;
  label: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
}

interface DeliveryTimelineProps {
  /** Array of timeline steps */
  steps: Array<TimelineStep> | ReadonlyArray<TimelineStep>;
  /** Optional className */
  className?: string;
}

/**
 * DeliveryTimeline molecule component.
 * Displays a vertical timeline of delivery steps with indicators and content.
 */
export default function DeliveryTimeline({
  steps,
  className,
}: DeliveryTimelineProps): React.JSX.Element {
  const getStepStatus = (status: string): 'completed' | 'active' | 'pending' => {
    if (status === 'completed') return 'completed';
    if (status === 'active') return 'active';
    return 'pending';
  };

  const isStepCompleted = (status: string): boolean => status === 'completed';
  const isStepActive = (status: string): boolean => status === 'active';
  const isStepPending = (status: string): boolean => status === 'pending';
  const isConnectorActive = (status: string): boolean =>
    isStepCompleted(status) || isStepActive(status);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.status);
        const isLast = index === steps.length - 1;
        const pending = isStepPending(step.status);
        const connectorActive = isConnectorActive(step.status);

        return (
          <div key={step.id} className="flex gap-4">
            <TimelineStepIndicator
              status={stepStatus}
              isLast={isLast}
              isConnectorActive={connectorActive}
            />
            <TimelineStepContent
              label={step.label}
              location={step.location}
              timestamp={step.timestamp}
              isCompleted={isStepCompleted(step.status)}
              isActive={isStepActive(step.status)}
              isPending={pending}
            />
          </div>
        );
      })}
    </div>
  );
}
