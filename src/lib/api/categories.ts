import { PublicCategoryType } from '@/types'
import { BaseApiClient } from './base'

/**
 * 分类相关API
 */
export class CategoriesApi extends BaseApiClient {
	/**
	 * 获取所有分类
	 * @returns 分类列表
	 */
	async getCategories(): Promise<PublicCategoryType[]> {
		const result = await this.get<PublicCategoryType[]>('/categories')
		return result || []
	}

	/**
	 * 根据ID获取分类详情
	 * @param id 分类ID
	 * @returns 分类详情
	 */
	async getCategoryById(id: string): Promise<PublicCategoryType> {
		const result = await this.get<PublicCategoryType>(`/categories/${id}`)
		if (!result) {
			throw new Error(`Category with id ${id} not found`)
		}
		return result
	}

	/**
	 * 获取分类树形结构
	 * @returns 分类树形结构
	 */
	async getCategoryTree(): Promise<PublicCategoryType[]> {
		const result = await this.get<PublicCategoryType[]>('/categories/tree')
		return result || []
	}
}

// 导出单例实例
export const categoriesApi = new CategoriesApi()
