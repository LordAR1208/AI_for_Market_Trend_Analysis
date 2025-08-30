import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ErrorHandler, AppError } from '../utils/errorHandler.tsx';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): State {
    const appError = ErrorHandler.handleError(error, 'ErrorBoundary');
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: any, errorInfo: any) {
    ErrorHandler.handleError({ ...error, errorInfo }, 'React');
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: AppError; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500';
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        </div>

        <div className={`border rounded-lg p-4 mb-6 ${getSeverityColor(error.severity)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Error Code</span>
            <span className="text-sm font-mono">{error.code}</span>
          </div>
          <p className="text-sm opacity-90">{error.message}</p>
          <div className="text-xs opacity-75 mt-2">
            {new Date(error.timestamp).toLocaleString()}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleReload}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        </div>

        {import.meta.env.DEV && (
          <details className="mt-6">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;