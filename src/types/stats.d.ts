/**
 * Generic stat types shared by billing, dashboard, etc.
 */

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  href?: string;
  onClick?: () => void;
  isCritical?: boolean;
}
