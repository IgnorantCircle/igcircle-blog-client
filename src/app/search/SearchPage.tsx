import { Container, Stack, Heading, Text } from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { SearchClient } from './SearchClient'
import { articlesApi } from '@/lib/api/articles'
import { categoriesApi } from '@/lib/api/categories'
import { tagsApi } from '@/lib/api/tags'
interface SearchPageProps {
	searchParams: {
		q?: string
		category?: string
		tag?: string
		sortBy?: 'publishedAt' | 'viewCount' | 'likeCount'
		sortOrder?: 'ASC' | 'DESC'
		page?: string
	}
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	// 解析搜索参数
	const searchQuery = searchParams.q || ''
	const selectedCategory = searchParams.category || ''
	const selectedTag = searchParams.tag || ''
	const sortBy = searchParams.sortBy || 'publishedAt'
	const sortOrder = searchParams.sortOrder || 'DESC'
	const currentPage = parseInt(searchParams.page || '1')
	const pageSize = 12

	// 检查是否有搜索条件
	const hasSearchConditions =
		searchQuery.trim() || selectedCategory || selectedTag

	try {
		// 并行获取数据
		const [categories, tags, searchResults] = await Promise.all([
			categoriesApi.getCategories(),
			tagsApi.getTags(),
			// 只有在有搜索条件时才执行搜索
			hasSearchConditions
				? articlesApi.getArticles({
						page: currentPage,
						limit: pageSize,
						keyword: searchQuery.trim() || undefined,
						categoryId: selectedCategory || undefined,
						tagIds: selectedTag ? [selectedTag] : undefined,
						status: 'published',
						sortBy,
						sortOrder,
					})
				: Promise.resolve({
						items: [],
						total: 0,
						page: 1,
						limit: pageSize,
						totalPages: 0,
						hasNext: false,
						hasPrev: false,
					}),
		])

		return (
			<MainLayout>
				<Container maxW="7xl" py={8}>
					{/* 页面标题 */}
					<Stack gap={6} mb={8} textAlign="center">
						<Stack gap={4}>
							<Heading
								size={{ base: '2xl', md: '3xl' }}
								color={{ base: 'gray.900', _dark: 'white' }}
							>
								文章搜索
							</Heading>
							<Text
								color={{ base: 'gray.600', _dark: 'gray.400' }}
								fontSize="lg"
								maxW="2xl"
								mx="auto"
								lineHeight="1.6"
							>
								搜索您感兴趣的文章内容，支持按分类、标签筛选
							</Text>
						</Stack>
					</Stack>

					{/* 搜索客户端组件 */}
					<SearchClient
						initialCategories={categories}
						initialTags={tags}
						initialSearchResults={searchResults}
						initialSearchParams={{
							q: searchQuery,
							category: selectedCategory,
							tag: selectedTag,
							sortBy,
							sortOrder,
							page: currentPage.toString(),
						}}
					/>
				</Container>
			</MainLayout>
		)
	} catch (error) {
		console.error('Failed to load search page data:', error)

		// 降级到客户端渲染
		return (
			<MainLayout>
				<Container maxW="7xl" py={8}>
					<Stack gap={6} mb={8} textAlign="center">
						<Stack gap={4}>
							<Heading
								size={{ base: '2xl', md: '3xl' }}
								color={{ base: 'gray.900', _dark: 'white' }}
							>
								文章搜索
							</Heading>
							<Text
								color={{ base: 'gray.600', _dark: 'gray.400' }}
								fontSize="lg"
								maxW="2xl"
								mx="auto"
								lineHeight="1.6"
							>
								搜索您感兴趣的文章内容，支持按分类、标签筛选
							</Text>
						</Stack>
					</Stack>

					<SearchClient />
				</Container>
			</MainLayout>
		)
	}
}
