'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PublicTag, PublicArticle, ArticleQueryParams,  } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/ui/Loading'
import { tagsApi, articlesApi } from '@/lib/api'	
import { formatNumber, generateColor } from '@/lib/utils'
import {
	ArrowLeft,
	Tag,
	FileText,
	Calendar,
	TrendingUp,
	Clock,
} from 'lucide-react'

const TagDetailPage: React.FC = () => {
	const params = useParams()
	const searchParams = useSearchParams()
	const tagId = params.id 

	const [tag, setTag] = useState<PublicTag | null>(null)
	const [articles, setArticles] = useState<PublicArticle[]>([])
	const [loading, setLoading] = useState(true)
	const [articlesLoading, setArticlesLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [hasMore, setHasMore] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>(
		'latest'
	)
	const pageSize = 12

	// 从URL参数初始化排序方式
	useEffect(() => {
		const sort = searchParams.get('sort') as 'latest' | 'popular' | 'oldest'
		if (sort && ['latest', 'popular', 'oldest'].includes(sort)) {
			setSortBy(sort)
		}
	}, [searchParams])

	// 获取标签信息
	useEffect(() => {
		const fetchTag = async () => {
			try {
				setLoading(true)
				const data = await tagsApi.getTagById(String(tagId))
				setTag(data)
			} catch (error) {
				console.error('Failed to fetch tag:', error)
				setError('标签加载失败')
			} finally {
				setLoading(false)
			}
		}

		if (tagId) {
			fetchTag()
		}
	}, [tagId])

	// 获取文章列表
	const fetchArticles = async (page: number, reset: boolean = false) => {
		try {
			setArticlesLoading(true)

			const queryParams: ArticleQueryParams = {
				page,
				limit: pageSize,
				tagId: String(tagId),
				sortBy:
					sortBy === 'latest'
						? 'publishedAt'
						: sortBy === 'popular'
						? 'viewCount'
						: 'publishedAt',
				sortOrder: sortBy === 'oldest' ? 'ASC' : 'DESC',
			}

			const response = await articlesApi.getArticles(queryParams)

			if (reset) {
				setArticles(response.items)
			} else {
				setArticles((prev) => [...prev, ...response.items])
			}

			setHasMore(response.hasNext)
			setCurrentPage(page)
		} catch (error) {
			console.error('Failed to fetch articles:', error)
		} finally {
			setArticlesLoading(false)
		}
	}

	// 初始加载文章
	useEffect(() => {
		if (tagId) {
			fetchArticles(1, true)
		}
	}, [tagId, sortBy])

	// 加载更多文章
	const handleLoadMore = () => {
		if (!articlesLoading && hasMore) {
			fetchArticles(currentPage + 1)
		}
	}

	// 切换排序方式
	const handleSortChange = (newSort: 'latest' | 'popular' | 'oldest') => {
		setSortBy(newSort)
		setCurrentPage(1)
		setHasMore(true)

		// 更新URL参数
		const url = new URL(window.location.href)
		url.searchParams.set('sort', newSort)
		window.history.replaceState({}, '', url.toString())
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded mb-4 w-1/4' />
							<div className='h-24 bg-gray-200 rounded mb-8' />
							<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
								<div className='lg:col-span-2'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										{Array.from({ length: 6 }).map((_, i) => (
											<div key={i} className='h-64 bg-gray-200 rounded-lg' />
										))}
									</div>
								</div>
								<div className='h-96 bg-gray-200 rounded-lg' />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error || !tag) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>
						{error || '标签未找到'}
					</h1>
					<Link href='/tags'>
						<Button>
							<ArrowLeft className='w-4 h-4 mr-2' />
							返回标签列表
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-6xl mx-auto'>
					{/* 返回按钮 */}
					<div className='mb-6'>
						<Link href='/tags'>
							<Button variant='ghost' size='sm'>
								<ArrowLeft className='w-4 h-4 mr-2' />
								返回标签列表
							</Button>
						</Link>
					</div>

					{/* 标签信息 */}
					<div className='bg-white rounded-lg shadow-sm p-8 mb-8'>
						<div className='flex items-center space-x-4'>
							<div
								className='w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0'
								style={{
									backgroundColor: tag.color || generateColor(tag.name),
								}}>
								<Tag className='w-8 h-8 text-white' />
							</div>
							<div className='flex-1'>
								<h1 className='text-3xl font-bold text-gray-900 mb-2'>
									{tag.name}
								</h1>
								<div className='flex items-center text-sm text-gray-500'>
									<FileText className='w-4 h-4 mr-1' />
									<span>{formatNumber(tag.articleCount)} 篇文章</span>
								</div>
							</div>
						</div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* 主内容区 */}
						<div className='lg:col-span-2'>
							{/* 排序选项 */}
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-xl font-semibold text-gray-900'>
									相关文章
								</h2>
								<div className='flex items-center space-x-2'>
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
							</div>

							{/* 文章列表 */}
							{articles.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
										{articles.map((article) => (
											<ArticleCard
												key={article.id}
												article={article}
												variant='default'
											/>
										))}
									</div>

									{/* 加载更多 */}
									{hasMore && (
										<div className='text-center'>
											<Button
												onClick={handleLoadMore}
												disabled={articlesLoading}
												size='lg'>
												{articlesLoading ? '加载中...' : '加载更多'}
											</Button>
										</div>
									)}
								</>
							) : (
								<div className='text-center py-12'>
									<FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>
										暂无文章
									</h3>
									<p className='text-gray-600'>该标签下还没有发布任何文章</p>
								</div>
							)}

							{/* 加载中的骨架屏 */}
							{articlesLoading && articles.length === 0 && (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{Array.from({ length: 6 }).map((_, i) => (
										<LoadingCard key={i} />
									))}
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

export default TagDetailPage
