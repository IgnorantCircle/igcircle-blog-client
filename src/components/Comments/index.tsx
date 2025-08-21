'use client'

import { useState, useEffect } from 'react'
import {
	Box,
	Heading,
	Text,
	Button,
	Textarea,
	VStack,
	HStack,
	Card,
	Separator,
	Badge,
} from '@chakra-ui/react'
import { Avatar } from '@/components/ui/avatar'
import { MessageCircle, Send, LogIn, Heart } from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { useAuthStore } from '@/lib/store'
import { commentsApi, CommentQueryType } from '@/lib/api/comments'
import { CommentType } from '@/types'
import { formatDate } from '@/lib/utils'

// 使用从types导入的CommentType

interface CommentsProps {
	articleId: string
	commentCount?: number
}

export function Comments({ articleId, commentCount = 0 }: CommentsProps) {
	const { isAuthenticated, user } = useAuthStore()
	const [comments, setComments] = useState<CommentType[]>([])
	const [newComment, setNewComment] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { openModal } = useAuthModal()
	const [totalComments, setTotalComments] = useState(commentCount)

	// 加载评论列表
	useEffect(() => {
		loadComments()
	}, [articleId])

	// 加载评论
	const loadComments = async () => {
		setIsLoading(true)
		try {
			const query: CommentQueryType = {
				articleId,
				page: 1,
				limit: 10,
				sortBy: 'createdAt',
				sortOrder: 'DESC',
			}
			const result = await commentsApi.getComments(query)
			setComments(result.items)
			setTotalComments(result.total)
		} catch (error) {
			console.error('Failed to load comments:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// 提交评论
	const handleSubmitComment = async () => {
		if (!newComment.trim() || !isAuthenticated) return

		setIsSubmitting(true)
		try {
			const commentData = {
				content: newComment.trim(),
				articleId,
			}
			const newCommentResult = await commentsApi.createComment(commentData)
			if (newCommentResult) {
				// 重新加载评论列表
				await loadComments()
				setNewComment('')
				setTotalComments((prev) => prev + 1)
			}
		} catch (error) {
			console.error('Failed to submit comment:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Box>
			{/* 评论标题 */}
			<HStack gap={3} mb={6}>
				<MessageCircle size={24} />
				<Heading size="lg">评论</Heading>
				<Badge colorPalette="gray" variant="subtle">
					{totalComments} 条
				</Badge>
			</HStack>

			{/* 评论表单 */}
			<Card.Root mb={6} p={6}>
				{isAuthenticated && user ? (
					<VStack align="stretch" gap={4}>
						<HStack gap={3}>
							<Avatar
								size="sm"
								name={user.nickname || user.username}
								src={user.avatar}
							/>
							<Text fontWeight="medium">{user.nickname || user.username}</Text>
						</HStack>
						<Textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="写下你的评论..."
							minH="100px"
							resize="vertical"
						/>
						<HStack justify="flex-end">
							<Button
								colorPalette="blue"
								onClick={handleSubmitComment}
								loading={isSubmitting}
								disabled={!newComment.trim()}
							>
								<Send size={16} />
								发表评论
							</Button>
						</HStack>
					</VStack>
				) : (
					<VStack gap={4} py={8}>
						<MessageCircle size={48} color="gray" />
						<Text
							fontSize="lg"
							fontWeight="medium"
							color="gray.600"
							_dark={{ color: 'gray.400' }}
						>
							登录后即可参与评论讨论
						</Text>
						<Button colorPalette="blue" onClick={() => openModal('login')}>
							<LogIn size={16} />
							立即登录
						</Button>
					</VStack>
				)}
			</Card.Root>

			{/* 评论列表 */}
			<VStack align="stretch" gap={4}>
				{isLoading ? (
					<Text textAlign="center" py={8} color="gray.500">
						加载评论中...
					</Text>
				) : comments.length > 0 ? (
					comments.map((comment, index) => (
						<Box key={comment.id}>
							<Card.Root p={4}>
								<VStack align="stretch" gap={3}>
									<HStack gap={3}>
										<Avatar
											size="sm"
											name={comment.author.nickname || comment.author.username}
											src={comment.author.avatar}
										/>
										<VStack align="start" gap={1}>
											<Text fontWeight="medium" fontSize="sm">
												{comment.author.nickname || comment.author.username}
											</Text>
											<Text fontSize="xs" color="gray.500">
												{formatDate(comment.createdAt)}
											</Text>
										</VStack>
									</HStack>
									<Text lineHeight="1.6">{comment.content}</Text>
								</VStack>
							</Card.Root>
							{index < comments.length - 1 && <Separator />}
						</Box>
					))
				) : (
					<Text textAlign="center" py={8} color="gray.500">
						暂无评论，快来抢沙发吧！
					</Text>
				)}
			</VStack>
		</Box>
	)
}
