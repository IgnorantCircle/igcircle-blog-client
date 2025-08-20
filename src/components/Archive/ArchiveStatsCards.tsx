'use client'

import {
	Grid,
	Card,
	Stack,
	Text,
	Box,
	Skeleton,
	HStack,
} from '@chakra-ui/react'
import { FileText, Eye, Calendar, Hash } from 'lucide-react'
import { useApiSWR } from '@/hooks/useSWR'
import { articlesApi } from '@/lib/api/articles'

interface ArchiveStatsCardsProps {
	initialStats?: {
		totalArticles: number
		totalViews: number
		totalCategories: number
		totalTags: number
	}
	/** 如果为true，则不进行客户端数据获取，仅使用initialStats */
	serverOnly?: boolean
}

interface StatCardProps {
	title: string
	value: number
	icon: React.ReactNode
	color: string
	loading?: boolean
}

function StatCard({
	title,
	value,
	icon,
	color,
	loading = false,
}: StatCardProps) {
	return (
		<Card.Root p={3} textAlign="center">
			<Stack gap={2} align="center">
				<HStack>
					<Box
						p={3}
						bg={{ base: `${color}.50`, _dark: `${color}.900` }}
						rounded="lg"
						color={{ base: `${color}.500`, _dark: `${color}.400` }}
					>
						{icon}
					</Box>
					<Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="sm">
						{title}
					</Text>
				</HStack>

				<Stack gap={1} align="center">
					{loading ? (
						<Skeleton height="32px" width="60px" />
					) : (
						<Text
							fontSize="2xl"
							fontWeight="bold"
							color={{ base: 'gray.900', _dark: 'white' }}
						>
							{value.toLocaleString()}
						</Text>
					)}
				</Stack>
			</Stack>
		</Card.Root>
	)
}

/**
 * 归档统计卡片组件
 * 显示文章总数、总浏览量、分类数、标签数等统计信息
 * 支持服务端渲染（serverOnly=true）和客户端数据获取两种模式
 */
export function ArchiveStatsCards({
	initialStats,
	serverOnly = false,
}: ArchiveStatsCardsProps) {
	// 获取统计数据（仅在非服务端模式下）
	const { data: stats, loading } = useApiSWR(
		serverOnly ? null : 'archive-stats',
		() => articlesApi.getArticleArchiveStats(),
		{
			fallbackData: initialStats,
		},
	)

	// 计算统计数据
	const finalStats = serverOnly ? initialStats : stats || initialStats
	const totalArticles = finalStats?.totalArticles || 0
	const totalViews = finalStats?.totalViews || 0
	const totalCategories = finalStats?.totalCategories || 0
	const totalTags = finalStats?.totalTags || 0
	const isLoading = !serverOnly && loading && !initialStats

	return (
		<Grid
			templateColumns={{
				base: 'repeat(2, 1fr)',
				md: 'repeat(4, 1fr)',
			}}
			gap={4}
			mb={4}
		>
			<StatCard
				title="文章总数"
				value={totalArticles}
				icon={<FileText size={16} />}
				color="blue"
				loading={isLoading}
			/>
			<StatCard
				title="总浏览量"
				value={totalViews}
				icon={<Eye size={16} />}
				color="green"
				loading={isLoading}
			/>
			<StatCard
				title="分类数量"
				value={totalCategories}
				icon={<Hash size={16} />}
				color="purple"
				loading={isLoading}
			/>
			<StatCard
				title="标签数量"
				value={totalTags}
				icon={<Calendar size={16} />}
				color="orange"
				loading={isLoading}
			/>
		</Grid>
	)
}
