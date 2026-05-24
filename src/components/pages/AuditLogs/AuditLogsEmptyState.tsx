'use client';

import * as React from 'react';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { NoChangesRecordIllustration } from '@/assets/svg';

export interface AuditLogsEmptyStateProps {
  /** When true, copy references filters and the reset button is shown. */
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

/**
 * Centered empty state for audit log tables (Overview Recent Activity + Activity Log).
 */
export default function AuditLogsEmptyState({
  hasActiveFilters,
  onResetFilters,
}: AuditLogsEmptyStateProps): React.JSX.Element {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-[#FAFAFA] px-6 py-14 text-center"
      role="status"
      aria-live="polite"
    >
      <img
        src={NoChangesRecordIllustration}
        alt=""
        width={100}
        height={100}
        className="h-[100px] w-[100px] shrink-0"
      />
      <Typography variant="h6" className="mt-6 max-w-md text-lg font-normal text-[#18181B]">
        {hasActiveFilters ? 'No audit events match your filters' : 'No audit events recorded'}
      </Typography>
      <Typography
        variant="caption"
        className="mt-2 max-w-md text-sm leading-relaxed text-[#71717A]"
      >
        {hasActiveFilters
          ? 'Try adjusting or clearing your filters to see more results.'
          : 'There are no audit events to display yet.'}
      </Typography>
      {hasActiveFilters ? (
        <Button
          type="button"
          variant="outline"
          className="mt-8 border-[#E5E7EB] bg-white px-6 text-[#30303B] hover:bg-[#F9FAFB]"
          onClick={onResetFilters}
        >
          Reset Filters
        </Button>
      ) : null}
    </div>
  );
}
