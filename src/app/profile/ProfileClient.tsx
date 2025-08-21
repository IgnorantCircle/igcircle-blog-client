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
	Tabs,
	Badge,
	Spinner,
	Alert,
} from '@chakra-ui/react'
import { Avatar } from '@/components/ui/avatar'
import { AuthGuard } from '@/components/AuthGuard'
import {
	Settings,
	Heart,
	Bookmark,
	MessageCircle,
	Eye,
	Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ArticleCardServer } from '@/components/ArticleCard/ArticleCardServer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/lib/store'
import { userProfileApi } from '@/lib/api/user-profile'
import { userArticlesApi } from '@/lib/api/user-articles'
import { commentsApi } from '@/lib/api/comments'
import {
	UserType,
	UserStatsType,
	PublicArticleType,
	CommentType,
	PaginatedResponseType,
} from '@/types'
import { UserArticleQueryType } from '@/types/user-articles'
import Link from 'next/link'

interface ProfileData {
	user: UserType | null
	stats: UserStatsType | null
	likedArticles: PaginatedResponseType<PublicArticleType> | null
	favoritedArticles: PaginatedResponseType<PublicArticleType> | null
	viewHistory: PaginatedResponseType<PublicArticleType> | null
	userComments: PaginatedResponseType<CommentType> | null
}

/**
 * 用户个人中心客户端组件
 */
export function ProfileClient() {
	return (
		<AuthGuard>
			<ProfileContent />
		</AuthGuard>
	)
}

function ProfileContent() {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [activeTab, setActiveTab] = useState('liked')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [profileData, setProfileData] = useState<ProfileData>({
		user: null,
		stats: null,
		likedArticles: null,
		favoritedArticles: null,
		viewHistory: null,
		userComments: null,
	})

	// AuthGuard已处理登录状态检查，这里不需要重复检查

	// 加载用户数据
	useEffect(() => {
		const loadProfileData = async () => {
			if (!isAuthenticated) return

			setIsLoading(true)
			setError(null)

			try {
				// 并行加载用户信息和统计数据
				const [userInfo, userStats] = await Promise.all([
					userProfileApi.getCurrentUser(),
					userProfileApi.getUserStats(),
				])

				setProfileData((prev) => ({
					...prev,
					user: userInfo,
					stats: userStats,
				}))
			} catch (err) {
				console.error('加载用户信息失败:', err)
				setError('加载用户信息失败，请重新登录')
			} finally {
				setIsLoading(false)
			}
		}

		loadProfileData()
	}, [isAuthenticated])

	// 加载标签页数据
	useEffect(() => {
		const loadTabData = async () => {
			if (!isAuthenticated || !profileData.user) return

			try {
				const query: UserArticleQueryType = { page: 1, limit: 10 }

				switch (activeTab) {
					case 'liked':
						if (!profileData.likedArticles) {
							const likedArticles =
								await userArticlesApi.getLikedArticles(query)
							setProfileData((prev) => ({ ...prev, likedArticles }))
						}
						break
					case 'favorited':
						if (!profileData.favoritedArticles) {
							const favoritedArticles =
								await userArticlesApi.getFavoritedArticles(query)
							setProfileData((prev) => ({ ...prev, favoritedArticles }))
						}
						break
					case 'comments':
						if (!profileData.userComments) {
							const userComments = await userProfileApi.getUserComments(
								undefined,
								{ ...query, includeArticleTitle: true },
							)
							setProfileData((prev) => ({ ...prev, userComments }))
						}
						break
				}
			} catch (err) {
				console.error(`Failed to load ${activeTab} data:`, err)
			}
		}

		loadTabData()
	}, [activeTab, isAuthenticated, profileData.user])

	// AuthGuard已确保用户已登录

	if (isLoading) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<VStack gap={4}>
						<Spinner size="lg" />
						<Text>加载中...</Text>
					</VStack>
				</Container>
			</MainLayout>
		)
	}

	if (error) {
		return (
			<MainLayout>
				<Container maxW="6xl" py={8}>
					<Alert.Root status="error">
						<Alert.Title>加载失败</Alert.Title>
						<Alert.Description>{error}</Alert.Description>
					</Alert.Root>
				</Container>
			</MainLayout>
		)
	}

	const { user, stats } = profileData

	if (!user || !stats) {
		return null
	}

	return (
		<ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
			<MainLayout>
				<Container maxW="6xl" py={8}>
					{/* 用户信息卡片 */}
					<Card.Root p={6} mb={8}>
						<Grid
							templateColumns={{ base: '1fr', md: 'auto 1fr auto' }}
							gap={6}
							alignItems="center"
						>
							{/* 头像 */}
							<GridItem>
								<Avatar
									size="2xl"
									name={user.nickname || user.username}
									src={user.avatar}
								/>
							</GridItem>

							{/* 用户信息 */}
							<GridItem>
								<VStack align="start" gap={2}>
									<HStack>
										<Text fontSize="2xl" fontWeight="bold">
											{user.nickname || user.username}
										</Text>
										<Badge colorPalette="blue">{user.role}</Badge>
									</HStack>
									<Text color="gray.600">@{user.username}</Text>
									{user.bio && (
										<Text color="gray.700" mt={2}>
											{user.bio}
										</Text>
									)}
								</VStack>
							</GridItem>

							{/* 操作按钮 */}
							<GridItem>
								<VStack gap={2}>
									<Button
										variant="outline"
										size="sm"
										onClick={() => router.push('/profile/settings')}
									>
										<Settings size={16} />
										编辑资料
									</Button>
								</VStack>
							</GridItem>
						</Grid>
					</Card.Root>

					{/* 标签页内容 */}
					<Tabs.Root
						value={activeTab}
						onValueChange={(e) => setActiveTab(e.value)}
					>
						<Tabs.List>
							<Tabs.Trigger value="liked">
								<Heart size={16} />
								点赞的文章
							</Tabs.Trigger>
							<Tabs.Trigger value="favorited">
								<Bookmark size={16} />
								收藏的文章
							</Tabs.Trigger>
							<Tabs.Trigger value="comments">
								<MessageCircle size={16} />
								我的评论
							</Tabs.Trigger>
						</Tabs.List>

						<Box mt={6}>
							<Tabs.Content value="liked">
								<ArticleList
									articles={profileData.likedArticles}
									emptyText="暂无点赞的文章"
								/>
							</Tabs.Content>
							<Tabs.Content value="favorited">
								<ArticleList
									articles={profileData.favoritedArticles}
									emptyText="暂无收藏的文章"
								/>
							</Tabs.Content>
							<Tabs.Content value="comments">
								<CommentList
									comments={profileData.userComments}
									onCommentDeleted={async () => {
										// 重新从后端获取评论数据
										try {
											const query = {
												page: 1,
												limit: 10,
												includeArticleTitle: true,
											}
											const updatedComments =
												await userProfileApi.getUserComments(undefined, query)
											setProfileData((prev) => ({
												...prev,
												userComments: updatedComments,
											}))
										} catch (error) {
											console.error('重新加载评论数据失败:', error)
										}
									}}
								/>
							</Tabs.Content>
						</Box>
					</Tabs.Root>
				</Container>
			</MainLayout>
		</ErrorBoundary>
	)
}

