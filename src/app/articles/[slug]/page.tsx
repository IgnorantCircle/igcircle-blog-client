'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PublicArticleDetail } from '@/types'
import ArticleActions from '@/components/article/ArticleActions'
import CommentSection from '@/components/article/CommentSection'
import RelatedArticles from '@/components/article/RelatedArticles'
import { Button } from '@/components/ui/Button'
import { articlesApi } from '@/lib/api'
import { formatDate, formatReadingTime, formatNumber } from '@/lib/utils'
import {
	Eye,
	Clock,
	Calendar,
	User,
	Tag,
	Folder,
	ArrowLeft,
} from 'lucide-react'

const ArticleDetailPage: React.FC = () => {
	const params = useParams()
	const slug = params.slug as string

	const [article, setArticle] = useState<PublicArticleDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchArticle = async () => {
			try {
				setLoading(true)
				const articleData = await articlesApi.getArticleBySlug(slug)
				setArticle(articleData)
			} catch (error) {
				console.error('Failed to fetch article:', error)
				setError('文章加载失败')
			} finally {
				setLoading(false)
			}
		}

		if (slug) {
			fetchArticle()
		}
	}, [slug])

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-4xl mx-auto'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded mb-4 w-3/4' />
							<div className='h-64 bg-gray-200 rounded mb-6' />
							<div className='space-y-4'>
								{Array.from({ length: 10 }).map((_, i) => (
									<div key={i} className='h-4 bg-gray-200 rounded' />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error || !article) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>
						{error || '文章未找到'}
					</h1>
					<Link href='/articles'>
						<Button>
							<ArrowLeft className='w-4 h-4 mr-2' />
							返回文章列表
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-4xl mx-auto'>
					{/* 返回按钮 */}
					<div className='mb-6'>
						<Link href='/articles'>
							<Button variant='ghost' size='sm'>
								<ArrowLeft className='w-4 h-4 mr-2' />
								返回文章列表
							</Button>
						</Link>
					</div>

					{/* 文章主体 */}
					<article className='bg-white rounded-lg shadow-sm overflow-hidden'>
						{/* 文章头部 */}
						<header className='p-8 border-b'>
							{/* 标题 */}
							<h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight'>
								{article.title}
							</h1>

							{/* 元信息 */}
							<div className='flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6'>
								<div className='flex items-center'>
									<User className='w-4 h-4 mr-2' />
									<span>{article.author.nickname}</span>
								</div>
								<div className='flex items-center'>
									<Calendar className='w-4 h-4 mr-2' />
									<span>{formatDate(article.publishedAt)}</span>
								</div>
								<div className='flex items-center'>
									<Clock className='w-4 h-4 mr-2' />
									<span>{formatReadingTime(article.readingTime)}</span>
								</div>
								<div className='flex items-center'>
									<Eye className='w-4 h-4 mr-2' />
									<span>{formatNumber(article.viewCount)} 阅读</span>
								</div>
							</div>

							{/* 分类和标签 */}
							<div className='flex flex-wrap items-center gap-4 mb-6'>
								{article.category && (
									<Link
										href={`/categories/${article.category.id}`}
										className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors'>
										<Folder className='w-3 h-3 mr-1' />
										{article.category.name}
									</Link>
								)}
								{article.tags.map((tag) => (
									<Link
										key={tag.id}
										href={`/tags/${tag.id}`}
										className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:scale-105'
										style={{
											backgroundColor: tag.color || '#f3f4f6',
											color: tag.color ? '#ffffff' : '#374151',
										}}>
										<Tag className='w-3 h-3 mr-1' />
										{tag.name}
									</Link>
								))}
							</div>

							{/* 摘要 */}
							<p className='text-lg text-gray-600 leading-relaxed'>
								{article.summary}
							</p>
						</header>

						{/* 封面图片 */}
						{article.coverImage && (
							<div className='relative h-64 md:h-96'>
								<Image
									src={article.coverImage}
									alt={article.title}
									fill
									className='object-cover'
									priority
								/>
							</div>
						)}

						{/* 文章内容 */}
						<div className='p-8'>
							<div
								className='prose prose-lg max-w-none'
								dangerouslySetInnerHTML={{ __html: article.content }}
							/>
						</div>

						{/* 文章底部操作 */}
						<footer className='p-8 border-t bg-gray-50'>
							<div className='flex items-center justify-between'>
								{/* 文章操作 */}
								<ArticleActions
									articleId={article.id}
									initialLikes={article.likeCount}
									initialViews={article.viewCount}
								/>

								{/* 作者信息 */}
								<div className='flex items-center space-x-3'>
									{article.author.avatar && (
										<Image
											src={article.author.avatar}
											alt={article.author.nickname || article.author.username}
											width={40}
											height={40}
											className='rounded-full'
										/>
									)}
									<div>
										<p className='font-medium text-gray-900'>
											{article.author.nickname || article.author.username}
										</p>
										<p className='text-sm text-gray-500'>
											{article.author.bio}
										</p>
									</div>
								</div>
							</div>
						</footer>
					</article>

					{/* 评论区域 */}
					<section className='mt-12'>
						<CommentSection />
					</section>

					{/* 相关文章 */}
					<section className='mt-12'>
						<RelatedArticles />
					</section>
				</div>
			</div>
		</div>
	)
}

export default ArticleDetailPage
