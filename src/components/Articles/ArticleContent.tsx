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
		<VStack align="stretch" gap={{ base: 6, md: 8 }}>
			{/* 文章头部 */}
			<Box>
				{/* 特色和置顶标识 */}
				{(article.isFeatured || article.isTop) && (
					<HStack gap={2} mb={{ base: 3, md: 4 }} wrap="wrap">
						{article.isTop && (
							<Badge
								colorPalette="red"
								variant="solid"
								size={{ base: 'sm', md: 'md' }}
							>
								置顶
							</Badge>
						)}
						{article.isFeatured && (
							<Badge
								colorPalette="yellow"
								variant="solid"
								size={{ base: 'sm', md: 'md' }}
							>
								精选
							</Badge>
						)}
					</HStack>
				)}

				{/* 文章标题 */}
				<Heading
					size={{ base: 'xl', md: '2xl' }}
					mb={{ base: 3, md: 4 }}
					lineHeight={{ base: '1.3', md: '1.2' }}
					color={{ base: 'gray.900', _dark: 'white' }}
					wordBreak="break-word"
					hyphens="auto"
				>
					{article.title}
				</Heading>

				{/* 文章元信息 */}
				<VStack
					align="start"
					gap={{ base: 2, md: 3 }}
					fontSize={{ base: 'xs', md: 'sm' }}
					color="gray.600"
					_dark={{ color: 'gray.400' }}
					mb={{ base: 3, md: 4 }}
				>
					{/* 第一行：日期和阅读时间 */}
					<HStack gap={{ base: 4, md: 6 }} wrap="wrap">
						<HStack gap={2} minW={0}>
							<Calendar size={16} />
							<Text truncate>{formatDate(article.publishedAt)}</Text>
						</HStack>
						<HStack gap={2} minW={0}>
							<Clock size={16} />
							<Text truncate>{formatReadingTime(article.readingTime)}</Text>
						</HStack>
					</HStack>
					{/* 第二行：浏览量和评论数 */}
					<HStack gap={{ base: 4, md: 6 }} wrap="wrap">
						<HStack gap={2} minW={0}>
							<Eye size={16} />
							<Text truncate>{formatNumber(article.viewCount)} 次浏览</Text>
						</HStack>
						{article.commentCount !== undefined && (
							<HStack gap={2} minW={0}>
								<MessageCircle size={16} />
								<Text truncate>
									{formatNumber(article.commentCount)} 条评论
								</Text>
							</HStack>
						)}
					</HStack>
				</VStack>

				{/* 分类和标签 */}
				<VStack align="start" gap={{ base: 3, md: 4 }} mb={{ base: 4, md: 6 }}>
					{/* 分类 */}
					{article.category && (
						<HStack gap={2} wrap="wrap">
							<Folder size={16} />
							<Link href={`/categories/${article.category.slug}`}>
								<Badge
									colorPalette="blue"
									variant="subtle"
									cursor="pointer"
									_hover={{ bg: 'blue.100' }}
									size={{ base: 'sm', md: 'md' }}
								>
									{article.category.name}
								</Badge>
							</Link>
						</HStack>
					)}

					{/* 标签 */}
					{article.tags && article.tags.length > 0 && (
						<VStack align="start" gap={2} w="full">
							<HStack gap={2}>
								<Tag size={16} />
								<Text
									fontSize={{ base: 'xs', md: 'sm' }}
									color="gray.600"
									_dark={{ color: 'gray.400' }}
								>
									标签
								</Text>
							</HStack>
							<HStack gap={2} wrap="wrap" w="full">
								{article.tags.map((tag) => (
									<Link key={tag.id} href={`/tags/${tag.slug}`}>
										<Badge
											colorPalette="gray"
											variant="outline"
											cursor="pointer"
											_hover={{ bg: 'gray.100' }}
											size={{ base: 'sm', md: 'md' }}
											style={{
												borderColor: tag.color,
												color: tag.color,
											}}
											maxW={{ base: '120px', md: 'none' }}
										>
											{tag.name}
										</Badge>
									</Link>
								))}
							</HStack>
						</VStack>
					)}
				</VStack>

				{/* 文章摘要 */}
				<Blockquote.Root
					colorPalette="blue"
					bg={{ base: 'gray.50', _dark: 'gray.800' }}
					p={{ base: 3, md: 4 }}
					borderRadius="md"
				>
					<Blockquote.Content>
						<Text
							fontSize={{ base: 'md', md: 'lg' }}
							color={{ base: 'gray.600', _dark: 'gray.400' }}
							lineHeight={{ base: '1.5', md: '1.6' }}
							wordBreak="break-word"
							hyphens="auto"
						>
							{article.summary}
						</Text>
					</Blockquote.Content>
				</Blockquote.Root>

				{/* 封面图片 */}
				{article.coverImage && (
					<Box
						mb={{ base: 6, md: 8 }}
						position="relative"
						overflow="hidden"
						borderRadius={{ base: 'md', md: 'lg' }}
						boxShadow={{ base: 'md', md: 'lg' }}
						transition="all 0.3s ease"
						_hover={{
							boxShadow: { base: 'lg', md: 'xl' },
							transform: { base: 'none', md: 'scale(1.02)' },
						}}
					>
						<Image
							src={article.coverImage}
							alt={article.title}
							w="full"
							h={{
								base: '200px',
								sm: '250px',
								md: '350px',
								lg: '400px',
							}}
							maxH={{ base: '60vh', md: '70vh' }}
							objectFit="cover"
							maxW="100%"
							loading="lazy"
							transition="transform 0.3s ease"
						/>
					</Box>
				)}
			</Box>

			{/* 文章内容 */}
			<Box
				minW={0}
				w="full"
				overflowWrap="break-word"
				wordBreak="break-word"
				hyphens="auto"
			>
				<MarkdownRenderer source={article.content} />
			</Box>
		</VStack>
	)
}
