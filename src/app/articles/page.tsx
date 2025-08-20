import { articlesApi } from '@/lib/api/articles'
import { categoriesApi } from '@/lib/api/categories'
import { tagsApi } from '@/lib/api/tags'
import { ArticleListClient } from '@/components/Articles/ArticleListClient'
import { ArticleQueryType } from '@/types'

export default async function ArticlesPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	// 等待 searchParams
	const params = await searchParams

	// 构建查询参数
	const filters: ArticleQueryType = {
		categoryIds:
			typeof params.categories === 'string'
				? params.categories.split(',').filter(Boolean)
				: undefined,
		tagIds:
			typeof params.tags === 'string'
				? params.tags.split(',').filter(Boolean)
				: undefined,
		keyword: typeof params.keyword === 'string' ? params.keyword : undefined,
		searchMode:
			typeof params.searchMode === 'string'
				? (params.searchMode as ArticleQueryType['searchMode'])
				: 'title',
		page: typeof params.page === 'string' ? parseInt(params.page) : 1,
		limit: typeof params.limit === 'string' ? parseInt(params.limit) : 6,
		sortBy:
			typeof params.sortBy === 'string'
				? (params.sortBy as ArticleQueryType['sortBy'])
				: 'publishedAt',
		sortOrder:
			typeof params.sortOrder === 'string'
				? (params.sortOrder as ArticleQueryType['sortOrder'])
				: 'DESC',
		status: 'published' as const,
	}

	try {
		// 并行获取所有数据
		const [categories, tags, articles] = await Promise.all([
			categoriesApi.getCategories(),
			tagsApi.getTags(),
			articlesApi.getArticles(filters),
		])

		return (
			<ArticleListClient
				initialCategories={categories}
				initialTags={tags}
				initialArticles={articles}
				initialFilters={filters}
			/>
		)
	} catch (error) {
		console.error('服务端获取数据失败:', error)
		// 如果服务端数据获取失败，仍然渲染客户端组件，让它自己获取数据
		return <ArticleListClient initialFilters={filters} />
	}
}
