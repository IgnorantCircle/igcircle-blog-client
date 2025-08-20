'use client'

import { Button, Text, HStack } from '@chakra-ui/react'

export interface PaginationProps {
	/** 当前页码 */
	currentPage: number
	/** 总页数 */
	totalPages: number
	/** 页码变化回调 */
	onPageChange: (page: number) => void
	/** 最大显示页码数量 */
	maxVisible?: number
	/** 组件大小 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	/** 颜色主题 */
	colorPalette?: string
	/** 是否显示首页/末页按钮 */
	showFirstLast?: boolean
	/** 自定义按钮文本 */
	labels?: {
		previous?: string
		next?: string
		first?: string
		last?: string
	}
}

/**
 * 通用分页组件
 * 支持自定义样式、按钮文本等，优化移动端显示
 */
export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	maxVisible = 5,
	size = 'sm',
	colorPalette = 'blue',
	showFirstLast = false,
	labels = {
		previous: '上一页',
		next: '下一页',
		first: '首页',
		last: '末页',
	},
}: PaginationProps) {
	// 如果总页数小于等于1，不显示分页
	if (totalPages <= 1) return null

	// 计算要显示的页码和省略号
	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = []

		// 如果总页数小于等于maxVisible，显示所有页码
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
			return pages
		}

		// 总是显示第一页
		pages.push(1)

		// 计算当前页周围要显示的页码范围
		const sidePages = Math.floor((maxVisible - 3) / 2) // 减去首页、末页和当前页
		let startPage = Math.max(2, currentPage - sidePages)
		let endPage = Math.min(totalPages - 1, currentPage + sidePages)

		// 调整范围以确保显示足够的页码
		if (endPage - startPage + 1 < maxVisible - 2) {
			if (startPage === 2) {
				endPage = Math.min(totalPages - 1, startPage + maxVisible - 3)
			} else if (endPage === totalPages - 1) {
				startPage = Math.max(2, endPage - maxVisible + 3)
			}
		}

		// 添加左侧省略号
		if (startPage > 2) {
			pages.push('ellipsis')
		}

		// 添加中间页码
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i)
		}

		// 添加右侧省略号
		if (endPage < totalPages - 1) {
			pages.push('ellipsis')
		}

		// 总是显示最后一页（如果不是第一页）
		if (totalPages > 1) {
			pages.push(totalPages)
		}

		return pages
	}

	const pageNumbers = getPageNumbers()
	const showFirstPage =
		showFirstLast && typeof pageNumbers[0] === 'number' && pageNumbers[0] > 1
	const showLastPage =
		showFirstLast &&
		typeof pageNumbers[pageNumbers.length - 1] === 'number' &&
		(pageNumbers[pageNumbers.length - 1] as number) < totalPages

	return (
		<HStack
			justify="center"
			align="center"
			flexWrap="nowrap"
			overflowX="auto"
			px={{ base: 2, md: 0 }}
			gap={{ base: 1, md: 2 }}
			minH="40px"
		>
			{/* 首页按钮 */}
			{showFirstPage && (
				<Button
					variant="outline"
					size={size}
					fontSize={{ base: 'xs', md: 'sm' }}
					px={{ base: 2, md: 3 }}
					flexShrink={0}
					onClick={() => onPageChange(1)}
				>
					{labels.first}
				</Button>
			)}

			{/* 上一页按钮 */}
			<Button
				variant="outline"
				size={size}
				fontSize={{ base: 'xs', md: 'sm' }}
				px={{ base: 2, md: 3 }}
				flexShrink={0}
				disabled={currentPage <= 1}
				onClick={() => onPageChange(currentPage - 1)}
			>
				{labels.previous}
			</Button>

			{/* 页码按钮 */}
			{pageNumbers.map((page, index) => {
				if (page === 'ellipsis') {
					return (
						<Text
							key={`ellipsis-${index}`}
							color={{ base: 'gray.500', _dark: 'gray.400' }}
							fontSize={{ base: 'xs', md: 'sm' }}
							minW={{ base: '32px', md: '40px' }}
							h={{ base: '32px', md: '40px' }}
							textAlign="center"
							display="flex"
							alignItems="center"
							justifyContent="center"
							flexShrink={0}
							userSelect="none"
						>
							⋯
						</Text>
					)
				}
				return (
					<Button
						key={page}
						variant={page === currentPage ? 'solid' : 'outline'}
						colorPalette={page === currentPage ? colorPalette : 'gray'}
						size={size}
						fontSize={{ base: 'xs', md: 'sm' }}
						minW={{ base: '32px', md: '40px' }}
						h={{ base: '32px', md: '40px' }}
						px={{ base: 1, md: 2 }}
						flexShrink={0}
						onClick={() => onPageChange(page as number)}
					>
						{page}
					</Button>
				)
			})}

			{/* 下一页按钮 */}
			<Button
				variant="outline"
				size={size}
				fontSize={{ base: 'xs', md: 'sm' }}
				px={{ base: 2, md: 3 }}
				flexShrink={0}
				disabled={currentPage >= totalPages}
				onClick={() => onPageChange(currentPage + 1)}
			>
				{labels.next}
			</Button>

			{/* 末页按钮 */}
			{showLastPage && (
				<Button
					variant="outline"
					size={size}
					fontSize={{ base: 'xs', md: 'sm' }}
					px={{ base: 2, md: 3 }}
					flexShrink={0}
					onClick={() => onPageChange(totalPages)}
				>
					{labels.last}
				</Button>
			)}
		</HStack>
	)
}
