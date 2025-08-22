import TagPage from './TagPage'
import { getTagData } from './TagPage'
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

		const data = await getTagData(resolvedParams.id, 1)

		if (!data || !data.tag) {
			return {
				title: '标签不存在',
				description: '您访问的标签不存在或已被删除',
			}
		}

		const tag = data.tag
		const title = `${tag.name} - 标签文章`
		const description = `浏览 ${tag.name} 标签下的所有文章，共 ${tag.articleCount || 0} 篇文章`
		const keywords = `${tag.name}, 标签, 文章, 博客`

		return {
			title,
			description,
			keywords,
			openGraph: {
				title,
				description,
				type: 'website',
				url: `/blog/tags/${tag.id}`,
				siteName: 'IGCircle Blog',
				locale: 'zh_CN',
			},
			alternates: {
				canonical: `/blog/tags/${tag.id}`,
			},
		}
	} catch (error) {
		console.error('生成标签元数据失败:', error)
		return {
			title: '标签加载失败',
			description: '标签信息加载失败，请稍后重试',
		}
	}
}

export default async function Page({ params, searchParams }: PageProps) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams
	return <TagPage params={resolvedParams} searchParams={resolvedSearchParams} />
}
