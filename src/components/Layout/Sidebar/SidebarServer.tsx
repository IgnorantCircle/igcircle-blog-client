import { PublicArticleType, PublicCategoryType, PublicTagType } from '@/types'
import { SidebarContent } from './SidebarContent'

interface SidebarServerProps {
	hotArticles?: PublicArticleType[]
	featuredArticles?: PublicArticleType[]
	categories?: PublicCategoryType[]
	tags?: PublicTagType[]
}

/**
 * 服务端Sidebar组件
 * 直接接收数据，不依赖客户端状态管理
 */
export function SidebarServer({
	hotArticles = [],
	featuredArticles = [],
	categories = [],
	tags = [],
}: SidebarServerProps) {
	return (
		<SidebarContent
			hotArticles={hotArticles}
			featuredArticles={featuredArticles}
			categories={categories}
			tags={tags}
		/>
	)
}
