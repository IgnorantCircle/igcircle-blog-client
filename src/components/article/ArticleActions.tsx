'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Share2, Bookmark, MessageCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/lib/store'
import { articlesApi } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ArticleActionsProps {
	articleId: string
	initialLikes?: number
	initialViews?: number
	className?: string
}

const ArticleActions: React.FC<ArticleActionsProps> = ({
	articleId,
	initialLikes = 0,
	initialViews = 0,
	className,
}) => {
	const [likes, setLikes] = useState(initialLikes)
	const [views, setViews] = useState(initialViews)
	const [isLiked, setIsLiked] = useState(false)
	const [isBookmarked, setIsBookmarked] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const { isAuthenticated } = useAuthStore()
	const toast = useToast()

	// 组件挂载时增加浏览量
	useEffect(() => {
		const incrementView = async () => {
			try {
				await articlesApi.incrementArticleView(articleId)
				setViews((prev) => prev + 1)
			} catch (error) {
				console.error('Failed to increment view:', error)
			}
		}

		incrementView()
	}, [articleId])

	const handleLike = async () => {
		if (!isAuthenticated) {
			toast.error('请先登录后再点赞')
			return
		}

		if (isLoading) return

		setIsLoading(true)
		try {
			await articlesApi.likeArticle(articleId)
			setIsLiked(!isLiked)
			setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
			toast.success(isLiked ? '取消点赞' : '点赞成功')
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleShare = async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: document.title,
					url: window.location.href,
				})
			} else {
				// 复制链接到剪贴板
				await navigator.clipboard.writeText(window.location.href)
				toast.success('链接已复制到剪贴板')
			}

			// 记录分享
			await articlesApi.shareArticle(articleId)
		} catch (error) {
			if (error instanceof Error && error.name !== 'AbortError') {
				toast.error('分享失败')
			}
		}
	}

	const handleBookmark = () => {
		if (!isAuthenticated) {
			toast.error('请先登录后再收藏')
			return
		}

		// TODO: 实现收藏功能
		setIsBookmarked(!isBookmarked)
		toast.success(isBookmarked ? '取消收藏' : '收藏成功')
	}

	const handleComment = () => {
		// 滚动到评论区域
		const commentSection = document.getElementById('comments')
		if (commentSection) {
			commentSection.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div className={cn('flex items-center space-x-4', className)}>
			{/* 浏览量 */}
			<div className='flex items-center text-gray-500 text-sm'>
				<Eye className='w-4 h-4 mr-1' />
				<span>{formatNumber(views)}</span>
			</div>

			{/* 点赞 */}
			<Button
				variant='ghost'
				size='sm'
				onClick={handleLike}
				disabled={isLoading}
				className={cn(
					'flex items-center space-x-1 transition-colors',
					isLiked
						? 'text-red-500 hover:text-red-600'
						: 'text-gray-500 hover:text-red-500'
				)}>
				<Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
				<span>{formatNumber(likes)}</span>
			</Button>

			{/* 收藏 */}
			<Button
				variant='ghost'
				size='sm'
				onClick={handleBookmark}
				className={cn(
					'flex items-center space-x-1 transition-colors',
					isBookmarked
						? 'text-yellow-500 hover:text-yellow-600'
						: 'text-gray-500 hover:text-yellow-500'
				)}>
				<Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
				<span className='hidden sm:inline'>收藏</span>
			</Button>

			{/* 评论 */}
			<Button
				variant='ghost'
				size='sm'
				onClick={handleComment}
				className='flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors'>
				<MessageCircle className='w-4 h-4' />
				<span className='hidden sm:inline'>评论</span>
			</Button>

			{/* 分享 */}
			<Button
				variant='ghost'
				size='sm'
				onClick={handleShare}
				className='flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors'>
				<Share2 className='w-4 h-4' />
				<span className='hidden sm:inline'>分享</span>
			</Button>
		</div>
	)
}

export default ArticleActions
