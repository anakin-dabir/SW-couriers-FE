import { ArrowLeft } from 'lucide-react';
import { CREDIT_FORM_TOP_BACK_CLASS } from '@/lib/creditApplicationUi';
import { cn } from '@/lib/utils';

interface CreditApplicationTopBackProps {
  onClick: () => void;
}

export default function CreditApplicationTopBack({
  onClick,
}: CreditApplicationTopBackProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(CREDIT_FORM_TOP_BACK_CLASS, 'self-start')}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      Back
    </button>
  );
}
