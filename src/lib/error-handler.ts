import { useToast } from '@/hooks/useToast'
import { ApiErrorType } from '@/types'

// 全局toast实例
let globalToast: ReturnType<typeof useToast> | null = null

// 设置全局toast实例
export const setGlobalToast = (toast: ReturnType<typeof useToast>) => {
	globalToast = toast
}

// 获取全局toast实例
export const getGlobalToast = () => globalToast

/**
 * 全局错误处理器类型
 */
type GlobalErrorHandler = (error: unknown, context?: string) => void

// 全局错误处理器
let globalErrorHandler: GlobalErrorHandler | null = null

/**
 * 设置全局错误处理器
 */
export const setGlobalErrorHandler = (handler: GlobalErrorHandler) => {
	globalErrorHandler = handler
}

/**
 * 统一错误捕获函数 - 替代try-catch
 * @param fn 要执行的函数
 * @param context 错误上下文
 * @returns Promise结果或错误
 */
export async function safeExecute<T>(
	fn: () => Promise<T> | T,
	context?: string,
): Promise<T | null> {
	const result = await Promise.resolve(fn()).catch((error) => {
		handleGlobalError(error, context)
		return null
	})
	return result
}

/**
 * 同步函数的安全执行
 * @param fn 要执行的同步函数
 * @param context 错误上下文
 * @returns 函数结果或null
 */
export function safeExecuteSync<T>(fn: () => T, context?: string): T | null {
	try {
		return fn()
	} catch (error) {
		handleGlobalError(error, context)
		return null
	}
}

/**
 * 全局错误处理函数
 * @param error 错误对象
 * @param context 错误上下文
 */
export function handleGlobalError(error: unknown, context?: string): void {
	// 如果有自定义全局错误处理器，优先使用
	if (globalErrorHandler) {
		globalErrorHandler(error, context)
		return
	}

	// 默认使用showError处理
	showError(error, context)
}

/**
 * Promise错误包装器 - 自动处理Promise错误
 * @param promise Promise对象
 * @param context 错误上下文
 * @returns 包装后的Promise
 */
export function wrapPromise<T>(
	promise: Promise<T>,
	context?: string,
): Promise<T | null> {
	return promise.catch((error) => {
		handleGlobalError(error, context)
		return null
	})
}

/**
 * 初始化全局错误监听器
 */
export function initGlobalErrorHandlers(): void {
	// 监听未捕获的Promise错误
	if (typeof window !== 'undefined') {
		window.addEventListener('unhandledrejection', (event) => {
			console.error('未处理的Promise拒绝:', event.reason)
			handleGlobalError(event.reason, 'unhandledrejection')
			event.preventDefault() // 阻止默认的错误处理
		})

		// 监听全局JavaScript错误
		window.addEventListener('error', (event) => {
			console.error('全局JavaScript错误:', event.error)
			handleGlobalError(event.error || event.message, 'globalError')
		})

		// 捕获资源加载错误
		window.addEventListener(
			'error',
			(event) => {
				if (event.target !== window) {
					console.error('资源加载错误:', {
						source: event.target,
						message: event.message || '资源加载失败',
					})
				}
			},
			true,
		)
	}
}

/**
 * 格式化错误信息
 * @param error 错误对象
 * @returns 格式化的错误信息
 */
function formatErrorMessage(error: unknown): string {
	if (error instanceof ApiErrorType) {
		// 根据错误类型返回不同的提示信息
		if (error.isNotFound()) {
			return '请求的资源不存在'
		}
		if (error.isUnauthorized()) {
			return '请先登录后再进行操作'
		}
		if (error.isForbidden()) {
			return '您没有权限进行此操作'
		}
		if (error.isConflict()) {
			return '操作冲突，请刷新页面后重试'
		}
		if (error.isValidationError()) {
			if (error.details && error.details.length > 0) {
				return `请求信息有误：${error.details.join('，')}`
			}
			return '验证失败，请检查输入信息'
		}
		if (error.isServerError()) {
			return '服务器内部错误，请稍后重试'
		}
		return error.message || '操作失败，请稍后重试'
	}
	return '未知错误，请稍后重试'
}

/**
 * 显示错误提示
 * @param error 错误对象
 * @param context 错误上下文（可选）
 */
export function showError(error: unknown, context?: string): void {
	const message = formatErrorMessage(error)

	// 开发环境下记录详细错误信息
	if (process.env.NODE_ENV === 'development') {
		const contextInfo = context ? ` [${context}]` : ''
		console.error(`🚨 错误${contextInfo}:`, error)
	}

	// 处理401未授权错误 - 自动退出登录
	if (error instanceof ApiErrorType && error.isUnauthorized()) {
		// 异步处理退出登录，避免循环依赖
		setTimeout(async () => {
			try {
				// 动态导入避免循环依赖
				const { useAuthStore } = await import('@/lib/store')
				const { logout } = useAuthStore.getState()

				// 执行退出登录
				await logout()

				// 显示退出登录提示
				if (globalToast) {
					globalToast.warning('登录已过期，请重新登录')
				}

				// 跳转到登录页面
				if (typeof window !== 'undefined') {
					const { useRouter } = await import('next/navigation')
					// 延迟跳转，确保toast显示
					setTimeout(() => {
						window.location.href = '/login'
					}, 1000)
				}
			} catch (logoutError) {
				console.error('自动退出登录失败:', logoutError)
				// 即使退出登录失败，也要清除本地状态
				if (typeof window !== 'undefined') {
					localStorage.removeItem('accessToken')
					localStorage.removeItem('remember_me')
					sessionStorage.removeItem('accessToken')
					window.location.href = '/login'
				}
			}
		}, 0)

		// 对于401错误，不显示原始错误消息，而是显示友好提示
		return
	}

	// 显示toast提示
	if (globalToast) {
		globalToast.error(message)
	} else {
		// Toast未初始化时，仅在开发环境显示警告
		if (process.env.NODE_ENV === 'development') {
			console.warn('Toast未初始化，错误信息:', message)
		}
	}
}

/**
 * 显示成功提示
 * @param message 成功信息
 */
export function showSuccess(message: string): void {
	if (globalToast) {
		globalToast.success(message)
	} else {
		console.log('成功:', message)
	}
}

/**
 * 显示警告提示
 * @param message 警告信息
 */
export function showWarning(message: string): void {
	if (globalToast) {
		globalToast.warning(message)
	} else {
		console.warn('警告:', message)
	}
}

/**
 * 显示信息提示
 * @param message 信息内容
 */
export function showInfo(message: string): void {
	if (globalToast) {
		globalToast.info(message)
	} else {
		console.info('信息:', message)
	}
}

// 所有主要的错误处理函数已在上面定义时导出
