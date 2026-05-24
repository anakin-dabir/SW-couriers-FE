import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SidebarLogoCollapsed from '@/components/atoms/SidebarLogoCollapsed';
import SidebarLogoExpanded from '@/components/atoms/SidebarLogoExpanded';

interface SidebarLogoProps {
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
}

/**
 * Atomic component for sidebar logo
 * Conditionally renders collapsed or expanded logo based on sidebar state
 */
export default function SidebarLogo({ isCollapsed }: SidebarLogoProps): React.JSX.Element {
  return (
    <Link
      to="/dashboard"
      className={cn(
        'flex items-center gap-2 flex-1 min-w-0 transition-all duration-300',
        isCollapsed && 'justify-center'
      )}
    >
      {isCollapsed ? <SidebarLogoCollapsed /> : <SidebarLogoExpanded />}
    </Link>
  );
}
