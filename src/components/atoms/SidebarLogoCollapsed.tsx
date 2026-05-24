import { SwCouriersLogo } from '@/assets/svg';

/**
 * Atomic component for collapsed sidebar logo
 * Displays SW Couriers logo SVG in a bordered box
 */
export default function SidebarLogoCollapsed(): React.JSX.Element {
  return (
    <div className="flex size-12 items-center justify-center rounded-lg border border-gray-200">
      <img src={SwCouriersLogo} alt="SW Couriers" className="h-6 w-auto" />
    </div>
  );
}
