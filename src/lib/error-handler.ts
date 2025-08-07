import { ApiError } from '@/types';

/**
 * 全局错误处理工具类
 */
export class ErrorHandler {
  /**
   * 处理API错误
   * @param error 错误对象
   * @returns 格式化的错误信息
   */
  static handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
      return this.formatApiError(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return '未知错误，请稍后重试';
  }

  /**
   * 格式化API错误信息
   * @param error API错误对象
   * @returns 格式化的错误信息
   */
  private static formatApiError(error: ApiError): string {
    // 根据错误类型返回不同的提示信息
    if (error.isNotFound()) {
      return '请求的资源不存在';
    }

    if (error.isUnauthorized()) {
      return '请先登录后再进行操作';
    }

    if (error.isForbidden()) {
      return '您没有权限进行此操作';
    }

    if (error.isConflict()) {
      return '操作冲突，请刷新页面后重试';
    }

    if (error.isValidationError()) {
      // 处理验证错误，显示详细的验证信息
      if (error.details && error.details.length > 0) {
        return `参数验证失败：${error.details.join('，')}`;
      }
      return '参数验证失败，请检查输入信息';
    }

    if (error.isServerError()) {
      return '服务器内部错误，请稍后重试';
    }

    // 返回原始错误信息
    return error.message || '操作失败，请稍后重试';
  }

  /**
   * 记录错误日志
   * @param error 错误对象
   * @param context 错误上下文
   */
  static logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';

    if (error instanceof ApiError) {
      console.error(
        `${timestamp}${contextInfo} API Error:`,
        {
          code: error.code,
          message: error.message,
          error: error.error,
          details: error.details,
          path: error.path,
          timestamp: error.timestamp,
        }
      );
    } else if (error instanceof Error) {
      console.error(
        `${timestamp}${contextInfo} Error:`,
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      );
    } else {
      console.error(
        `${timestamp}${contextInfo} Unknown Error:`,
        error
      );
    }
  }

  /**
   * 显示错误通知（可以集成到UI组件中）
   * @param error 错误对象
   * @param context 错误上下文
   */
  static showError(error: unknown, context?: string): void {
    const message = this.handleApiError(error);
    this.logError(error, context);

    // 这里可以集成到具体的通知组件中
    // 例如：toast.error(message)
    console.warn('Error notification:', message);
  }

  /**
   * 判断错误是否需要重试
   * @param error 错误对象
   * @returns 是否可以重试
   */
  static canRetry(error: unknown): boolean {
    if (error instanceof ApiError) {
      // 服务器错误和网络错误可以重试
      return error.isServerError() || error.code === 0;
    }

    // 网络错误可以重试
    if (error instanceof Error) {
      return error.message.includes('fetch') || 
             error.message.includes('network') ||
             error.message.includes('timeout');
    }

    return false;
  }

  /**
   * 获取错误的严重程度
   * @param error 错误对象
   * @returns 错误严重程度
   */
  static getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof ApiError) {
      if (error.isServerError()) {
        return 'critical';
      }
      if (error.isUnauthorized() || error.isForbidden()) {
        return 'high';
      }
      if (error.isNotFound() || error.isConflict()) {
        return 'medium';
      }
      if (error.isBadRequest() || error.isValidationError()) {
        return 'low';
      }
    }

    return 'medium';
  }
}

/**
 * 错误重试工具
 */
export class RetryHandler {
  /**
   * 带重试的异步函数执行
   * @param fn 要执行的异步函数
   * @param maxRetries 最大重试次数
   * @param delay 重试延迟（毫秒）
   * @returns Promise结果
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // 如果是最后一次尝试或错误不可重试，直接抛出错误
        if (attempt === maxRetries || !ErrorHandler.canRetry(error)) {
          throw error;
        }

        // 等待后重试
        await this.sleep(delay * Math.pow(2, attempt)); // 指数退避
      }
    }

    throw lastError;
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}