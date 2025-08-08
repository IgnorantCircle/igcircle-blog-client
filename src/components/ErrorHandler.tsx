'use client';

import React from 'react';
import { HookErrorState } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Wifi, Lock, AlertCircle, Info } from 'lucide-react';

/**
 * 页面层错误处理组件属性
 */
export interface ErrorHandlerProps {
  /** 错误状态 */
  errorState: HookErrorState;
  /** 重试函数 */
  onRetry?: () => void;
  /** 自定义操作 */
  customActions?: React.ReactNode;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 错误显示模式 */
  mode?: 'inline' | 'card' | 'fullscreen';
}

/**
 * 页面层错误处理组件
 * 页面层：专注业务逻辑，无需手动错误处理
 */
export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  errorState,
  onRetry,
  customActions,
  showDetails = false,
  className = '',
  mode = 'card',
}) => {
  if (!errorState.hasError) {
    return null;
  }

  const getErrorIcon = () => {
    switch (errorState.errorType) {
      case 'network':
        return <Wifi className="h-8 w-8 text-red-500" />;
      case 'auth':
        return <Lock className="h-8 w-8 text-yellow-500" />;
      case 'validation':
        return <Info className="h-8 w-8 text-blue-500" />;
      case 'business':
        return <AlertCircle className="h-8 w-8 text-orange-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (errorState.severity) {
      case 'low':
        return 'border-blue-200 bg-blue-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getErrorTypeLabel = () => {
    switch (errorState.errorType) {
      case 'network':
        return '网络错误';
      case 'auth':
        return '认证错误';
      case 'validation':
        return '验证错误';
      case 'business':
        return '业务错误';
      default:
        return '未知错误';
    }
  };

  const renderInlineMode = () => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getSeverityColor()} ${className}`}>
      {getErrorIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{errorState.userMessage}</p>
        {showDetails && errorState.developerMessage && (
          <p className="text-xs text-gray-500 mt-1">{errorState.developerMessage}</p>
        )}
      </div>
      {errorState.canRetry && onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          重试
        </Button>
      )}
      {customActions}
    </div>
  );

  const renderCardMode = () => (
    <div className={`p-6 rounded-lg border ${getSeverityColor()} ${className}`}>
      <div className="flex items-start gap-4">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getErrorTypeLabel()}
          </h3>
          <p className="text-gray-700 mb-4">{errorState.userMessage}</p>
          
          {showDetails && (
            <div className="space-y-2 mb-4">
              {errorState.errorCode && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">错误代码:</span> {errorState.errorCode}
                </p>
              )}
              {errorState.requestId && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">请求ID:</span> {errorState.requestId}
                </p>
              )}
              {errorState.developerMessage && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">详细信息:</span> {errorState.developerMessage}
                </p>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            {errorState.canRetry && onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                重试
              </Button>
            )}
            {customActions}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFullscreenMode = () => (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-lg border">
          <div className="text-center">
            <div className="mb-4">{getErrorIcon()}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getErrorTypeLabel()}
            </h2>
            <p className="text-gray-600 mb-6">{errorState.userMessage}</p>
            
            {showDetails && (
              <div className="text-left space-y-2 mb-6 p-4 bg-gray-50 rounded">
                {errorState.errorCode && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">错误代码:</span> {errorState.errorCode}
                  </p>
                )}
                {errorState.requestId && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">请求ID:</span> {errorState.requestId}
                  </p>
                )}
                {errorState.developerMessage && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">详细信息:</span> {errorState.developerMessage}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {errorState.canRetry && onRetry && (
                <Button onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  重试
                </Button>
              )}
              {customActions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (mode) {
    case 'inline':
      return renderInlineMode();
    case 'fullscreen':
      return renderFullscreenMode();
    case 'card':
    default:
      return renderCardMode();
  }
};

/**
 * 错误状态检查工具函数
 */
export const ErrorUtils = {
  /**
   * 检查是否有错误
   */
  hasError: (errorState: HookErrorState): boolean => {
    return errorState.hasError;
  },

  /**
   * 检查是否为网络错误
   */
  isNetworkError: (errorState: HookErrorState): boolean => {
    return errorState.errorType === 'network';
  },

  /**
   * 检查是否为认证错误
   */
  isAuthError: (errorState: HookErrorState): boolean => {
    return errorState.errorType === 'auth';
  },

  /**
   * 检查是否可以重试
   */
  canRetry: (errorState: HookErrorState): boolean => {
    return errorState.canRetry;
  },

  /**
   * 检查是否为严重错误
   */
  isCritical: (errorState: HookErrorState): boolean => {
    return errorState.severity === 'critical';
  },

  /**
   * 获取错误的用户消息
   */
  getUserMessage: (errorState: HookErrorState): string => {
    return errorState.userMessage;
  },
};

export default ErrorHandler;