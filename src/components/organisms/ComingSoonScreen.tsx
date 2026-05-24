import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import FallbackImage from '@/components/atoms/FallbackImage';
import FallbackContent from '@/components/molecules/FallbackContent';
import { ComingSoonIllustration } from '@/assets/img';

/**
 * Organism component for Coming Soon screen
 */
export default function ComingSoonScreen(): React.JSX.Element {
  const navigate = useNavigate();

  const handleGoToDashboard = (): void => {
    void navigate('/dashboard');
  };

  return (
    <div className="flex h-full max-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-10 max-w-md">
        <FallbackImage
          src={ComingSoonIllustration}
          alt="Coming soon illustration"
          className="w-full max-w-sm"
        />
        <FallbackContent
          title="Coming soon"
          description="This feature is currently under development and will be available in a future update."
          actions={
            <Button type="button" variant="outline" size="default" onClick={handleGoToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          }
        />
      </div>
    </div>
  );
}
