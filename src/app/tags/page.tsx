'use client'

import {
	Container,
	Grid,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Badge,
	Button,
	Skeleton,
	Alert,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useApiSWR } from '@/hooks/useSWR'
import { tagsApi } from '@/lib/api/tags'
import { PublicTagType } from '@/types'
import Link from 'next/link'
import { Tag, Hash, TrendingUp } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'
import { debounce } from '@/lib/utils'
import { articlesApi } from '@/lib/api'

// 标签云组件
function TagCloudItem({
	tag,
	index,
	containerRef,
}: {
	tag: PublicTagType
	index: number
	containerRef: React.RefObject<HTMLDivElement | null>
}) {
	// 根据文章数量计算标签大小
	const getFontSize = (count: number) => {
		if (count > 20) return 'lg'
		if (count > 10) return 'md'
		if (count > 5) return 'sm'
		return 'xs'
	}

	// 获取标签颜色，优先使用后端数据
	const getTagColor = () => {
		if (tag.color) return tag.color
		// 如果后端没有颜色数据，根据文章数量生成颜色
		const colors = [
			'blue',
			'green',
			'purple',
			'red',
			'orange',
			'teal',
			'pink',
			'cyan',
		]
		const tagIdHash = tag.id
			.split('')
			.reduce((acc, char) => acc + char.charCodeAt(0), 0)
		return colors[tagIdHash % colors.length]
	}

	// 动画延迟
	const animationDelay = `${index * 0.1}s`

	// 动态检测标签是否在第一行
	const [isInFirstRow, setIsInFirstRow] = useState(false)
	const tagRef = useRef<HTMLDivElement>(null)

	// 检测标签相对于容器的位置
	useEffect(() => {
		const checkPosition = () => {
			if (tagRef.current && containerRef.current) {
				const tagRect = tagRef.current.getBoundingClientRect()
				const containerRect = containerRef.current.getBoundingClientRect()

				// 计算标签相对于容器的位置
				const relativeTop = tagRect.top - containerRect.top

				// 如果标签距离容器顶部小于50px，认为是第一行
				setIsInFirstRow(relativeTop < 50)
			}
		}

		// 初始检测
		checkPosition()

		// 监听窗口大小变化
		const handleResize = () => {
			setTimeout(checkPosition, 100) // 延迟检测，等待布局完成
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [containerRef])

	return (
		<Box
			ref={tagRef}
			display="inline-block"
			m={2}
			position="relative"
			animation={`fadeInUp 0.6s ease-out ${animationDelay} both`}
			_hover={{
				transform: 'scale(1.1) rotate(2deg)',
				zIndex: 10,
			}}
			transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
			cursor="pointer"
			className="tag-item"
		>
			<Box asChild>
				<Link href={`/tags/${tag.id}`}>
					<Badge
						colorPalette={getTagColor()}
						variant="subtle"
						size={getFontSize(tag.articleCount || 0)}
						p={3}
						rounded="full"
						fontWeight="medium"
						_hover={{
							bg: `${getTagColor()}.500`,
							color: 'white',
							shadow: 'lg',
						}}
						transition="all 0.3s"
					>
						# {tag.name}
					</Badge>
				</Link>
			</Box>

			{/* Hover时显示的文章数量提示 */}
			<Box
				position="absolute"
				{...(isInFirstRow
					? {
							top: '100%',
							mt: 2,
						}
					: {
							bottom: '100%',
							mb: 2,
						})}
				left="50%"
				transform="translateX(-50%)"
				bg={{ base: 'gray.900', _dark: 'gray.100' }}
				color={{ base: 'white', _dark: 'gray.900' }}
				px={3}
				py={1}
				rounded="md"
				fontSize="xs"
				whiteSpace="nowrap"
				opacity={0}
				pointerEvents="none"
				transition="all 0.2s ease-in-out"
				zIndex={100}
				boxShadow="lg"
				className="tooltip"
				_before={{
					content: '""',
					position: 'absolute',
					left: '50%',
					transform: 'translateX(-50%)',
					borderLeft: '4px solid transparent',
					borderRight: '4px solid transparent',
					...(isInFirstRow
						? {
								bottom: '100%',
								borderTop: '4px solid',
								borderTopColor: { base: 'gray.900', _dark: 'gray.100' },
							}
						: {
								top: '100%',
								borderBottom: '4px solid',
								borderBottomColor: { base: 'gray.900', _dark: 'gray.100' },
							}),
				}}
			>
				{tag.articleCount || 0} 篇文章
			</Box>
		</Box>
	)
}

// 统计卡片组件
function StatsCard({
	title,
	value,
	icon,
	colorPalette = 'blue',
}: {
	title: string
	value: number
	icon: React.ReactNode
	colorPalette?: string
}) {
	return (
		<Card.Root p={6} bg={{ base: 'white', _dark: 'gray.800' }}>
			<Stack direction="row" gap={4} align="center">
				<Box
					p={3}
					bg={{ base: `${colorPalette}.50`, _dark: `${colorPalette}.900/20` }}
					rounded="lg"
					color={{ base: `${colorPalette}.500`, _dark: `${colorPalette}.400` }}
				>
					{icon}
				</Box>
				<Stack gap={1}>
					<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
						{title}
					</Text>
					<Text
						fontSize="2xl"
						fontWeight="bold"
						color={{ base: 'gray.900', _dark: 'white' }}
					>
						{value}
					</Text>
				</Stack>
			</Stack>
		</Card.Root>
	)
}

export default function TagsPage() {
	// 搜索状态 - 用于输入框显示
	const [inputValue, setInputValue] = useState('')
	// 搜索状态 - 用于过滤逻辑（防抖更新）
	const [searchQuery, setSearchQuery] = useState('')
	// 标签云容器引用
	const tagCloudContainerRef = useRef<HTMLDivElement>(null)

	// 创建防抖版本的搜索函数
	const debouncedSetSearchQuery = useMemo(() => {
		const searchHandler = (...args: unknown[]) => {
			const query = args[0] as string
			setSearchQuery(query)
		}
		return debounce(searchHandler, 300)
	}, [])

	// 当输入值改变时，立即更新输入框显示，同时触发防抖搜索
	const handleInputChange = (value: string) => {
		setInputValue(value)
		debouncedSetSearchQuery(value)
	}

	// 获取标签列表
	const tagsState = useApiSWR('tags', () => tagsApi.getTags())
	const articlesStatsState = useApiSWR('articles-stats', () =>
		articlesApi.getArticleArchiveStats(),
	)

	const tags = useMemo(() => tagsState.data || [], [tagsState.data])

	// 过滤标签
	const filteredTags = useMemo(() => {
		if (!searchQuery.trim()) return tags
		return tags.filter((tag: PublicTagType) =>
			tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
		)
	}, [tags, searchQuery])

	// 计算统计数据
	const stats = useMemo(() => {
		const articlesStatistics = articlesStatsState.data || {
			totalArticles: 0,
			totalViews: 0,
			totalCategories: 0,
			totalTags: 0,
			monthlyStats: [],
		}

		const totalTags = articlesStatistics.totalTags
		const totalArticles = articlesStatistics.totalArticles
		const hotTags = tags.filter(
			(tag: PublicTagType) => tag.articleCount > 10,
		).length
		const activeTags = tags.filter(
			(tag: PublicTagType) => tag.articleCount > 5,
		).length

		return {
			totalTags,
			totalArticles,
			hotTags,
			activeTags,
		}
	}, [tags, articlesStatsState.data])

	// 按文章数量排序
	const sortedTags = useMemo(() => {
		return [...filteredTags].sort(
			(a, b) => (b.articleCount || 0) - (a.articleCount || 0),
		)
	}, [filteredTags])

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
							标签云
						</Heading>
					</Stack>

					<SearchInput
						value={inputValue}
						onChange={handleInputChange}
						label="搜索标签..."
						size="lg"
						maxWidth="md"
						showClearButton={true}
					/>
				</Stack>

				{/* 统计信息 */}
				{!tagsState.loading && tags.length > 0 && (
					<Grid
						templateColumns={{
							base: '1fr',
							sm: 'repeat(2, 1fr)',
							lg: 'repeat(4, 1fr)',
						}}
						gap={6}
						mb={8}
					>
						<StatsCard
							title="总标签数"
							value={stats.totalTags}
							icon={<Tag size={24} />}
							colorPalette="blue"
						/>
						<StatsCard
							title="总文章数"
							value={stats.totalArticles}
							icon={<Hash size={24} />}
							colorPalette="green"
						/>
						<StatsCard
							title="热门标签"
							value={stats.hotTags}
							icon={<TrendingUp size={24} />}
							colorPalette="red"
						/>
						<StatsCard
							title="活跃标签"
							value={stats.activeTags}
							icon={<TrendingUp size={24} />}
							colorPalette="purple"
						/>
					</Grid>
				)}

				{/* 标签云 */}
				<Stack gap={6}>
					{/* 搜索结果提示 */}
					{searchQuery && (
						<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="lg">
							搜索 &ldquo;{searchQuery}&rdquo; 找到 {filteredTags.length} 个标签
						</Text>
					)}

					{tagsState.loading ? (
						<Box textAlign="center" py={12}>
							<Stack gap={4} align="center">
								{Array.from({ length: 20 }).map((_, i) => (
									<Skeleton
										key={i}
										display="inline-block"
										m={2}
										height="32px"
										width={`${60 + Math.random() * 80}px`}
										rounded="full"
									/>
								))}
							</Stack>
						</Box>
					) : tagsState.error ? (
						<Alert.Root status="error">
							<Alert.Title>标签加载失败</Alert.Title>
							<Alert.Description>
								{tagsState.error?.userMessage || '未知错误'}
							</Alert.Description>
						</Alert.Root>
					) : articlesStatsState.error ? (
						<Alert.Root status="error">
							<Alert.Title>统计信息加载失败</Alert.Title>
							<Alert.Description>
								{articlesStatsState.error?.userMessage || '未知错误'}
							</Alert.Description>
						</Alert.Root>
					) : sortedTags.length === 0 ? (
						<Card.Root p={12} textAlign="center">
							<Stack gap={4} align="center">
								<Box
									p={4}
									bg={{ base: 'gray.50', _dark: 'gray.700' }}
									rounded="lg"
									color={{ base: 'gray.400', _dark: 'gray.500' }}
								>
									<Tag size={48} />
								</Box>
								<Stack gap={2}>
									<Text
										color={{ base: 'gray.500', _dark: 'gray.400' }}
										fontSize="lg"
									>
										{searchQuery ? '未找到匹配的标签' : '暂无标签'}
									</Text>
									<Text color={{ base: 'gray.400', _dark: 'gray.500' }}>
										{searchQuery
											? '尝试使用其他关键词搜索'
											: '敬请期待更多内容'}
									</Text>
								</Stack>
								{searchQuery && (
									<Button
										onClick={() => setSearchQuery('')}
										colorPalette="blue"
									>
										清除搜索
									</Button>
								)}
							</Stack>
						</Card.Root>
					) : (
						<Card.Root p={8} bg={{ base: 'white', _dark: 'gray.800' }}>
							<Box
								ref={tagCloudContainerRef}
								textAlign="center"
								lineHeight="1.8"
								minH="300px"
								display="flex"
								flexWrap="wrap"
								justifyContent="center"
								alignItems="flex-start"
								alignContent="flex-start"
								gap={2}
								position="relative"
								overflow="hidden"
								_before={{
									content: '""',
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									background:
										'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
									pointerEvents: 'none',
								}}
							>
								{sortedTags.map((tag, index) => (
									<TagCloudItem
										key={tag.id}
										tag={tag}
										index={index}
										containerRef={tagCloudContainerRef}
									/>
								))}
							</Box>
						</Card.Root>
					)}
				</Stack>
			</Container>
		</MainLayout>
	)
}
