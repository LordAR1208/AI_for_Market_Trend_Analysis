/**
 * Centralized Error Handling Utilities
 */
import React from 'react';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static maxErrors = 100;

  /**
   * Log and handle application errors
   */
  static handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date().toISOString(),
      severity: this.getErrorSeverity(error)
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${context || 'App'}] Error:`, appError);
    }

    // Store error for debugging
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // In production, you might want to send to error tracking service
    this.reportError(appError, context);

    return appError;
  }

  /**
   * Handle API errors specifically
   */
  static handleApiError(error: any, endpoint?: string): AppError {
    const context = endpoint ? `API:${endpoint}` : 'API';
    
    if (error.response) {
      // HTTP error response
      const apiError = {
        ...error,
        message: error.response.data?.message || error.message,
        status: error.response.status
      };
      return this.handleError(apiError, context);
    }
    
    if (error.request) {
      // Network error
      const networkError = {
        ...error,
        message: 'Network error - please check your connection'
      };
      return this.handleError(networkError, context);
    }
    
    return this.handleError(error, context);
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any, operation?: string): AppError {
    const context = operation ? `DB:${operation}` : 'Database';
    
    // Supabase specific error handling
    if (error.code) {
      switch (error.code) {
        case 'PGRST301':
          error.message = 'Resource not found';
          break;
        case '23505':
          error.message = 'Resource already exists';
          break;
        case '42501':
          error.message = 'Insufficient permissions';
          break;
        case 'PGRST116':
          error.message = 'Invalid request format';
          break;
      }
    }
    
    return this.handleError(error, context);
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): AppError {
    const authError = { ...error };
    
    // Supabase auth error codes
    switch (error.message) {
      case 'Invalid login credentials':
        authError.message = 'Invalid email or password';
        break;
      case 'Email not confirmed':
        authError.message = 'Please check your email and confirm your account';
        break;
      case 'User already registered':
        authError.message = 'An account with this email already exists';
        break;
      case 'Password should be at least 6 characters':
        authError.message = 'Password must be at least 6 characters long';
        break;
    }
    
    return this.handleError(authError, 'Auth');
  }

  /**
   * Get recent errors for debugging
   */
  static getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
    recent: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const bySeverity: Record<string, number> = {};
    const byCode: Record<string, number> = {};
    let recent = 0;

    this.errors.forEach(error => {
      // Count by severity
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      
      // Count by code
      byCode[error.code] = (byCode[error.code] || 0) + 1;
      
      // Count recent errors
      if (new Date(error.timestamp).getTime() > oneHourAgo) {
        recent++;
      }
    });

    return {
      total: this.errors.length,
      bySeverity,
      byCode,
      recent
    };
  }

  private static getErrorCode(error: any): string {
    if (error.code) return error.code;
    if (error.status) return `HTTP_${error.status}`;
    if (error.name) return error.name;
    return 'UNKNOWN_ERROR';
  }

  private static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    return 'An unexpected error occurred';
  }

  private static getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    // Network errors
    if (error.code === 'NETWORK_ERROR') return 'high';
    
    // Authentication errors
    if (error.code?.startsWith('AUTH_')) return 'medium';
    
    // Database errors
    if (error.code?.startsWith('PGRST')) return 'high';
    
    // HTTP errors
    if (error.status >= 500) return 'critical';
    if (error.status >= 400) return 'medium';
    
    // Validation errors
    if (error.name === 'ValidationError') return 'low';
    
    return 'medium';
  }

  private static reportError(error: AppError, context?: string): void {
    // In production, send to error tracking service like Sentry
    if (import.meta.env.PROD && error.severity === 'critical') {
      // Example: Sentry.captureException(error);
      console.error('Critical error reported:', error);
    }
  }
}

/**
 * React Error Boundary Component
 */
export class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: AppError }> },
  { hasError: boolean; error: AppError | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    const appError = ErrorHandler.handleError(error, 'ErrorBoundary');
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: any, errorInfo: any) {
    ErrorHandler.handleError({ ...error, errorInfo }, 'React');
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: AppError }> = ({ error }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
      <p className="text-gray-300 mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Reload Page
      </button>
    </div>
  </div>
);</parameter>