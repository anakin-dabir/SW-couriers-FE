import type { ErrorInfo } from 'react';
import type React from 'react';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { ErrorIllustration } from '@/assets/img';

interface ErrorScreenProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

function ErrorScreen({
  error,
  errorInfo,
  onReset,
  onBack,
  backLabel = 'Go Back',
}: ErrorScreenProps): React.JSX.Element {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-off-white p-5">
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src={ErrorIllustration}
          alt="Something Went Wrong"
          className="w-1/4 h-1/4 grayscale opacity-70"
        />

        {/* Heading */}
        <Typography variant="h1" className="text-2xl font-bold mb-3">
          Something went wrong
        </Typography>

        {/* Description */}
        <Typography color="muted" className="mb-8">
          We couldn't load this page right now. Please check your connection or try again.
        </Typography>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <details className="mb-8 w-full max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
            <summary className="mb-3 cursor-pointer select-none text-sm font-semibold text-gray-700">
              Error Details (Development Mode)
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <strong className="mb-1.5 block text-xs text-gray-700">Error Message:</strong>
                <pre className="overflow-auto rounded-md border border-gray-200 bg-white p-3 text-xs font-mono text-error">
                  {error.toString()}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <strong className="mb-1.5 block text-xs text-gray-700">Stack Trace:</strong>
                  <pre className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-white p-3 text-xs font-mono text-gray-600">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong className="mb-1.5 block text-xs text-gray-700">Component Stack:</strong>
                  <pre className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-white p-3 text-xs font-mono text-gray-600">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {onReset && (
            <Button variant="outline" size="default" onClick={onReset}>
              Retry
            </Button>
          )}
          <Button
            variant="default"
            size="default"
            onClick={() => {
              if (onBack) {
                onBack();
              }
            }}
          >
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorScreen;
