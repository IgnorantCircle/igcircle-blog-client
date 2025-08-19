import { Container, Grid, GridItem, Box, Stack, Button } from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { SidebarServer } from '@/components/Layout/Sidebar/SidebarServer'
import Link from 'next/link'
import { ArticleSectionServer } from '@/components/ArticleSectionServer'
import { PublicArticleType, PublicCategoryType, PublicTagType } from '@/types'

interface HomePageServerProps {
	popularArticles: PublicArticleType[]
	featuredArticles: PublicArticleType[]
	recentArticles: PublicArticleType[]
	categories: PublicCategoryType[]
	tags: PublicTagType[]
}

/**
 * 服务端主页组件
 * 直接接收服务端预取的数据，实现真正的服务端渲染
 */
export function HomePageServer({
	popularArticles,
	featuredArticles,
	recentArticles,
	categories,
	tags,
}: HomePageServerProps) {
	return (
		<MainLayout>
			<Container maxW="15xl" py={8}>
				{/* 主要内容区域 */}
				<Grid templateColumns={{ base: '1fr', lg: '2fr 300px' }} gap={8}>
					{/* 主内容区 */}
					<GridItem>
						<Stack gap={8}>
							{/* 精选文章 */}
							<ArticleSectionServer
								title="精选文章"
								iconType="star"
								renderNum={3}
								iconColor="#f59e0b"
								articles={featuredArticles}
							/>

							{/* 热门文章 */}
							<ArticleSectionServer
								title="热门文章"
								iconType="trending"
								renderNum={3}
								iconColor="#ef4444"
								articles={popularArticles}
							/>

							{/* 最新文章 */}
							<ArticleSectionServer
								title="最新文章"
								iconType="clock"
								iconColor="#10b981"
								showBadge
								articles={recentArticles}
							/>

							{/* 查看更多按钮 */}
							<Box textAlign="center">
								<Box asChild>
									<Link href="/articles">
										<Button colorPalette="blue" size="lg">
											查看更多文章
										</Button>
									</Link>
								</Box>
							</Box>
						</Stack>
					</GridItem>

					{/* 侧边栏 */}
					<GridItem>
						<SidebarServer
							hotArticles={popularArticles}
							featuredArticles={featuredArticles}
							categories={categories}
							tags={tags}
						/>
					</GridItem>
				</Grid>
			</Container>
		</MainLayout>
	)
}
