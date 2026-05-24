import Typography from './Typography';
import { cn } from '@/lib/utils';

interface FormWrapperProps {
  /** Title text */
  title: string;
  /** SubTitle text */
  subTitle: string;
  /** Additional className */
  className?: string;
  /** Children */
  children: React.ReactNode;
}

/**
 * Atomic component for form title
 */
export default function FormWrapper({
  title,
  subTitle,
  children,
  className,
}: FormWrapperProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-2">
        <Typography variant="h4" weight="semibold" className="text-gray-900">
          {title}
        </Typography>
        <Typography variant="caption" className="text-gray-400! text-sm!">
          {subTitle}
        </Typography>
      </div>
      {children}
    </div>
  );
}
