'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PublicTag } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'

import { formatNumber, generateColor } from '@/lib/utils'
import { Tag, FileText, TrendingUp } from 'lucide-react'
import { tagsApi } from '@/lib/api'

const TagsPage: React.FC = () => {
	const [tags, setTags] = useState<PublicTag[]>([])
	const [hotTags, setHotTags] = useState<PublicTag[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchTags = async () => {
			try {
				setLoading(true)
				const [allTags, popularTags] = await Promise.all([
					tagsApi.getTags(),
					tagsApi.getPopularTags(),
				])
				setTags(allTags)
				setHotTags(popularTags)
			} catch (error) {
				console.error('Failed to fetch tags:', error)
				setError('标签加载失败')
			} finally {
				setLoading(false)
			}
		}

		fetchTags()
	}, [])

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded mb-8 w-1/3' />
							<div className='mb-8'>
								<div className='h-6 bg-gray-200 rounded mb-4 w-1/4' />
								<div className='flex flex-wrap gap-3'>
									{Array.from({ length: 10 }).map((_, i) => (
										<div
											key={i}
											className='h-8 bg-gray-200 rounded-full w-20'
										/>
									))}
								</div>
							</div>
							<div className='h-6 bg-gray-200 rounded mb-4 w-1/4' />
							<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
								{Array.from({ length: 12 }).map((_, i) => (
									<div key={i} className='h-20 bg-gray-200 rounded-lg' />
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

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-6xl mx-auto'>
					{/* 页面标题 */}
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-4'>文章标签</h1>
						<p className='text-gray-600'>通过标签快速找到感兴趣的文章主题</p>
					</div>

					{/* 热门标签 */}
					{hotTags.length > 0 && (
						<section className='mb-12'>
							<div className='flex items-center mb-6'>
								<TrendingUp className='w-5 h-5 text-orange-500 mr-2' />
								<h2 className='text-xl font-semibold text-gray-900'>
									热门标签
								</h2>
							</div>
							<div className='flex flex-wrap gap-3'>
								{hotTags.map((tag) => (
									<Link key={tag.id} href={`/tags/${tag.id}`}>
										<span
											className='inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm'
											style={{
												backgroundColor: tag.color || generateColor(tag.name),
												color: '#ffffff',
											}}>
											<Tag className='w-3 h-3 mr-1' />
											{tag.name}
											<span className='ml-2 text-xs opacity-80'>
												{formatNumber(tag.articleCount)}
											</span>
										</span>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* 所有标签 */}
					<section>
						<h2 className='text-xl font-semibold text-gray-900 mb-6'>
							所有标签
						</h2>

						{tags.length > 0 ? (
							<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
								{tags.map((tag) => (
									<Link key={tag.id} href={`/tags/${tag.id}`}>
										<Card className='h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group'>
											<CardContent className='p-4'>
												<div className='flex items-center space-x-3'>
													<div
														className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0'
														style={{
															backgroundColor:
																tag.color || generateColor(tag.name),
														}}>
														<Tag className='w-4 h-4 text-white' />
													</div>
													<div className='flex-1 min-w-0'>
														<h3 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate'>
															{tag.name}
														</h3>
														<div className='flex items-center text-xs text-gray-500 mt-1'>
															<FileText className='w-3 h-3 mr-1' />
															<span>{formatNumber(tag.articleCount)} 篇</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						) : (
							<div className='text-center py-12'>
								<Tag className='w-16 h-16 text-gray-400 mx-auto mb-4' />
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									暂无标签
								</h3>
								<p className='text-gray-600'>还没有创建任何标签</p>
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	)
}

export default TagsPage
