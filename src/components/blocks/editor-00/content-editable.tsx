import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContentEditableProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  placeholder?: string;
}

export const ContentEditable = React.forwardRef<HTMLDivElement, ContentEditableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative min-h-[200px] w-full rounded-md border border-form-border-light bg-form-surface px-3 py-2',
          'text-sm text-form-title font-normal leading-5',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500',
          '[&_.editor-placeholder]:text-form-placeholder [&_.editor-placeholder]:pointer-events-none [&_.editor-placeholder]:absolute [&_.editor-placeholder]:top-2 [&_.editor-placeholder]:left-3',
          className
        )}
        {...props}
      />
    );
  }
);

ContentEditable.displayName = 'ContentEditable';
