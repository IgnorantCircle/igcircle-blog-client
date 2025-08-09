'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicArticle, ArticleSearchQuery } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/ui/Loading'

import { useToast } from '@/components/ui/Toast'
import {
	Search,
	FileText,
	Calendar,
	TrendingUp,
	Clock,
	X,
	AlertCircle,
} from 'lucide-react'
import { articlesApi } from '@/lib/api'

const SearchPage: React.FC = () => {
	const searchParams = useSearchParams()
	const initialQuery = searchParams.get('q') || ''
	const toast = useToast()

	const [query, setQuery] = useState(initialQuery)
	const [sortBy, setSortBy] = useState<
		'latest' | 'popular' | 'oldest' | 'relevance'
	>('relevance')

	// 使用API Hook直接调用
	const [articles, setArticles] = useState<{
		items: PublicArticle[]
		total: number
		hasMore?: boolean
	} | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// 搜索函数
	const performSearch = async (searchQuery: string, sort?: string) => {
		if (!searchQuery.trim()) {
			setArticles(null)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const searchParams: ArticleSearchQuery = {
				q: searchQuery,
				page: 1,
				limit: 12,
			}

			const response = await articlesApi.searchArticles(searchParams)
			setArticles({
				items: response.items,
				total: response.total,
				hasMore: response.items.length === 12,
			})
		} catch (err) {
			setError('搜索失败，请稍后重试')
			console.error('Search failed:', err)
		} finally {
			setLoading(false)
		}
	}

	const retry = () => {
		if (query.trim()) {
			performSearch(query, sortBy)
		}
	}

	// 错误处理
	useEffect(() => {
		if (error) {
			toast.error('搜索失败: ' + error)
		}
	}, [error, toast])

	// 防抖搜索
	useEffect(() => {
		const timer = setTimeout(() => {
			if (query.trim()) {
				performSearch(query, sortBy)

				// 更新URL参数
				const url = new URL(window.location.href)
				url.searchParams.set('q', query)
				window.history.replaceState({}, '', url.toString())
			} else {
				setArticles(null)
				// 清除URL参数
				const url = new URL(window.location.href)
				url.searchParams.delete('q')
				window.history.replaceState({}, '', url.toString())
			}
		}, 500)

		return () => clearTimeout(timer)
	}, [query, sortBy])

	// 初始搜索
	useEffect(() => {
		if (initialQuery) {
			performSearch(initialQuery, sortBy)
		}
	}, [initialQuery])

	// 加载更多文章
	const handleLoadMore = () => {
		// TODO: Implement pagination
		console.log('Load more functionality to be implemented')
	}

	// 切换排序方式
	const handleSortChange = (
		newSort: 'latest' | 'popular' | 'oldest' | 'relevance'
	) => {
		setSortBy(newSort)
		if (query.trim()) {
			performSearch(query, newSort)
		}
	}

	// 清空搜索
	const handleClearSearch = () => {
		setQuery('')

		const url = new URL(window.location.href)
		url.searchParams.delete('q')
		window.history.replaceState({}, '', url.toString())
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-6xl mx-auto'>
					{/* 搜索标题 */}
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-4'>搜索文章</h1>
						<p className='text-gray-600'>在这里搜索您感兴趣的文章内容</p>
					</div>

					{/* 搜索框 */}
					<div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Search className='h-5 w-5 text-gray-400' />
							</div>
							<input
								type='text'
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder='输入关键词搜索文章...'
								className='block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
							/>
							{query && (
								<button
									onClick={handleClearSearch}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'>
									<X className='h-5 w-5' />
								</button>
							)}
						</div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* 主内容区 */}
						<div className='lg:col-span-2'>
							{/* 搜索结果统计和排序 */}
							{query.trim() && (
								<div className='flex items-center justify-between mb-6'>
									<div className='text-gray-600'>
										{loading ? (
											<span>搜索中...</span>
										) : (
											<span>
												找到{' '}
												<span className='font-semibold text-gray-900'>
													{articles?.total || 0}
												</span>{' '}
												篇相关文章
												{query && (
													<span className='ml-2'>
														关于 &ldquo;
														<span className='font-medium'>{query}</span>&rdquo;
													</span>
												)}
											</span>
										)}
									</div>

									{!loading && articles?.items && articles.items.length > 0 && (
										<div className='flex items-center space-x-2'>
											<Button
												variant={sortBy === 'relevance' ? 'primary' : 'ghost'}
												size='sm'
												onClick={() => handleSortChange('relevance')}>
												相关性
											</Button>
											<Button
												variant={sortBy === 'latest' ? 'primary' : 'ghost'}
												size='sm'
												onClick={() => handleSortChange('latest')}>
												<Clock className='w-4 h-4 mr-1' />
												最新
											</Button>
											<Button
												variant={sortBy === 'popular' ? 'primary' : 'ghost'}
												size='sm'
												onClick={() => handleSortChange('popular')}>
												<TrendingUp className='w-4 h-4 mr-1' />
												热门
											</Button>
											<Button
												variant={sortBy === 'oldest' ? 'primary' : 'ghost'}
												size='sm'
												onClick={() => handleSortChange('oldest')}>
												<Calendar className='w-4 h-4 mr-1' />
												最早
											</Button>
										</div>
									)}
								</div>
							)}

							{/* 搜索结果 */}
							{!query.trim() ? (
								<div className='text-center py-12'>
									<Search className='w-16 h-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>
										开始搜索
									</h3>
									<p className='text-gray-600'>在上方输入关键词来搜索文章</p>
								</div>
							) : loading ? (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{Array.from({ length: 6 }).map((_, i) => (
										<LoadingCard key={i} />
									))}
								</div>
							) : error ? (
								<div className='text-center py-12 bg-red-50 rounded-lg border border-red-200'>
									<AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-red-700 mb-2'>
										搜索失败
									</h3>
									<p className='text-red-600 mb-4'>{error}</p>
									<Button onClick={retry} variant='outline' size='sm'>
										重试
									</Button>
								</div>
							) : articles?.items && articles.items.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
										{articles.items.map((article) => (
											<ArticleCard
												key={article.id}
												article={article}
												variant='default'
												searchQuery={query}
											/>
										))}
									</div>

									{/* 加载更多 */}
									{articles?.hasMore && (
										<div className='text-center'>
											<Button
												onClick={handleLoadMore}
												disabled={loading}
												size='lg'>
												{loading ? '加载中...' : '加载更多'}
											</Button>
										</div>
									)}
								</>
							) : (
								<div className='text-center py-12'>
									<FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>
										未找到相关文章
									</h3>
									<p className='text-gray-600 mb-4'>
										尝试使用不同的关键词或检查拼写
									</p>
									<Button onClick={handleClearSearch} variant='outline'>
										清空搜索
									</Button>
								</div>
							)}
						</div>

						{/* 侧边栏 */}
						<div className='lg:col-span-1'>
							<Sidebar />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SearchPage
