'use client'

import {
	Container,
	Grid,
	GridItem,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Skeleton,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ArticleListWithPagination } from '@/components/ArticleList'
import { ArchiveStatsCards } from './ArchiveStatsCards'
import { ArchiveTimeline } from './ArchiveTimeline'
import { usePaginatedSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'
import { PublicArticleType } from '@/types'
import { Archive, Calendar } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ArchiveClientProps {
	initialArticles: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	initialStats?: {
		totalArticles: number
		totalViews: number
		totalCategories: number
		totalTags: number
		monthlyStats: { year: number; month: number; count: number }[]
	}
}

/**
 * 归档页面客户端组件
 * 包含统计卡片、时间轴筛选和文章卡片布局
 */
export function ArchiveClient({
	initialArticles,
	initialStats,
}: ArchiveClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	// 状态管理
	const [selectedYear, setSelectedYear] = useState<number | undefined>(
		searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
	)
	const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
		searchParams.get('month')
			? parseInt(searchParams.get('month')!)
			: undefined,
	)
	const [currentPage, setCurrentPage] = useState(
		searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
	)

	const pageSize = 6 // 3行2列 = 6篇文章

	// 获取归档文章数据
	const articlesState = usePaginatedSWR(
		`archive-articles-${selectedYear || 'all'}-${selectedMonth || 'all'}`,
		(page: number, limit: number) =>
			articlesApi.getArchive({
				year: selectedYear,
				month: selectedMonth,
				page,
				limit,
			}),
		currentPage,
		pageSize,
		{
			fallbackData: initialArticles,
		},
	)

	// 处理筛选变化
	const handleFilterChange = useCallback(
		(year?: number, month?: number) => {
			setSelectedYear(year)
			setSelectedMonth(month)
			setCurrentPage(1) // 重置到第一页

			// 更新URL
			const params = new URLSearchParams()
			if (year) params.set('year', year.toString())
			if (month) params.set('month', month.toString())

			router.push(`/archive?${params.toString()}`, { scroll: false })
		},
		[router],
	)

	// 处理分页变化
	const handlePageChange = useCallback(
		(page: number) => {
			setCurrentPage(page)

			// 更新URL
			const params = new URLSearchParams()
			if (selectedYear) params.set('year', selectedYear.toString())
			if (selectedMonth) params.set('month', selectedMonth.toString())
			if (page > 1) params.set('page', page.toString())

			router.push(`/archive?${params.toString()}`, { scroll: false })
		},
		[router, selectedYear, selectedMonth],
	)

	const totalPages = Math.ceil(
		(articlesState.data?.total || initialArticles.total) / pageSize,
	)
	const totalArticles = articlesState.data?.total || initialArticles.total

	// 构建筛选描述
	const getFilterDescription = () => {
		if (!selectedYear) return '全部文章'
		if (!selectedMonth) return `${selectedYear}年的文章`

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
		return `${selectedYear}年${monthNames[selectedMonth - 1]}的文章`
	}

	return (
		<MainLayout>
			<Container maxW="7xl" py={6}>
				{/* 统计卡片 */}
				<ArchiveStatsCards
					initialStats={initialStats}
					serverOnly={!!initialStats}
				/>

				{/* 主要内容区域 */}
				<Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
					{/* 左侧时间轴筛选 */}
					<GridItem>
						<Box position="sticky" top="100px">
							<ArchiveTimeline
								selectedYear={selectedYear}
								selectedMonth={selectedMonth}
								onFilterChange={handleFilterChange}
								initialStats={initialStats?.monthlyStats}
							/>
						</Box>
					</GridItem>

					{/* 右侧文章列表 */}
					<GridItem>
						<Stack gap={6}>
							{/* 筛选结果标题 */}
							<Stack
								direction={{ base: 'column', sm: 'row' }}
								justify="space-between"
								align={{ base: 'flex-start', sm: 'center' }}
								gap={4}
							>
								<Stack direction="row" align="center" gap={2}>
									<Calendar size={20} />
									<Heading
										size="lg"
										color={{ base: 'gray.900', _dark: 'white' }}
									>
										{getFilterDescription()}
									</Heading>
								</Stack>
								<Text
									color={{ base: 'gray.600', _dark: 'gray.400' }}
									fontSize="sm"
								>
									共 {totalArticles} 篇文章
								</Text>
							</Stack>

							{/* 文章网格 - 固定3行2列 */}
							{articlesState.loading ? (
								<Grid templateColumns="repeat(2, 1fr)" gap={6}>
									{Array.from({ length: 6 }).map((_, i) => (
										<Card.Root key={i} p={5} h="190px">
											<Stack gap={3}>
												<Skeleton height="24px" width="80%" />
												<Skeleton height="60px" />
												<Skeleton height="20px" width="60%" />
												<Skeleton height="16px" width="40%" />
											</Stack>
										</Card.Root>
									))}
								</Grid>
							) : totalArticles === 0 ? (
								<Card.Root p={12} textAlign="center">
									<Stack gap={4} align="center">
										<Box
											p={4}
											bg={{ base: 'gray.50', _dark: 'gray.700' }}
											rounded="lg"
											color={{ base: 'gray.400', _dark: 'gray.500' }}
										>
											<Archive size={48} />
										</Box>
										<Stack gap={2}>
											<Text
												color={{ base: 'gray.500', _dark: 'gray.400' }}
												fontSize="lg"
											>
												{getFilterDescription()}暂无文章
											</Text>
											<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
												请尝试选择其他时间范围
											</Text>
										</Stack>
									</Stack>
								</Card.Root>
							) : (
								<ArticleListWithPagination
									articles={articlesState?.data?.items || []}
									loading={false}
									error={null}
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={handlePageChange}
									gridColumns={{
										base: '1fr',
										sm: 'repeat(2, 1fr)',
									}}
									showEmptyBlocks={true}
									emptyBlocksTarget={6}
									paginationProps={{ mt: 0, showFirstLast: true }}
								/>
							)}

							{/* 分页组件已集成到ArticleListWithPagination中 */}
						</Stack>
					</GridItem>
				</Grid>
			</Container>
		</MainLayout>
	)
}
