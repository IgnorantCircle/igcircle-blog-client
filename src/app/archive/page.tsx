import { Metadata } from 'next'
import { Suspense } from 'react'
import { ArchiveClient } from '@/components/Archive'
import { articlesApi } from '@/lib/api/articles'
import { ArticleArchiveQueryType } from '@/types'
import { Container, Spinner, Center } from '@chakra-ui/react'

interface ArchivePageProps {
	searchParams: Promise<{
		year?: string
		month?: string
		page?: string
	}>
}

/**
 * 生成页面元数据
 */
export async function generateMetadata({
	searchParams,
}: ArchivePageProps): Promise<Metadata> {
	const params = await searchParams
	const year = params.year ? parseInt(params.year) : undefined
	const month = params.month ? parseInt(params.month) : undefined

	let title = '文章归档'
	let description = '按时间浏览所有文章，发现更多精彩内容'

	if (year && month) {
		const monthNames = [
			'一月',
			'二月',
			'三月',
			'四月',
			'五月',
			'六月',
			'七月',
			'八月',
			'九月',
			'十月',
			'十一月',
			'十二月',
		]
		title = `${year}年${monthNames[month - 1]}的文章归档`
		description = `浏览${year}年${monthNames[month - 1]}发布的所有文章`
	} else if (year) {
		title = `${year}年的文章归档`
		description = `浏览${year}年发布的所有文章`
	}

	return {
		title,
		description,
		keywords: [
			'文章归档',
			'博客文章',
			'技术博客',
			year?.toString(),
			month?.toString(),
		].filter((item): item is string => item !== undefined),
		openGraph: {
			title,
			description,
			type: 'website',
		},
	}
}

/**
 * 归档页面加载组件
 */
function ArchivePageLoading() {
	return (
		<Container maxW="7xl" py={8}>
			<Center h="400px">
				<Spinner size="xl" color="blue.500" />
			</Center>
		</Container>
	)
}

/**
 * 归档页面服务端组件
 */
export default async function ArchivePage({ searchParams }: ArchivePageProps) {
	const params = await searchParams
	const year = params.year ? parseInt(params.year) : undefined
	const month = params.month ? parseInt(params.month) : undefined
	const currentPage = parseInt(params.page || '1')
	const limit = 6 // 3行2列 = 6篇文章

	try {
		// 并行获取归档文章和统计数据
		const [articlesResult, statsResult] = await Promise.all([
			articlesApi.getArchive({
				year,
				month,
				page: currentPage,
				limit,
			} as ArticleArchiveQueryType),
			articlesApi.getArticleArchiveStats({ includeStats: true }),
		])

		return (
			<Suspense fallback={<ArchivePageLoading />}>
				<ArchiveClient
					initialArticles={articlesResult}
					initialStats={statsResult}
				/>
			</Suspense>
		)
	} catch (error) {
		console.error('Failed to load archive page:', error)

		// 返回错误状态的组件
		return (
			<Suspense fallback={<ArchivePageLoading />}>
				<ArchiveClient
					initialArticles={{
						items: [],
						total: 0,
						page: 1,
						limit: 6,
						totalPages: 0,
						hasNext: false,
						hasPrev: false,
					}}
					initialStats={{
						totalArticles: 0,
						totalViews: 0,
						totalCategories: 0,
						totalTags: 0,
						monthlyStats: [],
					}}
				/>
			</Suspense>
		)
	}
}
