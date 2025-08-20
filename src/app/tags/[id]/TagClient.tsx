'use client'

import {
	Container,
	Grid,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Button,
	Skeleton,
	Alert,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ArticleListWithPagination } from '@/components/ArticleList'
import { usePaginatedSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'
import { PublicArticleType, PublicTagType } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Hash, FileText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

interface TagClientProps {
	tag: PublicTagType
	initialArticles: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
	}
	tagId: string
}

export default function TagClient({
	tag,
	initialArticles,
	tagId,
}: TagClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [currentPage, setCurrentPage] = useState(initialArticles.page)
	const pageSize = 6

	// 获取该标签下的文章
	const articlesState = usePaginatedSWR(
		`tag-${tagId}-articles`,
		(page: number, limit: number) =>
			articlesApi.getArticles({
				page,
				limit,
				tagIds: [tagId],
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
			router.push(`/tags/${tagId}?${params.toString()}`)
		},
		[tagId, router, searchParams],
	)

	// 计算总页数和文章列表
	const totalPages = Math.ceil(
		(articlesState.data?.total || initialArticles.total) / pageSize,
	)
	const articles = articlesState.data?.items || initialArticles.items

	return (
		<MainLayout>
			<Container maxW="7xl" py={8}>
				<Stack gap={4} mb={3}>
					{/* 返回按钮 */}
					<Button
						variant="ghost"
						size="sm"
						width="fit-content"
						bg="blue.500"
						color="white"
						onClick={() => router.push('/tags')}
					>
						<ArrowLeft size={16} />
						返回
					</Button>
				</Stack>

				{/* 标签信息 */}
				<Card.Root p={8} mb={8}>
					<Stack gap={6}>
						{/* 标签头部信息 */}
						<Stack
							direction={{ base: 'column', md: 'row' }}
							gap={6}
							align="center"
						>
							<Box
								p={4}
								bg={{ base: 'blue.50', _dark: 'blue.900/20' }}
								rounded="xl"
								color="blue.500"
								flexShrink={0}
							>
								<Hash size={48} />
							</Box>
							<Stack
								gap={3}
								flex={1}
								textAlign={{ base: 'center', md: 'left' }}
							>
								<Heading
									size="2xl"
									color={{ base: 'gray.900', _dark: 'white' }}
								>
									{tag.name}
								</Heading>
								<Stack
									direction="row"
									gap={4}
									justify={{ base: 'center', md: 'flex-start' }}
								>
									<Stack direction="row" gap={1} align="center">
										<FileText size={16} />
										<Text color={{ base: 'gray.600', _dark: 'gray.400' }}>
											{tag.articleCount || 0} 篇文章
										</Text>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</Card.Root>

				{/* 文章列表 */}
				<Stack gap={6}>
					{/* 文章网格 */}
					{articlesState.loading ? (
						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
							gap={6}
						>
							{Array.from({ length: 8 }).map((_, i) => (
								<Card.Root key={i} p={6}>
									<Stack gap={4}>
										<Skeleton height="24px" width="80%" />
										<Skeleton height="60px" />
										<Stack direction="row" gap={2}>
											<Skeleton height="20px" width="60px" />
											<Skeleton height="20px" width="60px" />
										</Stack>
										<Skeleton height="20px" width="200px" />
									</Stack>
								</Card.Root>
							))}
						</Grid>
					) : false ? (
						<Alert.Root status="error">
							<Alert.Title>文章加载失败</Alert.Title>
							<Alert.Description>
								文章列表加载失败，请稍后重试
							</Alert.Description>
						</Alert.Root>
					) : articles.length === 0 ? (
						<Card.Root p={12} textAlign="center">
							<Stack gap={4} align="center">
								<Box
									p={4}
									bg={{ base: 'gray.50', _dark: 'gray.700' }}
									rounded="lg"
									color={{ base: 'gray.400', _dark: 'gray.500' }}
								>
									<FileText size={48} />
								</Box>
								<Stack gap={2}>
									<Text
										color={{ base: 'gray.500', _dark: 'gray.400' }}
										fontSize="lg"
									>
										该标签下暂无文章
									</Text>
									<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
										敬请期待更多精彩内容
									</Text>
								</Stack>
								<Box asChild>
									<Link href="/articles">
										<Button colorPalette="blue">浏览其他文章</Button>
									</Link>
								</Box>
							</Stack>
						</Card.Root>
					) : (
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
						/>
					)}
				</Stack>
			</Container>
		</MainLayout>
	)
}
