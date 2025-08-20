import { Box, Heading, Text, Stack, Card, Badge } from '@chakra-ui/react'
import { PublicArticleType } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Eye, Heart, Calendar } from 'lucide-react'

interface ArticleCardServerProps {
	article: PublicArticleType
	showBadge?: boolean
	badgeText?: string
	badgeColor?: string
	showCategory?: boolean
	showTags?: boolean
}

/**
 * 服务端ArticleCard组件
 * 纯展示组件，不包含客户端交互逻辑
 */
export function ArticleCardServer({
	article,
	showBadge = false,
	showCategory = true,
	showTags = true,
}: ArticleCardServerProps) {
	// 标签配置
	const badgeConfig = {
		top: '📌 置顶',
		featured: '⭐ 精选',
	}

	return (
		<Card.Root
			p={5}
			_hover={{
				transform: 'translateY(-2px)',
				shadow: 'lg',
			}}
			transition="all 0.2s"
			cursor="pointer"
			position="relative"
			display="flex"
			h="190px"
			flexDirection="column"
		>
			<Box asChild flex={1}>
				<Link href={`/articles/${article.slug}`}>
					<Stack gap={3} h="full" justify="space-between">
						{/* 标题 - 固定一行 */}
						<Heading
							size="md"
							color={{ base: 'gray.900', _dark: 'white' }}
							_hover={{ color: 'blue.500' }}
							transition="color 0.2s"
							lineHeight="1.3"
							lineClamp={1}
							overflow="hidden"
						>
							{showBadge && article.isFeatured && (
								<Badge colorPalette="yellow" variant="solid" size="sm" mr={2}>
									{badgeConfig.featured}
								</Badge>
							)}
							{showBadge && article.isTop && (
								<Badge colorPalette="red" variant="solid" size="sm" mr={2}>
									{badgeConfig.top}
								</Badge>
							)}
							{article.title}
						</Heading>

						<Text
							color={{ base: 'gray.600', _dark: 'gray.400' }}
							lineHeight="1.5"
							lineClamp={3}
							flexShrink={0}
							h="60px"
							fontSize="sm"
							overflow="hidden"
						>
							{article.summary}
						</Text>

						{/* 分类和标签 - 固定一行 */}
						<Stack
							direction="row"
							gap={2}
							align="center"
							h="24px"
							flexShrink={0}
							justify="space-between"
						>
							{/* 分类 */}
							{showCategory && article.category && (
								<Badge colorPalette="green" variant="subtle" size="sm">
									{article.category.name}
								</Badge>
							)}
							{/* 标签 */}
							{showTags && article?.tags && article.tags.length > 0 && (
								<Stack direction="row" gap={2} align="center" overflow="hidden">
									{article.tags.map((tag) => (
										<Badge
											key={tag.id}
											colorPalette="blue"
											variant="subtle"
											size="sm"
											flexShrink={0}
											maxW="120px"
											overflow="hidden"
											textOverflow="ellipsis"
											whiteSpace="nowrap"
										>
											{tag.name}
										</Badge>
									))}
								</Stack>
							)}
						</Stack>

						{/* 元信息 - 固定一行 */}
						<Stack
							direction="row"
							justify="space-between"
							align="center"
							color={{ base: 'gray.500', _dark: 'gray.400' }}
							fontSize="xs"
							h="20px"
							flexShrink={0}
						>
							<Stack direction="row" gap={3} align="center">
								<Stack direction="row" gap={1} align="center">
									<Calendar size={12} />
									<Text>
										{format(
											new Date(article.publishedAt || article.createdAt),
											'yyyy-MM-dd',
											{
												locale: zhCN,
											},
										)}
									</Text>
								</Stack>
							</Stack>
							<Stack direction="row" gap={3} align="center">
								{article.viewCount !== undefined && (
									<Stack direction="row" gap={1} align="center">
										<Eye size={12} />
										<Text>{article.viewCount}</Text>
									</Stack>
								)}
								{article.likeCount !== undefined && (
									<Stack direction="row" gap={1} align="center">
										<Heart size={12} />
										<Text>{article.likeCount}</Text>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Link>
			</Box>
		</Card.Root>
	)
}
