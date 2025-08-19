import {
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Badge,
	Button,
	Skeleton,
	HStack,
} from '@chakra-ui/react'
import { PublicArticleType, PublicCategoryType, PublicTagType } from '@/types'
import Link from 'next/link'
import { TrendingUp, Award, BarChart3, Info } from 'lucide-react'
import { CompactArticleCardServer } from '@/components/CompactArticleCard'

interface SidebarContentProps {
	hotArticles?: PublicArticleType[]
	featuredArticles?: PublicArticleType[]
	categories?: PublicCategoryType[]
	tags?: PublicTagType[]
	isLoading?: {
		hotArticles?: boolean
		featuredArticles?: boolean
		categories?: boolean
		tags?: boolean
	}
	hasError?: {
		hotArticles?: boolean
		featuredArticles?: boolean
		categories?: boolean
		tags?: boolean
	}
}

/**
 * 共享的Sidebar内容组件
 * 包含所有UI渲染逻辑，不依赖特定的数据获取方式
 */
export function SidebarContent({
	hotArticles = [],
	featuredArticles = [],
	categories = [],
	tags = [],
	isLoading = {},
	hasError = {},
}: SidebarContentProps) {
	return (
		<Stack gap={5}>
			{/* 热门文章趋势 */}
			<Card.Root p={5}>
				<Stack gap={4}>
					<Stack direction="row" align="center" gap={2} justify="space-between">
						<HStack>
							<TrendingUp size={18} color="#ef4444" />
							<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
								热门文章
							</Heading>
						</HStack>
						<Box>
							<Link href="/articles">
								<Button variant="ghost" size="sm" color="blue.700">
									查看全部
								</Button>
							</Link>
						</Box>
					</Stack>
					{isLoading.hotArticles ? (
						<Stack gap={3}>
							{Array.from({ length: 5 }).map((_, i) => (
								<Stack key={i} direction="row" gap={3} align="center">
									<Skeleton width="24px" height="24px" rounded="full" />
									<Stack gap={1} flex={1}>
										<Skeleton height="16px" width="80%" />
										<Skeleton height="12px" width="60%" />
									</Stack>
								</Stack>
							))}
						</Stack>
					) : hasError.hotArticles ? (
						<Text color="red.500" fontSize="sm">
							加载失败
						</Text>
					) : hotArticles && hotArticles.length > 0 ? (
						<Stack gap={1}>
							{hotArticles?.slice(0, 5).map((article, index) => (
								<CompactArticleCardServer
									key={article.id}
									article={article}
									rank={index + 1}
								/>
							))}
						</Stack>
					) : (
						<Text color="gray.500" fontSize="sm">
							暂无热门文章
						</Text>
					)}
				</Stack>
			</Card.Root>

			{/* 精选文章 */}
			<Card.Root p={5}>
				<Stack gap={4}>
					<Stack direction="row" align="center" gap={2} justify="space-between">
						<HStack>
							<Award size={18} color="#f59e0b" />
							<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
								精选文章
							</Heading>
						</HStack>
						<Box>
							<Link href="/articles">
								<Button variant="ghost" size="sm" color="blue.700">
									查看全部
								</Button>
							</Link>
						</Box>
					</Stack>
					{isLoading.featuredArticles ? (
						<Stack gap={3}>
							{Array.from({ length: 4 }).map((_, i) => (
								<Stack key={i} gap={1}>
									<Skeleton height="16px" width="90%" />
									<Skeleton height="12px" width="60%" />
								</Stack>
							))}
						</Stack>
					) : hasError.featuredArticles ? (
						<Text color="red.500" fontSize="sm">
							加载失败
						</Text>
					) : featuredArticles && featuredArticles.length > 0 ? (
						<Stack gap={2}>
							{featuredArticles?.slice(0, 4).map((article) => (
								<CompactArticleCardServer key={article.id} article={article} />
							))}
						</Stack>
					) : (
						<Text color="gray.500" fontSize="sm">
							暂无精选文章
						</Text>
					)}
				</Stack>
			</Card.Root>

			{/* 热门标签 */}
			<Card.Root p={5}>
				<Stack gap={4}>
					<Stack direction="row" align="center" gap={2} justify="space-between">
						<HStack>
							<BarChart3 size={18} color="#3b82f6" />
							<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
								热门标签
							</Heading>
						</HStack>
						<Box>
							<Link href="/tags">
								<Button variant="ghost" size="sm" color="blue.700">
									查看全部
								</Button>
							</Link>
						</Box>
					</Stack>
					{isLoading.tags ? (
						<Stack direction="row" gap={2} flexWrap="wrap">
							{Array.from({ length: 8 }).map((_, i) => (
								<Skeleton key={i} height="20px" width="50px" />
							))}
						</Stack>
					) : hasError.tags ? (
						<Text color="red.500" fontSize="sm">
							加载失败
						</Text>
					) : tags && tags.length > 0 ? (
						<>
							<Stack direction="row" gap={2} flexWrap="wrap">
								{tags?.slice(0, 10).map((tag: PublicTagType) => (
									<Box key={tag.id} asChild>
										<Link href={`/tags/${tag.id}`}>
											<Badge
												colorPalette="blue"
												variant="outline"
												size="sm"
												cursor="pointer"
												_hover={{
													bg: 'blue.50',
													borderColor: 'blue.300',
												}}
												transition="all 0.2s"
											>
												{tag.name}
											</Badge>
										</Link>
									</Box>
								))}
							</Stack>
						</>
					) : (
						<Text color="gray.500" fontSize="sm">
							暂无标签
						</Text>
					)}
				</Stack>
			</Card.Root>

			{/* 热门分类 */}
			<Card.Root p={5}>
				<Stack gap={4}>
					<Stack direction="row" align="center" gap={2} justify="space-between">
						<HStack>
							<BarChart3 size={18} color="#10b981" />
							<Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>
								热门分类
							</Heading>
						</HStack>
						<Box asChild>
							<Link href="/categories">
								<Button variant="ghost" size="sm" color="blue.700">
									查看全部
								</Button>
							</Link>
						</Box>
					</Stack>
					{isLoading.categories ? (
						<Stack gap={2}>
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} height="20px" />
							))}
						</Stack>
					) : hasError.categories ? (
						<Text color="red.500" fontSize="sm">
							加载失败
						</Text>
					) : categories && categories.length > 0 ? (
						<>
							<Stack gap={1}>
								{categories?.slice(0, 6).map((category: PublicCategoryType) => (
									<Box key={category.id} asChild>
										<Link href={`/categories/${category.id}`}>
											<Stack
												direction="row"
												justify="space-between"
												align="center"
												p={1.5}
												rounded="md"
												_hover={{ bg: { base: 'gray.50', _dark: 'gray.700' } }}
												transition="background 0.2s"
											>
												<Text
													color={{ base: 'gray.700', _dark: 'gray.300' }}
													_hover={{ color: 'blue.500' }}
													transition="color 0.2s"
													fontSize="sm"
												>
													{category.name}
												</Text>
												<Badge colorPalette="gray" variant="subtle" size="sm">
													{category.articleCount || 0}
												</Badge>
											</Stack>
										</Link>
									</Box>
								))}
							</Stack>
						</>
					) : (
						<Text color="gray.500" fontSize="sm">
							暂无分类
						</Text>
					)}
				</Stack>
			</Card.Root>

			{/* 网站信息 */}
			<Card.Root p={5}>
				<Stack gap={4}>
					<Stack direction="row" align="center" gap={2}>
						<Info size={18} color="#6b7280" />
						<Heading size="sm" color={{ base: 'gray.900', _dark: 'white' }}>
							关于博客
						</Heading>
					</Stack>
					<Stack gap={3}>
						<Stack gap={2}>
							<Stack direction="row" justify="space-between" align="center">
								<Text
									fontSize="sm"
									color={{ base: 'gray.500', _dark: 'gray.400' }}
								>
									文章总数
								</Text>
								<Badge colorPalette="blue" variant="subtle" size="sm">
									100+
								</Badge>
							</Stack>
							<Stack direction="row" justify="space-between" align="center">
								<Text
									fontSize="sm"
									color={{ base: 'gray.500', _dark: 'gray.400' }}
								>
									分类数量
								</Text>
								<Badge colorPalette="green" variant="subtle" size="sm">
									{categories?.length || 0}
								</Badge>
							</Stack>
							<Stack direction="row" justify="space-between" align="center">
								<Text
									fontSize="sm"
									color={{ base: 'gray.500', _dark: 'gray.400' }}
								>
									标签数量
								</Text>
								<Badge colorPalette="purple" variant="subtle" size="sm">
									{tags?.length || 0}
								</Badge>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Card.Root>
		</Stack>
	)
}
