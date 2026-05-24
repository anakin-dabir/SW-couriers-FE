import type { LucideIcon } from 'lucide-react';

/**
 * Sub-navigation item type
 * Used for nested menu items within a parent navigation item
 */
export interface SubNavItem {
  /** Display title of the sub-navigation item */
  title: string;
  /** URL path for the sub-navigation item */
  url: string;
  /** Optional icon (submenu renders text-only by default) */
  icon?: LucideIcon;
}

/**
 * Main navigation item type
 * Can contain optional sub-navigation items for collapsible menus
 */
export interface NavItem {
  /** Display title of the navigation item */
  title: string;
  /** URL path for the navigation item */
  url: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Optional badge text to display (e.g., notification count) */
  badge?: string;
  /** Optional array of sub-navigation items */
  items?: SubNavItem[];
}
