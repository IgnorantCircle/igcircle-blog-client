import {
	CommentType,
	CreateCommentDataType,
	UpdateCommentDataType,
	PaginatedResponseType,
} from '@/types'
import { BaseApiClient } from './base'
import { buildEndpoint, QueryParamValue } from '@/lib/utils'

/**
 * 评论查询参数
 */
export interface CommentQueryType extends Record<string, QueryParamValue> {
	page?: number
	limit?: number
	articleId?: string
	parentId?: string
	userId?: string
	sortBy?: 'createdAt' | 'likeCount'
	sortOrder?: 'ASC' | 'DESC'
}

/**
 * 评论相关API
 */
export class CommentsApi extends BaseApiClient {
	/**
	 * 获取评论列表
	 * @param query 查询参数
	 * @returns 分页评论列表
	 */
	async getComments(
		query?: CommentQueryType,
	): Promise<PaginatedResponseType<CommentType>> {
		const endpoint = buildEndpoint('/user/comments', query)
		const response = await this.get<{
			items: CommentType[]
			total: number
			page: number
			limit: number
		}>(endpoint)

		if (!response) {
			throw new Error('Failed to get comments')
		}

		const totalPages = Math.ceil(response.total / response.limit)
		return {
			items: response.items,
			total: response.total,
			page: response.page,
			limit: response.limit,
			totalPages,
			hasNext: response.page < totalPages,
			hasPrev: response.page > 1,
		}
	}

	/**
	 * 获取评论详情
	 * @param id 评论ID
	 * @returns 评论详情
	 */
	async getCommentById(id: string): Promise<CommentType> {
		const result = await this.get<CommentType>(`/user/comments/${id}`)
		if (!result) {
			throw new Error(`Comment with id ${id} not found`)
		}
		return result
	}

	/**
	 * 获取评论回复列表
	 * @param id 评论ID
	 * @param query 查询参数
	 * @returns 回复列表
	 */
	async getCommentReplies(
		id: string,
		query?: CommentQueryType,
	): Promise<PaginatedResponseType<CommentType>> {
		const endpoint = buildEndpoint(`/user/comments/${id}/replies`, query)
		const response = await this.get<{
			items: CommentType[]
			total: number
			page: number
			limit: number
		}>(endpoint)

		if (!response) {
			throw new Error('Failed to get comment replies')
		}

		const totalPages = Math.ceil(response.total / response.limit)
		return {
			items: response.items,
			total: response.total,
			page: response.page,
			limit: response.limit,
			totalPages,
			hasNext: response.page < totalPages,
			hasPrev: response.page > 1,
		}
	}

	/**
	 * 创建评论
	 * @param data 评论数据
	 * @returns 创建的评论
	 */
	async createComment(data: CreateCommentDataType): Promise<CommentType> {
		const result = await this.post<CommentType>('/user/comments', data)
		if (!result) {
			throw new Error('Failed to create comment')
		}
		return result
	}

	/**
	 * 更新评论
	 * @param id 评论ID
	 * @param data 更新数据
	 * @returns 更新后的评论
	 */
	async updateComment(
		id: string,
		data: UpdateCommentDataType,
	): Promise<CommentType> {
		const result = await this.put<CommentType>(`/user/comments/${id}`, data)
		if (!result) {
			throw new Error('Failed to update comment')
		}
		return result
	}

	/**
	 * 删除评论
	 * @param id 评论ID
	 */
	async deleteComment(id: string): Promise<void> {
		await this.delete<void>(`/user/comments/${id}`)
	}

	/**
	 * 点赞/取消点赞评论
	 * @param id 评论ID
	 * @returns 点赞结果
	 */
	async toggleCommentLike(
		id: string,
	): Promise<{ isLiked: boolean; likeCount: number }> {
		const result = await this.post<{ isLiked: boolean; likeCount: number }>(
			`/user/comments/${id}/like`,
		)
		if (!result) {
			throw new Error('Failed to toggle comment like')
		}
		return result
	}

	/**
	 * 获取我的评论列表
	 * @param query 查询参数
	 * @returns 我的评论列表
	 */
	async getMyComments(
		query?: CommentQueryType,
	): Promise<PaginatedResponseType<CommentType>> {
		const endpoint = buildEndpoint('/user/comments/my/list', query)
		const response = await this.get<{
			items: CommentType[]
			total: number
			page: number
			limit: number
		}>(endpoint)

		if (!response) {
			throw new Error('Failed to get my comments')
		}

		const totalPages = Math.ceil(response.total / response.limit)
		return {
			items: response.items,
			total: response.total,
			page: response.page,
			limit: response.limit,
			totalPages,
			hasNext: response.page < totalPages,
			hasPrev: response.page > 1,
		}
	}
}

// 导出评论API实例
export const commentsApi = new CommentsApi()
