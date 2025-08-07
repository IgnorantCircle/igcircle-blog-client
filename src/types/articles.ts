export interface BaseArticle {
  id: string;
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
  publishedAt: string | number;
  createdAt: string | number;
  updatedAt: string | number;
}
/**
 * 公开用户信息
 */
interface PublicUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  createdAt: string | number;
  updatedAt: string | number;
}

/**
 * 公开分类信息
 */
interface PublicCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
}

/**
 * 公开标签信息
 */
interface PublicTag {
  id: string;
  name: string;
  color: string;
  articleCount: number;
}

/**
 * 公开文章信息
 */
export interface PublicArticle extends BaseArticle {
  author: PublicUser;
  category?: PublicCategory;
  tags?: PublicTag[];
  views?: number;
  likes?: number;
}

/**
 * 文章详情信息
 */
export interface PublicArticleDetail extends PublicArticle {
  content: string;
  tags: PublicTag[];
  category: PublicCategory;
}

/**
 * 文章查询参数
 */
export interface ArticleQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  keyword?: string;
  sortBy?: 'publishedAt' | 'viewCount' | 'likeCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  status?: 'published';
  isFeatured?: boolean;
  isTop?: boolean;
}

/**
 * 文章查询参数类型别名
 */
export type ArticleQueryParams = ArticleQuery;

/**
 * 文章搜索查询参数
 */
export interface ArticleSearchQuery {
  q: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  sortBy?: 'publishedAt' | 'viewCount' | 'likeCount';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 文章归档查询参数
 */
export interface ArticleArchiveQuery {
  year?: number;
  month?: number;
  page?: number;
  limit?: number;
}

/**
 * 创建文章数据
 */
export interface CreateArticleData {
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  isFeatured?: boolean;
  isTop?: boolean;
}

/**
 * 更新文章数据
 */
export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}