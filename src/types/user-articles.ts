// 用户文章互动相关类型定义

/**
 * 文章互动状态接口
 */
export interface ArticleInteractionStatusType {
	isLiked: boolean
	isFavorited: boolean
}

/**
 * 点赞操作响应接口
 */
export interface LikeToggleResponseType {
	isLiked: boolean
	likeCount: number
}

/**
 * 收藏操作响应接口
 */
export interface FavoriteToggleResponseType {
	isFavorited: boolean
}

/**
 * 批量文章互动状态接口
 */
export type BatchArticleInteractionStatusType = Record<
	string,
	ArticleInteractionStatusType
>

/**
 * 用户文章互动查询参数
 */
export interface UserArticleQueryType {
	page?: number
	limit?: number
	sortBy?: 'createdAt' | 'likedAt' | 'favoritedAt' | 'viewedAt'
	sortOrder?: 'ASC' | 'DESC'
}
