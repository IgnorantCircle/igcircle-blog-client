import {
	Box,
	Heading,
	Text,
	HStack,
	VStack,
	Badge,
	Image,
	Blockquote,
} from '@chakra-ui/react'
import { Clock, Calendar, Tag, Folder, Eye, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { PublicArticleDetailType } from '@/types'
import { formatDate, formatNumber, formatReadingTime } from '@/lib/utils'

interface ArticleContentProps {
	article: PublicArticleDetailType
}

/**
 * 文章静态内容组件（服务端组件）
 * 包含文章的标题、元信息、分类标签、摘要、封面图和正文内容
 */
export function ArticleContent({ article }: ArticleContentProps) {
	return (
		<VStack align="stretch" gap={8}>
			{/* 文章头部 */}
			<Box>
				{/* 特色和置顶标识 */}
				{(article.isFeatured || article.isTop) && (
					<HStack gap={2} mb={4}>
						{article.isTop && (
							<Badge colorPalette="red" variant="solid">
								置顶
							</Badge>
						)}
						{article.isFeatured && (
							<Badge colorPalette="yellow" variant="solid">
								精选
							</Badge>
						)}
					</HStack>
				)}

				{/* 文章标题 */}
				<Heading
					size="2xl"
					mb={4}
					lineHeight="1.2"
					color={{ base: 'gray.900', _dark: 'white' }}
				>
					{article.title}
				</Heading>

				{/* 文章元信息 */}
				<HStack
					gap={6}
					wrap="wrap"
					fontSize="sm"
					color="gray.600"
					_dark={{ color: 'gray.400' }}
					mb={4}
				>
					<HStack gap={2}>
						<Calendar size={16} />
						<Text>{formatDate(article.publishedAt)}</Text>
					</HStack>
					<HStack gap={2}>
						<Clock size={16} />
						<Text>{formatReadingTime(article.readingTime)}</Text>
					</HStack>
					<HStack gap={2}>
						<Eye size={16} />
						<Text>{formatNumber(article.viewCount)} 次浏览</Text>
					</HStack>
					{article.commentCount !== undefined && (
						<HStack gap={2}>
							<MessageCircle size={16} />
							<Text>{formatNumber(article.commentCount)} 条评论</Text>
						</HStack>
					)}
				</HStack>

				{/* 分类和标签 */}
				<HStack gap={4} wrap="wrap" mb={6}>
					{article.category && (
						<HStack gap={2}>
							<Folder size={16} />
							<Link href={`/categories/${article.category.slug}`}>
								<Badge
									colorPalette="blue"
									variant="subtle"
									cursor="pointer"
									_hover={{ bg: 'blue.100' }}
								>
									{article.category.name}
								</Badge>
							</Link>
						</HStack>
					)}

					{article.tags && article.tags.length > 0 && (
						<HStack gap={2} wrap="wrap">
							<Tag size={16} />
							{article.tags.map((tag) => (
								<Link key={tag.id} href={`/tags/${tag.slug}`}>
									<Badge
										colorPalette="gray"
										variant="outline"
										cursor="pointer"
										_hover={{ bg: 'gray.100' }}
										style={{
											borderColor: tag.color,
											color: tag.color,
										}}
									>
										{tag.name}
									</Badge>
								</Link>
							))}
						</HStack>
					)}
				</HStack>

				{/* 文章摘要 */}
				<Blockquote.Root colorPalette="blue" bg="gray.100" pt={4}>
					<Blockquote.Content>
						<Text
							fontSize="lg"
							color={{ base: 'gray.600', _dark: 'gray.400' }}
							lineHeight="1.6"
							mb={6}
						>
							{article.summary}
						</Text>
					</Blockquote.Content>
				</Blockquote.Root>

				{/* 封面图片 */}
				{article.coverImage && (
					<Box mb={8}>
						<Image
							src={article.coverImage}
							alt={article.title}
							w="full"
							h="400px"
							objectFit="cover"
							borderRadius="lg"
						/>
					</Box>
				)}
			</Box>

			{/* 文章内容 */}
			<Box>
				<MarkdownRenderer source={article.content} />
			</Box>
		</VStack>
	)
}
