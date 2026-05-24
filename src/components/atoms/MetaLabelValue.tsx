import * as React from 'react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface MetaLabelValueProps {
  label: string;
  value: string;
  align?: 'left' | 'right';
  className?: string;
}

export default function MetaLabelValue({
  label,
  value,
  align = 'left',
  className,
}: MetaLabelValueProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        align === 'right' ? 'items-end' : 'items-start',
        className
      )}
    >
      <Typography variant="caption" className="text-xs capitalize text-gray-500">
        {label}
      </Typography>
      <Typography variant="body" className="text-base font-medium text-gray-900">
        {value}
      </Typography>
    </div>
  );
}
