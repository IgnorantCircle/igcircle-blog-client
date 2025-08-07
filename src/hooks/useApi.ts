'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';

/**
 * Hook层错误处理状态
 */
export interface HookErrorState {
  /** 是否有错误 */
  hasError: boolean;
  /** 错误类型 */
  errorType: 'network' | 'http' | 'business' | 'validation' | 'auth' | 'unknown';
  /** 错误严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 是否可重试 */
  canRetry: boolean;
  /** 用户友好的错误消息 */
  userMessage: string;
  /** 开发者错误信息 */
  developerMessage?: string;
  /** 错误代码 */
  errorCode?: string;
  /** 请求ID */
  requestId?: string;
}

/**
 * API调用状态接口
 * Hook层：处理业务逻辑错误、状态管理
 */
export interface ApiState<T> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误状态 */
  errorState: HookErrorState;
  /** 原始错误对象（仅开发环境） */
  rawError: ApiError | Error | null;
  /** 重试函数 */
  retry: () => void;
  /** 清除错误 */
  clearError: () => void;
  /** 手动设置数据 */
  setData: (data: T | null) => void;
  /** 是否首次加载 */
  isFirstLoad: boolean;
}

/**
 * API Hook选项
 */
export interface UseApiOptions {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 依赖项数组 */
  deps?: any[];
  /** 错误回调 */
  onError?: (errorState: HookErrorState, rawError: unknown) => void;
  /** 成功回调 */
  onSuccess?: (data: unknown) => void;
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean;

  /** 业务逻辑验证函数 */
  validateData?: (data: unknown) => string | null;
}

