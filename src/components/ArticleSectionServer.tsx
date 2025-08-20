import { Box, Heading, Grid } from '@chakra-ui/react'
import { ArticleCardServer } from './ArticleCard/ArticleCardServer'
import { PublicArticleType } from '@/types/articles'
import { Star, TrendingUp, Clock } from 'lucide-react'

interface ArticleSectionServerProps {
	title: string
	iconType: 'star' | 'trending' | 'clock'
	iconColor: string
	showBadge?: boolean
	articles: PublicArticleType[]
	renderNum?: number
	gridColumns?: {
		base: string
		md: string
	}
}

/**
 * 服务端文章区块组件
 * 直接接收文章数据，不依赖客户端状态
 */
export function ArticleSectionServer({
	title,
	iconType,
	iconColor,
	articles,
	renderNum,
	gridColumns = { base: '1fr', md: 'repeat(3, 1fr)' },
}: ArticleSectionServerProps) {
	// 根据 iconType 选择对应的图标组件
	const getIcon = () => {
		switch (iconType) {
			case 'star':
				return <Star size={20} style={{ color: iconColor }} />
			case 'trending':
				return <TrendingUp size={20} style={{ color: iconColor }} />
			case 'clock':
				return <Clock size={20} style={{ color: iconColor }} />
			default:
				return <Star size={20} style={{ color: iconColor }} />
		}
	}

	const displayArticles = renderNum ? articles.slice(0, renderNum) : articles

	return (
		<Box>
			<Heading
				size="lg"
				mb={6}
				display="flex"
				alignItems="center"
				gap={2}
				color="gray.800"
				_dark={{ color: 'gray.100' }}
			>
				{getIcon()}
				{title}
			</Heading>

			<Grid templateColumns={gridColumns} gap={4}>
				{displayArticles.map((article) => (
					<ArticleCardServer key={article.id} article={article} />
				))}
			</Grid>
		</Box>
	)
}
