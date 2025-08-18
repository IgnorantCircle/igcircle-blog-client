export interface BaseArticleType {
	id: string
	title: string
	summary: string
	slug: string
	coverImage: string
	readingTime: number
	viewCount: number
	likeCount: number
	shareCount: number
	isFeatured: boolean
	isTop: boolean
	publishedAt: string
	createdAt: string
	updatedAt: string
}
/**
 * 公开用户信息
 */
interface PublicUserTypeInArticle {
	id: string
	username: string
	nickname: string
	avatar?: string
	bio?: string
	createdAt: string | number
	updatedAt: string | number
}

/**
 * 公开分类信息
 */
interface PublicCategoryTypeInArticle {
	id: string
	name: string
	slug: string
	description: string
	icon: string
	articleCount: number
}

/**
 * 公开标签信息
 */
interface PublicTagTypeInArticle {
	id: string
	name: string
	slug: string
	color: string
	articleCount: number
}

/**
 * 公开文章信息
 */
export interface PublicArticleType extends BaseArticleType {
	author: PublicUserTypeInArticle
	category?: PublicCategoryTypeInArticle
	tags?: PublicTagTypeInArticle[]
	views?: number
	likes?: number
	commentCount?: number
}

/**
 * 文章详情信息
 */
export interface PublicArticleDetailType extends PublicArticleType {
	content: string
	tags: PublicTagTypeInArticle[]
	category: PublicCategoryTypeInArticle
}

/**
 * 文章查询参数
 */
export interface ArticleQueryType {
	page?: number
	limit?: number
	categoryId?: string
	categoryIds?: string[]
	tagIds?: string[]
	keyword?: string
	searchMode?: 'title' | 'content' | 'summary'
	sortBy?: 'publishedAt' | 'viewCount' | 'likeCount' | 'createdAt' | 'updatedAt'
	sortOrder?: 'ASC' | 'DESC'
	status?: 'draft' | 'published' | 'archived'
	isFeatured?: boolean
	isTop?: boolean
	minReadingTime?: number
	maxReadingTime?: number
	year?: number
	month?: number
	includeTags?: boolean
	includeCategory?: boolean
}

/**
 * 文章搜索查询参数
 */
export interface ArticleSearchQueryType {
	q: string
	page?: number
	limit?: number
	categoryId?: string
	categoryIds?: string[]
	tagIds?: string[]
	sortBy?: 'publishedAt' | 'viewCount' | 'likeCount'
	sortOrder?: 'ASC' | 'DESC'
	status?: 'draft' | 'published' | 'archived'
}

/**
 * 文章归档查询参数
 */
export interface ArticleArchiveQueryType {
	year?: number
	month?: number
	page?: number
	limit?: number
	includeStats?: boolean
}

export interface ArticleArchiveStatsType {
	totalArticles: number
	totalViews: number
	totalCategories: number
	totalTags: number
	monthlyStats: { year: number; month: number; count: number }[]
}

/**
 * 创建文章数据
 */
export interface CreateArticleDataType {
	title: string
	content: string
	summary?: string
	coverImage?: string
	categoryId?: string
	tagIds?: string[]
	isFeatured?: boolean
	isTop?: boolean
}

/**
 * 更新文章数据
 */
export interface UpdateArticleDataType extends Partial<CreateArticleDataType> {
	id: string
}
