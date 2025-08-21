import { PublicArticleType, PaginatedResponseType } from '@/types'
import {
	ArticleInteractionStatusType,
	LikeToggleResponseType,
	FavoriteToggleResponseType,
	BatchArticleInteractionStatusType,
	UserArticleQueryType,
} from '@/types/user-articles'
import { BaseApiClient } from './base'
import { buildEndpoint, QueryParamValue } from '@/lib/utils'

/**
 * 用户文章互动相关API
 */
export class UserArticlesApi extends BaseApiClient {
	/**
	 * 切换文章点赞状态
	 * @param articleId 文章ID
	 * @returns 点赞结果
	 */
	async toggleArticleLike(articleId: string): Promise<LikeToggleResponseType> {
		const result = await this.post<LikeToggleResponseType>(
			`/user/articles/${articleId}/like`,
		)
		if (!result) {
			throw new Error('切换点赞状态失败')
		}
		return result
	}

	/**
	 * 切换文章收藏状态
	 * @param articleId 文章ID
	 * @returns 收藏结果
	 */
	async toggleArticleFavorite(
		articleId: string,
	): Promise<FavoriteToggleResponseType> {
		const result = await this.post<FavoriteToggleResponseType>(
			`/user/articles/${articleId}/favorite`,
		)
		if (!result) {
			throw new Error('切换收藏状态失败')
		}
		return result
	}

	/**
	 * 获取文章互动状态
	 * @param articleId 文章ID
	 * @returns 互动状态
	 */
	async getArticleInteractionStatus(
		articleId: string,
	): Promise<ArticleInteractionStatusType> {
		const result = await this.get<ArticleInteractionStatusType>(
			`/user/articles/${articleId}/status`,
		)
		if (!result) {
			return { isLiked: false, isFavorited: false }
		}
		return result
	}

	/**
	 * 批量获取文章互动状态
	 * @param articleIds 文章ID数组
	 * @returns 批量互动状态
	 */
	async getBatchArticleInteractionStatus(
		articleIds: string[],
	): Promise<BatchArticleInteractionStatusType> {
		const params = new URLSearchParams()
		articleIds.forEach((id) => params.append('articleIds', id))
		const result = await this.get<BatchArticleInteractionStatusType>(
			`/user/articles/batch-interaction-status?${params.toString()}`,
		)
		if (!result) {
			return {}
		}
		return result
	}

	/**
	 * 获取用户点赞的文章列表
	 * @param query 查询参数
	 * @returns 分页文章列表
	 */
	async getLikedArticles(
		query?: UserArticleQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		const endpoint = buildEndpoint(
			'/user/articles/liked',
			query as Record<string, QueryParamValue>,
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
	 * 获取用户收藏的文章列表
	 * @param query 查询参数
	 * @returns 分页文章列表
	 */
	async getFavoritedArticles(
		query?: UserArticleQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		const endpoint = buildEndpoint(
			'/user/articles/favorites',
			query as Record<string, QueryParamValue>,
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
export const userArticlesApi = new UserArticlesApi()
