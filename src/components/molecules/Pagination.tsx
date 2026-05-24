import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn, getVisiblePages } from '@/lib/utils';
import { Typography } from '@/components/atoms';

interface PaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Additional className */
  className?: string;
  /** Active page button classes (defaults to primary fill) */
  activePageClassName?: string;
}

/**
 * Molecule component for pagination
 * Provides navigation between pages - reusable across tables, lists, and other paginated content
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  activePageClassName = 'bg-primary-500 text-white',
}: PaginationProps): React.JSX.Element {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 items-center gap-1 rounded-md px-2.5 py-2 text-xs font-medium text-form-title hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <Typography variant="caption" weight="medium">
          Previous
        </Typography>
      </button>

      {/* Page Numbers - Hidden on mobile */}
      <div className="hidden md:flex md:items-center md:gap-1">
        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center"
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4 text-form-title" />
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md text-xs font-medium transition-colors',
                currentPage === page ? activePageClassName : 'text-form-title hover:bg-gray-100'
              )}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              <Typography variant="caption" weight="medium">
                {page}
              </Typography>
            </button>
          )
        )}
      </div>

      {/* Page indicator on mobile */}
      <Typography variant="caption" weight="medium" className="px-2 text-form-title md:hidden">
        {currentPage} / {totalPages}
      </Typography>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 items-center gap-1 rounded-md px-4 py-2 text-xs font-medium text-form-title hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        <Typography variant="caption" weight="medium">
          Next
        </Typography>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
