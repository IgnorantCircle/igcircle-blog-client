import CategoryPage from './CategoryPage'
import { getCategoryData } from './CategoryPage'
import { Metadata } from 'next'

interface PageProps {
	params: Promise<{
		id: string
	}>
	searchParams: Promise<{
		page?: string
	}>
}

// 生成动态元数据
export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	try {
		const resolvedParams = await params
		const data = await getCategoryData(resolvedParams.id, 1)

		if (!data || !data.category) {
			return {
				title: '分类不存在',
				description: '您访问的分类不存在或已被删除',
			}
		}

		const category = data.category
		const title = `${category.name} - 分类文章`
		const description =
			category.description ||
			`浏览 ${category.name} 分类下的所有文章，共 ${category.articleCount || 0} 篇文章`
		const keywords = `${category.name}, 分类, 文章, 博客`

		return {
			title,
			description,
			keywords,
			openGraph: {
				title,
				description,
				type: 'website',
				url: `/blog/categories/${category.id}`,
				siteName: 'igCircle Blog',
				locale: 'zh_CN',
			},
			alternates: {
				canonical: `/blog/categories/${category.id}`,
			},
		}
	} catch (error) {
		console.error('生成分类元数据失败:', error)
		return {
			title: '分类加载失败',
			description: '分类信息加载失败，请稍后重试',
		}
	}
}

export default async function Page({ params, searchParams }: PageProps) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams
	return (
		<CategoryPage params={resolvedParams} searchParams={resolvedSearchParams} />
	)
}
