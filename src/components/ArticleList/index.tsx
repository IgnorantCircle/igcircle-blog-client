import { Grid, Box, Text, Stack, Card, Skeleton, Alert } from '@chakra-ui/react'
import { ArticleCardServer } from '@/components/ArticleCard/ArticleCardServer'
import { Pagination } from '@/components/ui/Pagination'
import { PublicArticleType } from '@/types'
import { ReactNode } from 'react'

interface ArticleListWithPaginationProps {
	/** 文章数据 */
	articles: PublicArticleType[]
	/** 加载状态 */
	loading: boolean
	/** 错误状态 */
	error?: Error | null
	/** 当前页码 */
	currentPage: number
	/** 总页数 */
	totalPages: number
	/** 页码变化回调 */
	onPageChange: (page: number) => void
	/** 网格列配置 */
	gridColumns?: {
		base: string
		md?: string
		lg?: string
		sm?: string
	}
	/** 是否显示空白块补充（保持布局） */
	showEmptyBlocks?: boolean
	/** 空白块的目标数量 */
	emptyBlocksTarget?: number
	/** 空状态内容 */
	emptyStateContent?: ReactNode
	/** 错误状态内容 */
	errorStateContent?: ReactNode
	/** 加载状态骨架屏数量 */
	skeletonCount?: number
	/** 分页器额外属性 */
	paginationProps?: {
		showFirstLast?: boolean
		mt?: number | string
	}
	/** 是否在没有多页时保留分页器位置 */
	reservePaginationSpace?: boolean
}

export function ArticleListWithPagination({
	articles,
	loading,
	error,
	currentPage,
	totalPages,
	onPageChange,
	gridColumns = {
		base: '1fr',
		md: 'repeat(2, 1fr)',
	},
	showEmptyBlocks = false,
	emptyBlocksTarget = 6,
	emptyStateContent,
	errorStateContent,
	skeletonCount = 6,
	paginationProps = {},
	reservePaginationSpace = true,
}: ArticleListWithPaginationProps) {
	// 加载状态
	if (loading) {
		return (
			<Grid templateColumns={gridColumns} gap={6}>
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<Card.Root key={i} p={6}>
						<Stack gap={4}>
							<Skeleton height="24px" width="80%" />
							<Skeleton height="60px" />
							<Skeleton height="20px" width="60%" />
							<Skeleton height="16px" width="40%" />
						</Stack>
					</Card.Root>
				))}
			</Grid>
		)
	}

	// 错误状态
	if (error) {
		if (errorStateContent) {
			return <>{errorStateContent}</>
		}
		return (
			<Alert.Root status="error">
				<Alert.Title>加载失败</Alert.Title>
				<Alert.Description>
					{error?.message || '文章列表加载失败，请稍后重试'}
				</Alert.Description>
			</Alert.Root>
		)
	}

	// 空状态
	if (!articles.length) {
		if (emptyStateContent) {
			return <>{emptyStateContent}</>
		}
		return (
			<Box textAlign="center" py={12}>
				<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="lg">
					暂无文章
				</Text>
			</Box>
		)
	}

	// 正常状态
	return (
		<Stack gap={6}>
			<Grid templateColumns={gridColumns} gap={6}>
				{/* 显示文章卡片 */}
				{articles.map((article) => (
					<ArticleCardServer key={article.id} article={article} />
				))}
				{/* 补充空白块以保持布局 */}
				{showEmptyBlocks &&
					Array.from({
						length: Math.max(0, emptyBlocksTarget - articles.length),
					}).map((_, i) => <Box key={`empty-${i}`} height="190px" />)}
			</Grid>

			{/* 分页器 */}
			<Box display="flex" justifyContent="center" mt={paginationProps.mt || 2}>
				{totalPages > 1 ? (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
						{...paginationProps}
					/>
				) : (
					reservePaginationSpace && <Box height="36px" />
				)}
			</Box>
		</Stack>
	)
}
