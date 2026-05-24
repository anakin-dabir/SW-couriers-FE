import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface FormSubtitleProps {
  /** Subtitle text */
  subtitle: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for form subtitle
 */
export default function FormSubtitle({
  subtitle,
  className,
}: FormSubtitleProps): React.JSX.Element {
  return (
    <Typography variant="caption" className={cn('leading-5 text-form-body', className)}>
      {subtitle}
    </Typography>
  );
}
