'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ApiError } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 全局错误边界组件
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 记录错误日志
    ErrorHandler.logError(error, 'ErrorBoundary');
    
    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 错误回退组件属性
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}

/**
 * 默认错误回退组件
 */
function ErrorFallback({ error, errorInfo, onRetry }: ErrorFallbackProps) {
  const isApiError = error instanceof ApiError;
  const errorMessage = error ? ErrorHandler.handleApiError(error) : '发生了未知错误';
  const canRetry = error ? ErrorHandler.canRetry(error) : true;
  const severity = error ? ErrorHandler.getErrorSeverity(error) : 'medium';

  // 根据错误严重程度选择不同的样式
  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg border-2 p-6 text-center ${getSeverityStyles()}`}>
        <div className="flex justify-center mb-4">
          <AlertTriangle className={`h-12 w-12 ${getIconColor()}`} />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          页面出现错误
        </h2>
        
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>

        {/* API错误详情 */}
        {isApiError && (
          <div className="mb-6 p-3 bg-white rounded border text-left text-sm">
            <div className="font-medium text-gray-700 mb-1">错误详情：</div>
            <div className="text-gray-600">
              <div>状态码: {(error as ApiError).code}</div>
              {(error as ApiError).error && (
                <div>错误类型: {(error as ApiError).error}</div>
              )}
              {(error as ApiError).path && (
                <div>请求路径: {(error as ApiError).path}</div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {canRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </Button>
          )}
          
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 开发环境下显示详细错误信息 */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              开发者信息 (仅开发环境显示)
            </summary>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
              <div className="mb-2">
                <strong>错误信息:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>错误堆栈:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>组件堆栈:</strong>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * 简化的错误边界Hook
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

/**
 * 异步错误边界Hook
 */
export function useAsyncError() {
  const { captureError } = useErrorBoundary();

  return React.useCallback(
    (error: Error) => {
      // 在下一个事件循环中抛出错误，确保错误边界能够捕获
      setTimeout(() => {
        captureError(error);
      }, 0);
    },
    [captureError]
  );
}

export default ErrorBoundary;