import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { ErrorScreen } from '@/components/organisms';

/**
 * RouteErrorElement Component
 *
 * Handles errors thrown by React Router (route loaders, actions, or rendering).
 * This is used as the errorElement in React Router route configuration.
 */
export default function RouteErrorElement(): React.JSX.Element {
  const error = useRouteError();
  const navigate = useNavigate();

  // Convert route error to Error object for ErrorScreen
  let errorObj: Error | null = null;

  if (isRouteErrorResponse(error)) {
    // Handle route error response
    errorObj = new Error(error.statusText || `Error ${error.status}`);
    if (error.data instanceof Error) {
      errorObj = error.data;
    } else if (typeof error.data === 'string') {
      errorObj = new Error(error.data);
    }
  } else if (error instanceof Error) {
    // Handle standard Error object
    errorObj = error;
  } else {
    // Handle unknown error types
    errorObj = new Error('An unexpected error occurred');
  }

  const handleRetry = (): void => {
    window.location.reload();
  };

  const handleContactSupport = (): void => {
    void navigate('/support');
  };

  return (
    <ErrorScreen
      error={errorObj}
      errorInfo={null}
      onReset={handleRetry}
      onBack={handleContactSupport}
      backLabel="Contact Support"
    />
  );
}
