import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface FormTitleProps {
  /** Title text */
  title: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for form title
 */
export default function FormTitle({ title, className }: FormTitleProps): React.JSX.Element {
  return (
    <Typography
      variant="h3"
      weight="semibold"
      className={cn('leading-none tracking-tight text-form-title', className)}
    >
      {title}
    </Typography>
  );
}
