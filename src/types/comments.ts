// 评论相关类型定义

/**
 * 评论信息
 */
export interface CommentType {
	id: string
	content: string
	author: {
		id: string
		username: string
		nickname: string
		avatar?: string
	}
	articleId: string
	parentId?: string
	likeCount: number
	isLiked: boolean
	createdAt: string | number
	updatedAt: string | number
	replies?: CommentType[]
	likesCount?: number // 兼容性字段
}

/**
 * 评论响应
 */
export interface CommentsResponseType {
	data: CommentType[]
	total: number
	page: number
	limit: number
}

/**
 * 创建评论数据
 */
export interface CreateCommentDataType {
	content: string
	articleId: string
	parentId?: string
}

/**
 * 更新评论数据
 */
export interface UpdateCommentDataType {
	content: string
}
