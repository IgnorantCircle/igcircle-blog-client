'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PublicCategory } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { categoriesApi } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import { Folder, FileText } from 'lucide-react'

const CategoriesPage: React.FC = () => {
	const [categories, setCategories] = useState<PublicCategory[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setLoading(true)
				const data = await categoriesApi.getCategories()
				setCategories(data)
			} catch (error) {
				console.error('Failed to fetch categories:', error)
				setError('分类加载失败')
			} finally {
				setLoading(false)
			}
		}

		fetchCategories()
	}, [])

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded mb-8 w-1/3' />
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className='h-32 bg-gray-200 rounded-lg' />
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
						<h1 className='text-3xl font-bold text-gray-900 mb-4'>文章分类</h1>
						<p className='text-gray-600'>浏览所有分类，发现感兴趣的内容</p>
					</div>

					{/* 分类网格 */}
					{categories.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{categories.map((category) => (
								<Link key={category.id} href={`/categories/${category.id}`}>
									<Card className='h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group'>
										<CardContent className='p-6'>
											<div className='flex items-start space-x-4'>
												<div className='flex-shrink-0'>
													<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
														<Folder className='w-6 h-6 text-blue-600' />
													</div>
												</div>
												<div className='flex-1 min-w-0'>
													<h3 className='text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
														{category.name}
													</h3>
													{category.description && (
														<p className='text-gray-600 text-sm mb-3 line-clamp-2'>
															{category.description}
														</p>
													)}
													<div className='flex items-center text-sm text-gray-500'>
														<FileText className='w-4 h-4 mr-1' />
														<span>
															{formatNumber(category.articleCount)} 篇文章
														</span>
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
							<Folder className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								暂无分类
							</h3>
							<p className='text-gray-600'>还没有创建任何分类</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default CategoriesPage
