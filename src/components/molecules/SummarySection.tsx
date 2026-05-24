import SummaryRow from '@/components/atoms/SummaryRow';

export interface SummaryItem {
  label: string;
  value: string;
  isTotal?: boolean;
  muted?: boolean;
}

interface SummarySectionProps {
  items: SummaryItem[];
  align?: 'left' | 'right';
  spacing?: 'normal' | 'compact';
  className?: string;
}

/**
 * SummarySection Molecule
 *
 * Reusable summary component for displaying totals and breakdowns
 * Used in both Invoice Details Modal and Statement Modal
 */
export default function SummarySection({
  items,
  align = 'left',
  spacing = 'normal',
  className = '',
}: SummarySectionProps): React.JSX.Element {
  const SPACING_CLASS = spacing === 'compact' ? 'space-y-1.5' : 'space-y-3';
  const ALIGN_CLASS = align === 'right' ? 'text-right' : '';
  const SIZE = align === 'right' ? 'small' : 'normal';

  return (
    <div className={`${SPACING_CLASS} ${ALIGN_CLASS} ${className}`}>
      {items.map((item, index) => (
        <SummaryRow
          key={index}
          label={item.label}
          value={item.value}
          isTotal={item.isTotal}
          muted={item.muted}
          size={SIZE}
          align={align}
        />
      ))}
    </div>
  );
}
