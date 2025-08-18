// 标签相关类型定义

/**
 * 公开标签信息
 */
export interface PublicTagType {
	id: string
	name: string
	slug: string
	color: string
	articleCount: number
}

/**
 * 标签云项目
 */
export interface TagCloudItemType {
	id: string
	name: string
	slug: string
	color: string
	count: number
	weight: number
}
