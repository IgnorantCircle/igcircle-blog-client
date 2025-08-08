import {
	PublicArticle,
	PublicArticleDetail,
	ArticleQuery,
	ArticleSearchQuery,
	ArticleArchiveQuery,
	PaginatedResponse,
} from '@/types'
import { ErrorHandler } from '@/lib/error-handler'
import { BaseApiClient } from './base'

/**
 * 文章相关API
 */
export class ArticlesApi extends BaseApiClient {
	/**
	 * 获取文章列表
	 * @param query 查询参数
	 * @returns 分页文章列表
	 */
	async getArticles(
		query?: ArticleQuery
	): Promise<PaginatedResponse<PublicArticle>> {
		try {
			const params = new URLSearchParams()
			if (query?.page) params.append('page', query.page.toString())
			if (query?.limit) params.append('limit', query.limit.toString())
			if (query?.categoryId)
				params.append('categoryId', query.categoryId.toString())
			if (query?.tagId) params.append('tagId', query.tagId.toString())
			if (query?.keyword) params.append('keyword', query.keyword)
			if (query?.sortBy) params.append('sortBy', query.sortBy)
			if (query?.sortOrder) params.append('sortOrder', query.sortOrder)

			const queryString = params.toString()
			const endpoint = `/articles${queryString ? `?${queryString}` : ''}`

			return await this.get<PaginatedResponse<PublicArticle>>(endpoint)
		} catch (error) {
			ErrorHandler.logError(error, 'getArticles')
			throw error
		}
	}

	/**
	 * 获取精选文章
	 * @param limit 数量限制
	 * @returns 精选文章列表
	 */
	async getFeaturedArticles(limit = 6): Promise<PublicArticle[]> {
		try {
			return await this.get<PublicArticle[]>(
				`/articles/featured?limit=${limit}`
			)
		} catch (error) {
			ErrorHandler.logError(error, 'getFeaturedArticles')
			throw error
		}
	}

	/**
	 * 获取最新文章
	 * @param limit 数量限制
	 * @returns 最新文章列表
	 */
	async getRecentArticles(limit = 10): Promise<PublicArticle[]> {
		try {
			return await this.get<PublicArticle[]>(`/articles/recent?limit=${limit}`)
		} catch (error) {
			ErrorHandler.logError(error, 'getRecentArticles')
			throw error
		}
	}

	/**
	 * 获取热门文章
	 * @param limit 数量限制
	 * @returns 热门文章列表
	 */
	async getPopularArticles(limit = 10): Promise<PublicArticle[]> {
		try {
			return await this.get<PublicArticle[]>(`/articles/popular?limit=${limit}`)
		} catch (error) {
			ErrorHandler.logError(error, 'getPopularArticles')
			throw error
		}
	}

	/**
	 * 根据ID获取文章详情
	 * @param id 文章ID
	 * @returns 文章详情
	 */
	async getArticleById(id: string): Promise<PublicArticleDetail> {
		try {
			return await this.get<PublicArticleDetail>(`/articles/${id}`)
		} catch (error) {
			ErrorHandler.logError(error, 'getArticleById')
			throw error
		}
	}

	/**
	 * 根据slug获取文章详情
	 * @param slug 文章slug
	 * @returns 文章详情
	 */
	async getArticleBySlug(slug: string): Promise<PublicArticleDetail> {
		try {
			return await this.get<PublicArticleDetail>(`/articles/slug/${slug}`)
		} catch (error) {
			ErrorHandler.logError(error, 'getArticleBySlug')
			throw error
		}
	}

	/**
	 * 获取相关文章
	 * @param id 文章ID
	 * @param limit 数量限制
	 * @returns 相关文章列表
	 */
	async getRelatedArticles(id: string, limit = 5): Promise<PublicArticle[]> {
		try {
			return await this.get<PublicArticle[]>(
				`/articles/${id}/related?limit=${limit}`
			)
		} catch (error) {
			ErrorHandler.logError(error, 'getRelatedArticles')
			throw error
		}
	}

	/**
	 * 增加文章浏览次数
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async incrementArticleView(id: string): Promise<void> {
		try {
			await this.post<void>(`/articles/${id}/view`)
		} catch (error) {
			ErrorHandler.logError(error, 'incrementArticleView')
			throw error
		}
	}

	/**
	 * 点赞文章
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async likeArticle(id: string): Promise<void> {
		try {
			await this.post<void>(`/articles/${id}/like`)
		} catch (error) {
			ErrorHandler.logError(error, 'likeArticle')
			throw error
		}
	}

	/**
	 * 分享文章
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async shareArticle(id: string): Promise<void> {
		try {
			await this.post<void>(`/articles/${id}/share`)
		} catch (error) {
			ErrorHandler.logError(error, 'shareArticle')
			throw error
		}
	}

	/**
	 * 搜索文章
	 * @param query 搜索参数
	 * @returns 搜索结果
	 */
	async searchArticles(
		query: ArticleSearchQuery
	): Promise<PaginatedResponse<PublicArticle>> {
		try {
			const params = new URLSearchParams()
			params.append('q', query.q)
			if (query.page) params.append('page', query.page.toString())
			if (query.limit) params.append('limit', query.limit.toString())
			if (query.categoryId)
				params.append('categoryId', query.categoryId.toString())
			if (query.tagId) params.append('tagId', query.tagId.toString())
			if (query.sortBy) params.append('sortBy', query.sortBy)
			if (query.sortOrder) params.append('sortOrder', query.sortOrder)

			return await this.get<PaginatedResponse<PublicArticle>>(
				`/articles/search?${params.toString()}`
			)
		} catch (error) {
			ErrorHandler.logError(error, 'searchArticles')
			throw error
		}
	}

	/**
	 * 获取文章归档
	 * @param query 归档查询参数
	 * @returns 归档数据
	 */
	async getArticleArchive(
		query?: ArticleArchiveQuery
	): Promise<{ year: number; month: number; count: number }[]> {
		try {
			const params = new URLSearchParams()
			if (query?.year) params.append('year', query.year.toString())
			if (query?.month) params.append('month', query.month.toString())

			const queryString = params.toString()
			const endpoint = `/articles/archive${
				queryString ? `?${queryString}` : ''
			}`

			return await this.get<{ year: number; month: number; count: number }[]>(
				endpoint
			)
		} catch (error) {
			ErrorHandler.logError(error, 'getArticleArchive')
			throw error
		}
	}

	/**
	 * 获取归档数据（别名方法）
	 * @param query 归档查询参数
	 * @returns 文章列表
	 */
	async getArchive(query?: ArticleArchiveQuery): Promise<PublicArticle[]> {
		try {
			const params = new URLSearchParams()
			if (query?.year) params.append('year', query.year.toString())
			if (query?.month) params.append('month', query.month.toString())
			if (query?.page) params.append('page', query.page.toString())
			if (query?.limit) params.append('limit', query.limit.toString())

			const queryString = params.toString()
			const endpoint = `/articles${queryString ? `?${queryString}` : ''}`

			return await this.get<PublicArticle[]>(endpoint)
		} catch (error) {
			ErrorHandler.logError(error, 'getArchive')
			throw error
		}
	}
}

// 导出单例实例
export const articlesApi = new ArticlesApi()
