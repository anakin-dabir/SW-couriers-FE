import { Check } from 'lucide-react';
import { Typography } from '@/components/atoms';
import {
  CREDIT_STEP_ACTIVE_COLOR,
  CREDIT_STEP_ACTIVE_HALO_COLOR,
  CREDIT_STEP_INACTIVE_COLOR,
  CREDIT_STEP_LABEL_ACTIVE_CLASS,
  CREDIT_STEP_LABEL_INACTIVE_CLASS,
} from '@/lib/creditApplicationUi';
import { cn } from '@/lib/utils';

interface CreditApplicationStepperProps {
  steps: readonly string[];
  currentStep: number;
}

/** Grid columns: node | connector | node | connector | … | node */
function stepperGridTemplateColumns(stepCount: number): string {
  return Array.from({ length: stepCount }, (_, index) =>
    index < stepCount - 1 ? 'auto minmax(0,1fr)' : 'auto'
  ).join(' ');
}

export default function CreditApplicationStepper({
  steps,
  currentStep,
}: CreditApplicationStepperProps): React.JSX.Element {
  const lastIndex = steps.length - 1;

  return (
    <div
      className="grid w-full min-w-0 gap-y-2"
      style={{ gridTemplateColumns: stepperGridTemplateColumns(steps.length) }}
      role="list"
      aria-label="Credit application progress"
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        const isFirst = index === 0;
        const isLast = index === lastIndex;
        const nodeColumn = index * 2 + 1;
        const connectorColumn = nodeColumn + 1;
        const connectorFilled = index < lastIndex && index <= currentStep;
        const labelIsEmphasized = isActive || isComplete;

        return (
          <div key={step} className="contents">
            <div
              className="flex items-center justify-center self-center"
              style={{ gridColumn: nodeColumn, gridRow: 1 }}
              aria-current={isActive ? 'step' : undefined}
            >
              <StepNode active={isActive} complete={isComplete} />
            </div>

            {index < lastIndex ? (
              <div
                className="flex min-w-0 items-center self-center px-0.5 sm:px-1"
                style={{ gridColumn: connectorColumn, gridRow: 1 }}
                aria-hidden
              >
                <StepConnector filled={connectorFilled} />
              </div>
            ) : null}

            <Typography
              variant="caption"
              style={{ gridColumn: nodeColumn, gridRow: 2 }}
              className={cn(
                'min-w-0 whitespace-pre-line text-[10px] leading-[14px] sm:text-[11px] sm:leading-4 md:text-xs',
                isFirst && 'justify-self-start text-left',
                isLast && 'justify-self-end text-right',
                !isFirst && !isLast && 'justify-self-center text-center',
                labelIsEmphasized
                  ? CREDIT_STEP_LABEL_ACTIVE_CLASS
                  : CREDIT_STEP_LABEL_INACTIVE_CLASS
              )}
            >
              {step}
            </Typography>
          </div>
        );
      })}
    </div>
  );
}

function StepConnector({ filled }: { filled: boolean }): React.JSX.Element {
  return (
    <span
      className={cn(
        'block h-0 w-full min-w-[8px] border-t-2',
        filled ? 'border-solid' : 'border-dashed'
      )}
      style={{ borderColor: filled ? CREDIT_STEP_ACTIVE_COLOR : CREDIT_STEP_INACTIVE_COLOR }}
    />
  );
}

function StepNode({ active, complete }: { active: boolean; complete: boolean }): React.JSX.Element {
  if (active) {
    return (
      <span className="relative flex size-5 shrink-0 items-center justify-center" aria-hidden>
        <span
          className="flex size-2.5 items-center justify-center rounded-full"
          style={{
            backgroundColor: CREDIT_STEP_ACTIVE_COLOR,
            boxShadow: `0 0 0 4px ${CREDIT_STEP_ACTIVE_HALO_COLOR}`,
          }}
        >
          <span className="size-1 rounded-full bg-white" />
        </span>
      </span>
    );
  }

  if (complete) {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: CREDIT_STEP_ACTIVE_COLOR }}
        aria-hidden
      >
        <Check className="size-3 text-white" strokeWidth={3} />
      </span>
    );
  }

  return (
    <span
      className="size-5 shrink-0 rounded-full border-2 bg-white"
      style={{ borderColor: CREDIT_STEP_INACTIVE_COLOR }}
      aria-hidden
    />
  );
}
