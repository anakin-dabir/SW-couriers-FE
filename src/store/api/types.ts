/**
 * Common API response types
 */

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Common query parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export type QueryParams = PaginationParams & SortParams & FilterParams;
