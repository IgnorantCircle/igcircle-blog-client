'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicArticle, PublicTag, PublicCategory } from '@/types'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { TrendingUp, Tag, Folder, Clock } from 'lucide-react'

interface SidebarProps {
	className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
	const [popularArticles, setPopularArticles] = useState<PublicArticle[]>([])
	const [popularTags, setPopularTags] = useState<PublicTag[]>([])
	const [categories, setCategories] = useState<PublicCategory[]>([])
	const [loading, setLoading] = useState(true)

	// if (loading) {
	//   return (
	//     <aside className={className}>
	//       <div className="space-y-6">
	//         {[1, 2, 3].map((i) => (
	//           <Card key={i}>
	//             <CardHeader>
	//               <div className="h-6 bg-gray-200 rounded animate-pulse" />
	//             </CardHeader>
	//             <CardContent>
	//               <div className="space-y-3">
	//                 {[1, 2, 3].map((j) => (
	//                   <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
	//                 ))}
	//               </div>
	//             </CardContent>
	//           </Card>
	//         ))}
	//       </div>
	//     </aside>
	//   );
	// }

	return (
		<aside className={className}>
			<div className='space-y-6'>
				{/* 热门文章 */}
				<Card>
					<CardHeader>
						<h3 className='flex items-center text-lg font-semibold text-gray-900'>
							<TrendingUp className='w-5 h-5 mr-2 text-red-500' />
							热门文章
						</h3>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{popularArticles.map((article, index) => (
								<Link
									key={article.id}
									href={`/articles/${article.slug}`}
									className='block group'>
									<div className='flex space-x-3'>
										<div className='flex-shrink-0'>
											<span className='inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-white bg-red-500 rounded'>
												{index + 1}
											</span>
										</div>
										<div className='flex-1 min-w-0'>
											<h4 className='text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2'>
												{article.title}
											</h4>
										</div>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* 标签云 */}
				<Card>
					<CardHeader>
						<h3 className='flex items-center text-lg font-semibold text-gray-900'>
							<Tag className='w-5 h-5 mr-2 text-blue-500' />
							热门标签
						</h3>
					</CardHeader>
					<CardContent>
						<div className='flex flex-wrap gap-2'>
							{popularTags.map((tag) => (
								<Link
									key={tag.id}
									href={`/tags/${tag.id}`}
									className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:scale-105'
									style={{
										backgroundColor: tag.color || '#f3f4f6',
										color: tag.color ? '#ffffff' : '#374151',
									}}>
									{tag.name}
									<span className='ml-1 text-xs opacity-75'>
										{tag.articleCount}
									</span>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* 分类 */}
				<Card>
					<CardHeader>
						<h3 className='flex items-center text-lg font-semibold text-gray-900'>
							<Folder className='w-5 h-5 mr-2 text-green-500' />
							文章分类
						</h3>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{categories.map((category) => (
								<Link
									key={category.id}
									href={`/categories/${category.id}`}
									className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group'>
									<div className='flex items-center space-x-2'>
										{category.icon && (
											<span className='text-lg'>{category.icon}</span>
										)}
										<span className='text-sm font-medium text-gray-900 group-hover:text-blue-600'>
											{category.name}
										</span>
									</div>
									<span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
										{category.articleCount}
									</span>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* 网站统计 */}
				<Card>
					<CardHeader>
						<h3 className='text-lg font-semibold text-gray-900'>网站统计</h3>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-2 gap-4 text-center'>
							<div>
								<div className='text-2xl font-bold text-blue-600'>阅读量</div>
								<div className='text-xs text-gray-500'>总阅读量</div>
							</div>
							<div>
								<div className='text-2xl font-bold text-green-600'>
									{popularArticles.length}
								</div>
								<div className='text-xs text-gray-500'>文章数量</div>
							</div>
							<div>
								<div className='text-2xl font-bold text-purple-600'>
									{categories.length}
								</div>
								<div className='text-xs text-gray-500'>分类数量</div>
							</div>
							<div>
								<div className='text-2xl font-bold text-orange-600'>
									{popularTags.length}
								</div>
								<div className='text-xs text-gray-500'>标签数量</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</aside>
	)
}

export default Sidebar
