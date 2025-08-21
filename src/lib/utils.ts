import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(
	date: string | Date | number,
	options?: Intl.DateTimeFormatOptions,
): string {
	let dateObj: Date

	if (typeof date === 'string') {
		// 检查是否为纯数字字符串（时间戳）
		if (/^\d+$/.test(date)) {
			const timestamp = parseInt(date, 10)
			dateObj = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
		} else {
			dateObj = new Date(date)
		}
	} else if (typeof date === 'number') {
		// 处理时间戳，支持秒级和毫秒级时间戳
		dateObj = new Date(date < 10000000000 ? date * 1000 : date)
	} else {
		return '-'
	}

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}

	return dateObj.toLocaleDateString('zh-CN', { ...defaultOptions, ...options })
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date | number): string {
	let dateObj: Date

	if (typeof date === 'string') {
		// 检查是否为纯数字字符串（时间戳）
		if (/^\d+$/.test(date)) {
			const timestamp = parseInt(date, 10)
			dateObj = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
		} else {
			dateObj = new Date(date)
		}
	} else if (typeof date === 'number') {
		// 处理时间戳，支持秒级和毫秒级时间戳
		dateObj = new Date(date < 10000000000 ? date * 1000 : date)
	} else {
		dateObj = date
	}

	const now = new Date()
	const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

	if (diffInSeconds < 60) {
		return '刚刚'
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60)
	if (diffInMinutes < 60) {
		return `${diffInMinutes}分钟前`
	}

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) {
		return `${diffInHours}小时前`
	}

	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays < 7) {
		return `${diffInDays}天前`
	}

	if (diffInDays < 30) {
		const diffInWeeks = Math.floor(diffInDays / 7)
		return `${diffInWeeks}周前`
	}

	if (diffInDays < 365) {
		const diffInMonths = Math.floor(diffInDays / 30)
		return `${diffInMonths}个月前`
	}

	const diffInYears = Math.floor(diffInDays / 365)
	return `${diffInYears}年前`
}

// 格式化阅读时间
export function formatReadingTime(minutes: number): string {
	if (minutes < 1) {
		return '5分钟阅读'
	}
	return `${Math.ceil(minutes)}分钟阅读`
}

// 格式化数字（如浏览量、点赞数等）
export function formatNumber(num: number): string {
	if (num < 1000) {
		return num.toString()
	}

	if (num < 10000) {
		return `${(num / 1000).toFixed(1)}k`
	}

	if (num < 100000) {
		return `${Math.floor(num / 1000)}k`
	}

	return `${(num / 10000).toFixed(1)}w`
}

// 截取文本
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text
	}
	return text.slice(0, maxLength) + '...'
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout

	return (...args: Parameters<T>) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => func(...args), wait)
	}
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle: boolean
	return function (this: unknown, ...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args)
			inThrottle = true
			setTimeout(() => (inThrottle = false), limit)
		}
	}
}

/**
 * 查询参数值类型
 */
export type QueryParamValue =
	| string
	| number
	| boolean
	| string[]
	| undefined
	| null

/**
 * 构建查询字符串的工具函数
 * @param params 查询参数对象
 * @returns 格式化的查询字符串
 */
export function buildQueryString(
	params: Record<string, QueryParamValue>,
): string {
	const searchParams = new URLSearchParams()

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return

		if (Array.isArray(value)) {
			// 处理数组参数
			value.forEach((item) => {
				if (item !== undefined && item !== null) {
					searchParams.append(key, String(item))
				}
			})
		} else {
			// 处理普通参数
			searchParams.append(key, String(value))
		}
	})

	return searchParams.toString()
}

/**
 * 构建带查询参数的端点URL
 * @param baseEndpoint 基础端点
 * @param params 查询参数
 * @returns 完整的端点URL
 */
export function buildEndpoint(
	baseEndpoint: string,
	params?: Record<string, QueryParamValue>,
): string {
	if (!params) return baseEndpoint

	const queryString = buildQueryString(params)
	return queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint
}
