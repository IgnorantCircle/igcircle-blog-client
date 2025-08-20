import { notFound } from 'next/navigation'
import { articlesApi } from '@/lib/api/articles'
import { ArticleInteractions } from '@/components/Articles/ArticleInteractions'
import { PublicArticleDetailType, PublicArticleType } from '@/types'

interface PageProps {
	params: Promise<{
		slug: string
	}>
}

/**
 * 获取文章数据
 * @param slug 文章slug
 * @returns 文章详情和相关文章
 */
async function getArticleData(slug: string): Promise<{
	article: PublicArticleDetailType
	relatedArticles: PublicArticleType[]
} | null> {
	try {
		// 获取文章详情
		const article = await articlesApi.getArticleBySlug(slug)

		// 获取相关文章，如果失败则使用空数组
		let relatedArticles: PublicArticleType[] = []
		try {
			relatedArticles = await articlesApi.getRelatedArticles(article.id, 4)
		} catch (relatedError) {
			console.error('服务端获取数据失败:', relatedError)
			// 相关文章获取失败不影响主文章显示，使用空数组
		}

		return {
			article,
			relatedArticles,
		}
	} catch (error) {
		console.error('服务端获取数据失败:', error)
		return null
	}
}

export default async function ArticlePage({ params }: PageProps) {
	const { slug } = await params
	const articleData = await getArticleData(slug)

	if (!articleData) {
		notFound()
	}

	const { article, relatedArticles } = articleData

	return (
		<ArticleInteractions article={article} relatedArticles={relatedArticles} />
	)
}
