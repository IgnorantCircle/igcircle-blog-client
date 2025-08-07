'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ApiError } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';

/**
 * Toast类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast配置
 */
export interface ToastConfig {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast上下文
 */
interface ToastContextType {
  toasts: ToastConfig[];
  addToast: (config: Omit<ToastConfig, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: Partial<ToastConfig>) => string;
  error: (error: string | Error | ApiError, options?: Partial<ToastConfig>) => string;
  warning: (message: string, options?: Partial<ToastConfig>) => string;
  info: (message: string, options?: Partial<ToastConfig>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider组件
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastConfig = {
      id,
      duration: 5000,
      ...config,
    };

    setToasts(prev => [...prev, toast]);

    // 自动移除非持久化的toast
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message: string, options?: Partial<ToastConfig>) => {
    return addToast({
      type: 'success',
      message,
      ...options,
    });
  }, [addToast]);

  const error = useCallback((error: string | Error | ApiError, options?: Partial<ToastConfig>) => {
    const message = typeof error === 'string' ? error : ErrorHandler.handleApiError(error);
    
    // 记录错误日志
    if (error instanceof Error) {
      ErrorHandler.logError(error, 'Toast');
    }

    return addToast({
      type: 'error',
      message,
      duration: 8000, // 错误消息显示更长时间
      ...options,
    });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<ToastConfig>) => {
    return addToast({
      type: 'warning',
      message,
      duration: 6000,
      ...options,
    });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<ToastConfig>) => {
    return addToast({
      type: 'info',
      message,
      ...options,
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/**
 * Toast容器组件
 */
function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} config={toast} />
      ))}
    </div>
  );
}

/**
 * Toast项组件
 */
function ToastItem({ config }: { config: ToastConfig }) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      removeToast(config.id);
    }, 300);
  }, [config.id, removeToast]);

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = 'rounded-lg shadow-lg border p-4 backdrop-blur-sm';
    
    switch (config.type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-white/90 border-gray-200 text-gray-800`;
    }
  };

  const animationClasses = isLeaving
    ? 'transform translate-x-full opacity-0'
    : isVisible
    ? 'transform translate-x-0 opacity-100'
    : 'transform translate-x-full opacity-0';

  return (
    <div
      className={`${getStyles()} transition-all duration-300 ease-in-out ${animationClasses}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {config.title && (
            <div className="font-medium text-sm mb-1">
              {config.title}
            </div>
          )}
          <div className="text-sm">
            {config.message}
          </div>
          
          {config.action && (
            <div className="mt-2">
              <button
                onClick={config.action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              >
                {config.action.label}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
          aria-label="关闭通知"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * 使用Toast的Hook
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * 全局Toast实例（用于在非React组件中使用）
 */
class GlobalToast {
  private static instance: GlobalToast;
  private toastContext: ToastContextType | null = null;

  static getInstance(): GlobalToast {
    if (!GlobalToast.instance) {
      GlobalToast.instance = new GlobalToast();
    }
    return GlobalToast.instance;
  }

  setContext(context: ToastContextType) {
    this.toastContext = context;
  }

  success(message: string, options?: Partial<ToastConfig>) {
    return this.toastContext?.success(message, options);
  }

  error(error: string | Error | ApiError, options?: Partial<ToastConfig>) {
    return this.toastContext?.error(error, options);
  }

  warning(message: string, options?: Partial<ToastConfig>) {
    return this.toastContext?.warning(message, options);
  }

  info(message: string, options?: Partial<ToastConfig>) {
    return this.toastContext?.info(message, options);
  }
}

export const toast = GlobalToast.getInstance();

/**
 * Toast上下文注册Hook（用于全局Toast）
 */
export function useToastContext() {
  const context = useToast();
  
  useEffect(() => {
    toast.setContext(context);
  }, [context]);

  return context;
}