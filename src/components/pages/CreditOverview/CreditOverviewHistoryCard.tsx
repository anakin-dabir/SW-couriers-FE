import * as React from 'react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import {
  CREDIT_HISTORY_HEADER_CLASS,
  CREDIT_HISTORY_SECTION_CLASS,
  CREDIT_HISTORY_TITLE_CLASS,
} from '@/lib/creditOverviewUi';

export interface CreditOverviewHistoryCardProps {
  title: string;
  children: React.ReactNode;
  headerEnd?: React.ReactNode;
  className?: string;
}

export function CreditOverviewHistoryCard({
  title,
  children,
  headerEnd,
  className,
}: CreditOverviewHistoryCardProps): React.JSX.Element {
  return (
    <section className={cn(CREDIT_HISTORY_SECTION_CLASS, className)}>
      <div className={CREDIT_HISTORY_HEADER_CLASS}>
        <Typography className={CREDIT_HISTORY_TITLE_CLASS}>{title}</Typography>
        {headerEnd ? <div className="flex shrink-0 items-center">{headerEnd}</div> : null}
      </div>
      {children}
    </section>
  );
}
