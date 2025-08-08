import { PublicCategory } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';
import { BaseApiClient } from './base';

/**
 * 分类相关API
 */
export class CategoriesApi extends BaseApiClient {
  /**
   * 获取所有分类
   * @returns 分类列表
   */
  async getCategories(): Promise<PublicCategory[]> {
    try {
      return await this.get<PublicCategory[]>('/categories');
    } catch (error) {
      ErrorHandler.logError(error, 'getCategories');
      throw error;
    }
  }

  /**
   * 根据ID获取分类详情
   * @param id 分类ID
   * @returns 分类详情
   */
  async getCategoryById(id: string): Promise<PublicCategory> {
    try {
      return await this.get<PublicCategory>(`/categories/${id}`);
    } catch (error) {
      ErrorHandler.logError(error, 'getCategoryById');
      throw error;
    }
  }

  /**
   * 获取分类树形结构
   * @returns 分类树形结构
   */
  async getCategoryTree(): Promise<PublicCategory[]> {
    try {
      return await this.get<PublicCategory[]>('/categories/tree');
    } catch (error) {
      ErrorHandler.logError(error, 'getCategoryTree');
      throw error;
    }
  }
}

// 导出单例实例
export const categoriesApi = new CategoriesApi();