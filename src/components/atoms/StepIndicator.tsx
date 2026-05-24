import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
}

/**
 * StepIndicator component displays progress bars for multi-step forms
 * Based on Figma design: 3 bars (81px x 7px) with gap of 8.4px
 */
export default function StepIndicator({
  currentStep,
  totalSteps = 3,
  className,
}: StepIndicatorProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-2 w-20 rounded-xl transition-colors duration-300',
            index + 1 <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
          )}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${index + 1} of ${totalSteps}`}
        />
      ))}
    </div>
  );
}
