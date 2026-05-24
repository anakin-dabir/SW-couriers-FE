import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import FallbackImage from '@/components/atoms/FallbackImage';
import FallbackContent from '@/components/molecules/FallbackContent';
import { NotFoundIllustration } from '@/assets/img';

/**
 * Organism component for 404 Not Found screen
 */
export default function NotFoundScreen(): React.JSX.Element {
  const navigate = useNavigate();

  const handleGoBack = (): void => {
    void navigate(-1);
  };

  const handleGoToDashboard = (): void => {
    void navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-12 max-w-md">
        <FallbackImage
          src={NotFoundIllustration}
          alt="Page not found illustration"
          className="w-full max-w-sm"
        />
        <FallbackContent
          title="Page not found"
          description="The page you're looking for doesn't exist or may have been moved."
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleGoBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Previous Page
              </Button>
              <Button
                type="button"
                variant="default"
                size="default"
                onClick={handleGoToDashboard}
                className="flex-1 bg-error hover:bg-error/90"
              >
                Go to Dashboard
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}
