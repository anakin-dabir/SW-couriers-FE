import { memo } from 'react';
import Logo from '@/components/atoms/Logo';
import type { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

const Header = memo(function Header({ children }: HeaderProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm"
    >
      <Logo to="/dashboard" />
      <nav role="navigation" aria-label="Main navigation" className="flex items-center gap-4">
        {children}
      </nav>
    </header>
  );
});

export default Header;
