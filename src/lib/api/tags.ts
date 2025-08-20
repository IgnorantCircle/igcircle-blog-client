import { PublicTagType, TagCloudItemType } from '@/types'
import { BaseApiClient } from './base'

/**
 * 标签相关API
 */
export class TagsApi extends BaseApiClient {
	/**
	 * 获取所有标签
	 * @returns 标签列表
	 */
	async getTags(): Promise<PublicTagType[]> {
		const result = await this.get<PublicTagType[]>('/tags')
		return result || []
	}

	/**
	 * 获取热门标签
	 * @returns 热门标签列表
	 */
	async getPopularTags(): Promise<PublicTagType[]> {
		const result = await this.get<PublicTagType[]>('/tags/popular')
		return result || []
	}

	/**
	 * 获取标签云
	 * @returns 标签云数据
	 */
	async getTagCloud(): Promise<TagCloudItemType[]> {
		const result = await this.get<TagCloudItemType[]>('/tags/cloud')
		return result || []
	}

	/**
	 * 根据ID获取标签详情
	 * @param id 标签ID
	 * @returns 标签详情
	 */
	async getTagById(id: string): Promise<PublicTagType> {
		const result = await this.get<PublicTagType>(`/tags/${id}`)
		if (!result) {
			throw new Error(`Tag with id ${id} not found`)
		}
		return result
	}
}

// 导出单例实例
export const tagsApi = new TagsApi()
