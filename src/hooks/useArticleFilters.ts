'use client'

import { useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArticleQueryType } from '@/types'

/**
 * 文章筛选逻辑的自定义Hook
 * 处理URL参数同步、筛选条件管理等
 */
export function useArticleFilters(initialFilters?: ArticleQueryType) {
	const searchParams = useSearchParams()
	const router = useRouter()

	// 从URL参数或初始筛选条件初始化筛选条件
	const [filters, setFilters] = useState<ArticleQueryType>(() => {
		// 优先使用URL参数，如果没有则使用初始筛选条件
		const urlFilters = {
			page: parseInt(searchParams.get('page') || '1'),
			limit: parseInt(searchParams.get('limit') || '6'),
			categoryIds:
				searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
			tagIds: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
			keyword: searchParams.get('keyword') || undefined,
			searchMode:
				(searchParams.get('searchMode') as ArticleQueryType['searchMode']) ||
				undefined,
			sortBy:
				(searchParams.get('sortBy') as ArticleQueryType['sortBy']) ||
				'publishedAt',
			sortOrder:
				(searchParams.get('sortOrder') as ArticleQueryType['sortOrder']) ||
				'DESC',
			status: 'published' as const,
		}
		// 如果URL中没有筛选参数且有初始筛选条件，则使用初始筛选条件
		if (initialFilters && !searchParams.toString()) {
			return { ...urlFilters, ...initialFilters }
		}

		return urlFilters
	})

	// 搜索关键词状态
	const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '')

	// 搜索模式状态
	const [searchMode, setSearchMode] = useState<ArticleQueryType['searchMode']>(
		filters.searchMode || 'title',
	)

	// 当前选中的排序值
	const currentSortValue = useMemo(
		() => `${filters.sortBy || 'publishedAt'}_${filters.sortOrder || 'DESC'}`,
		[filters.sortBy, filters.sortOrder],
	)

	// 更新URL参数
	const updateURL = useCallback(
		(newFilters: ArticleQueryType) => {
			const params = new URLSearchParams()
			if (newFilters.page && newFilters.page > 1)
				params.set('page', newFilters.page.toString())
			if (newFilters.limit && newFilters.limit !== 6)
				params.set('limit', newFilters.limit.toString())
			if (newFilters.categoryIds?.length)
				params.set('categories', newFilters.categoryIds.join(','))
			if (newFilters.tagIds?.length)
				params.set('tags', newFilters.tagIds.join(','))
			if (newFilters.keyword) params.set('keyword', newFilters.keyword)
			if (newFilters.searchMode) params.set('searchMode', newFilters.searchMode)
			if (newFilters.sortBy && newFilters.sortBy !== 'publishedAt')
				params.set('sortBy', newFilters.sortBy)
			if (newFilters.sortOrder && newFilters.sortOrder !== 'DESC')
				params.set('sortOrder', newFilters.sortOrder)

			const queryString = params.toString()
			router.push(`/articles${queryString ? `?${queryString}` : ''}`, {
				scroll: false,
			})
		},
		[router],
	)

	// 处理筛选条件变化
	const handleFiltersChange = useCallback(
		(newFilters: ArticleQueryType) => {
			setFilters(newFilters)
			updateURL(newFilters)
		},
		[updateURL],
	)

	// 处理搜索模式变化
	const handleSearchModeChange = useCallback(
		(newSearchMode: ArticleQueryType['searchMode']) => {
			setSearchMode(newSearchMode)
			const searchModeValue =
				newSearchMode === 'title' ? undefined : newSearchMode
			handleFiltersChange({
				...filters,
				searchMode: searchModeValue,
				page: 1,
			})
		},
		[filters, handleFiltersChange],
	)

	// 处理搜索
	const handleSearch = useCallback(() => {
		const newFilters = {
			...filters,
			keyword: searchKeyword.trim() || undefined,
			searchMode,
			page: 1,
		}
		handleFiltersChange(newFilters)
	}, [filters, searchKeyword, searchMode, handleFiltersChange])

	// 处理分页
	const handlePageChange = useCallback(
		(page: number) => {
			handleFiltersChange({ ...filters, page })
		},
		[filters, handleFiltersChange],
	)

	// 清除所有筛选条件
	const clearAllFilters = useCallback(() => {
		setSearchKeyword('')
		setSearchMode('title')
		handleFiltersChange({
			page: 1,
			limit: 6,
			status: 'published' as const,
			sortBy: 'publishedAt',
			sortOrder: 'DESC',
			// 清除分类、标签、关键词和搜索模式筛选，但保留排序
			categoryIds: undefined,
			tagIds: undefined,
			keyword: undefined,
			searchMode: 'title',
		})
	}, [handleFiltersChange])

	// 处理排序变化
	const handleSortChange = useCallback(
		(sortValue: string) => {
			if (!sortValue) {
				// 清除选择，重置为默认排序
				handleFiltersChange({
					...filters,
					sortBy: 'publishedAt',
					sortOrder: 'DESC',
					page: 1,
				})
			} else {
				const [sortBy, sortOrder] = sortValue.split('_')
				handleFiltersChange({
					...filters,
					sortBy: sortBy as ArticleQueryType['sortBy'],
					sortOrder: sortOrder as ArticleQueryType['sortOrder'],
					page: 1,
				})
			}
		},
		[filters, handleFiltersChange],
	)

	return {
		filters,
		searchKeyword,
		setSearchKeyword,
		searchMode,
		setSearchMode,
		currentSortValue,
		handleFiltersChange,
		handleSearch,
		handleSearchModeChange,
		handlePageChange,
		clearAllFilters,
		handleSortChange,
	}
}
