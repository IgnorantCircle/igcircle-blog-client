import { ApiResponse, ErrorResponse, ApiError } from '@/types';
import { getAuthToken } from '@/lib/store';

const API_BASE_URL = process.env.SERVER_API_URL || 'http://localhost:5001/api';

/**
 * HTTP错误上下文接口
 */
interface HttpErrorContext {
  /** 请求端点 */
  endpoint: string;
  /** HTTP方法 */
  method: string;
  /** 请求ID */
  requestId: string;
  /** HTTP状态码 */
  status?: number;
}

/**
 * 基础API客户端类
 * HTTP客户端层：统一处理网络错误、状态码错误
 */
export class BaseApiClient {
  /**
   * 统一的HTTP请求方法
   * HTTP客户端层：统一处理网络错误、状态码错误
   * @param endpoint API端点
   * @param options 请求选项
   * @returns Promise<T>
   */
  protected async request<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    const requestId = this.generateRequestId();
    const method = options?.method || 'GET';
    
    const context: HttpErrorContext = {
      endpoint,
      method,
      requestId,
      status: 0, // 初始化 status 属性
    };

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      });

      context.status = response.status;

      // HTTP客户端层：统一处理状态码错误
      if (!response.ok) {
        return this.handleHttpError(response, context, endpoint);
      }

      const responseData = await response.json();

      // 处理成功响应
      if (this.isApiResponse(responseData)) {
        return responseData.data as T;
      }

      // 如果不是标准API响应格式，直接返回数据
      return responseData as T;
    } catch (error: unknown) {
      // HTTP客户端层：统一处理网络错误
      return this.handleNetworkError(error, context);
    }
  }

  /**
   * 处理HTTP状态码错误
   * @param response 响应对象
   * @param context 错误上下文
   * @param endpoint API端点
   */
  private async handleHttpError<T>(response: Response, context: HttpErrorContext, endpoint: string): Promise<T> {
    let responseData: { 
      message?: string; 
      error?: string; 
      details?: Record<string, unknown>[];
      timestamp?: string;
      path?: string;
    };
    try {
      responseData = await response.json();
    } catch {
      responseData = { message: response.statusText };
    }

    const errorResponse: ErrorResponse = {
      code: response.status,
      message: this.getHttpErrorMessage(response.status, responseData.message),
      error: responseData.error || this.getHttpErrorType(response.status),
      details: responseData.details,
      timestamp: responseData.timestamp || new Date().toISOString(),
      path: responseData.path || endpoint,
    };

    // 记录HTTP错误
    this.logHttpError(errorResponse, context);
    throw new ApiError(errorResponse);
  }

  /**
   * 处理网络错误
   * @param error 原始错误
   * @param context 错误上下文
   */
  private handleNetworkError<T>(error: unknown, context: HttpErrorContext): Promise<T> {
    if (error instanceof ApiError) {
      throw error;
    }

    let errorResponse: ErrorResponse;

    // 网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorResponse = {
        code: 0,
        message: '网络连接失败，请检查网络设置',
        error: 'NetworkError',
        timestamp: new Date().toISOString(),
        path: context.endpoint,
      };
    }
    // 请求超时
    else if (error instanceof Error && error.name === 'AbortError') {
      errorResponse = {
        code: 0,
        message: '请求超时，请稍后重试',
        error: 'TimeoutError',
        timestamp: new Date().toISOString(),
        path: context.endpoint,
      };
    }
    // 其他未知错误
    else {
      errorResponse = {
        code: 500,
        message: error instanceof Error ? error.message : '未知网络错误',
        error: 'UnknownError',
        timestamp: new Date().toISOString(),
        path: context.endpoint,
      };
    }

    // 记录网络错误
    this.logNetworkError(errorResponse, context, error);
    throw new ApiError(errorResponse);
  }

  /**
   * 获取HTTP错误消息
   * @param status HTTP状态码
   * @param originalMessage 原始错误消息
   */
  private getHttpErrorMessage(status: number, originalMessage?: string): string {
    if (originalMessage) return originalMessage;

    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '权限不足',
      404: '请求的资源不存在',
      409: '资源冲突',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后重试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时',
    };

    return statusMessages[status] || `HTTP错误 ${status}`;
  }

  /**
   * 获取HTTP错误类型
   * @param status HTTP状态码
   */
  private getHttpErrorType(status: number): string {
    if (status >= 400 && status < 500) return 'ClientError';
    if (status >= 500) return 'ServerError';
    return 'HttpError';
  }

  /**
   * 记录HTTP错误
   * @param error 错误响应
   * @param context 错误上下文
   */
  private logHttpError(error: ErrorResponse, context: HttpErrorContext): void {
    console.error('[HTTP Client] HTTP Error:', {
      requestId: context.requestId,
      method: context.method,
      endpoint: context.endpoint,
      status: context.status,
      error: error.error,
      message: error.message,
      timestamp: error.timestamp,
    });
  }

  /**
   * 记录网络错误
   * @param error 错误响应
   * @param context 错误上下文
   * @param originalError 原始错误
   */
  private logNetworkError(error: ErrorResponse, context: HttpErrorContext, originalError: unknown): void {
    console.error('[HTTP Client] Network Error:', {
      requestId: context.requestId,
      method: context.method,
      endpoint: context.endpoint,
      error: error.error,
      message: error.message,
      originalError: originalError instanceof Error ? originalError.message : originalError,
      timestamp: error.timestamp,
    });
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GET请求
   */
  protected async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST请求
   */
  protected async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  protected async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  protected async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 判断是否为标准API响应格式
   * @param data 响应数据
   * @returns boolean
   */
  private isApiResponse(data: unknown): data is ApiResponse {
    return (
      data !== null &&
      typeof data === 'object' &&
      'code' in data &&
      'message' in data &&
      'timestamp' in data &&
      'path' in data
    );
  }
}