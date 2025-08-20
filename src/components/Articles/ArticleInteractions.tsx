'use client'

import { useState, useEffect } from 'react'
import {
	Container,
	Box,
	Text,
	HStack,
	VStack,
	Button,
	Card,
	Grid,
	GridItem,
	IconButton,
	Spinner,
} from '@chakra-ui/react'
import { Heart, Share2, ArrowLeft, Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ArticleCardServer } from '@/components/ArticleCard/ArticleCardServer'
import { Comments } from '@/components/Comments'
import { TableOfContents } from '@/components/ui/tocbot/TableOfContents'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ArticleContent } from './ArticleContent'
import { userArticlesApi } from '@/lib/api/user-articles'
import { useAuthStore } from '@/lib/store'
import { useToast } from '@/hooks/useToast'
import { PublicArticleDetailType, PublicArticleType } from '@/types'

interface ArticleInteractionsProps {
	article: PublicArticleDetailType
	relatedArticles: PublicArticleType[]
}

// 文章互动按钮组件
function ArticleActions({ article }: { article: PublicArticleDetailType }) {
	const { isAuthenticated } = useAuthStore()
	const { error, success } = useToast()
	const [isLiked, setIsLiked] = useState(false)
	const [isBookmarked, setIsBookmarked] = useState(false)
	const [likeCount, setLikeCount] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [isInitializing, setIsInitializing] = useState(true)

	// 获取用户的互动状态
	useEffect(() => {
		const fetchInteractionStatus = async () => {
			if (!isAuthenticated) {
				setIsInitializing(false)
				return
			}

			try {
				const status = await userArticlesApi.getArticleInteractionStatus(
					article.id,
				)
				setIsLiked(status.isLiked)
				setIsBookmarked(status.isFavorited)
			} catch (error) {
				console.error('Failed to fetch interaction status:', error)
			} finally {
				setIsInitializing(false)
			}
		}

		fetchInteractionStatus()
	}, [article.id, isAuthenticated])

	const handleLike = async () => {
		if (!isAuthenticated) {
			error('请先登录')
			return
		}

		if (isLoading) return

		setIsLoading(true)
		try {
			const result = await userArticlesApi.toggleArticleLike(article.id)
			setIsLiked(result.isLiked)
			setLikeCount(result.likeCount)
		} catch (err) {
			console.error('Failed to toggle like:', err)
			error('操作失败，请重试')
		} finally {
			setIsLoading(false)
		}
	}

	const handleBookmark = async () => {
		if (!isAuthenticated) {
			error('请先登录')
			return
		}

		if (isLoading) return

		setIsLoading(true)
		try {
			const result = await userArticlesApi.toggleArticleFavorite(article.id)
			setIsBookmarked(result.isFavorited)
		} catch (err) {
			console.error('Failed to toggle bookmark:', err)
			error('操作失败，请重试')
		} finally {
			setIsLoading(false)
		}
	}

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: article.title,
					text: article.summary,
					url: window.location.href,
				})
			} catch {
				await navigator.clipboard.writeText(window.location.href)
				success('链接已复制到剪贴板')
			}
		} else {
			// 降级到复制链接
			try {
				await navigator.clipboard.writeText(window.location.href)
				success('链接已复制到剪贴板')
			} catch (err) {
				console.error('Failed to copy link:', err)
			}
		}
	}

	if (isInitializing) {
		return (
			<HStack gap={4} justify="center">
				<Spinner size="sm" />
				<Text>加载中...</Text>
			</HStack>
		)
	}

	return (
		<HStack gap={4} justify="center">
			<Button
				variant={isLiked ? 'solid' : 'outline'}
				colorPalette="red"
				size="lg"
				onClick={handleLike}
				disabled={isLoading || !isAuthenticated}
			>
				{isLoading ? (
					<Spinner size="sm" />
				) : (
					<Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
				)}
				{isLiked ? '取消点赞' : '点赞'}
			</Button>

			<IconButton
				variant={isBookmarked ? 'solid' : 'outline'}
				colorPalette="blue"
				size="lg"
				onClick={handleBookmark}
				disabled={isLoading || !isAuthenticated}
				aria-label="收藏文章"
			>
				{isLoading ? (
					<Spinner size="sm" />
				) : (
					<Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
				)}
			</IconButton>

			<IconButton
				variant="outline"
				colorPalette="green"
				size="lg"
				onClick={handleShare}
				aria-label="分享文章"
			>
				<Share2 size={20} />
			</IconButton>
		</HStack>
	)
}

// 相关文章组件
function RelatedArticles({ articles }: { articles: PublicArticleType[] }) {
	if (!articles || articles.length === 0) {
		return null
	}

	return (
		<Card.Root p={6}>
			<Text fontSize="xl" fontWeight="semibold" mb={4}>
				相关文章
			</Text>
			<Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
				{articles.map((article) => (
					<ArticleCardServer key={article.id} article={article} />
				))}
			</Grid>
		</Card.Root>
	)
}

/**
 * 文章交互组件（客户端组件）
 * 包含所有需要客户端状态的功能：返回按钮、浏览量增加、文章互动、评论、相关文章、目录
 */
export function ArticleInteractions({
	article,
	relatedArticles,
}: ArticleInteractionsProps) {
	const router = useRouter()
	return (
		<ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
			<MainLayout>
				<Container maxW="7xl" py={8}>
					{/* 返回按钮 */}
					<Button
						variant="subtle"
						size="sm"
						onClick={() => router.back()}
						mb={6}
					>
						<ArrowLeft size={16} />
						返回
					</Button>

					<Grid templateColumns={{ base: '1fr', lg: '1fr 200px' }} gap={8}>
						{/* 主内容区域 */}
						<GridItem>
							{/* 文章静态内容 */}
							<ArticleContent article={article} />

							{/* 文章互动 */}
							<Card.Root p={6} mt={8}>
								<VStack align="stretch" gap={4}>
									<Text fontWeight="semibold">喜欢这篇文章吗？</Text>
									<ArticleActions article={article} />
								</VStack>
							</Card.Root>

							{/* 评论区域 */}
							<Box mt={8}>
								<Comments
									articleId={article.id}
									commentCount={article.commentCount}
								/>
							</Box>

							{/* 相关文章 */}
							<Box mt={8}>
								<RelatedArticles articles={relatedArticles} />
							</Box>
						</GridItem>

						{/* 侧边栏 - 文章目录 */}
						<GridItem>
							<Box position="sticky" top="100px">
								<TableOfContents content={article.content} />
							</Box>
						</GridItem>
					</Grid>
				</Container>
			</MainLayout>
		</ErrorBoundary>
	)
}
