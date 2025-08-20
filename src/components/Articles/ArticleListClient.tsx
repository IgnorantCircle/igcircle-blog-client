'use client'

import { useEffect, useRef } from 'react'
import {
	Container,
	Grid,
	GridItem,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Badge,
	Button,
	Skeleton,
	Select,
	createListCollection,
	Portal,
	HStack,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { SearchInput } from '@/components/ui/SearchInput'
import { ArticleListWithPagination } from '@/components/ArticleList'
import { useApiSWR } from '@/hooks/useSWR'
import { useArticleFilters } from '@/hooks/useArticleFilters'
import { useFilterDisplay } from '@/hooks/useFilterDisplay'
import { useToast } from '@/hooks/useToast'
import { articlesApi } from '@/lib/api/articles'
import { categoriesApi } from '@/lib/api/categories'
import { tagsApi } from '@/lib/api/tags'
import {
	PublicCategoryType,
	PublicTagType,
	ArticleQueryType,
	PublicArticleType,
} from '@/types'

interface ArticleListClientProps {
	initialCategories?: PublicCategoryType[]
	initialTags?: PublicTagType[]
	initialArticles?: {
		items: PublicArticleType[]
		total: number
		page: number
		limit: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	initialFilters?: ArticleQueryType
}

// 筛选侧边栏组件
function FilterSidebar({
	filters,
	onFiltersChange,
	categoriesState,
	tagsState,
	toast,
}: {
	filters: ArticleQueryType
	onFiltersChange: (filters: ArticleQueryType) => void
	categoriesState: ReturnType<typeof useApiSWR<PublicCategoryType[]>>
	tagsState: ReturnType<typeof useApiSWR<PublicTagType[]>>
	toast: ReturnType<typeof useToast>
}) {
	return (
		<Box h="calc(100vh - 200px)" pr={2}>
			<Stack gap={6}>
				{/* 分类筛选 */}
				<Card.Root p={6}>
					<Stack gap={4}>
						<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
							按分类筛选
						</Heading>
						{categoriesState.loading ? (
							<Stack gap={2}>
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} height="32px" />
								))}
							</Stack>
						) : (
							<Box maxH="250px" overflowY="auto">
								<Stack gap={2}>
									<Button
										variant={!filters.categoryIds?.length ? 'solid' : 'outline'}
										colorPalette={
											!filters.categoryIds?.length ? 'blue' : 'gray'
										}
										size="sm"
										w="full"
										justifyContent="flex-start"
										onClick={() =>
											onFiltersChange({
												...filters,
												categoryIds: undefined,
												page: 1,
											})
										}
									>
										全部分类
									</Button>
									{categoriesState.data?.map((category: PublicCategoryType) => {
										const isSelected = filters.categoryIds?.includes(
											category.id,
										)
										const currentCategoryCount =
											filters.categoryIds?.length || 0
										const isDisabled = !isSelected && currentCategoryCount >= 3
										return (
											<Button
												key={category.id}
												variant={isSelected ? 'solid' : 'outline'}
												colorPalette={isSelected ? 'blue' : 'gray'}
												size="sm"
												w="full"
												justifyContent="space-between"
												disabled={isDisabled}
												onClick={() => {
													if (isDisabled) {
														toast.warning('最多只能选择3个分类')
														return
													}
													const currentCategoryIds = filters.categoryIds || []
													const newCategoryIds = isSelected
														? currentCategoryIds.filter(
																(id) => id !== category.id,
															)
														: [...currentCategoryIds, category.id]
													onFiltersChange({
														...filters,
														categoryIds: newCategoryIds.length
															? newCategoryIds
															: undefined,
														page: 1,
													})
												}}
											>
												<Text>{category.name}</Text>
												<Badge size="sm" colorPalette="blue">
													{category.articleCount || 0}
												</Badge>
											</Button>
										)
									})}
								</Stack>
							</Box>
						)}
					</Stack>
				</Card.Root>

				{/* 标签筛选 */}
				<Card.Root p={6}>
					<Stack gap={4}>
						<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
							按标签筛选
						</Heading>
						{tagsState.loading ? (
							<Stack gap={2}>
								{Array.from({ length: 8 }).map((_, i) => (
									<Skeleton key={i} height="28px" />
								))}
							</Stack>
						) : (
							<Box maxH="300px" overflowY="auto">
								<Stack gap={3}>
									<HStack gap={2} wrap="wrap">
										<Button
											variant={!filters.tagIds?.length ? 'solid' : 'outline'}
											colorPalette={!filters.tagIds?.length ? 'blue' : 'gray'}
											size="sm"
											onClick={() =>
												onFiltersChange({
													...filters,
													tagIds: undefined,
													page: 1,
												})
											}
										>
											全部标签
										</Button>
									</HStack>
									<HStack gap={2} wrap="wrap">
										{tagsState.data?.map((tag: PublicTagType) => {
											const isSelected = filters.tagIds?.includes(tag.id)
											const currentTagCount = filters.tagIds?.length || 0
											const isDisabled = !isSelected && currentTagCount >= 5
											return (
												<Button
													key={tag.id}
													variant={isSelected ? 'solid' : 'outline'}
													colorPalette={isSelected ? 'blue' : 'gray'}
													size="xs"
													disabled={isDisabled}
													onClick={() => {
														if (isDisabled) {
															toast.warning('最多只能选择5个标签')
															return
														}
														const currentTagIds = filters.tagIds || []
														const newTagIds = isSelected
															? currentTagIds.filter((id) => id !== tag.id)
															: [...currentTagIds, tag.id]
														onFiltersChange({
															...filters,
															tagIds: newTagIds.length ? newTagIds : undefined,
															page: 1,
														})
													}}
												>
													{tag.name}
													<Badge size="sm" ml={1}>
														{tag.articleCount || 0}
													</Badge>
												</Button>
											)
										})}
									</HStack>
								</Stack>
							</Box>
						)}
					</Stack>
				</Card.Root>
			</Stack>
		</Box>
	)
}

