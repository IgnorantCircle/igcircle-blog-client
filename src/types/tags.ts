// 标签相关类型定义

/**
 * 公开标签信息
 */
export interface PublicTag {
  id: string;
  name: string;
  color: string;
  articleCount: number;
}

/**
 * 标签云项目
 */
export interface TagCloudItem {
  id: string;
  name: string;
  color: string;
  count: number;
  weight: number;
}