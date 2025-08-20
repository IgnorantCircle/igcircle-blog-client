'use client'

import {
	Container,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Button,
	Alert,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ArticleListWithPagination } from '@/components/ArticleList'
import { usePaginatedSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'
import { PublicArticleType, PublicCategoryType } from '@/types'
import Link from 'next/link'

import { ArrowLeft, Folder, FileText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

// 分类统计组件
function CategoryStats({ category }: { category: PublicCategoryType }) {
	return (
		<Card.Root
			p={6}
			bg={{ base: 'blue.50', _dark: 'blue.900' }}
			borderColor="blue.200"
		>
			<Stack gap={4}>
				<Stack direction="row" gap={3} align="center">
					<Box p={2} bg="blue.500" color="white" borderRadius="md">
						<Folder size={20} />
					</Box>
					<Stack gap={1}>
						<Heading size="xl" color="blue.700">
							{category.name}
						</Heading>
						<Text color="blue.600" fontSize="sm">
							分类 · {category.articleCount || 0} 篇文章
						</Text>
					</Stack>
				</Stack>
				{category.description && (
					<Text color="blue.700" lineHeight="1.6">
						{category.description}
					</Text>
				)}
			</Stack>
		</Card.Root>
	)
}

interface CategoryClientProps {
	category: PublicCategoryType
	initialArticles: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
	}
	categorySlug: string
}

export default function CategoryClient({
	category,
	initialArticles,
	categorySlug,
}: CategoryClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [currentPage, setCurrentPage] = useState(initialArticles.page)
	const pageSize = 6

	// 获取该分类下的文章
	const articlesState = usePaginatedSWR(
		`category-${category.id}-articles`,
		(page: number, limit: number) =>
			articlesApi.getArticles({
				page,
				limit,
				categoryIds: [category.id],
				status: 'published' as const,
				sortBy: 'publishedAt',
				sortOrder: 'DESC',
			}),
		currentPage,
		pageSize,
		{
			fallbackData:
				currentPage === initialArticles.page
					? {
							items: initialArticles.items,
							total: initialArticles.total,
							page: initialArticles.page,
							limit: initialArticles.limit,
							totalPages: Math.ceil(
								initialArticles.total / initialArticles.limit,
							),
							hasNext:
								initialArticles.page * initialArticles.limit <
								initialArticles.total,
							hasPrev: initialArticles.page > 1,
						}
					: undefined,
		},
	)

	// 处理分页
	const handlePageChange = useCallback(
		(page: number) => {
			setCurrentPage(page)
			// 更新 URL
			const params = new URLSearchParams(searchParams.toString())
			if (page > 1) {
				params.set('page', page.toString())
			} else {
				params.delete('page')
			}
			router.push(`/categories/${categorySlug}?${params.toString()}`)
		},
		[categorySlug, router, searchParams],
	)

	// 计算总页数和文章列表
	const totalPages = Math.ceil(
		(articlesState.data?.total || initialArticles.total) / pageSize,
	)
	const articles = articlesState.data?.items || initialArticles.items

	return (
		<MainLayout>
			<Container maxW="6xl" py={4}>
				<Stack gap={4}>
					{/* 返回按钮 */}
					<Button
						variant="ghost"
						size="sm"
						width="fit-content"
						bg="blue.500"
						color="white"
						onClick={() => router.push('/categories')}
					>
						<ArrowLeft size={16} />
						返回
					</Button>

					{/* 分类信息 */}
					<CategoryStats category={category} />

					{/* 文章列表 */}
					<Box>
						<ArticleListWithPagination
							articles={articles}
							loading={articlesState.loading}
							error={articlesState.error}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							gridColumns={{
								base: '1fr',
								md: 'repeat(2, 1fr)',
							}}
							showEmptyBlocks={true}
							emptyBlocksTarget={6}
							paginationProps={{ mt: 2 }}
							errorStateContent={
								<Alert.Root status="error">
									<Alert.Title>加载失败</Alert.Title>
									<Alert.Description>
										{articlesState.errorState?.userMessage ||
											'文章列表加载失败，请稍后重试'}
									</Alert.Description>
								</Alert.Root>
							}
							emptyStateContent={
								<Box textAlign="center" py={12}>
									<Stack gap={4} align="center">
										<Box p={4} bg="gray.50" borderRadius="full">
											<FileText size={32} color="#9CA3AF" />
										</Box>
										<Stack gap={2} align="center">
											<Heading size="md" color="gray.600">
												该分类下暂无文章
											</Heading>
											<Text color="gray.500" fontSize="sm">
												敬请期待更多精彩内容
											</Text>
										</Stack>
										<Button asChild variant="outline">
											<Link href="/articles">浏览所有文章</Link>
										</Button>
									</Stack>
								</Box>
							}
						/>
					</Box>
				</Stack>
			</Container>
		</MainLayout>
	)
}
