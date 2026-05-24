/**
 * Type definitions for DataTable component
 */

export type Alignment = 'left' | 'center' | 'right';

export interface Column<T> {
  /** Column key */
  key: keyof T | string;
  /** Column header label */
  header: string;
  /** Custom cell renderer */
  cell?: (row: T, index: number) => React.ReactNode;
  /** Header alignment */
  headerAlign?: Alignment;
  /** Cell alignment */
  cellAlign?: Alignment;
  /** Column className (table body cells) */
  className?: string;
  /** Optional header cell className (defaults to className when omitted) */
  headerClassName?: string;
  /** Muted grey header labels (audit-style tables) */
  headerMuted?: boolean;
  /** Double-arrow sort affordance (visual; optional server sort later) */
  headerShowSort?: boolean;
  /** Hide on mobile card view */
  hideOnMobile?: boolean;
  /** Show as primary field on mobile card */
  mobileOrder?: number;
}

export interface DataTableProps<T = Record<string, unknown>> {
  /** Table columns configuration */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Total pages */
  totalPages?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Rows shown per page */
  pageSize?: number;
  /** Total entries across all pages */
  totalEntries?: number;
  /** Rows-per-page change handler */
  onPageSizeChange?: (size: number) => void;
  /** Loading state for skeleton rendering */
  isLoading?: boolean;
  /** Number of skeleton rows while loading */
  skeletonRowCount?: number;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Additional table className */
  className?: string;
  /** ClassName for the rounded table section wrapper (padding, background) */
  tableSectionClassName?: string;
  /** When set, wraps the desktop table (not pagination) in horizontal overflow */
  tableHorizontalScrollClassName?: string;
  /** Width hint on the scrolling inner block (e.g. min-w-[1580px]); use with tableHorizontalScrollClassName */
  tableScrollMinWidthClassName?: string;
  /** Row key accessor */
  getRowKey?: (row: T, index: number) => string | number;
  /** Card click handler for mobile view */
  onRowClick?: (row: T) => void;
  /** Extra classes per row (e.g. highlight unusual patterns) */
  getRowClassName?: (row: T, index: number) => string | undefined;
}
