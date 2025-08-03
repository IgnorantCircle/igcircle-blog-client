// API响应类型定义
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 用户类型
export interface PublicUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

// 文章类型
export interface PublicArticle {
  id: number;
  title: string;
  summary: string;
  slug: string;
  coverImage: string;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isFeatured: boolean;
  isTop: boolean;
  publishedAt: string;
  author: PublicUser;
}

export interface PublicArticleDetail extends PublicArticle {
  content: string;
  tags: PublicTag[];
  category: PublicCategory;
}

// 分类类型
export interface PublicCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
}

// 标签类型
export interface PublicTag {
  id: number;
  name: string;
  color: string;
  articleCount: number;
}

// 查询参数类型
export interface ArticleQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  tagId?: number;
  keyword?: string;
  sortBy?: 'publishedAt' | 'viewCount' | 'likeCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ArticleSearchQuery {
  keyword: string;
  page?: number;
  limit?: number;
  categoryId?: number;
  tagId?: number;
}

export interface ArticleArchiveQuery {
  year?: number;
  month?: number;
}