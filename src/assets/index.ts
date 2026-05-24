/**
 * Assets Index
 *
 * Central export point for all assets (SVG, images, fonts).
 * Re-export from subdirectories for convenient imports.
 *
 * Usage:
 * import { LogoIcon } from '@/assets/svg';
 * import { HeroImage } from '@/assets/img';
 * import { fontFaces } from '@/assets/font';
 *
 * Or import from main assets:
 * import { LogoIcon } from '@/assets';
 */

// Re-export SVG assets
export * from './svg';

// Re-export image assets
export * from './img';