// 文章列表组件
function ArticleList({
	articles,
	emptyText,
}: {
	articles: PaginatedResponseType<PublicArticleType> | null
	emptyText: string
}) {
	if (!articles) {
		return (
			<VStack gap={4}>
				<Spinner size="md" />
				<Text>加载中...</Text>
			</VStack>
		)
	}

	if (articles.items.length === 0) {
		return (
			<Card.Root p={8}>
				<VStack gap={4}>
					<Text color="gray.500">{emptyText}</Text>
				</VStack>
			</Card.Root>
		)
	}

	return (
		<Grid
			templateColumns={{
				base: '1fr',
				md: 'repeat(2, 1fr)',
				lg: 'repeat(3, 1fr)',
			}}
			gap={6}
		>
			{articles.items.map((article) => (
				<ArticleCardServer key={article.id} article={article} />
			))}
		</Grid>
	)
}

// 评论列表组件
function CommentList({
	comments,
	onCommentDeleted,
}: {
	comments: PaginatedResponseType<CommentType> | null
	onCommentDeleted?: () => void
}) {
	const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
		null,
	)

	const handleDeleteComment = async (commentId: string) => {
		if (!confirm('确定要删除这条评论吗？')) {
			return
		}

		setDeletingCommentId(commentId)
		try {
			await commentsApi.deleteComment(commentId)
			// 删除成功后刷新评论列表
			if (onCommentDeleted) {
				onCommentDeleted()
			}
		} catch (error) {
			console.error('删除评论失败:', error)
			alert('删除评论失败，请稍后重试')
		} finally {
			setDeletingCommentId(null)
		}
	}

	if (!comments) {
		return (
			<VStack gap={4}>
				<Spinner size="md" />
				<Text>加载中...</Text>
			</VStack>
		)
	}

	if (comments.items.length === 0) {
		return (
			<Card.Root p={8}>
				<VStack gap={4}>
					<Text color="gray.500">暂无评论记录</Text>
				</VStack>
			</Card.Root>
		)
	}

	return (
		<VStack gap={4} align="stretch">
			{comments.items.map((comment) => (
				<Card.Root key={comment.id} p={4}>
					<HStack justify="space-between" align="start">
						<VStack align="start" gap={2} flex={1}>
							<Text fontSize="sm" color="gray.600">
								评论于 {new Date(comment.createdAt).toLocaleDateString()}
							</Text>
							<Text>{comment.content}</Text>
							<Link href={`/articles/${comment.article?.title}`}>
								{comment.article?.title && (
									<Text fontSize="sm" color="blue.600">
										文章：{comment.article?.title}
									</Text>
								)}
							</Link>
						</VStack>
						<Button
							variant="ghost"
							size="sm"
							colorPalette="red"
							loading={deletingCommentId === comment.id}
							onClick={() => handleDeleteComment(comment.id)}
							title="删除评论"
						>
							<Trash2 size={16} />
						</Button>
					</HStack>
				</Card.Root>
			))}
		</VStack>
	)
}
