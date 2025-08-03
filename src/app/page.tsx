'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PublicArticle } from '@/types'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/ui/Loading'
import { ArrowRight, Star, TrendingUp, Clock } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'

export default function Home() {
	const [featuredArticles, setFeaturedArticles] = useState<PublicArticle[]>([])
	const [recentArticles, setRecentArticles] = useState<PublicArticle[]>([])
	const [popularArticles, setPopularArticles] = useState<PublicArticle[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		//获取首页收据
	}, [])

	return (
		<div className='min-h-screen bg-gray-50'>
			<section className='bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
				<div className='container mx-auto px-4 py-16'>
					<div className='max-w-4xl mx-auto text-center'>
						<h1 className='text-4xl md:text-6xl font-bold mb-6'>
							欢迎来到 igCircle Blog
						</h1>
						<p className='text-xl md:text-2xl mb-8 text-blue-100'>
							知识就像一个圆，你知道的越多，你不知道的就越多
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button
								size='lg'
								className='bg-white text-blue-600 hover:bg-gray-100'>
								<Link href='/articles' className='flex items-center'>
									浏览文章
									<ArrowRight className='ml-2 w-5 h-5' />
								</Link>
							</Button>
							<Button
								size='lg'
								variant='outline'
								className='border-white text-white hover:bg-white hover:text-blue-600'>
								<Link href='/about'>了解更多</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
					<div className='lg:col-span-3 space-y-12'>
						{featuredArticles.length > 0 && (
							<section>
								<div className='flex items-center justify-between mb-8'>
									<h2 className='flex items-center text-2xl font-bold text-gray-900'>
										<Star className='w-6 h-6 mr-2 text-yellow-500' />
										精选文章
									</h2>
									<Link href='/articles?featured=true'>
										<Button variant='ghost' size='sm'>
											查看更多
											<ArrowRight className='ml-2 w-4 h-4' />
										</Button>
									</Link>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
									{loading
										? Array.from({ length: 3 }).map((_, index) => (
												<LoadingCard key={index} />
										  ))
										: featuredArticles.map((article) => (
												<ArticleCard
													key={article.id}
													article={article}
													variant='featured'
												/>
										  ))}
								</div>
							</section>
						)}

						<section>
							<div className='flex items-center justify-between mb-8'>
								<h2 className='flex items-center text-2xl font-bold text-gray-900'>
									<Clock className='w-6 h-6 mr-2 text-green-500' />
									最新文章
								</h2>
								<Link href='/articles'>
									<Button variant='ghost' size='sm'>
										查看更多
										<ArrowRight className='ml-2 w-4 h-4' />
									</Button>
								</Link>
							</div>
						</section>

						<section>
							<div className='flex items-center justify-between mb-8'>
								<h2 className='flex items-center text-2xl font-bold text-gray-900'>
									<TrendingUp className='w-6 h-6 mr-2 text-red-500' />
									热门文章
								</h2>
								<Link href='/articles?sort=popular'>
									<Button variant='ghost' size='sm'>
										查看更多
										<ArrowRight className='ml-2 w-4 h-4' />
									</Button>
								</Link>
							</div>
						</section>
					</div>
					<Sidebar className='lg:col-span-1' />
				</div>
			</div>
		</div>
	)
}
