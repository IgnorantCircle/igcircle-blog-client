import { Container, Alert } from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { categoriesApi } from '@/lib/api/categories'
import { articlesApi } from '@/lib/api/articles'
import { PublicCategoryType, PublicArticleType } from '@/types'
import CategoryClient from './CategoryClient'

interface CategoryPageProps {
	params: {
		id: string
	}
	searchParams: {
		page?: string
	}
}

interface CategoryData {
	category: PublicCategoryType
	articles: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
	}
}

async function getCategoryData(
	categorySlug: string,
	page: number = 1,
): Promise<CategoryData | null> {
	try {
		const pageSize = 9
		// 并行获取分类信息和文章列表
		const [category, articlesResponse] = await Promise.all([
			categoriesApi.getCategoryById(categorySlug),
			articlesApi.getArticles({
				page,
				limit: pageSize,
				categoryIds: [categorySlug],
				status: 'published' as const,
				sortBy: 'publishedAt',
				sortOrder: 'DESC',
			}),
		])

		return {
			category,
			articles: articlesResponse,
		}
	} catch (error) {
		console.error('服务端获取分类数据失败:', error)
		return null
	}
}

export default async function CategoryPage({
	params,
	searchParams,
}: CategoryPageProps) {
	const categorySlug = params.id
	const currentPage = parseInt(searchParams.page || '1', 10)

	const data = await getCategoryData(categorySlug, currentPage)

	if (!data) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<Alert.Root status="error">
						<Alert.Title>加载失败</Alert.Title>
						<Alert.Description>分类信息加载失败，请稍后重试</Alert.Description>
					</Alert.Root>
				</Container>
			</MainLayout>
		)
	}

	if (!data.category) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<Alert.Root status="warning">
						<Alert.Title>分类不存在</Alert.Title>
						<Alert.Description>您访问的分类不存在或已被删除</Alert.Description>
					</Alert.Root>
				</Container>
			</MainLayout>
		)
	}

	return (
		<CategoryClient
			category={data.category}
			initialArticles={data.articles}
			categorySlug={categorySlug}
		/>
	)
}
