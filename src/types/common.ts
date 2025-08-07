// 通用类型定义

/**
 * API响应类型定义
 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;
  /** 时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
}

/**
 * 分页响应数据格式接口
 */
export interface PaginatedResponse<T = unknown> {
  /** 数据列表 */
  items: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * 错误响应数据格式接口
 */
export interface ErrorResponse {
  /** 错误状态码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  error?: string;
  /** 验证错误详情 */
  details?: Record<string, unknown>[];
  /** 时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
}

/**
 * API错误类
 */
export class ApiError extends Error {
  public readonly code: number;
  public readonly error?: string;
  public readonly details?: Record<string, unknown>[];
  public readonly timestamp: string;
  public readonly path: string;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.code = errorResponse.code;
    this.error = errorResponse.error;
    this.details = errorResponse.details;
    this.timestamp = errorResponse.timestamp;
    this.path = errorResponse.path;
  }

  isNotFound(): boolean {
    return this.code === 404;
  }

  isBadRequest(): boolean {
    return this.code === 400;
  }

  isUnauthorized(): boolean {
    return this.code === 401;
  }

  isForbidden(): boolean {
    return this.code === 403;
  }

  isConflict(): boolean {
    return this.code === 409;
  }

  isServerError(): boolean {
    return this.code >= 500;
  }

  isValidationError(): boolean {
    return this.code === 422;
  }
}