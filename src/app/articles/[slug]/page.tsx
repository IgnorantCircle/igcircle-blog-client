import { notFound } from 'next/navigation'
import { Metadata } from 'next'
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

/**
 * 生成文章页面的动态元数据
 */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params

	try {
		const article = await articlesApi.getArticleBySlug(slug)

		// 生成关键词
		const keywords = [
			'技术博客',
			article.category?.name,
			...(article.tags?.map((tag) => tag.name) || []),
			'前端开发',
			'后端开发',
			'编程技术',
		].filter(Boolean)

		// 生成描述
		const description =
			article.summary ||
			`阅读 ${article.title} - ${article.category?.name || '技术文章'}，了解更多编程技术和开发经验。`

		return {
			title: `${article.title} - igCircle Blog`,
			description,
			keywords,
			authors: [
				{
					name:
						article.author.nickname || article.author.username || 'igCircle',
				},
			],
			openGraph: {
				title: article.title,
				description,
				type: 'article',
				url: `/blog/articles/${slug}`,

				publishedTime: article.publishedAt,
				modifiedTime: article.updatedAt,
				authors: [
					article.author.nickname || article.author.username || 'igCircle',
				],
				tags: article.tags?.map((tag) => tag.name),
			},

			alternates: {
				canonical: `/blog/articles/${slug}`,
			},
		}
	} catch (error) {
		console.error('生成文章元数据失败:', error)
		return {
			title: '文章详情 - igCircle Blog',
			description: '技术博客文章详情页面',
			keywords: ['技术博客', '前端开发', '后端开发', '编程技术'],
			authors: [{ name: 'igCircle' }],
		}
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
