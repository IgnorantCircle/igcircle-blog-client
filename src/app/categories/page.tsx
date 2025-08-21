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
import { useApiSWR } from '@/hooks/useSWR'
import { categoriesApi } from '@/lib/api/categories'
import { PublicCategoryType } from '@/types'
import Link from 'next/link'
import { Folder, FileText, TrendingUp } from 'lucide-react'
import { articlesApi } from '@/lib/api'

// 分类卡片组件
function CategoryCard({ category }: { category: PublicCategoryType }) {
	return (
		<Card.Root
			p={6}
			_hover={{
				transform: 'translateY(-2px)',
				shadow: 'lg',
			}}
			transition="all 0.2s"
			cursor="pointer"
			h="full"
		>
			<Box asChild>
				<Link href={`/categories/${category.id}`}>
					<Stack gap={4} h="full">
						{/* 图标和标题 */}
						<Stack direction="row" gap={3} align="center">
							<Box
								p={3}
								bg={{ base: 'blue.50', _dark: 'blue.900/20' }}
								rounded="lg"
								color="blue.500"
							>
								{category.icon ? (
									<Text fontSize="2xl">{category.icon}</Text>
								) : (
									<Folder size={24} />
								)}
							</Box>
							<Stack gap={1} flex={1}>
								<Heading
									size="md"
									color={{ base: 'gray.900', _dark: 'white' }}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
								>
									{category.name}
								</Heading>
								<Stack direction="row" gap={2} align="center">
									<FileText size={14} />
									<Text
										color={{ base: 'gray.500', _dark: 'gray.400' }}
										fontSize="sm"
									>
										{category.articleCount || 0} 篇文章
									</Text>
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</Link>
			</Box>
		</Card.Root>
	)
}

// 统计信息组件
function CategoryStats({
	categories,
	articlesStatistics,
}: {
	categories: PublicCategoryType[]
	articlesStatistics: {
		totalArticles: number
		totalCategories: number
	}
}) {
	if (!categories.length) return
	const totalArticles = articlesStatistics.totalArticles
	const mostPopular = categories.reduce((prev, current) =>
		(prev.articleCount || 0) > (current.articleCount || 0) ? prev : current,
	)

	return (
		<Grid templateColumns={{ base: 'repeat(3, 1fr)' }} gap={6} mb={8}>
			<Card.Root p={6} textAlign="center">
				<Stack gap={3} align="center">
					<Box
						p={3}
						bg={{ base: 'blue.50', _dark: 'blue.900/20' }}
						rounded="lg"
						color="blue.500"
					>
						<Folder size={24} />
					</Box>
					<Stack gap={1}>
						<Text
							fontSize="2xl"
							fontWeight="bold"
							color={{ base: 'gray.900', _dark: 'white' }}
						>
							{categories.length}
						</Text>
						<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
							总分类数
						</Text>
					</Stack>
				</Stack>
			</Card.Root>

			<Card.Root p={6} textAlign="center">
				<Stack gap={3} align="center">
					<Box
						p={3}
						bg={{ base: 'green.50', _dark: 'green.900/20' }}
						rounded="lg"
						color="green.500"
					>
						<FileText size={24} />
					</Box>
					<Stack gap={1}>
						<Text
							fontSize="2xl"
							fontWeight="bold"
							color={{ base: 'gray.900', _dark: 'white' }}
						>
							{totalArticles}
						</Text>
						<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
							总文章数
						</Text>
					</Stack>
				</Stack>
			</Card.Root>

			<Card.Root p={6} textAlign="center">
				<Stack gap={3} align="center">
					<Box
						p={3}
						bg={{ base: 'purple.50', _dark: 'purple.900/20' }}
						rounded="lg"
						color="purple.500"
					>
						<TrendingUp size={24} />
					</Box>
					<Stack gap={1}>
						<Text
							fontSize="lg"
							fontWeight="bold"
							color={{ base: 'gray.900', _dark: 'white' }}
							lineClamp={1}
						>
							{mostPopular.name}
						</Text>
						<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
							热门分类
						</Text>
					</Stack>
				</Stack>
			</Card.Root>
		</Grid>
	)
}

