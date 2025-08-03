import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { PublicArticle } from '@/types'
interface ArticleCardProps {
	article: PublicArticle
	variant?: 'default' | 'featured' | 'compact'
	searchQuery?: string
}

const ArticleCard: React.FC<ArticleCardProps> = () => {
	return (
		<Card className='hover:shadow-md transition-shadow duration-200'>
			<CardContent className='p-4'>文章内容 \</CardContent>
		</Card>
	)
}

export default ArticleCard
