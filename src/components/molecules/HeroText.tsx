import HeroTitle from '@/components/atoms/HeroTitle';
import HeroDescription from '@/components/atoms/HeroDescription';
import { cn } from '@/lib/utils';

interface HeroTextProps {
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for hero text section (title + description)
 */
export default function HeroText({
  title,
  description,
  className,
}: HeroTextProps): React.JSX.Element {
  return (
    <div
      className={cn('flex w-full max-w-xl flex-col gap-2.5 text-center items-center', className)}
    >
      <HeroTitle title={title} />
      <HeroDescription description={description} />
    </div>
  );
}
