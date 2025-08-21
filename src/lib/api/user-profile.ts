import {
	PublicUserType,
	UserType,
	UserStatsType,
	PublicArticleType,
	CommentType,
	PaginatedResponseType,
} from '@/types'
import { UserArticleQueryType } from '@/types/user-articles'
import { BaseApiClient } from './base'
import { buildEndpoint, QueryParamValue } from '@/lib/utils'

/**
 * 用户个人资料更新接口
 */
export interface UserProfileUpdateType {
	nickname?: string
	avatar?: string
	bio?: string
	location?: string
	website?: string
}

/**
 * 用户个人页面API
 */
export class UserProfileApi extends BaseApiClient {
	/**
	 * 获取当前用户信息
	 * @returns 用户信息
	 */
	async getCurrentUser(): Promise<UserType> {
		const result = await this.get<UserType>('/users/profile')
		if (!result) {
			throw new Error('获取用户信息失败')
		}
		return result
	}

	/**
	 * 获取用户公开信息
	 * @param userId 用户ID
	 * @returns 用户公开信息
	 */
	async getUserProfile(userId: string): Promise<PublicUserType> {
		const result = await this.get<PublicUserType>(`/users/profile/${userId}`)
		if (!result) {
			throw new Error('获取用户信息失败')
		}
		return result
	}

	/**
	 * 更新用户个人资料
	 * @param data 更新数据
	 * @returns 更新后的用户信息
	 */
	async updateProfile(data: UserProfileUpdateType): Promise<UserType> {
		const result = await this.put<UserType>('/users/profile', data)
		if (!result) {
			throw new Error('更新用户信息失败')
		}
		return result
	}

	/**
	 * 获取用户统计信息
	 * @param userId 用户ID（可选，不传则获取当前用户）
	 * @returns 用户统计信息
	 */
	async getUserStats(userId?: string): Promise<UserStatsType> {
		const endpoint = userId
			? `/users/profile/stats/${userId}`
			: '/users/profile/stats'
		const result = await this.get<UserStatsType>(endpoint)
		if (!result) {
			return {
				articlesCount: 0,
				followersCount: 0,
				followingCount: 0,
				likesCount: 0,
			}
		}
		return result
	}

	/**
	 * 获取用户评论列表
	 * @param userId 用户ID（可选，不传则获取当前用户）
	 * @param query 查询参数
	 * @returns 分页评论列表
	 */
	async getUserComments(
		userId?: string,
		query?: UserArticleQueryType,
	): Promise<PaginatedResponseType<CommentType>> {
		const baseEndpoint = userId ? `/user/comments/${userId}` : '/user/comments'
		const endpoint = buildEndpoint(
			baseEndpoint,
			query as Record<string, QueryParamValue>,
		)
		const result = await this.get<PaginatedResponseType<CommentType>>(endpoint)
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
	 * 获取用户发布的文章列表
	 * @param userId 用户ID
	 * @param query 查询参数
	 * @returns 分页文章列表
	 */
	async getUserArticles(
		userId: string,
		query?: UserArticleQueryType,
	): Promise<PaginatedResponseType<PublicArticleType>> {
		const endpoint = buildEndpoint(
			`/user/articles/${userId}`,
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
	 * 上传用户头像
	 * @param file 头像文件
	 * @returns 更新后的用户信息
	 */
	async uploadAvatar(file: File): Promise<UserType> {
		const formData = new FormData()
		formData.append('avatar', file)

		const token =
			typeof window !== 'undefined'
				? localStorage.getItem('accessToken') ||
					sessionStorage.getItem('accessToken')
				: null

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/users/profile/avatar`,
			{
				method: 'POST',
				body: formData,
				headers: {
					...(token && { Authorization: `Bearer ${token}` }),
				},
			},
		)

		if (!response.ok) {
			throw new Error('头像上传失败')
		}

		const result = await response.json()
		return result.data || result
	}

	/**
	 * 删除用户账户
	 * @param password 确认密码
	 * @returns 删除结果
	 */
	async deleteAccount(password: string): Promise<{ success: boolean }> {
		const result = await this.delete<{ success: boolean }>('/user/profile', {
			body: JSON.stringify({ password }),
		})
		if (!result) {
			throw new Error('删除账户失败')
		}
		return result
	}
}

// 导出单例实例
export const userProfileApi = new UserProfileApi()
