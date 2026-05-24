import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarSegmentProps {
  /** Width percentage (0-100) */
  width: number;
  /** Whether this is the active segment */
  isActive: boolean;
  /** Whether this is the leftmost segment */
  isLeft: boolean;
  /** Whether this is the rightmost segment */
  isRight: boolean;
  /** Color variant: 'red' (default) or 'green' (for delivered) */
  color?: 'red' | 'green';
  /** Optional className */
  className?: string;
}

/**
 * ProgressBarSegment atom component.
 * Displays a progress bar segment with dotted markers.
 */
export default function ProgressBarSegment({
  width,
  isActive,
  isLeft,
  isRight,
  color = 'red',
  className,
}: ProgressBarSegmentProps): React.JSX.Element {
  // Generate multiple vertical white dotted lines across the red segment
  const generateWhiteDottedLines = (): React.JSX.Element[] => {
    if (!isActive) return [];

    const LINE_COUNT = 12; // Number of vertical dotted lines (increased for better coverage)
    const lines: React.JSX.Element[] = [];

    for (let i = 0; i < LINE_COUNT; i++) {
      // Distribute lines evenly across the width
      const position = ((i + 1) / (LINE_COUNT + 1)) * 100;
      lines.push(
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px pointer-events-none z-10"
          style={{
            left: `${position}%`,
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 2px, white 2px, white 4px)',
          }}
        />
      );
    }

    return lines;
  };

  const BG_COLOR = isActive ? (color === 'green' ? 'bg-success' : 'bg-primary') : 'bg-gray-200';

  return (
    <div
      className={cn(
        'absolute top-0 h-full',
        BG_COLOR,
        isLeft && 'left-0 rounded-l-lg',
        isRight && 'right-0 rounded-r-lg',
        className
      )}
      style={{ width: `${width}%` }}
    >
      {/* White vertical dotted lines covering the entire red segment */}
      {generateWhiteDottedLines()}
    </div>
  );
}
