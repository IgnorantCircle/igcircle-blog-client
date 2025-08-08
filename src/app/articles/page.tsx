'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicArticle, ArticleQuery } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/ui/Loading'
import { articlesApi } from '@/lib/api'
import { usePaginatedApi } from '@/hooks/useApi'
import { ErrorHandler, ErrorUtils } from '@/components/ErrorHandler'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'

const ArticlesPage: React.FC = () => {
	const searchParams = useSearchParams()
	const [query, setQuery] = useState<ArticleQuery>({
		page: 1,
		limit: 12,
		sortBy: 'publishedAt',
		sortOrder: 'DESC',
	})

	// 使用分页API Hook - Hook层自动处理错误
	const {
		items: articlesList,
		total,
		page,
		totalPages,
		loading,
		errorState,
		retry,
		isFirstLoad,
	} = usePaginatedApi(
		(pageNum: number, limitNum: number) =>
			articlesApi.getArticles({ ...query, page: pageNum, limit: limitNum }),
		{
			initialPage: query.page,
			initialLimit: query.limit,
			deps: [query],
			// Hook层自动处理错误，页面层无需手动处理
			
			validateData: (data): string | null => {
				// 业务逻辑验证
				if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray((data as any).items)) {
					return '数据格式错误';
				}
				return null;
			},
		}
	)

	// 从URL参数初始化查询条件
	useEffect(() => {
		const newQuery: ArticleQuery = {
			page: parseInt(searchParams.get('page') || '1'),
			limit: parseInt(searchParams.get('limit') || '12'),
			categoryId: searchParams.get('categoryId') || undefined,
			tagId: searchParams.get('tagId') || undefined,
			keyword: searchParams.get('keyword') || undefined,
			sortBy: (searchParams.get('sortBy') as 'publishedAt' | 'viewCount' | 'likeCount') || 'publishedAt',
			sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
		}

		setQuery(newQuery)
	}, [searchParams])

	// 页面层：专注业务逻辑，无需手动错误处理
	// 错误处理已由Hook层和ErrorHandler组件自动处理

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(window.location.search)
		params.set('page', newPage.toString())
		window.history.pushState(
			{},
			'',
			`${window.location.pathname}?${params.toString()}`
		)

		setQuery((prev) => ({ ...prev, page: newPage }))
	}

	const handleSortChange = (
		sortBy: 'publishedAt' | 'viewCount' | 'likeCount',
		sortOrder: 'ASC' | 'DESC'
	) => {
		const params = new URLSearchParams(window.location.search)
		params.set('sortBy', sortBy)
		params.set('sortOrder', sortOrder)
		params.set('page', '1') // 重置到第一页
		window.history.pushState(
			{},
			'',
			`${window.location.pathname}?${params.toString()}`
		)

		setQuery((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }))
	}


	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
					{/* Main Content */}
					<div className='lg:col-span-3'>
						{/* Header */}
						<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
							<div>
								<h1 className='text-3xl font-bold text-gray-900 mb-2'>
									文章列表
								</h1>
								<p className='text-gray-600'>共找到 {total} 篇文章</p>
							</div>

							{/* Sort Options */}
							<div className='flex items-center space-x-4 mt-4 sm:mt-0'>
								<span className='text-sm text-gray-500 flex items-center'>
									<Filter className='w-4 h-4 mr-1' />
									排序：
								</span>
								<select
									value={`${query.sortBy}-${query.sortOrder}`}
									onChange={(e) => {
										const [sortBy, sortOrder] = e.target.value.split('-')
										handleSortChange(sortBy as 'publishedAt' | 'viewCount' | 'likeCount', sortOrder as 'ASC' | 'DESC')
									}}
									className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'>
									<option value='publishedAt-DESC'>最新发布</option>
									<option value='publishedAt-ASC'>最早发布</option>
									<option value='viewCount-DESC'>浏览量最多</option>
									<option value='likeCount-DESC'>点赞最多</option>
								</select>
							</div>
						</div>

						{/* Articles Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
					{loading && isFirstLoad ? (
						// 首次加载显示骨架屏
						Array.from({ length: 12 }).map((_, index) => (
							<LoadingCard key={index} />
						))
					) : ErrorUtils.hasError(errorState) ? (
						// 页面层：使用ErrorHandler组件自动处理错误显示
						<div className='col-span-full'>
							<ErrorHandler
								errorState={errorState}
								onRetry={retry}
								mode='card'
								customActions={
									<Link href='/'>
										<Button variant='outline'>返回首页</Button>
									</Link>
								}
							/>
										</div>
									) : articlesList && articlesList.length > 0 ? (
										// 显示文章列表
										articlesList.map((article: PublicArticle) => (
											<ArticleCard
												key={article.id}
												article={article}
												variant='default'
											/>
										))
									) : (
										// 无数据状态
										<div className='col-span-full text-center py-12'>
											<p className='text-gray-500 text-lg'>暂无文章</p>
										</div>
									)}
										{/* 加载更多时的loading状态 */}
										{loading && !isFirstLoad && (
											<div className='col-span-full text-center py-4'>
												<div className='inline-flex items-center px-4 py-2 text-sm text-gray-600'>
													<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
													加载中...
												</div>
											</div>
										)}
								</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='flex items-center justify-between'>
								<div className='text-sm text-gray-500'>
									显示第 {(page - 1) * (query.limit || 12) + 1} -{' '}
									{Math.min(page * (query.limit || 12), total)} 条， 共 {total}{' '}
									条
								</div>

								<div className='flex items-center space-x-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handlePageChange(page - 1)}
										disabled={page <= 1}>
										<ChevronLeft className='w-4 h-4 mr-1' />
										上一页
									</Button>

									<div className='flex items-center space-x-1'>
										{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											let pageNum
											if (totalPages <= 5) {
												pageNum = i + 1
											} else if (page <= 3) {
												pageNum = i + 1
											} else if (page >= totalPages - 2) {
												pageNum = totalPages - 4 + i
											} else {
												pageNum = page - 2 + i
											}

											return (
												<Button
													key={pageNum}
													variant={page === pageNum ? 'primary' : 'outline'}
													size='sm'
													onClick={() => handlePageChange(pageNum)}
													className='w-8 h-8 p-0'>
													{pageNum}
												</Button>
											)
										})}
									</div>

									<Button
										variant='outline'
										size='sm'
										onClick={() => handlePageChange(page + 1)}
										disabled={page >= totalPages}>
										下一页
										<ChevronRight className='w-4 h-4 ml-1' />
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className='lg:col-span-1'>
						<Sidebar />
					</div>
				</div>
			</div>
		</div>
	)
}

export default ArticlesPage
