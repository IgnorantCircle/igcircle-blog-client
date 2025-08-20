import {
	PublicArticleType,
	PublicArticleDetailType,
	ArticleQueryType,
	ArticleSearchQueryType,
	ArticleArchiveQueryType,
	PaginatedResponseType,
	ArticleArchiveStatsType,
} from '@/types'
import { BaseApiClient } from './base'
import { buildEndpoint, type QueryParamValue } from '@/lib/utils'

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
		query?: ArticleQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		const endpoint = buildEndpoint(
			'/articles',
			query as Record<string, QueryParamValue> | undefined,
		)
		const result =
			await this.get<PaginatedResponseType<PublicArticleType>>(endpoint)
		if (!result) {
			return {
				items: [],
				total: 0,
				page: 1,
				limit: 0,
				totalPages: 0,
				hasNext: false,
				hasPrev: false,
			}
		}
		return result
	}

	/**
	 * 获取精选文章
	 * @param limit 数量限制
	 * @returns 精选文章列表
	 */
	async getFeaturedArticles(limit = 6): Promise<PublicArticleType[]> {
		const result = await this.get<PublicArticleType[]>(
			`/articles/featured?limit=${limit}`,
		)
		return result || []
	}

	/**
	 * 获取最新文章
	 * @param limit 数量限制
	 * @returns 最新文章列表
	 */
	async getRecentArticles(limit = 10): Promise<PublicArticleType[]> {
		const result = await this.get<PublicArticleType[]>(
			`/articles/recent?limit=${limit}`,
		)
		return result || []
	}

	/**
	 * 获取热门文章
	 * @param limit 数量限制
	 * @returns 热门文章列表
	 */
	async getPopularArticles(limit = 10): Promise<PublicArticleType[]> {
		const result = await this.get<PublicArticleType[]>(
			`/articles/popular?limit=${limit}`,
		)
		return result || []
	}

	/**
	 * 根据ID获取文章详情
	 * @param id 文章ID
	 * @returns 文章详情
	 */
	async getArticleById(id: string): Promise<PublicArticleDetailType> {
		const result = await this.get<PublicArticleDetailType>(`/articles/${id}`)
		if (!result) {
			throw new Error(`Article with id ${id} not found`)
		}
		return result
	}

	/**
	 * 根据slug获取文章详情
	 * @param slug 文章slug
	 * @returns 文章详情
	 */
	async getArticleBySlug(slug: string): Promise<PublicArticleDetailType> {
		const result = await this.get<PublicArticleDetailType>(
			`/articles/slug/${slug}`,
		)
		if (!result) {
			throw new Error(`Article with slug ${slug} not found`)
		}
		return result
	}

	/**
	 * 获取相关文章
	 * @param id 文章ID
	 * @param limit 数量限制
	 * @returns 相关文章列表
	 */
	async getRelatedArticles(
		id: string,
		limit = 5,
	): Promise<PublicArticleType[]> {
		const result = await this.get<PublicArticleType[]>(
			`/articles/${id}/related?limit=${limit}`,
		)
		return result || []
	}

	/**
	 * 增加文章浏览次数
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async incrementArticleView(id: string): Promise<void> {
		await this.post<void>(`/articles/${id}/view`)
	}

	/**
	 * 点赞文章
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async likeArticle(id: string): Promise<void> {
		await this.post<void>(`/articles/${id}/like`)
	}

	/**
	 * 分享文章
	 * @param id 文章ID
	 * @returns Promise<void>
	 */
	async shareArticle(id: string): Promise<void> {
		await this.post<void>(`/articles/${id}/share`)
	}

	/**
	 * 搜索文章
	 * @param query 搜索参数
	 * @returns 搜索结果
	 */
	async searchArticles(
		query: ArticleSearchQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		const endpoint = buildEndpoint(
			'/articles/search',
			query as unknown as Record<string, QueryParamValue>,
		)
		const result =
			await this.get<PaginatedResponseType<PublicArticleType>>(endpoint)
		if (!result) {
			return {
				items: [],
				total: 0,
				page: 1,
				limit: 0,
				totalPages: 0,
				hasNext: false,
				hasPrev: false,
			}
		}
		return result
	}

	/**
	 * 获取文章归档统计数据
	 * @param query 查询参数
	 * @returns 归档统计数据
	 */
	async getArticleArchiveStats(query?: {
		includeStats?: boolean
	}): Promise<ArticleArchiveStatsType> {
		const endpoint = buildEndpoint(
			'/articles/archive/stats',
			query as Record<string, QueryParamValue> | undefined,
		)
		const result = await this.get<ArticleArchiveStatsType>(endpoint)
		if (!result) {
			return {
				totalArticles: 0,
				totalViews: 0,
				totalCategories: 0,
				totalTags: 0,
				monthlyStats: [],
			}
		}
		return result
	}

	/**
	 * 获取归档数据（别名方法）
	 * @param query 归档查询参数
	 * @returns 文章列表
	 */
	async getArchive(
		query?: ArticleArchiveQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		// 合并查询参数，强制设置为已发布状态
		const mergedQuery = { ...query, status: 'published' }
		const endpoint = buildEndpoint(
			'/articles/archive',
			mergedQuery as Record<string, QueryParamValue>,
		)
		const result =
			await this.get<PaginatedResponseType<PublicArticleType>>(endpoint)
		if (!result) {
			return {
				items: [],
				total: 0,
				page: 1,
				limit: 0,
				totalPages: 0,
				hasNext: false,
				hasPrev: false,
			}
		}
		return result
	}
}

// 导出单例实例
export const articlesApi = new ArticlesApi()
