'use client'

import { useMemo } from 'react'
import { ArticleQueryType, PublicCategoryType, PublicTagType } from '@/types'

/**
 * 筛选条件显示逻辑的自定义Hook
 * 处理筛选条件的显示文本和状态
 */
export function useFilterDisplay(
	filters: ArticleQueryType,
	categories: PublicCategoryType[] | undefined,
	tags: PublicTagType[] | undefined,
) {
	// 获取当前分类名称
	const getCurrentCategoryNames = useMemo(() => {
		if (!filters.categoryIds?.length || !categories) return []
		return categories
			.filter((cat) => filters.categoryIds?.includes(cat.id))
			.map((cat) => cat.name)
	}, [filters.categoryIds, categories])

	// 获取当前标签名称
	const getCurrentTagNames = useMemo(() => {
		if (!filters.tagIds?.length || !tags) return []
		return tags
			.filter((tag) => filters.tagIds?.includes(tag.id))
			.map((tag) => tag.name)
	}, [filters.tagIds, tags])

	// 获取排序方式显示文本
	const getSortText = useMemo(() => {
		const sortKey = `${filters.sortBy || 'publishedAt'}_${
			filters.sortOrder || 'DESC'
		}`
		const sortMap: Record<string, string> = {
			publishedAt_DESC: '最新发布',
			publishedAt_ASC: '最早发布',
			viewCount_DESC: '最多浏览',
			likeCount_DESC: '最多点赞',
			createdAt_DESC: '最新创建',
		}
		return sortMap[sortKey] || '最新发布'
	}, [filters.sortBy, filters.sortOrder])

	// 检查是否有活动的筛选条件
	const hasActiveFilters = useMemo(
		() =>
			filters.keyword ||
			filters.categoryIds?.length ||
			filters.tagIds?.length ||
			true, // 排序选项始终显示
		[filters],
	)

	return {
		getCurrentCategoryNames,
		getCurrentTagNames,
		getSortText,
		hasActiveFilters,
	}
}
