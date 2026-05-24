import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface InvoiceMetaRowProps {
  label: string;
  value: string;
  className?: string;
  variant?: 'regular' | 'small' | 'xsmall';
}

/**
 * InvoiceMetaRow Molecule
 *
 * Displays a label-value pair for invoice metadata
 */
export default function InvoiceMetaRow({
  label,
  value,
  variant = 'regular',
  className = '',
}: InvoiceMetaRowProps): React.JSX.Element {
  const GAP_CLASSES = variant === 'xsmall' ? 'gap-0' : variant === 'small' ? 'gap-1' : 'gap-2';

  const TEXT_CLASSES =
    variant === 'regular'
      ? 'text-sm text-gray-500'
      : variant === 'small'
        ? 'text-xs text-gray-500'
        : 'text-2xs text-gray-500';

  const VALUE_TEXT_CLASSES =
    variant === 'regular'
      ? 'text-base text-gray-900'
      : variant === 'small'
        ? 'text-sm text-gray-900'
        : 'text-xs text-gray-900';

  const LABEL_VARIANT = variant === 'regular' ? 'caption' : 'label';

  return (
    <div className={cn('flex flex-col', GAP_CLASSES, className)}>
      <Typography variant={LABEL_VARIANT} color="muted" className={TEXT_CLASSES}>
        {label}
      </Typography>
      <Typography variant="body" weight="medium" className={VALUE_TEXT_CLASSES}>
        {value}
      </Typography>
    </div>
  );
}
