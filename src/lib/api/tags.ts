import { PublicTag, TagCloudItem } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';
import { BaseApiClient } from './base';

/**
 * 标签相关API
 */
export class TagsApi extends BaseApiClient {
  /**
   * 获取所有标签
   * @returns 标签列表
   */
  async getTags(): Promise<PublicTag[]> {
    try {
      return await this.get<PublicTag[]>('/tags');
    } catch (error) {
      ErrorHandler.logError(error, 'getTags');
      throw error;
    }
  }

  /**
   * 获取热门标签
   * @returns 热门标签列表
   */
  async getPopularTags(): Promise<PublicTag[]> {
    try {
      return await this.get<PublicTag[]>('/tags/popular');
    } catch (error) {
      ErrorHandler.logError(error, 'getPopularTags');
      throw error;
    }
  }

  /**
   * 获取标签云
   * @returns 标签云数据
   */
  async getTagCloud(): Promise<TagCloudItem[]> {
    try {
      return await this.get<TagCloudItem[]>('/tags/cloud');
    } catch (error) {
      ErrorHandler.logError(error, 'getTagCloud');
      throw error;
    }
  }

  /**
   * 根据ID获取标签详情
   * @param id 标签ID
   * @returns 标签详情
   */
  async getTagById(id: string): Promise<PublicTag> {
    try {
      return await this.get<PublicTag>(`/tags/${id}`);
    } catch (error) {
      ErrorHandler.logError(error, 'getTagById');
      throw error;
    }
  }
}

// 导出单例实例
export const tagsApi = new TagsApi();