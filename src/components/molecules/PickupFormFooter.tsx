import { memo, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import {
  PICKUP_FORM_FOOTER_CANCEL_LABEL,
  PICKUP_FORM_FOOTER_SAVE_DRAFT_LABEL,
  PICKUP_FORM_FOOTER_NEXT_LABEL,
  PICKUP_FORM_FOOTER_SUBMIT_LABEL,
} from '@/lib/data';
import { cn } from '@/lib/utils';

interface PickupFormFooterProps {
  onCancel: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
  /** Optional back handler. When provided, a Back button is rendered on the left of the footer. */
  onBack?: () => void;
  isSubmitting?: boolean;
  cancelLabel?: string;
  saveDraftLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  /** When true, only show a single primary Submit button (e.g. Review step). */
  submitOnly?: boolean;
  /** When 'submit', Next button submits the form (validation runs); when 'button', onClick only */
  nextButtonType?: 'submit' | 'button';
  className?: string;
  /** Optional icon after the primary / next label (e.g. arrow — Figma 6:43569). */
  nextIcon?: ReactNode;
  /** Extra classes on the primary next/submit button (e.g. min-width, shadow). */
  nextButtonClassName?: string;
}

export default memo(function PickupFormFooter({
  onCancel,
  onSaveDraft,
  onNext,
  onBack,
  isSubmitting = false,
  cancelLabel = PICKUP_FORM_FOOTER_CANCEL_LABEL,
  saveDraftLabel = PICKUP_FORM_FOOTER_SAVE_DRAFT_LABEL,
  nextLabel = PICKUP_FORM_FOOTER_NEXT_LABEL,
  backLabel = 'Back',
  submitOnly = false,
  nextButtonType = 'button',
  className,
  nextIcon,
  nextButtonClassName,
}: PickupFormFooterProps): React.JSX.Element {
  const isNextSubmit = nextButtonType === 'submit';

  if (submitOnly) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-form-border-light',
          className
        )}
      >
        {onBack ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 min-w-[150px] px-4"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {backLabel}
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          variant="default"
          size="sm"
          className="sm:min-w-40"
          onClick={onNext}
          disabled={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
          {PICKUP_FORM_FOOTER_SUBMIT_LABEL}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 min-w-[120px] px-4"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {backLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-10 min-w-[150px] px-4"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-10 min-w-[150px] px-4"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          {saveDraftLabel}
        </Button>
        <Button
          type={isNextSubmit ? 'submit' : 'button'}
          className={cn(
            'h-10 min-w-[181px] px-4 shadow-[0_0_6px_0_rgba(253,164,60,0.35)]',
            nextButtonClassName
          )}
          variant="default"
          size="sm"
          onClick={isNextSubmit ? undefined : onNext}
          disabled={isSubmitting}
        >
          {nextLabel}
          {nextIcon}
        </Button>
      </div>
    </div>
  );
});
