import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { cn } from '@/lib/utils';

interface CreditInsightCardProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export default function CreditInsightCard({
  title,
  children,
  headerActions,
  className,
  headerClassName,
  titleClassName,
  contentClassName,
}: CreditInsightCardProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6E8EC] shadow-none',
        className
      )}
    >
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between border-b border-[#E6E8EC] bg-[#F4F5F7] px-5 py-3',
          headerClassName
        )}
      >
        <CardTitle
          className={cn(
            'text-xs font-semibold tracking-wide text-[#6B7280] uppercase',
            titleClassName
          )}
        >
          {title}
        </CardTitle>
        <div className="flex items-center p-0 m-0"> {headerActions && headerActions}</div>
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-5 px-5 py-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
