'use client'

import {
	Grid,
	Box,
	Text,
	Stack,
	Card,
	Button,
	Skeleton,
	Alert,
	Input,
	Select,
	createListCollection,
} from '@chakra-ui/react'
import { ArticleListWithPagination } from '@/components/ArticleList'
import { useApiSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'
import { PublicArticleType, PublicCategoryType, PublicTagType } from '@/types'
import { Search, X } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchClientProps {
	initialCategories?: PublicCategoryType[]
	initialTags?: PublicTagType[]
	initialSearchResults?: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	initialSearchParams?: {
		q?: string
		category?: string
		tag?: string
		sortBy?: string
		sortOrder?: string
		page?: string
	}
}

export function SearchClient({
	initialCategories = [],
	initialTags = [],
	initialSearchResults,
	initialSearchParams = {},
}: SearchClientProps) {
	const router = useRouter()

	// 搜索状态
	const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '')
	const [selectedCategory, setSelectedCategory] = useState(
		initialSearchParams.category || '',
	)
	const [selectedTag, setSelectedTag] = useState(initialSearchParams.tag || '')
	const [sortBy, setSortBy] = useState<
		'publishedAt' | 'viewCount' | 'likeCount'
	>(
		(initialSearchParams.sortBy as 'publishedAt' | 'viewCount' | 'likeCount') ||
			'publishedAt',
	)
	const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
		(initialSearchParams.sortOrder as 'ASC' | 'DESC') || 'DESC',
	)
	const [currentPage, setCurrentPage] = useState(
		parseInt(initialSearchParams.page || '1'),
	)
	const pageSize = 12

	// 构建搜索key
	const hasActiveFilters = searchQuery.trim() || selectedCategory || selectedTag
	const searchKey = hasActiveFilters
		? `search-${JSON.stringify({
				q: searchQuery.trim(),
				category: selectedCategory,
				tag: selectedTag,
				sortBy,
				sortOrder,
				page: currentPage,
			})}`
		: null

	// 搜索文章
	const articlesState = useApiSWR(
		searchKey,
		() => {
			if (!hasActiveFilters) {
				return Promise.resolve({
					items: [],
					total: 0,
					page: 1,
					limit: pageSize,
					totalPages: 0,
					hasNext: false,
					hasPrev: false,
				})
			}

			return articlesApi.getArticles({
				page: currentPage,
				limit: pageSize,
				keyword: searchQuery.trim() || undefined,
				categoryId: selectedCategory || undefined,
				tagIds: selectedTag ? [selectedTag] : undefined,
				status: 'published',
				sortBy,
				sortOrder,
			})
		},
		{ fallbackData: initialSearchResults },
	)

	// 执行搜索
	const handleSearch = useCallback(async () => {
		setCurrentPage(1)

		// 触发SWR重新获取数据
		if (searchQuery.trim() || selectedCategory || selectedTag) {
			articlesState.mutate()
		}

		// 更新URL参数
		const params = new URLSearchParams()
		if (searchQuery.trim()) params.set('q', searchQuery.trim())
		if (selectedCategory) params.set('category', selectedCategory)
		if (selectedTag) params.set('tag', selectedTag)
		if (sortBy !== 'publishedAt') params.set('sortBy', sortBy)
		if (sortOrder !== 'DESC') params.set('sortOrder', sortOrder)
		if (currentPage !== 1) params.set('page', currentPage.toString())

		router.replace(`/search?${params.toString()}`)
	}, [
		searchQuery,
		selectedCategory,
		selectedTag,
		sortBy,
		sortOrder,
		currentPage,
		articlesState,
		router,
	])

	// 清除筛选
	const handleClearFilters = useCallback(() => {
		setSearchQuery('')
		setSelectedCategory('')
		setSelectedTag('')
		setSortBy('publishedAt')
		setSortOrder('DESC')
		setCurrentPage(1)
		router.replace('/search')
	}, [router])

	// 处理分页
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page)
	}, [])

	// 计算总页数
	const totalPages = Math.ceil((articlesState.data?.total || 0) / pageSize)
	const articles = articlesState.data?.items || []
	const categories = initialCategories
	const tags = initialTags

	return (
		<Stack gap={6}>
			{/* 搜索表单 */}
			<Card.Root p={6}>
				<Stack gap={6}>
					{/* 搜索框 */}
					<Stack direction={{ base: 'column', md: 'row' }} gap={4}>
						<Box flex={1}>
							<Input
								placeholder="输入关键词搜索文章..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								size="lg"
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleSearch()
									}
								}}
							/>
						</Box>
						<Button
							colorPalette="blue"
							size="lg"
							onClick={handleSearch}
							loading={articlesState.loading}
						>
							<Search size={20} />
							<Text ml={2}>搜索</Text>
						</Button>
					</Stack>

					{/* 筛选选项 */}
					<Grid
						templateColumns={{
							base: '1fr',
							md: 'repeat(2, 1fr)',
							lg: 'repeat(4, 1fr)',
						}}
						gap={4}
					>
						{/* 分类筛选 */}
						<Stack gap={2}>
							<Text
								fontSize="sm"
								fontWeight="medium"
								color={{ base: 'gray.700', _dark: 'gray.300' }}
							>
								分类
							</Text>
							<Select.Root
								collection={createListCollection({
									items: [
										{ label: '全部分类', value: '' },
										...categories.map((category) => ({
											label: category.name,
											value: category.id,
										})),
									],
								})}
								value={[selectedCategory]}
								onValueChange={(e) => setSelectedCategory(e.value[0] || '')}
							>
								<Select.Trigger>
									<Select.ValueText placeholder="选择分类" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item item="">全部分类</Select.Item>
									{categories.map((category) => (
										<Select.Item key={category.id} item={category.id}>
											{category.name}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</Stack>

						{/* 标签筛选 */}
						<Stack gap={2}>
							<Text
								fontSize="sm"
								fontWeight="medium"
								color={{ base: 'gray.700', _dark: 'gray.300' }}
							>
								标签
							</Text>
							<Select.Root
								collection={createListCollection({
									items: [
										{ label: '全部标签', value: '' },
										...tags.map((tag) => ({
											label: tag.name,
											value: tag.id,
										})),
									],
								})}
								value={[selectedTag]}
								onValueChange={(e) => setSelectedTag(e.value[0] || '')}
							>
								<Select.Trigger>
									<Select.ValueText placeholder="选择标签" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item item="">全部标签</Select.Item>
									{tags.map((tag) => (
										<Select.Item key={tag.id} item={tag.id}>
											{tag.name}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</Stack>

						{/* 排序方式 */}
						<Stack gap={2}>
							<Text
								fontSize="sm"
								fontWeight="medium"
								color={{ base: 'gray.700', _dark: 'gray.300' }}
							>
								排序
							</Text>
							<Select.Root
								collection={createListCollection({
									items: [
										{ label: '发布时间', value: 'publishedAt' },
										{ label: '浏览量', value: 'viewCount' },
										{ label: '点赞数', value: 'likeCount' },
									],
								})}
								value={[sortBy]}
								onValueChange={(e) =>
									setSortBy(
										e.value[0] as 'publishedAt' | 'viewCount' | 'likeCount',
									)
								}
							>
								<Select.Trigger>
									<Select.ValueText />
								</Select.Trigger>
								<Select.Content>
									<Select.Item item="publishedAt">发布时间</Select.Item>
									<Select.Item item="viewCount">浏览量</Select.Item>
									<Select.Item item="likeCount">点赞数</Select.Item>
								</Select.Content>
							</Select.Root>
						</Stack>

						{/* 排序顺序 */}
						<Stack gap={2}>
							<Text
								fontSize="sm"
								fontWeight="medium"
								color={{ base: 'gray.700', _dark: 'gray.300' }}
							>
								顺序
							</Text>
							<Select.Root
								collection={createListCollection({
									items: [
										{ label: '降序', value: 'DESC' },
										{ label: '升序', value: 'ASC' },
									],
								})}
								value={[sortOrder]}
								onValueChange={(e) =>
									setSortOrder(e.value[0] as 'ASC' | 'DESC')
								}
							>
								<Select.Trigger>
									<Select.ValueText />
								</Select.Trigger>
								<Select.Content>
									<Select.Item item="DESC">降序</Select.Item>
									<Select.Item item="ASC">升序</Select.Item>
								</Select.Content>
							</Select.Root>
						</Stack>
					</Grid>

					{/* 操作按钮 */}
					{hasActiveFilters && (
						<Stack direction="row" gap={4} justify="flex-end">
							<Button variant="outline" onClick={handleClearFilters}>
								<X size={16} />
								<Text ml={2}>清除筛选</Text>
							</Button>
						</Stack>
					)}
				</Stack>
			</Card.Root>

			{/* 搜索结果 */}
			<Stack gap={6}>
				{/* 结果统计 */}
				{!articlesState.loading && articlesState.data && hasActiveFilters && (
					<Stack
						direction={{ base: 'column', sm: 'row' }}
						justify="space-between"
						align={{ base: 'flex-start', sm: 'center' }}
						gap={4}
					>
						<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
							共找到 {articlesState.data.total} 篇文章
						</Text>
						{articlesState.data.total > 0 && (
							<Text
								color={{ base: 'gray.500', _dark: 'gray.400' }}
								fontSize="sm"
							>
								第 {currentPage} 页，共 {totalPages} 页
							</Text>
						)}
					</Stack>
				)}

				{/* 文章网格 */}
				{!hasActiveFilters ? (
					<Card.Root p={12} textAlign="center">
						<Stack gap={4} align="center">
							<Box
								p={4}
								bg={{ base: 'gray.50', _dark: 'gray.700' }}
								rounded="lg"
								color={{ base: 'gray.400', _dark: 'gray.500' }}
							>
								<Search size={48} />
							</Box>
							<Stack gap={2}>
								<Text
									color={{ base: 'gray.500', _dark: 'gray.400' }}
									fontSize="lg"
								>
									请输入关键词或选择筛选条件
								</Text>
								<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
									开始搜索您感兴趣的文章内容
								</Text>
							</Stack>
						</Stack>
					</Card.Root>
				) : articlesState.loading ? (
					<Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
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
				) : articlesState.error ? (
					<Alert.Root status="error">
						<Alert.Title>搜索失败</Alert.Title>
						<Alert.Description>
							{articlesState.errorState?.userMessage || '搜索失败，请稍后重试'}
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
								<Search size={48} />
							</Box>
							<Stack gap={2}>
								<Text
									color={{ base: 'gray.500', _dark: 'gray.400' }}
									fontSize="lg"
								>
									未找到匹配的文章
								</Text>
								<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
									尝试调整搜索条件或浏览其他内容
								</Text>
							</Stack>
							<Button onClick={handleClearFilters} colorPalette="blue">
								清除筛选条件
							</Button>
						</Stack>
					</Card.Root>
				) : (
					<ArticleListWithPagination
						articles={articles}
						loading={false}
						error={null}
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
						gridColumns={{
							base: '1fr',
							md: 'repeat(2, 1fr)',
						}}
						reservePaginationSpace={false}
					/>
				)}
			</Stack>
		</Stack>
	)
}
