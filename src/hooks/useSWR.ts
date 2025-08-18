'use client'

import useSWR, { SWRConfiguration, mutate } from 'swr'
import { useState, useCallback, useEffect } from 'react'
import { ApiErrorType } from '@/types'
import { handleGlobalError } from '@/lib/error-handler'

/**
 * 错误处理状态
 */
export interface ErrorState {
	/** 是否有错误 */
	hasError: boolean
	/** 错误类型 */
	errorType: 'network' | 'http' | 'business' | 'validation' | 'auth' | 'unknown'
	/** 是否可重试 */
	canRetry: boolean
	/** 用户友好的错误消息 */
	userMessage: string
	/** 开发者错误信息 */
	developerMessage?: string
	/** 错误代码 */
	errorCode?: string
}

/**
 * 获取错误类型
 */
function getErrorType(error: unknown): ErrorState['errorType'] {
	if (error instanceof ApiErrorType) {
		if (error.code === 0) return 'network'
		if (error.code === 401) return 'auth'
		if (error.code === 400 || error.code === 422) return 'validation'
		if (error.code >= 400 && error.code < 500) return 'business'
		return 'http'
	}
	return 'unknown'
}

/**
 * 判断错误是否可以重试
 */
function canRetryError(error: unknown): boolean {
	if (error instanceof ApiErrorType) {
		return error.isServerError() || error.code === 0
	}
	if (error instanceof Error) {
		return (
			error.message.includes('fetch') ||
			error.message.includes('network') ||
			error.message.includes('timeout')
		)
	}
	return false
}

/**
 * 获取用户友好的错误消息
 */
function getUserFriendlyMessage(error: unknown): string {
	if (error instanceof ApiErrorType) {
		// 网络错误
		if (error.code === 0) {
			return '网络连接失败，请检查网络后重试'
		}

		// 认证错误
		if (error.code === 401) {
			return '登录已过期，请重新登录'
		}

		// 权限错误
		if (error.code === 403) {
			return '权限不足，无法执行此操作'
		}

		// 资源不存在
		if (error.code === 404) {
			return '请求的内容不存在'
		}

		// 服务器错误
		if (error.code >= 500) {
			return '服务暂时不可用，请稍后重试'
		}

		// 使用原始消息或默认消息
		return error.message || '操作失败，请稍后重试'
	}

	return '操作失败，请稍后重试'
}

/**
 * 处理错误，转换为错误状态
 */
function processError(error: unknown): ErrorState {
	const errorState: ErrorState = {
		hasError: true,
		errorType: getErrorType(error),
		canRetry: canRetryError(error),
		userMessage: getUserFriendlyMessage(error),
		developerMessage:
			process.env.NODE_ENV === 'development'
				? (error as Error)?.message
				: undefined,
	}

	if (error instanceof ApiErrorType) {
		errorState.errorCode =
			typeof error.code === 'string'
				? error.code
				: error.code?.toString() || 'unknown'
	}

	return errorState
}

/**
 * SWR配置选项
 */
export interface UseSWROptions<T> extends Omit<SWRConfiguration<T>, 'fetcher'> {
	/** 错误回调 */
	onError?: (errorState: ErrorState, rawError: unknown) => void
	/** 成功回调 */
	onSuccess?: (data: T) => void
	/** 业务逻辑验证函数 */
	validateData?: (data: T) => string | null
}

/**
 * 基础SWR Hook
 */
export function useApiSWR<T>(
	key: string | null,
	fetcher: () => Promise<T>,
	options: UseSWROptions<T> = {},
) {
	const { onError, onSuccess, validateData, ...swrOptions } = options
	const [errorState, setErrorState] = useState<ErrorState | null>(null)

	const swrResult = useSWR(
		key,
		async () => {
			try {
				const data = await fetcher()

				// 业务逻辑验证
				if (validateData) {
					const validationResult = validateData(data)
					if (validationResult) {
						const businessError = new Error(validationResult)
						const businessErrorState: ErrorState = {
							hasError: true,
							errorType: 'business',
							canRetry: false,
							userMessage: validationResult,
							developerMessage:
								process.env.NODE_ENV === 'development'
									? 'Business logic validation failed'
									: undefined,
						}
						setErrorState(businessErrorState)
						onError?.(businessErrorState, businessError)
						throw businessError
					}
				}

				setErrorState(null)
				onSuccess?.(data)
				return data
			} catch (error) {
				const processedError = processError(error)
				setErrorState(processedError)

				// 全局错误处理
				handleGlobalError(error, 'useApiSWR')

				onError?.(processedError, error)
				throw error
			}
		},
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			...swrOptions,
		},
	)

	const clearError = useCallback(() => {
		setErrorState(null)
	}, [])

	return {
		data: swrResult.data,
		loading: swrResult.isLoading,
		error: swrResult.error,
		errorState:
			errorState || (swrResult.error ? processError(swrResult.error) : null),
		mutate: swrResult.mutate,
		retry: () => swrResult.mutate(),
		clearError,
		isValidating: swrResult.isValidating,
	}
}

/**
 * 分页SWR Hook
 */
export function usePaginatedSWR<T>(
	baseKey: string,
	fetcher: (
		page: number,
		limit: number,
	) => Promise<{
		items: T[]
		total: number
		page: number
		limit: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}>,
	page: number,
	limit: number,
	options: UseSWROptions<{
		items: T[]
		total: number
		page: number
		limit: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}> = {},
) {
	const key = `${baseKey}?page=${page}&limit=${limit}`

	return useApiSWR(key, () => fetcher(page, limit), options)
}

/**
 * 搜索SWR Hook（带防抖）
 */
export function useSearchSWR<T>(
	baseKey: string,
	searchFn: (query: string) => Promise<T>,
	query: string,
	options: UseSWROptions<T> & {
		debounceMs?: number
		minQueryLength?: number
	} = {},
) {
	const { debounceMs = 300, minQueryLength = 1, ...swrOptions } = options
	const [debouncedQuery, setDebouncedQuery] = useState(query)

	// 防抖处理
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query)
		}, debounceMs)

		return () => clearTimeout(timer)
	}, [query, debounceMs])

	const shouldFetch = debouncedQuery.length >= minQueryLength
	const key = shouldFetch
		? `${baseKey}?q=${encodeURIComponent(debouncedQuery)}`
		: null

	return useApiSWR(key, () => searchFn(debouncedQuery), swrOptions)
}

/**
 * 手动触发数据更新
 */
export function mutateApiData(key: string, data?: unknown) {
	return mutate(key, data)
}
