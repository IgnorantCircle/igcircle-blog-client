import {
	LoginRequestType,
	LoginResponseType,
	RegisterRequestType,
	RegisterResponseType,
} from '@/types'
import { BaseApiClient } from './base'

/**
 * 认证相关API
 */
export class AuthApi extends BaseApiClient {
	/**
	 * 用户登录
	 * @param credentials 登录凭据
	 * @returns 登录响应
	 */
	async login(credentials: LoginRequestType): Promise<LoginResponseType> {
		const result = await this.post<LoginResponseType>(
			'/auth/login',
			credentials,
		)
		if (!result) {
			throw new Error('登录请求失败')
		}
		return result
	}

	/**
	 * 用户注册
	 * @param userData 注册数据
	 * @returns 注册响应
	 */
	async register(userData: RegisterRequestType): Promise<RegisterResponseType> {
		const result = await this.post<RegisterResponseType>(
			'/auth/register',
			userData,
		)
		if (!result) {
			throw new Error('注册请求失败')
		}
		return result
	}

	/**
	 * 发送验证码
	 * @param email 邮箱地址
	 * @returns Promise<void>
	 */
	async sendVerificationCode(email: string): Promise<void> {
		const result = await this.post<void>('/auth/send-verification-code', {
			email,
		})
		if (!result) {
			throw new Error('发送验证码请求失败')
		}
	}

	/**
	 * 忘记密码
	 * @param email 邮箱地址
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	async forgotPassword(
		email: string,
	): Promise<{ success: boolean; message: string }> {
		const result = await this.post<{ success: boolean; message: string }>(
			'/auth/forgot-password',
			{ email },
		)
		if (!result) {
			throw new Error('忘记密码请求失败')
		}
		return result
	}

	/**
	 * 重置密码
	 * @param token 重置令牌
	 * @param newPassword 新密码
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	async resetPassword(
		token: string,
		newPassword: string,
	): Promise<{ success: boolean; message: string }> {
		const result = await this.post<{ success: boolean; message: string }>(
			'/auth/reset-password',
			{ token, newPassword },
		)
		if (!result) {
			throw new Error('重置密码请求失败')
		}
		return result
	}

	/**
	 * 用户退出登录
	 * @returns Promise<{ message: string }>
	 */
	async logout(): Promise<{ message: string }> {
		const result = await this.post<{ message: string }>('/auth/logout')
		if (!result) {
			throw new Error('登出请求失败')
		}
		return result
	}

	/**
	 * 退出所有设备登录
	 * @returns Promise<{ message: string }>
	 */
	async logoutAll(): Promise<{ message: string }> {
		const result = await this.post<{ message: string }>('/auth/logout-all')
		if (!result) {
			throw new Error('登出所有设备请求失败')
		}
		return result
	}

	/**
	 * 获取RSA公钥
	 * @returns Promise<{ publicKey: string }>
	 */
	async getRsaPublicKey(): Promise<{ publicKey: string }> {
		const result = await this.get<{ publicKey: string }>('/rsa/public-key')
		if (!result) {
			throw new Error('获取RSA公钥失败')
		}
		return result
	}

	/**
	 * 修改密码（用户设置中使用）
	 * @param currentPassword 当前密码（已加密）
	 * @param newPassword 新密码（已加密）
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<{ success: boolean; message: string }> {
		const result = await this.post<{ success: boolean; message: string }>(
			'/auth/change-password',
			{ currentPassword, newPassword },
		)
		if (!result) {
			throw new Error('修改密码请求失败')
		}
		return result
	}
}

// 导出单例实例
export const authApi = new AuthApi()
