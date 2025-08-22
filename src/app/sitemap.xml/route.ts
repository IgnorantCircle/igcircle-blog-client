import { NextResponse } from 'next/server'
import { articlesApi } from '@/lib/api/articles'
import { categoriesApi } from '@/lib/api/categories'
import { tagsApi } from '@/lib/api/tags'

interface SitemapUrl {
	loc: string
	lastmod?: string
	changefreq?:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never'
	priority?: number
}

export async function GET() {
	try {
		const baseUrl =
			process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
		const blogPath = '/blog'

		const urls: SitemapUrl[] = []

		// 静态页面
		urls.push(
			{ loc: `${baseUrl}${blogPath}`, changefreq: 'daily', priority: 1.0 },
			{
				loc: `${baseUrl}${blogPath}/about`,
				changefreq: 'monthly',
				priority: 0.8,
			},
			{
				loc: `${baseUrl}${blogPath}/articles`,
				changefreq: 'daily',
				priority: 0.9,
			},
			{
				loc: `${baseUrl}${blogPath}/categories`,
				changefreq: 'weekly',
				priority: 0.8,
			},
			{
				loc: `${baseUrl}${blogPath}/tags`,
				changefreq: 'weekly',
				priority: 0.8,
			},
			{
				loc: `${baseUrl}${blogPath}/archive`,
				changefreq: 'daily',
				priority: 0.7,
			},
			{
				loc: `${baseUrl}${blogPath}/search`,
				changefreq: 'monthly',
				priority: 0.6,
			},
		)

		// 获取所有已发布的文章
		try {
			const articlesResponse = await articlesApi.getArticles({
				status: 'published',
				limit: 1000, // 获取所有文章
				sortBy: 'publishedAt',
				sortOrder: 'DESC',
			})

			articlesResponse.items.forEach((article) => {
				urls.push({
					loc: `${baseUrl}${blogPath}/articles/${article.slug}`,
					lastmod: new Date(article.updatedAt).toISOString().split('T')[0],
					changefreq: 'weekly',
					priority: article.isFeatured ? 0.9 : 0.8,
				})
			})
		} catch (error) {
			console.error('获取文章列表失败:', error)
		}

		// 获取所有分类
		try {
			const categories = await categoriesApi.getCategories()
			categories.forEach((category) => {
				urls.push({
					loc: `${baseUrl}${blogPath}/categories/${category.slug}`,
					changefreq: 'weekly',
					priority: 0.7,
				})
			})
		} catch (error) {
			console.error('获取分类列表失败:', error)
		}

		// 获取所有标签
		try {
			const tags = await tagsApi.getPopularTags() // 获取热门标签
			tags.forEach((tag) => {
				urls.push({
					loc: `${baseUrl}${blogPath}/tags/${tag.id}`,
					changefreq: 'weekly',
					priority: 0.6,
				})
			})
		} catch (error) {
			console.error('获取标签列表失败:', error)
		}

		// 生成XML
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`,
	)
	.join('\n')}
</urlset>`

		return new NextResponse(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1小时缓存
			},
		})
	} catch (error) {
		console.error('生成sitemap失败:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