export function ArticleListClient({
	initialCategories,
	initialTags,
	initialArticles,
	initialFilters,
}: ArticleListClientProps) {
	// Toast通知
	const toast = useToast()

	// 筛选逻辑
	const {
		filters,
		searchKeyword,
		setSearchKeyword,
		currentSortValue,
		handleFiltersChange,
		handleSearch,
		handlePageChange,
		clearAllFilters,
		handleSortChange,
	} = useArticleFilters(initialFilters)

	// 搜索模式选项
	const searchModeContent = createListCollection({
		items: [
			{ label: '标题', value: 'title' },
			{ label: '摘要', value: 'summary' },
			{ label: '内容', value: 'content' },
		],
	})

	// 排序选项
	const sortContent = createListCollection({
		items: [
			{ label: '最新发布', value: 'publishedAt_DESC' },
			{ label: '最早发布', value: 'publishedAt_ASC' },
			{ label: '最多浏览', value: 'viewCount_DESC' },
			{ label: '最多点赞', value: 'likeCount_DESC' },
		],
	})

	// 获取数据
	const categoriesState = useApiSWR(
		initialCategories ? null : 'categories',
		() => categoriesApi.getCategories(),
	)
	const tagsState = useApiSWR(initialTags ? null : 'tags', () =>
		tagsApi.getTags(),
	)
	const articlesState = useApiSWR(
		initialArticles ? null : `articles-${JSON.stringify(filters)}`,
		() => articlesApi.getArticles(filters),
	)

	// 使用初始数据或API数据
	const finalCategoriesState = {
		...categoriesState,
		data: initialCategories || categoriesState.data,
		loading: !initialCategories && categoriesState.loading,
	}

	const finalTagsState = {
		...tagsState,
		data: initialTags || tagsState.data,
		loading: !initialTags && tagsState.loading,
	}

	const finalArticlesState = {
		...articlesState,
		data: initialArticles || articlesState.data,
		loading: !initialArticles && articlesState.loading,
	}

	// 处理筛选条件变化时的数据重新获取
	const initialFiltersRef = useRef(initialFilters)
	const hasInitialArticles = useRef(!!initialArticles)

	useEffect(() => {
		// 如果有初始数据，但筛选条件发生了变化，需要重新获取数据
		if (hasInitialArticles.current && initialFiltersRef.current) {
			const filtersChanged =
				JSON.stringify(filters) !== JSON.stringify(initialFiltersRef.current)
			if (filtersChanged) {
				// 清除初始数据标记，让组件重新获取数据
				hasInitialArticles.current = false
				// 手动触发数据获取
				articlesState.mutate()
			}
		}
	}, [filters])

	// 筛选条件显示逻辑
	const {
		getCurrentCategoryNames,
		getCurrentTagNames,
		getSortText,
		hasActiveFilters,
	} = useFilterDisplay(
		filters,
		finalCategoriesState.data || [],
		finalTagsState.data || [],
	)

	// 计算总页数
	const totalPages = Math.ceil(
		(finalArticlesState.data?.total || 0) / (filters.limit || 6),
	)

	return (
		<MainLayout>
			<Container maxW="7xl" py={8}>
				{/* 搜索栏和排序 */}
				<Stack
					direction={{ base: 'column', md: 'row' }}
					gap={4}
					mb={6}
					align="center"
				>
					{/* 搜索栏 */}
					<HStack flex={1} maxW={{ base: 'full', md: '500px' }} gap={2}>
						{/* 搜索模式选择器 */}
						<Select.Root
							collection={searchModeContent}
							value={[filters.searchMode || 'title']}
							onValueChange={(details) => {
								const newSearchMode = details.value[0] as
									| 'title'
									| 'summary'
									| 'content'
								handleFiltersChange({
									...filters,
									searchMode: newSearchMode,
									page: 1,
								})
							}}
							size="md"
							width="90px"
						>
							<Select.Trigger>
								<Select.ValueText />
							</Select.Trigger>
							<Portal>
								<Select.Positioner>
									<Select.Content>
										{searchModeContent.items.map((item) => (
											<Select.Item key={item.value} item={item}>
												<Select.ItemText>{item.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Content>
								</Select.Positioner>
							</Portal>
						</Select.Root>

						{/* 搜索输入框 */}
						<Box flex={1}>
							<SearchInput
								value={searchKeyword}
								onChange={setSearchKeyword}
								placeholder={`搜索${
									searchModeContent.items.find(
										(item) => item.value === (filters.searchMode || 'title'),
									)?.label || '标题'
								}`}
								size="lg"
								maxWidth="full"
								maxLength={50}
								onClear={() => {
									const newFilters = {
										...filters,
										keyword: undefined,
										page: 1,
									}
									handleFiltersChange(newFilters)
								}}
								containerProps={{
									onKeyDown: (e: React.KeyboardEvent) => {
										if (e.key === 'Enter') {
											handleSearch()
										}
									},
								}}
							/>
						</Box>
					</HStack>

					{/* 排序选择 */}
					<Stack direction="row" align="center" gap={2} minW="250px">
						<Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }}>
							排序：
						</Text>
						<Select.Root
							collection={sortContent}
							value={[currentSortValue]}
							onValueChange={(details) => {
								handleSortChange(details.value[0])
							}}
							size="sm"
							width="180px"
						>
							<Select.Trigger>
								<Select.ValueText />
							</Select.Trigger>
							<Portal>
								<Select.Positioner>
									<Select.Content>
										{sortContent.items.map((item) => (
											<Select.Item key={item.value} item={item}>
												<Select.ItemText>{item.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Content>
								</Select.Positioner>
							</Portal>
						</Select.Root>
					</Stack>
				</Stack>

				{/* 筛选条件显示 */}
				{hasActiveFilters && (
					<Card.Root mb={4} p={2}>
						<Stack direction="row" align="center" gap={4} wrap="wrap">
							<Text fontSize="sm" fontWeight="medium">
								当前筛选：
							</Text>
							<HStack gap={2} wrap="wrap">
								{getCurrentCategoryNames &&
									getCurrentCategoryNames.map &&
									getCurrentCategoryNames.map((categoryName: string) => (
										<Badge key={categoryName} colorPalette="blue" size="md">
											分类：{categoryName}
										</Badge>
									))}
								{getCurrentTagNames &&
									getCurrentTagNames.map &&
									getCurrentTagNames.map((tagName: string) => (
										<Badge key={tagName} colorPalette="green" size="md">
											标签：{tagName}
										</Badge>
									))}
								{filters.keyword && (
									<Badge colorPalette="orange" size="md">
										{searchModeContent.items.find(
											(item) => item.value === filters.searchMode,
										)?.label || '标题'}
										关键词：{filters.keyword}
									</Badge>
								)}
								<Badge colorPalette="purple" size="md">
									{getSortText}
								</Badge>
							</HStack>
							<Button size="sm" variant="outline" onClick={clearAllFilters}>
								清除筛选
							</Button>
						</Stack>
					</Card.Root>
				)}

				{/* 主要内容区域 */}
				<Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
					{/* 文章列表 */}
					<GridItem>
						<ArticleListWithPagination
							articles={finalArticlesState.data?.items || []}
							loading={finalArticlesState.loading}
							error={finalArticlesState.error}
							currentPage={filters.page || 1}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							gridColumns={{
								base: '1fr',
								md: 'repeat(2, 1fr)',
							}}
							showEmptyBlocks={true}
							emptyBlocksTarget={6}
							paginationProps={{ mt: 8 }}
							errorStateContent={
								<Card.Root p={6} textAlign="center">
									<Text
										color="red.500"
										fontSize="lg"
										fontWeight="medium"
										mb={2}
									>
										加载失败
									</Text>
									<Text color="gray.600">
										{finalArticlesState.error?.message || '未知错误'}
									</Text>
								</Card.Root>
							}
						/>
					</GridItem>

					{/* 筛选侧边栏 */}
					<GridItem>
						<FilterSidebar
							filters={filters}
							onFiltersChange={handleFiltersChange}
							categoriesState={finalCategoriesState}
							tagsState={finalTagsState}
							toast={toast}
						/>
					</GridItem>
				</Grid>
			</Container>
		</MainLayout>
	)
}
