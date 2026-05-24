import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { cn } from '@/lib/utils';

interface UserTextProps {
  /** Text to display */
  text: string;
  /** Truncated version of the text */
  truncatedText: string;
  /** Whether to show tooltip (when text is truncated) */
  showTooltip: boolean;
  /** Size variant */
  size?: 'sm' | 'xs';
  /** Text color class */
  colorClass?: string;
}

/**
 * Atomic component for displaying user text (name or email)
 * Shows tooltip with full text when truncated
 */
export default function UserText({
  text,
  truncatedText,
  showTooltip,
  size = 'sm',
  colorClass = 'text-sidebar-text',
}: UserTextProps): React.JSX.Element {
  const SIZE_CLASS = size === 'sm' ? 'text-sm leading-4' : 'text-xs leading-3.5';

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(SIZE_CLASS, colorClass, 'truncate cursor-help')}>
            {truncatedText}
          </span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    );
  }

  return <span className={cn(SIZE_CLASS, colorClass)}>{text}</span>;
}
