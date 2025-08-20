import { ApiResponseType, ErrorResponseType, ApiErrorType } from '@/types'
import { handleGlobalError } from '@/lib/error-handler'

// 服务器端安全的认证令牌获取函数
function getAuthTokenSafe(): string | null {
	// 在服务器端返回 null，避免调用客户端函数
	if (typeof window === 'undefined') {
		return null
	}

	// 优先从 localStorage 获取令牌（记住登录的情况）
	// 如果没有，再从 sessionStorage 获取令牌（不记住登录的情况）
	try {
		const localToken = localStorage.getItem('accessToken')
		if (localToken) return localToken

		// 如果localStorage没有，从sessionStorage获取（不记住登录的情况）
		return sessionStorage.getItem('accessToken')
	} catch (error) {
		console.error('获取认证token失败:', error)
		return null
	}
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
/**
 * HTTP错误上下文接口
 */
interface HttpErrorContext {
	/** 请求端点 */
	endpoint: string
	/** HTTP方法 */
	method: string
	/** 请求ID */
	requestId: string
	/** HTTP状态码 */
	status?: number
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
	 * @returns Promise<T | null>
	 */
	protected async request<T = unknown>(
		endpoint: string,
		options?: RequestInit,
	): Promise<T | null> {
		const url = `${API_BASE_URL}${endpoint}`
		const token = getAuthTokenSafe()
		const requestId = this.generateRequestId()
		const method = options?.method || 'GET'

		const context: HttpErrorContext = {
			endpoint,
			method,
			requestId,
			status: 0, // 初始化 status 属性
		}

		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					'X-Request-ID': requestId,
					...(token && { Authorization: `Bearer ${token}` }),
					...options?.headers,
				},
				...options,
				// 每60秒重新验证一次数据
				next: { revalidate: 60 },
			})

			context.status = response.status

			// HTTP客户端层：统一处理状态码错误
			if (!response.ok) {
				return this.handleHttpError(response, context, endpoint)
			}

			const responseData = await response.json()

			// 处理成功响应
			if (this.isApiResponse(responseData)) {
				return responseData.data as T
			}

			// 如果不是标准API响应格式，直接返回数据
			return responseData as T
		} catch (error) {
			// 使用全局错误处理器处理网络错误
			handleGlobalError(error, `${method} ${endpoint}`)
			return null
		}
	}

	/**
	 * 处理HTTP状态码错误
	 * @param response 响应对象
	 * @param context 错误上下文
	 * @param endpoint API端点
	 */
	private async handleHttpError<T>(
		response: Response,
		context: HttpErrorContext,
		endpoint: string,
	): Promise<never> {
		// 移除try-catch，使用Promise.resolve处理可能的JSON解析错误
		const responseData = await Promise.resolve(response.json()).catch(() => ({
			message: response.statusText,
		}))

		const errorResponse: ErrorResponseType = {
			code: response.status,
			message: this.getHttpErrorMessage(response.status, responseData.message),
			error: responseData.error || this.getHttpErrorType(response.status),
			details: responseData.details,
			timestamp: responseData.timestamp || new Date().toISOString(),
			path: responseData.path || endpoint,
		}

		// 记录HTTP错误
		this.logHttpError(errorResponse, context)

		// 抛出ApiErrorType，让全局错误处理器处理
		throw new ApiErrorType(errorResponse)
	}

	/**
	 * 处理网络错误
	 * @param error 原始错误
	 * @param context 错误上下文
	 */
	private handleNetworkError<T>(
		error: unknown,
		context: HttpErrorContext,
	): never {
		if (error instanceof ApiErrorType) {
			throw error
		}

		let errorResponse: ErrorResponseType

		// 网络连接错误
		if (error instanceof TypeError && error.message.includes('fetch')) {
			errorResponse = {
				code: 0,
				message: '网络连接失败，请检查网络设置',
				error: 'NetworkError',
				timestamp: new Date().toISOString(),
				path: context.endpoint,
			}
		}
		// 请求超时
		else if (error instanceof Error && error.name === 'AbortError') {
			errorResponse = {
				code: 0,
				message: '请求超时，请稍后重试',
				error: 'TimeoutError',
				timestamp: new Date().toISOString(),
				path: context.endpoint,
			}
		}
		// 其他未知错误
		else {
			errorResponse = {
				code: 500,
				message: error instanceof Error ? error.message : '未知网络错误',
				error: 'UnknownError',
				timestamp: new Date().toISOString(),
				path: context.endpoint,
			}
		}

		// 记录网络错误
		this.logNetworkError(errorResponse, context, error)

		// 抛出ApiErrorType，让全局错误处理器处理
		throw new ApiErrorType(errorResponse)
	}

	/**
	 * 获取HTTP错误消息
	 * @param status HTTP状态码
	 * @param originalMessage 原始错误消息
	 */
	private getHttpErrorMessage(
		status: number,
		originalMessage?: string,
	): string {
		if (originalMessage) return originalMessage

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
		}

		return statusMessages[status] || `HTTP错误 ${status}`
	}

	/**
	 * 获取HTTP错误类型
	 * @param status HTTP状态码
	 */
	private getHttpErrorType(status: number): string {
		if (status >= 400 && status < 500) return 'ClientError'
		if (status >= 500) return 'ServerError'
		return 'HttpError'
	}

	/**
	 * 记录HTTP错误
	 * @param error 错误响应
	 * @param context 错误上下文
	 */
	private logHttpError(
		error: ErrorResponseType,
		context: HttpErrorContext,
	): void {
		console.error('[HTTP Client] HTTP Error:', {
			requestId: context.requestId,
			method: context.method,
			endpoint: context.endpoint,
			status: context.status,
			error: error.error,
			message: error.message,
			timestamp: error.timestamp,
		})
	}

	/**
	 * 记录网络错误
	 * @param error 错误响应
	 * @param context 错误上下文
	 * @param originalError 原始错误
	 */
	private logNetworkError(
		error: ErrorResponseType,
		context: HttpErrorContext,
		originalError: unknown,
	): void {
		console.log('[HTTP Client] Network Error:', {
			requestId: context.requestId,
			method: context.method,
			endpoint: context.endpoint,
			error: error.error,
			message: error.message,
			originalError:
				originalError instanceof Error ? originalError.message : originalError,
			timestamp: error.timestamp,
		})
	}

	/**
	 * 生成请求ID
	 */
	private generateRequestId(): string {
		return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	}

	/**
	 * GET请求
	 */
	protected async get<T>(
		endpoint: string,
		options?: RequestInit,
	): Promise<T | null> {
		return this.request<T>(endpoint, { ...options, method: 'GET' })
	}

	/**
	 * POST请求
	 */
	protected async post<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T | null> {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * PUT请求
	 */
	protected async put<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T | null> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * DELETE请求
	 */
	protected async delete<T>(
		endpoint: string,
		options?: RequestInit,
	): Promise<T | null> {
		return this.request<T>(endpoint, { ...options, method: 'DELETE' })
	}

	/**
	 * 判断是否为标准API响应格式
	 * @param data 响应数据
	 * @returns boolean
	 */
	private isApiResponse(data: unknown): data is ApiResponseType {
		return (
			data !== null &&
			typeof data === 'object' &&
			'code' in data &&
			'message' in data &&
			'timestamp' in data &&
			'path' in data
		)
	}
}
