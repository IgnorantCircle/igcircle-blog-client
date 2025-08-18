/**
 * 公开用户信息
 */
export interface PublicUserType {
	id: string
	username: string
	nickname: string
	avatar?: string
	bio?: string
}

/**
 * 完整用户信息
 */
export interface UserType extends PublicUserType {
	email: string
	role: 'user' | 'admin'
	avatar?: string
}

/**
 * 用户资料数据
 */
export interface UserProfileDataType {
	username?: string
	nickname?: string
	email?: string
	bio?: string
	avatar?: string
}

/**
 * 用户统计信息
 */
export interface UserStatsType {
	articlesCount: number
	followersCount: number
	followingCount: number
	likesCount: number
}

/**
 * 密码更新数据
 */
export interface PasswordUpdateDataType {
	currentPassword: string
	newPassword: string
}

/**
 * 通知设置
 */
export interface NotificationSettingsType {
	emailNotifications: boolean
	pushNotifications: boolean
	commentNotifications: boolean
	likeNotifications: boolean
	followNotifications: boolean
}

/**
 * 隐私设置
 */
export interface PrivacySettingsType {
	profileVisibility: 'public' | 'private'
	showEmail: boolean
	allowMessages: boolean
	showOnlineStatus: boolean
	showStats: boolean
}

/**
 * 更新资料数据
 */
export interface UpdateProfileDataType {
	nickname?: string
	bio?: string
	avatar?: string
}

/**
 * 更新密码数据
 */
export interface UpdatePasswordDataType {
	currentPassword: string
	newPassword: string
}
