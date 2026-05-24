import type { ReactNode } from 'react';
import HeroVisualSection from './HeroVisualSection';
import FormSection from './FormSection';
import { getHeroContent, isRightGradientPage } from '@/lib/utils';

interface PublicLayoutContentProps {
  /** Page children */
  children: ReactNode;
  /** Current pathname */
  pathname: string;
}

/**
 * Molecule component for public layout content
 * Handles layout switching based on route
 */
export default function PublicLayoutContent({
  children,
  pathname,
}: PublicLayoutContentProps): React.JSX.Element {
  const isRightGradient = isRightGradientPage(pathname);
  const heroContent = getHeroContent(pathname);

  // Login Layout: Gradient Left, Form Right
  if (!isRightGradient) {
    return (
      <>
        <HeroVisualSection
          title={heroContent.title}
          description={heroContent.description}
          logoPosition="left"
        />
        <FormSection>{children}</FormSection>
      </>
    );
  }

  // Register/Forgot Password Layout: Form Left, Gradient Right
  return (
    <>
      <FormSection className="relative">{children}</FormSection>
      <HeroVisualSection
        title={heroContent.title}
        description={heroContent.description}
        logoPosition="right"
      />
    </>
  );
}
