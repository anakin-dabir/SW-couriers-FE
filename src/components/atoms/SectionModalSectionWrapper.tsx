import { Typography } from '@/components/atoms';

interface SectionModalSectionWrapperProps {
  title: string;
  children: React.ReactNode;
}

/**
 * SectionModalSectionWrapper Atom
 *
 * Wrapper component for modal sections with consistent heading pattern
 * Used to wrap content sections in modals with a title
 */
export default function SectionModalSectionWrapper({
  title,
  children,
}: SectionModalSectionWrapperProps): React.JSX.Element {
  return (
    <div>
      <Typography variant="h3" weight="semibold" className="text-lg text-gray-900 mb-4">
        {title}
      </Typography>
      {children}
    </div>
  );
}
