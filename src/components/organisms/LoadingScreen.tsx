import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import FallbackTitle from '@/components/atoms/FallbackTitle';
import FallbackDescription from '@/components/atoms/FallbackDescription';

interface LoadingScreenProps {
  /** Loading message */
  message?: string;
  /** Description text */
  description?: string;
}

/**
 * Organism component for Loading screen
 */
export default function LoadingScreen({
  message = 'Loading your dashboard',
  description = 'Fetching real-time delivery data and system updates.',
}: LoadingScreenProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-8 max-w-xl">
        <LoadingSpinner size="lg" />
        <div className="flex flex-col items-center gap-5">
          <FallbackTitle>{message}</FallbackTitle>
          <FallbackDescription>{description}</FallbackDescription>
        </div>
      </div>
    </div>
  );
}
