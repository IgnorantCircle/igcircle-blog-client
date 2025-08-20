import { Container, Alert } from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { tagsApi } from '@/lib/api/tags'
import { articlesApi } from '@/lib/api/articles'
import { PublicTagType, PublicArticleType } from '@/types'
import TagClient from './TagClient'

interface TagPageProps {
	params: {
		id: string
	}
	searchParams: {
		page?: string
	}
}

interface TagData {
	tag: PublicTagType
	articles: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
	}
}

async function getTagData(
	tagId: string,
	page: number = 1,
): Promise<TagData | null> {
	try {
		const pageSize = 12

		// 并行获取标签信息和文章列表
		const [tag, articlesResponse] = await Promise.all([
			tagsApi.getTagById(tagId),
			articlesApi.getArticles({
				page,
				limit: pageSize,
				tagIds: [tagId],
				status: 'published' as const,
				sortBy: 'publishedAt',
				sortOrder: 'DESC',
			}),
		])

		return {
			tag,
			articles: articlesResponse,
		}
	} catch (error) {
		console.error('Failed to fetch tag data:', error)
		return null
	}
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
	const tagId = params.id
	const currentPage = parseInt(searchParams.page || '1', 10)

	const data = await getTagData(tagId, currentPage)

	if (!data) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<Alert.Root status="error">
						<Alert.Title>加载失败</Alert.Title>
						<Alert.Description>标签信息加载失败，请稍后重试</Alert.Description>
					</Alert.Root>
				</Container>
			</MainLayout>
		)
	}

	if (!data.tag) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<Alert.Root status="warning">
						<Alert.Title>标签不存在</Alert.Title>
						<Alert.Description>您访问的标签不存在或已被删除</Alert.Description>
					</Alert.Root>
				</Container>
			</MainLayout>
		)
	}

	return (
		<TagClient tag={data.tag} initialArticles={data.articles} tagId={tagId} />
	)
}
