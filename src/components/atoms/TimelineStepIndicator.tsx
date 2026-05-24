import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStepIndicatorProps {
  /** Step status */
  status: 'completed' | 'active' | 'pending';
  /** Whether this is the last step */
  isLast: boolean;
  /** Whether the connector line should be active */
  isConnectorActive: boolean;
  /** Optional className */
  className?: string;
}

/**
 * TimelineStepIndicator atom component.
 * Displays a step indicator (completed/active/pending) with optional connector line.
 */
export default function TimelineStepIndicator({
  status,
  isLast,
  isConnectorActive,
  className,
}: TimelineStepIndicatorProps): React.JSX.Element {
  const renderIndicator = (): React.ReactNode => {
    if (status === 'completed') {
      return (
        <div className="size-8 flex justify-center items-center bg-red-100 rounded-full">
          <div className="size-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="size-3 text-white" />
          </div>
        </div>
      );
    }

    if (status === 'active') {
      return (
        <div className="size-8 flex justify-center items-center bg-red-100 rounded-full">
          <div className="size-5 border-4 border-primary bg-white rounded-full" />
        </div>
      );
    }

    // pending: red outer ring, gray inner
    return (
      <div className="size-8 flex justify-center items-center bg-gray-100 rounded-full">
        <div className="size-5 border-4 border-gray-600 bg-white rounded-full" />
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {renderIndicator()}

      {/* Connecting Line (Vertical Dotted) */}
      {!isLast && (
        <div
          className={cn(
            'mt-1 flex-1 min-h-16',
            isConnectorActive ? 'w-1 rounded-full bg-primary' : 'w-0.5 rounded-full'
          )}
          style={
            !isConnectorActive
              ? {
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, #6b7280 0px, #6b7280 4px, transparent 4px, transparent 8px)',
                  opacity: 0.3,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
