// 评论相关类型定义

/**
 * 评论信息
 */
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
  };
  articleId: string;
  parentId?: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string | number;
  updatedAt: string | number;
  replies?: Comment[];
  likesCount?: number; // 兼容性字段
}

/**
 * 评论响应
 */
export interface CommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 创建评论数据
 */
export interface CreateCommentData {
  content: string;
  articleId: string;
  parentId?: string;
}

/**
 * 更新评论数据
 */
export interface UpdateCommentData {
  content: string;
}