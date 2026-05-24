import { Typography } from '@/components/atoms';

interface SummaryRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  muted?: boolean;
  size?: 'normal' | 'small';
  align?: 'left' | 'right';
}

/**
 * SummaryRow Atom
 *
 * Displays a single label-value pair for summary sections
 * Used in both invoice and statement summaries
 */
export default function SummaryRow({
  label,
  value,
  isTotal = false,
  muted = false,
  size = 'normal',
  align = 'left',
}: SummaryRowProps): React.JSX.Element {
  const TEXT_SIZE = size === 'small' ? 'text-sm' : 'text-base';
  const TOTAL_TEXT_SIZE = size === 'small' ? 'text-lg' : 'text-xl';
  const MUTED_COLOR = 'text-gray-200';

  if (isTotal) {
    return (
      <div className={`flex justify-between items-center mt-2`}>
        <Typography variant="h4" weight="bold" className={`${TOTAL_TEXT_SIZE} text-gray-900`}>
          {label}
        </Typography>
        <Typography variant="h4" weight="bold" className={`${TOTAL_TEXT_SIZE} text-gray-900`}>
          {value}
        </Typography>
      </div>
    );
  }

  const LABEL_WIEGHT = align === 'right' ? 'medium' : 'medium';
  const VALUE_WEIGHT = align === 'right' ? 'semibold' : 'medium';
  const LABEL_COLOR = muted ? MUTED_COLOR : align === 'right' ? 'text-gray-700' : 'text-gray-900';
  const VALUE_COLOR = muted ? MUTED_COLOR : 'text-gray-900';

  return (
    <div className="flex justify-between items-center">
      <Typography
        variant="body"
        color={muted ? 'muted' : 'text'}
        weight={LABEL_WIEGHT}
        className={`${TEXT_SIZE} ${LABEL_COLOR}`}
      >
        {label}
      </Typography>
      <Typography
        variant="body"
        color={muted ? 'muted' : 'text'}
        weight={VALUE_WEIGHT}
        className={`${TEXT_SIZE} ${VALUE_COLOR}`}
      >
        {value}
      </Typography>
    </div>
  );
}