/**
 * 通用API调用Hook
 * Hook层：处理业务逻辑错误、状态管理
 * @param apiCall API调用函数
 * @param options 选项
 * @returns API状态和控制函数
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): ApiState<T> {
  const {
    immediate = true,
    deps = [],
    onError,
    onSuccess,
    cancelOnUnmount = true,
    validateData,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<HookErrorState>({
    hasError: false,
    errorType: 'unknown',
    severity: 'medium',
    canRetry: false,
    userMessage: '',
  });
  const [rawError, setRawError] = useState<ApiError | Error | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorType: 'unknown',
      severity: 'medium',
      canRetry: false,
      userMessage: '',
    });
    setRawError(null);
  }, []);

  const executeApiCall = useCallback(async (isRetry = false) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    
    if (!isRetry) {
      clearError();
    }

    try {
      const result = await apiCall();
      
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        return;
      }

      // Hook层：业务逻辑验证
      if (validateData) {
        const validationResult = validateData(result);
        if (validationResult) {
          const businessErrorState = createBusinessErrorState(validationResult);
          setErrorState(businessErrorState);
          
          const businessError = new Error(validationResult);
          setRawError(businessError);
          onError?.(businessErrorState, businessError);
          return;
        }
      }

      // 成功处理
      setData(result);
      setIsFirstLoad(false);
      onSuccess?.(result);
    } catch (err: unknown) {
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        return;
      }

      // Hook层：处理业务逻辑错误
      const hookErrorState = processApiError(err as ApiError | Error);
      setErrorState(hookErrorState);
      setRawError(err as ApiError | Error);
      setIsFirstLoad(false);
      
      // 记录错误
      ErrorHandler.logError(err, 'useApi Hook Layer');
      
      onError?.(hookErrorState, err as ApiError | Error);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apiCall, onError, onSuccess, clearError, validateData]);

  /**
   * 处理API错误，转换为Hook层错误状态
   * @param error 原始错误
   */
  const processApiError = useCallback((error: unknown): HookErrorState => {
    if (error instanceof ApiError) {
      return {
        hasError: true,
        errorType: getErrorType(error),
        severity: ErrorHandler.getErrorSeverity(error),
        canRetry: ErrorHandler.canRetry(error),
        userMessage: getUserFriendlyMessage(error),
        developerMessage: process.env.NODE_ENV === 'development' ? error.message : undefined,
        errorCode: error.code || 'unknown',
        requestId: extractRequestId(error) || undefined,
      };
    }

    // 处理普通错误
    return {
      hasError: true,
      errorType: 'unknown',
      severity: 'medium',
      canRetry: true,
      userMessage: '操作失败，请稍后重试',
      developerMessage: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined,
    };
  }, []);

  /**
   * 创建业务逻辑错误状态
   * @param message 错误消息
   */
  const createBusinessErrorState = useCallback((message: string): HookErrorState => {
    return {
      hasError: true,
      errorType: 'business',
      severity: 'medium',
      canRetry: false,
      userMessage: message,
      developerMessage: process.env.NODE_ENV === 'development' ? 'Business logic validation failed' : undefined,
    };
  }, []);

  /**
   * 获取错误类型
   * @param error API错误
   */
  const getErrorType = (error: ApiError): HookErrorState['errorType'] => {
    if (error.code === 0) return 'network';
    if (error.code === 401) return 'auth';
    if (error.code === 400 || error.code === 422) return 'validation';
    if (error.code >= 400 && error.code < 500) return 'business';
    return 'unknown';
  };

  /**
   * 获取用户友好的错误消息
   * @param error API错误
   */
  const getUserFriendlyMessage = (error: ApiError): string => {
    // 网络错误
    if (error.code === 0) {
      return '网络连接失败，请检查网络后重试';
    }
    
    // 认证错误
    if (error.code === 401) {
      return '登录已过期，请重新登录';
    }
    
    // 权限错误
    if (error.code === 403) {
      return '权限不足，无法执行此操作';
    }
    
    // 资源不存在
    if (error.code === 404) {
      return '请求的内容不存在';
    }
    
    // 服务器错误
    if (error.code >= 500) {
      return '服务暂时不可用，请稍后重试';
    }
    
    // 使用原始消息或默认消息
    return error.message || '操作失败，请稍后重试';
  };

  /**
   * 从错误中提取请求ID
   * @param error API错误
   */
  const extractRequestId = (error: ApiError): string | undefined => {
    // 可以从错误详情中提取请求ID
    return error.details?.find((detail: any) => detail.requestId)?.requestId;
  };

  const retry = useCallback(() => {
    executeApiCall(false);
  }, [executeApiCall]);

  const manualSetData = useCallback((newData: T | null) => {
    setData(newData);
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (immediate) {
      executeApiCall(false);
    }

    return () => {
      // 清理资源
      if (cancelOnUnmount && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    errorState,
    rawError: process.env.NODE_ENV === 'development' ? rawError : null,
    retry,
    clearError,
    setData: manualSetData,
    isFirstLoad,
  };
}

/**
 * 分页API调用Hook
 * @param apiCall 分页API调用函数
 * @param options 选项
 * @returns 分页API状态和控制函数
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ items: T[]; total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>,
  options: UseApiOptions & { initialPage?: number; initialLimit?: number } = {}
) {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const apiState = useApi(
    () => apiCall(page, limit),
    {
      ...apiOptions,
      deps: [page, limit, ...(apiOptions.deps || [])],
      onSuccess: (data) => {
        if (page === 1) {
          setAllItems(data.items);
        } else {
          setAllItems(prev => [...prev, ...data.items]);
        }
        setIsLoadingMore(false);
        apiOptions.onSuccess?.(data);
      },
      onError: (errorState, rawError) => {
        setIsLoadingMore(false);
        apiOptions.onError?.(errorState, rawError);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (apiState.data?.hasNext && !apiState.loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [apiState.data?.hasNext, apiState.loading, isLoadingMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllItems([]);
    apiState.retry();
  }, [apiState]);

  const changePageSize = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setAllItems([]);
  }, []);

  return {
    ...apiState,
    items: allItems,
    page,
    limit,
    isLoadingMore,
    loadMore,
    refresh,
    changePageSize,
    hasMore: apiState.data?.hasNext || false,
    total: apiState.data?.total || 0,
    totalPages: apiState.data?.totalPages || 0,
  };
}

/**
 * 搜索API调用Hook
 * @param searchFn 搜索函数
 * @param options 选项
 * @returns 搜索状态和控制函数
 */
export function useSearch<T>(
  searchFn: (query: string) => Promise<T>,
  options: UseApiOptions & { debounceMs?: number; minQueryLength?: number } = {}
) {
  const { debounceMs = 300, minQueryLength = 1, ...apiOptions } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const apiState = useApi(
    () => searchFn(debouncedQuery),
    {
      ...apiOptions,
      immediate: false,
      deps: [debouncedQuery, ...(apiOptions.deps || [])],
    }
  );

  // 当查询条件满足时自动搜索
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      apiState.retry();
    } else {
      apiState.setData(null);
    }
  }, [debouncedQuery, minQueryLength]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    apiState.setData(null);
    apiState.clearError();
  }, [apiState]);

  return {
    ...apiState,
    query,
    debouncedQuery,
    search,
    clearSearch,
    isSearching: apiState.loading && debouncedQuery.length >= minQueryLength,
  };
}

/**
 * 无限滚动Hook
 * @param loadMore 加载更多函数
 * @param hasMore 是否还有更多数据
 * @param options 选项
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const { threshold = 0.1,} = options;
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= (1 - threshold)) {
        setIsFetching(true);
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetching, loadMore, threshold]);

  useEffect(() => {
    if (isFetching) {
      setIsFetching(false);
    }
  }, [isFetching]);

  return { isFetching };
}