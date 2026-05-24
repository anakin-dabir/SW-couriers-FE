import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Wrapper class name for the container */
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    const textareaElement = (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-form-border-light bg-form-surface px-3 py-2',
          'text-sm text-form-title font-normal leading-5',
          'placeholder:text-form-placeholder',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (wrapperClassName) {
      return <div className={cn('relative w-full', wrapperClassName)}>{textareaElement}</div>;
    }

    return textareaElement;
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
