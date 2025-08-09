'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PublicArticle } from '@/types'
import { Card } from '@/components/ui/Card'
import { articlesApi } from '@/lib/api'
import { formatDate, formatNumber } from '@/lib/utils'
import {
	Calendar,
	FileText,
	Eye,
	Heart,
	ChevronDown,
	ChevronRight,
} from 'lucide-react'

interface ArchiveData {
	[year: string]: {
		[month: string]: PublicArticle[]
	}
}

interface MonthStats {
	count: number
	totalViews: number
	totalLikes: number
}

const ArchivePage: React.FC = () => {
	const [archiveData, setArchiveData] = useState<ArchiveData>({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
	const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

	useEffect(() => {
		const fetchArchive = async () => {
			try {
				setLoading(true)
				const data = await articlesApi.getArchive()

				// 按年月分组
				const grouped: ArchiveData = {}
				data.forEach((article) => {
					const date = new Date(article.publishedAt)
					const year = date.getFullYear().toString()
					const month = (date.getMonth() + 1).toString().padStart(2, '0')

					if (!grouped[year]) {
						grouped[year] = {}
					}
					if (!grouped[year][month]) {
						grouped[year][month] = []
					}
					grouped[year][month].push(article)
				})

				setArchiveData(grouped)

				// 默认展开最新的年份
				const years = Object.keys(grouped).sort(
					(a, b) => parseInt(b) - parseInt(a)
				)
				if (years.length > 0) {
					setExpandedYears(new Set([years[0]]))
				}
			} catch (error) {
				console.error('Failed to fetch archive:', error)
				setError('归档数据加载失败')
			} finally {
				setLoading(false)
			}
		}

		fetchArchive()
	}, [])

	const toggleYear = (year: string) => {
		const newExpanded = new Set(expandedYears)
		if (newExpanded.has(year)) {
			newExpanded.delete(year)
			// 同时收起该年份下的所有月份
			const monthsToRemove = new Set<string>()
			expandedMonths.forEach((monthKey) => {
				if (monthKey.startsWith(year)) {
					monthsToRemove.add(monthKey)
				}
			})
			const newExpandedMonths = new Set(expandedMonths)
			monthsToRemove.forEach((month) => newExpandedMonths.delete(month))
			setExpandedMonths(newExpandedMonths)
		} else {
			newExpanded.add(year)
		}
		setExpandedYears(newExpanded)
	}

	const toggleMonth = (year: string, month: string) => {
		const monthKey = `${year}-${month}`
		const newExpanded = new Set(expandedMonths)
		if (newExpanded.has(monthKey)) {
			newExpanded.delete(monthKey)
		} else {
			newExpanded.add(monthKey)
		}
		setExpandedMonths(newExpanded)
	}

	const getMonthStats = (articles: PublicArticle[]): MonthStats => {
		return {
			count: articles.length,
			totalViews: articles.reduce((sum, article) => sum + article.viewCount, 0),
			totalLikes: articles.reduce((sum, article) => sum + article.likeCount, 0),
		}
	}

	const getYearStats = (yearData: { [month: string]: PublicArticle[] }) => {
		let totalCount = 0
		let totalViews = 0
		let totalLikes = 0

		Object.values(yearData).forEach((articles) => {
			totalCount += articles.length
			totalViews += articles.reduce(
				(sum, article) => sum + article.viewCount,
				0
			)
			totalLikes += articles.reduce(
				(sum, article) => sum + article.likeCount,
				0
			)
		})

		return { totalCount, totalViews, totalLikes }
	}

	const getMonthName = (month: string) => {
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
		return monthNames[parseInt(month) - 1]
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-4xl mx-auto'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded mb-8 w-1/3' />
							<div className='space-y-4'>
								{Array.from({ length: 5 }).map((_, i) => (
									<div key={i} className='h-16 bg-gray-200 rounded-lg' />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>{error}</h1>
					<Link href='/' className='text-blue-600 hover:text-blue-800'>
						返回首页
					</Link>
				</div>
			</div>
		)
	}

	const years = Object.keys(archiveData).sort(
		(a, b) => parseInt(b) - parseInt(a)
	)
	const totalArticles = years.reduce((sum, year) => {
		return sum + getYearStats(archiveData[year]).totalCount
	}, 0)

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-4xl mx-auto'>
					{/* 页面标题 */}
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-4'>文章归档</h1>
						<p className='text-gray-600'>
							按时间浏览所有文章，共 {formatNumber(totalArticles)} 篇文章
						</p>
					</div>

					{/* 归档内容 */}
					{years.length > 0 ? (
						<div className='space-y-4'>
							{years.map((year) => {
								const yearData = archiveData[year]
								const yearStats = getYearStats(yearData)
								const isYearExpanded = expandedYears.has(year)
								const months = Object.keys(yearData).sort(
									(a, b) => parseInt(b) - parseInt(a)
								)

								return (
									<Card key={year} className='overflow-hidden'>
										{/* 年份标题 */}
										<div
											className='p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b'
											onClick={() => toggleYear(year)}>
											<div className='flex items-center justify-between'>
												<div className='flex items-center space-x-3'>
													{isYearExpanded ? (
														<ChevronDown className='w-5 h-5 text-gray-500' />
													) : (
														<ChevronRight className='w-5 h-5 text-gray-500' />
													)}
													<Calendar className='w-6 h-6 text-blue-600' />
													<h2 className='text-2xl font-bold text-gray-900'>
														{year} 年
													</h2>
												</div>
												<div className='flex items-center space-x-6 text-sm text-gray-600'>
													<div className='flex items-center'>
														<FileText className='w-4 h-4 mr-1' />
														<span>{formatNumber(yearStats.totalCount)} 篇</span>
													</div>
													<div className='flex items-center'>
														<Eye className='w-4 h-4 mr-1' />
														<span>{formatNumber(yearStats.totalViews)}</span>
													</div>
													<div className='flex items-center'>
														<Heart className='w-4 h-4 mr-1' />
														<span>{formatNumber(yearStats.totalLikes)}</span>
													</div>
												</div>
											</div>
										</div>

										{/* 月份列表 */}
										{isYearExpanded && (
											<div className='divide-y'>
												{months.map((month) => {
													const monthArticles = yearData[month]
													const monthStats = getMonthStats(monthArticles)
													const monthKey = `${year}-${month}`
													const isMonthExpanded = expandedMonths.has(monthKey)

													return (
														<div key={month}>
															{/* 月份标题 */}
															<div
																className='p-4 cursor-pointer hover:bg-gray-50 transition-colors'
																onClick={() => toggleMonth(year, month)}>
																<div className='flex items-center justify-between'>
																	<div className='flex items-center space-x-3'>
																		{isMonthExpanded ? (
																			<ChevronDown className='w-4 h-4 text-gray-500' />
																		) : (
																			<ChevronRight className='w-4 h-4 text-gray-500' />
																		)}
																		<h3 className='text-lg font-semibold text-gray-800'>
																			{getMonthName(month)}
																		</h3>
																	</div>
																	<div className='flex items-center space-x-4 text-sm text-gray-600'>
																		<span>{monthStats.count} 篇</span>
																		<span>
																			{formatNumber(monthStats.totalViews)} 阅读
																		</span>
																		<span>
																			{formatNumber(monthStats.totalLikes)} 点赞
																		</span>
																	</div>
																</div>
															</div>

															{/* 文章列表 */}
															{isMonthExpanded && (
																<div className='px-4 pb-4'>
																	<div className='space-y-2'>
																		{monthArticles.map((article) => (
																			<Link
																				key={article.id}
																				href={`/articles/${article.slug}`}
																				className='block p-3 rounded-lg hover:bg-gray-50 transition-colors group'>
																				<div className='flex items-center justify-between'>
																					<div className='flex-1 min-w-0'>
																						<h4 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate'>
																							{article.title}
																						</h4>
																						<div className='flex items-center space-x-4 mt-1 text-xs text-gray-500'>
																							<span>
																								{formatDate(
																									article.publishedAt
																								)}
																							</span>
																							<span>
																								{article.author.nickname}
																							</span>
																							{article.category && (
																								<span>
																									{article.category.name}
																								</span>
																							)}
																						</div>
																					</div>
																					<div className='flex items-center space-x-3 text-xs text-gray-500 ml-4'>
																						<div className='flex items-center'>
																							<Eye className='w-3 h-3 mr-1' />
																							<span>
																								{formatNumber(
																									article.viewCount
																								)}
																							</span>
																						</div>
																						<div className='flex items-center'>
																							<Heart className='w-3 h-3 mr-1' />
																							<span>
																								{formatNumber(
																									article.likeCount
																								)}
																							</span>
																						</div>
																					</div>
																				</div>
																			</Link>
																		))}
																	</div>
																</div>
															)}
														</div>
													)
												})}
											</div>
										)}
									</Card>
								)
							})}
						</div>
					) : (
						<div className='text-center py-12'>
							<Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								暂无文章
							</h3>
							<p className='text-gray-600'>还没有发布任何文章</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ArchivePage
