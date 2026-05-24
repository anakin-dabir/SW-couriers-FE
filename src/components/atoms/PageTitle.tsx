import Typography from './Typography';

interface PageTitleProps {
  /** Title text to display */
  title: string;
  /** Additional className */
  className?: string;
  /** Whether the title is displayed on mobile */
  isMobile?: boolean;
}

/**
 * Atomic component for displaying page title
 */
export default function PageTitle({
  isMobile,
  title,
  className,
}: PageTitleProps): React.JSX.Element {
  return (
    <div className={className}>
      {isMobile ? (
        <Typography
          variant="body"
          weight="medium"
          className="leading-normal tracking-wider text-sidebar-text-dark"
        >
          {title}
        </Typography>
      ) : (
        <Typography
          variant="h5"
          weight="medium"
          className="leading-normal tracking-wider text-sidebar-text-dark"
        >
          {title}
        </Typography>
      )}
    </div>
  );
}
