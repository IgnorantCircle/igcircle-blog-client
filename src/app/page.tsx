import { articlesApi } from '@/lib/api/articles'
import { categoriesApi, tagsApi } from '@/lib/api'
import { HomePageServer } from '@/components/HomePage/HomePageServer'

export default async function Home() {
	// 在服务端并行获取所有数据
	const [popularArticles, featuredArticles, recentArticles, categories, tags] =
		await Promise.all([
			articlesApi.getPopularArticles(5),
			articlesApi.getFeaturedArticles(5),
			articlesApi.getRecentArticles(9),
			categoriesApi.getCategories(),
			tagsApi.getPopularTags(),
		])

	return (
		<HomePageServer
			popularArticles={popularArticles}
			featuredArticles={featuredArticles}
			recentArticles={recentArticles}
			categories={categories}
			tags={tags}
		/>
	)
}
