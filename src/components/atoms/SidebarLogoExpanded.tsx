import { SwCouriersLogo } from '@/assets/svg';

/**
 * Atomic component for expanded sidebar logo
 * Displays SW Couriers logo SVG
 */
export default function SidebarLogoExpanded(): React.JSX.Element {
  return <img src={SwCouriersLogo} alt="SW Couriers" className="h-8 w-auto" />;
}
