
/**
 * 公开用户信息
 */
export interface PublicUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  bio?: string;
}

/**
 * 完整用户信息
 */
export interface User extends PublicUser {
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

/**
 * 用户资料数据
 */
export interface UserProfileData {
  username?: string;
  nickname?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  articlesCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
}

/**
 * 密码更新数据
 */
export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

/**
 * 通知设置
 */
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  followNotifications: boolean;
}

/**
 * 隐私设置
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  showStats: boolean;
}

/**
 * 更新资料数据
 */
export interface UpdateProfileData {
  nickname?: string;
  bio?: string;
  avatar?: string;
}

/**
 * 更新密码数据
 */
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}