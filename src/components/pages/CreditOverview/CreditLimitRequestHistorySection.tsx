import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
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
import { formatPersonName } from '@/lib/creditApplicationDetail';
import {
  formatLimitIncreaseHistoryDate,
  formatLimitIncreaseMoney,
  formatLimitIncreaseStatus,
  limitIncreaseStatusBadgeClass,
} from '@/lib/creditLimitIncrease';
import {
  CREDIT_HISTORY_EMPTY_CELL_CLASS,
  CREDIT_HISTORY_TABLE_BODY_ROW_CLASS,
  CREDIT_HISTORY_TABLE_CELL_CLASS,
  CREDIT_HISTORY_TABLE_HEAD_CLASS,
  CREDIT_HISTORY_TABLE_HEADER_ROW_CLASS,
  CREDIT_HISTORY_TABLE_SCROLL_CLASS,
} from '@/lib/creditOverviewUi';
import type { CreditLimitIncreaseRequestItem } from '@/store/api/creditOverviewApi';

function personInitials(
  person: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  const first = person?.first_name?.trim()?.[0] ?? '';
  const last = person?.last_name?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

export interface CreditLimitRequestHistorySectionProps {
  rows: CreditLimitIncreaseRequestItem[];
  isLoading?: boolean;
}

export function CreditLimitRequestHistorySection({
  rows,
  isLoading = false,
}: CreditLimitRequestHistorySectionProps): React.JSX.Element {
  return (
    <CreditOverviewHistoryCard title="Credit Limit Request History">
      <div className={CREDIT_HISTORY_TABLE_SCROLL_CLASS}>
        <Table className="min-w-[1020px]">
          <TableHeader>
            <TableRow className={CREDIT_HISTORY_TABLE_HEADER_ROW_CLASS}>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Date</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Previous Limit</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Requested Limit</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Approved Limit</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Reviewed By</TableHead>
              <TableHead className={CREDIT_HISTORY_TABLE_HEAD_CLASS}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className={CREDIT_HISTORY_EMPTY_CELL_CLASS}>
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className={CREDIT_HISTORY_EMPTY_CELL_CLASS}>
                  No limit increase requests yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const reviewer = row.reviewed_by ?? row.requested_by;
                return (
                  <TableRow key={row.id} className={CREDIT_HISTORY_TABLE_BODY_ROW_CLASS}>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {formatLimitIncreaseHistoryDate(row.created_at)}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {formatLimitIncreaseMoney(row.previous_limit)}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {formatLimitIncreaseMoney(row.requested_limit)}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      {formatLimitIncreaseMoney(row.approved_limit)}
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7 border border-[#E4E4E7]">
                          <AvatarFallback className="bg-[#F4F4F5] text-[10px] font-semibold text-[#52525B]">
                            {personInitials(reviewer)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{formatPersonName(reviewer)}</span>
                      </div>
                    </TableCell>
                    <TableCell className={CREDIT_HISTORY_TABLE_CELL_CLASS}>
                      <Badge
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                          limitIncreaseStatusBadgeClass(row.status)
                        )}
                      >
                        {formatLimitIncreaseStatus(row.status)}
                      </Badge>
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
