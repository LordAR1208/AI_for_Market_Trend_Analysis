/**
 * Logging Utilities
 * Centralized logging with different levels and contexts
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'info';

  /**
   * Log debug information
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Log general information
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Log errors
   */
  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * Log API calls
   */
  apiCall(method: string, url: string, status?: number, duration?: number): void {
    this.info(`${method} ${url}`, {
      status,
      duration: duration ? `${duration}ms` : undefined
    }, 'API');
  }

  /**
   * Log user actions
   */
  userAction(action: string, userId?: string, data?: any): void {
    this.info(`User action: ${action}`, data, 'User');
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, { value, unit }, 'Performance');
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 50, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
      const minPriority = levelPriority[level];
      
      filteredLogs = this.logs.filter(log => 
        levelPriority[log.level] >= minPriority
      );
    }
    
    return filteredLogs.slice(-count);
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear log history
   */
  clearLogs(): void {
    this.logs = [];
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    
    // Only log if level meets threshold
    if (levelPriority[level] < levelPriority[this.logLevel]) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to internal log storage
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const style = this.getConsoleStyle(level);
    const prefix = `[${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
    
    console.log(`%c${prefix} ${message}`, style, data || '');

    // In production, send to logging service
    if (import.meta.env.PROD && level === 'error') {
      this.sendToLoggingService(logEntry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #6B7280; font-weight: normal;',
      info: 'color: #3B82F6; font-weight: normal;',
      warn: 'color: #F59E0B; font-weight: bold;',
      error: 'color: #EF4444; font-weight: bold; background: #FEE2E2; padding: 2px 4px; border-radius: 3px;'
    };
    
    return styles[level];
  }

  private sendToLoggingService(logEntry: LogEntry): void {
    // In production, integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint
    
    try {
      // Example implementation
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(err => {
        console.error('Failed to send log to service:', err);
      });
    } catch (error) {
      console.error('Error sending log to service:', error);
    }
  }
}

export const logger = new Logger();

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing and log result
   */
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    logger.performance(name, Math.round(duration));
    return duration;
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * Monitor component render performance
   */
  static monitorRender(componentName: string) {
    return {
      onRenderStart: () => this.startTimer(`render:${componentName}`),
      onRenderEnd: () => this.endTimer(`render:${componentName}`)
    };
  }
}

/**
 * React hook for error handling
 */
export class ErrorHandler {
  static handleError(error: any, context?: string): any {
    logger.error(`Error in ${context || 'Unknown'}`, error, context);
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
      timestamp: new Date().toISOString(),
      severity: 'medium' as const
    };
  }

  static handleApiError(error: any, endpoint?: string): any {
    return this.handleError(error, `API:${endpoint || 'Unknown'}`);
  }
}

export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    return ErrorHandler.handleError(error, context);
  };

  const handleApiError = (error: any, endpoint?: string) => {
    return ErrorHandler.handleApiError(error, endpoint);
  };

  const handleAsyncError = async (asyncFn: () => Promise<any>, context?: string) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };

  return {
    handleError,
    handleApiError,
    handleAsyncError
  };
};