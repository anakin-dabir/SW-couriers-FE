import { memo, createElement } from 'react';
import type { ReactNode, HTMLAttributes, ElementType } from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label';
type TypographyColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'text' | 'muted';
type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'htmlFor'> {
  children: ReactNode;
  /**
   * Typography variant that determines the HTML element and default styling
   */
  variant?: TypographyVariant;
  /**
   * Text color variant
   */
  color?: TypographyColor;
  /**
   * Font weight
   */
  weight?: TypographyWeight;
  /**
   * Text alignment
   */
  align?: TypographyAlign;
  /**
   * Whether the text should be truncated with ellipsis
   */
  truncate?: boolean;
  /**
   * Number of lines to show before truncating (only works with truncate)
   */
  lines?: number;
  /**
   * Custom component to render as (e.g., 'p', 'span', 'div')
   */
  component?: ElementType;
  /**
   * HTML for attribute (used when variant="label" to associate label with input)
   */
  htmlFor?: string;
}

/**
 * Typography Atom
 *
 * Flexible typography component with semantic variants and styling options.
 * Uses Tailwind CSS for styling.
 * Optimized with React.memo for performance.
 * Fully accessible with proper semantic HTML.
 */
const Typography = memo(function Typography({
  children,
  variant = 'body',
  color = 'text',
  weight = 'normal',
  align = 'left',
  truncate = false,
  lines,
  component,
  className = '',
  style,
  htmlFor,
  ...props
}: TypographyProps) {
  // Map variant to HTML element
  const getComponent = (): ElementType => {
    if (component) return component;
    if (variant.startsWith('h')) return variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    if (variant === 'label') return 'label';
    return 'p';
  };

  // Variant-specific Tailwind classes
  const VARIANT_CLASSES: Record<TypographyVariant, string> = {
    h1: 'text-4xl leading-tight font-bold',
    h2: 'text-3xl leading-snug font-bold',
    h3: 'text-2xl leading-relaxed font-semibold',
    h4: 'text-xl leading-relaxed font-semibold',
    h5: 'text-lg leading-normal font-semibold',
    h6: 'text-base leading-normal font-semibold',
    body: 'text-base leading-normal',
    caption: 'text-sm leading-relaxed',
    label: 'text-sm leading-relaxed font-medium',
  };

  // Color-specific Tailwind classes
  const COLOR_CLASSES: Record<TypographyColor, string> = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-500',
    text: 'text-gray-900',
    muted: 'text-gray-600',
  };

  // Weight-specific Tailwind classes (override variant weight if needed)
  const WEIGHT_CLASSES: Record<TypographyWeight, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Alignment classes
  const ALIGN_CLASSES: Record<TypographyAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  // Truncation classes
  const truncateClasses = truncate ? (lines && lines > 1 ? `line-clamp-${lines}` : 'truncate') : '';

  // Build className string
  const classes = [
    'm-0 p-0', // Base reset
    VARIANT_CLASSES[variant],
    COLOR_CLASSES[color],
    WEIGHT_CLASSES[weight],
    ALIGN_CLASSES[align],
    truncateClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = getComponent();

  // Prepare props for the element
  const elementProps: Record<string, unknown> = {
    className: classes,
    style,
    ...props,
  };

  // Add htmlFor when variant is label
  if (variant === 'label' && htmlFor) {
    elementProps.htmlFor = htmlFor;
  }

  return createElement(Component, elementProps, children);
});

export default Typography;
export type {
  TypographyProps,
  TypographyVariant,
  TypographyColor,
  TypographyWeight,
  TypographyAlign,
};
