import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/Button';
import { CreditOverviewHistoryCard } from '@/components/pages/CreditOverview/CreditOverviewHistoryCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { cn } from '@/lib/utils';
import {
  applicationHistoryStatusBadgeClass,
  applicationHistoryStatusDotClass,
  formatApplicationHistoryStatus,
  formatMoneyField,
  formatPersonName,
} from '@/lib/creditApplicationDetail';
import {
  CREDIT_HISTORY_EMPTY_CELL_CLASS,
  CREDIT_HISTORY_TABLE_BODY_ROW_CLASS,
  CREDIT_HISTORY_TABLE_CELL_CLASS,
  CREDIT_HISTORY_TABLE_CELL_PRIMARY_CLASS,
  CREDIT_HISTORY_TABLE_HEAD_CLASS,
  CREDIT_HISTORY_TABLE_HEADER_ROW_CLASS,
  CREDIT_HISTORY_TABLE_SCROLL_CLASS,
} from '@/lib/creditOverviewUi';
import { overviewDateMedium } from '@/lib/creditPresentation';
import type { CreditApplicationDetail } from '@/store/api/creditApplicationsApi';

function reviewerInitials(reviewer: CreditApplicationDetail['assigned_reviewer']): string {
  const first = reviewer?.first_name?.trim()?.[0] ?? '';
  const last = reviewer?.last_name?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

export interface ApplicationsHistorySectionProps {
  rows: CreditApplicationDetail[];
  isLoading?: boolean;
  onView: (applicationId: string) => void;
}

export function ApplicationsHistorySection({
  rows,
  isLoading = false,
  onView,
}: ApplicationsHistorySectionProps): React.JSX.Element {
  return (
    <CreditOverviewHistoryCard title="Applications History">
      <div className={CREDIT_HISTORY_TABLE_SCROLL_CLASS}>
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className={CREDIT_HISTORY_TABLE_HEADER_ROW_CLASS}>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Application ID</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Submission Date</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Requested Limit</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Reviewer</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Status</TableHead>
              <TableHead className={cn(CREDIT_HISTORY_TABLE_HEAD_CLASS, 'text-right')}>
                View
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className={CREDIT_HISTORY_EMPTY_CELL_CLASS}>
                  Loading applications…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className={CREDIT_HISTORY_EMPTY_CELL_CLASS}>
                  No application history yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const statusKey = (row.status ?? '').toUpperCase();
                const reviewer = row.assigned_reviewer;
                return (
                  <TableRow key={row.id} className={CREDIT_HISTORY_TABLE_BODY_ROW_CLASS}>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_PRIMARY_CLASS}>
                      {row.application_number?.trim() || '—'}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {overviewDateMedium(row.submitted_at ?? row.created_at) ?? '—'}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {formatMoneyField(row.requested_credit_limit)}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7 border border-[#E4E4E7]">
                          <AvatarFallback className="bg-[#F4F4F5] text-[10px] font-semibold text-[#52525B]">
                            {reviewerInitials(reviewer)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{formatPersonName(reviewer)}</span>
                      </div>
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      <Badge
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                          applicationHistoryStatusBadgeClass(statusKey)
                        )}
                      >
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            applicationHistoryStatusDotClass(statusKey)
                          )}
                          aria-hidden
                        />
                        {formatApplicationHistoryStatus(statusKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(CREDIT_HISTORY_TABLE_CELL_CLASS, 'text-right')}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-md border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#FAFAFA]"
                        aria-label={`View application ${row.application_number ?? row.id}`}
                        onClick={() => onView(row.id)}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </CreditOverviewHistoryCard>
  );
}