export default function CategoriesPage() {
	// 获取分类列表
	const categoriesState = useApiSWR('categories', () =>
		categoriesApi.getCategories(),
	)
	const articlesState = useApiSWR('articles', () =>
		articlesApi.getArticleArchiveStats(),
	)

	return (
		<MainLayout>
			<Container maxW="7xl" py={8}>
				{/* 加载状态 */}
				{categoriesState.loading ? (
					<>
						{/* 统计信息骨架屏 */}
						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
							gap={6}
							mb={8}
						>
							{Array.from({ length: 3 }).map((_, i) => (
								<Card.Root key={i} p={6}>
									<Stack gap={3} align="center">
										<Skeleton width="48px" height="48px" rounded="lg" />
										<Stack gap={1} align="center">
											<Skeleton height="32px" width="60px" />
											<Skeleton height="16px" width="80px" />
										</Stack>
									</Stack>
								</Card.Root>
							))}
						</Grid>

						{/* 分类卡片骨架屏 */}
						<Grid
							templateColumns={{
								base: '1fr',
								md: 'repeat(4, 1fr)',
							}}
							gap={6}
						>
							{Array.from({ length: 9 }).map((_, i) => (
								<Card.Root key={i} p={6}>
									<Stack gap={4}>
										<Stack direction="row" gap={3} align="center">
											<Skeleton width="48px" height="48px" rounded="lg" />
											<Stack gap={1} flex={1}>
												<Skeleton height="20px" width="80%" />
												<Skeleton height="16px" width="60%" />
											</Stack>
										</Stack>
										<Skeleton height="60px" />
										<Stack direction="row" justify="space-between">
											<Skeleton height="20px" width="40px" />
											<Skeleton height="32px" width="80px" />
										</Stack>
									</Stack>
								</Card.Root>
							))}
						</Grid>
					</>
				) : categoriesState.error ? (
					/* 错误状态 */
					<Alert.Root status="error">
						<Alert.Title>加载失败</Alert.Title>
						<Alert.Description>
							{categoriesState.error?.userMessage || '未知错误'}
						</Alert.Description>
					</Alert.Root>
				) : categoriesState.data?.length === 0 ? (
					/* 空状态 */
					<Card.Root p={12} textAlign="center">
						<Stack gap={4} align="center">
							<Box
								p={4}
								bg={{ base: 'gray.50', _dark: 'gray.700' }}
								rounded="lg"
								color={{ base: 'gray.400', _dark: 'gray.500' }}
							>
								<Folder size={48} />
							</Box>
							<Stack gap={2}>
								<Text
									color={{ base: 'gray.500', _dark: 'gray.400' }}
									fontSize="lg"
								>
									暂无分类
								</Text>
								<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
									敬请期待更多分类内容
								</Text>
							</Stack>
						</Stack>
					</Card.Root>
				) : (
					/* 正常状态 */
					<>
						{/* 统计信息 */}
						<CategoryStats
							categories={categoriesState.data || []}
							articlesStatistics={
								articlesState.data || {
									totalArticles: 0,
									totalCategories: 0,
								}
							}
						/>

						{/* 分类网格 */}
						<Grid
							templateColumns={{
								base: '1fr',
								md: 'repeat(3, 1fr)',
								lg: 'repeat(5, 1fr)',
							}}
							gap={6}
						>
							{categoriesState.data?.map((category) => (
								<CategoryCard key={category.id} category={category} />
							))}
						</Grid>

						{/* 底部提示 */}
						<Box textAlign="center" mt={12}>
							<Box asChild>
								<Link href="/articles">
									<Button colorPalette="blue" size="lg">
										浏览所有文章
									</Button>
								</Link>
							</Box>
						</Box>
					</>
				)}
			</Container>
		</MainLayout>
	)
}
