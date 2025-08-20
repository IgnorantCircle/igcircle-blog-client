'use client'

import {
	Box,
	Stack,
	Text,
	Button,
	Card,
	Badge,
	Skeleton,
	Collapsible,
} from '@chakra-ui/react'
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useApiSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'

interface ArchiveTimelineProps {
	selectedYear?: number
	selectedMonth?: number
	onFilterChange: (year?: number, month?: number) => void
	initialStats?: { year: number; month: number; count: number }[]
}

interface YearGroupProps {
	year: number
	months: { month: number; count: number }[]
	selectedYear?: number
	selectedMonth?: number
	onFilterChange: (year?: number, month?: number) => void
	isExpanded: boolean
	onToggle: () => void
}

function YearGroup({
	year,
	months,
	selectedYear,
	selectedMonth,
	onFilterChange,
	isExpanded,
	onToggle,
}: YearGroupProps) {
	const totalCount = months.reduce((sum, month) => sum + month.count, 0)
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

	return (
		<Card.Root>
			<Collapsible.Root open={isExpanded}>
				{/* 年份标题 */}
				<Collapsible.Trigger asChild>
					<Button
						variant="ghost"
						w="full"
						justifyContent="space-between"
						p={4}
						h="auto"
						minH="60px"
						onClick={onToggle}
						bg={
							selectedYear === year
								? { base: 'blue.50', _dark: 'blue.900' }
								: 'transparent'
						}
						_hover={{
							bg:
								selectedYear === year
									? { base: 'blue.100', _dark: 'blue.800' }
									: { base: 'gray.50', _dark: 'gray.700' },
						}}
					>
						<Stack direction="row" align="center" gap={3}>
							<Calendar size={20} />
							<Stack gap={1} align="start">
								<Text fontWeight="semibold" fontSize="lg">
									{year}年
								</Text>
								<Text
									fontSize="sm"
									color={{ base: 'gray.600', _dark: 'gray.400' }}
								>
									{totalCount} 篇文章
								</Text>
							</Stack>
						</Stack>
						<Stack direction="row" align="center" gap={2}>
							<Badge colorPalette="blue" variant="subtle">
								{totalCount}
							</Badge>
							{isExpanded ? (
								<ChevronDown size={16} />
							) : (
								<ChevronRight size={16} />
							)}
						</Stack>
					</Button>
				</Collapsible.Trigger>

				{/* 月份列表 */}
				<Collapsible.Content>
					<Box px={4} pb={4}>
						<Stack gap={2}>
							{/* 全年选项 */}
							<Button
								variant={
									selectedYear === year && !selectedMonth ? 'solid' : 'ghost'
								}
								colorPalette={
									selectedYear === year && !selectedMonth ? 'blue' : 'gray'
								}
								size="sm"
								justifyContent="space-between"
								w="full"
								onClick={() => onFilterChange(year)}
							>
								<Text>全年</Text>
								<Badge size="sm" colorPalette="blue" variant="subtle">
									{totalCount}
								</Badge>
							</Button>

							{/* 月份选项 */}
							{months.map(({ month, count }) => (
								<Button
									key={month}
									variant={
										selectedYear === year && selectedMonth === month
											? 'solid'
											: 'ghost'
									}
									colorPalette={
										selectedYear === year && selectedMonth === month
											? 'blue'
											: 'gray'
									}
									size="sm"
									justifyContent="space-between"
									w="full"
									onClick={() => onFilterChange(year, month)}
								>
									<Text>{monthNames[month - 1]}</Text>
									<Badge size="sm" colorPalette="blue" variant="subtle">
										{count}
									</Badge>
								</Button>
							))}
						</Stack>
					</Box>
				</Collapsible.Content>
			</Collapsible.Root>
		</Card.Root>
	)
}

/**
 * 归档时间轴组件
 * 按年月分组显示文章数量，支持筛选
 */
export function ArchiveTimeline({
	selectedYear,
	selectedMonth,
	onFilterChange,
	initialStats,
}: ArchiveTimelineProps) {
	// 获取归档统计数据
	const { data: stats, loading } = useApiSWR(
		'archive-timeline-stats',
		() => articlesApi.getArticleArchiveStats(),
		{
			fallbackData: initialStats
				? {
						totalArticles: 0,
						totalViews: 0,
						totalCategories: 0,
						totalTags: 0,
						monthlyStats: initialStats,
					}
				: undefined,
		},
	)

	// 管理展开状态
	const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())

	// 按年分组数据
	const groupedData = useMemo(() => {
		const monthlyStats = stats?.monthlyStats || initialStats || []
		if (!monthlyStats || !Array.isArray(monthlyStats)) return []

		const yearGroups = new Map<number, { month: number; count: number }[]>()

		monthlyStats.forEach(({ year, month, count }) => {
			if (!year || !month || !count) return

			if (!yearGroups.has(year)) {
				yearGroups.set(year, [])
			}
			yearGroups.get(year)!.push({ month, count })
		})

		// 排序：年份降序，月份降序
		return Array.from(yearGroups.entries())
			.map(([year, months]) => ({
				year,
				months: months.sort((a, b) => b.month - a.month),
			}))
			.sort((a, b) => b.year - a.year)
	}, [stats])

	// 切换年份展开状态
	const toggleYear = (year: number) => {
		setExpandedYears((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(year)) {
				newSet.delete(year)
			} else {
				newSet.add(year)
			}
			return newSet
		})
	}

	// 自动展开选中的年份
	if (selectedYear && !expandedYears.has(selectedYear)) {
		setExpandedYears((prev) => new Set([...prev, selectedYear]))
	}

	return (
		<Box>
			{/* 标题 */}
			<Stack direction="row" align="center" gap={2} mb={4}>
				<Calendar size={20} />
				<Text fontWeight="semibold" fontSize="lg">
					时间筛选
				</Text>
			</Stack>

			{/* 全部文章选项 */}
			<Card.Root mb={4}>
				<Button
					variant={!selectedYear ? 'solid' : 'ghost'}
					colorPalette={!selectedYear ? 'blue' : 'gray'}
					w="full"
					p={4}
					h="auto"
					minH="60px"
					onClick={() => onFilterChange()}
				>
					<Stack direction="row" align="center" gap={3}>
						<Calendar size={20} />
						<Text fontWeight="semibold" fontSize="lg">
							全部文章
						</Text>
					</Stack>
				</Button>
			</Card.Root>

			{/* 时间轴列表 */}
			<Stack gap={3}>
				{loading ? (
					// 加载状态
					Array.from({ length: 3 }).map((_, i) => (
						<Card.Root key={i} p={4}>
							<Stack gap={2}>
								<Skeleton height="24px" width="120px" />
								<Skeleton height="16px" width="80px" />
							</Stack>
						</Card.Root>
					))
				) : groupedData.length > 0 ? (
					// 年份分组
					groupedData.map(({ year, months }) => (
						<YearGroup
							key={year}
							year={year}
							months={months}
							selectedYear={selectedYear}
							selectedMonth={selectedMonth}
							onFilterChange={onFilterChange}
							isExpanded={expandedYears.has(year)}
							onToggle={() => toggleYear(year)}
						/>
					))
				) : (
					// 空状态
					<Card.Root p={8} textAlign="center">
						<Stack gap={2} align="center">
							<Calendar size={48} color="gray" />
							<Text color={{ base: 'gray.500', _dark: 'gray.400' }}>
								暂无归档数据
							</Text>
						</Stack>
					</Card.Root>
				)}
			</Stack>
		</Box>
	)
}
