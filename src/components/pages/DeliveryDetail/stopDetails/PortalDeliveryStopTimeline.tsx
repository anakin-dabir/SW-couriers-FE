import type React from 'react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export interface PortalTimelineStep {
  title: string;
  time: string;
  completed: boolean;
}

export interface PortalDeliveryStopTimelineProps {
  steps: PortalTimelineStep[];
  title?: string;
  className?: string;
}

export default function PortalDeliveryStopTimeline({
  steps,
  title = 'DELIVERY STOP TIMELINE',
  className,
}: PortalDeliveryStopTimelineProps): React.JSX.Element {
  const firstIncompleteIndex = steps.findIndex((step) => !step.completed);
  const lastCompletedIndex =
    firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex - 1;
  const progressRatio =
    steps.length > 1 && lastCompletedIndex >= 0 ? lastCompletedIndex / (steps.length - 1) : 0;

  return (
    <div
      className={cn(
        'shrink-0 overflow-x-hidden rounded-xl border border-gray-200 bg-white',
        className
      )}
    >
      <div className="border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          {title}
        </Typography>
      </div>

      <div className="px-5 py-4">
        <div className="relative isolate">
          {/* Single continuous track — per-row calc() segments gap in Safari with space-y-* */}
          <div
            className="pointer-events-none absolute bottom-1 left-[6px] top-[6px] z-0 w-5 rounded-full bg-[#E5E7EB]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-1 left-[6px] top-[6px] z-0 w-5 overflow-hidden rounded-full"
            aria-hidden
          >
            <div
              className="w-full bg-[#10B981] transition-[height] duration-300"
              style={{ height: `${progressRatio * 100}%` }}
            />
          </div>

          <div className="space-y-7">
            {steps.map((step, idx) => {
              const isActive = !step.completed && steps.findIndex((s) => !s.completed) === idx;
              return (
                <div key={`${idx}-${step.title}`} className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      'z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-all duration-200',
                      step.completed ? 'border-white bg-[#10B981]' : 'border-[#E5E7EB] bg-gray-600'
                    )}
                  >
                    {!isActive && step.completed ? (
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 8 8">
                        <path
                          d="M2 4.333 3.5 6l2.5-3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="block h-4 w-4 rounded-full border-2 border-dashed border-white" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <Typography
                      variant="body"
                      className={cn(
                        'truncate text-[13px] leading-tight tracking-tight',
                        step.completed ? 'font-medium text-gray-900' : 'font-medium text-[#9CA3AF]'
                      )}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={cn(
                        'shrink-0 text-[11px] font-medium',
                        step.completed ? 'text-[#6B7280]' : 'text-[#9CA3AF]'
                      )}
                    >
                      {step.time}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
