import React, { Component, type ReactNode } from 'react';
import { ErrorScreen } from '@/components/organisms';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  private backResetRaf: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: {
        componentStack: error.stack || 'No stack trace available',
      } as React.ErrorInfo,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleBack = (): void => {
    const previousLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    window.history.back();

    const resetAfterLocationChange = (): void => {
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (currentLocation !== previousLocation) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
        this.backResetRaf = null;
        return;
      }

      this.backResetRaf = window.requestAnimationFrame(resetAfterLocationChange);
    };

    if (this.backResetRaf !== null) {
      window.cancelAnimationFrame(this.backResetRaf);
    }
    this.backResetRaf = window.requestAnimationFrame(resetAfterLocationChange);
  };

  componentWillUnmount(): void {
    if (this.backResetRaf !== null) {
      window.cancelAnimationFrame(this.backResetRaf);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI or default ErrorScreen
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorScreen
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onBack={this.handleBack}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
