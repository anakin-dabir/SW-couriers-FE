import { SwCouriersLogo } from '@/assets/svg';

interface FormLogoProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for form logo
 * Displays SW Couriers logo in forms
 */
export default function FormLogo({ className }: FormLogoProps): React.JSX.Element {
  return <img src={SwCouriersLogo} alt="SW Couriers" className={className || 'h-14 w-20'} />;
}
