import { Typography } from '@/components/atoms';
import { CreditApplicationHeaderIcon } from '@/assets/svg';
import CreditApplicationStepper from '@/components/pages/CreditApplication/CreditApplicationStepper';
import CreditApplicationTopBack from '@/components/pages/CreditApplication/CreditApplicationTopBack';
import {
  CREDIT_FORM_CANVAS_CLASS,
  CREDIT_FORM_INTRO_CLASS,
  CREDIT_FORM_MAIN_CARD_CLASS,
  CREDIT_FORM_NARROW_COLUMN_CLASS,
  CREDIT_FORM_STEPPER_CARD_CLASS,
  CREDIT_FORM_STEPPER_ROW_CLASS,
  CREDIT_FORM_SUBTITLE_CLASS,
  CREDIT_FORM_TITLE_CLASS,
} from '@/lib/creditApplicationUi';

interface CreditApplicationFormShellProps {
  steps: readonly string[];
  currentStep: number;
  onBack: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Figma layout: white page → narrow header → full-width stepper → narrow form card.
 */
export default function CreditApplicationFormShell({
  steps,
  currentStep,
  onBack,
  children,
  footer,
}: CreditApplicationFormShellProps): React.JSX.Element {
  return (
    <div className={CREDIT_FORM_CANVAS_CLASS}>
      <div className={CREDIT_FORM_NARROW_COLUMN_CLASS}>
        <CreditApplicationTopBack onClick={onBack} />

        <div className={CREDIT_FORM_INTRO_CLASS}>
          <img
            src={CreditApplicationHeaderIcon}
            alt=""
            width={64}
            height={56}
            className="shrink-0"
            aria-hidden
          />
          <div>
            <Typography variant="h1" className={CREDIT_FORM_TITLE_CLASS}>
              Credit Application
            </Typography>
            <Typography variant="body" className={CREDIT_FORM_SUBTITLE_CLASS}>
              Complete the form below to apply for a credit facility. All required fields must be
              filled before submission.
            </Typography>
          </div>
        </div>
      </div>

      <div className={CREDIT_FORM_STEPPER_ROW_CLASS}>
        <div className={CREDIT_FORM_STEPPER_CARD_CLASS}>
          <CreditApplicationStepper steps={steps} currentStep={currentStep} />
        </div>
      </div>

      <div className={CREDIT_FORM_NARROW_COLUMN_CLASS}>
        <div className={CREDIT_FORM_MAIN_CARD_CLASS}>
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
