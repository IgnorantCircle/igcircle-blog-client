import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types';
import { ErrorHandler } from '@/lib/error-handler';
import { BaseApiClient } from './base';

/**
 * 认证相关API
 */
export class AuthApi extends BaseApiClient {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录响应
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      return await this.post<LoginResponse>('/auth/login', credentials);
    } catch (error) {
      ErrorHandler.logError(error, 'login');
      throw error;
    }
  }

  /**
   * 用户注册
   * @param userData 注册数据
   * @returns 注册响应
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      return await this.post<RegisterResponse>('/auth/register', userData);
    } catch (error) {
      ErrorHandler.logError(error, 'register');
      throw error;
    }
  }

  /**
   * 发送验证码
   * @param email 邮箱地址
   * @returns Promise<void>
   */
  async sendVerificationCode(email: string): Promise<void> {
    try {
      await this.post<void>('/auth/send-verification-code', { email });
    } catch (error) {
      ErrorHandler.logError(error, 'sendVerificationCode');
      throw error;
    }
  }

  /**
   * 重置密码
   * @param token 重置令牌
   * @param newPassword 新密码
   * @returns Promise<void>
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.post<void>('/auth/reset-password', { token, newPassword });
    } catch (error) {
      ErrorHandler.logError(error, 'resetPassword');
      throw error;
    }
  }

  /**
   * 用户退出登录
   * @returns Promise<{ message: string }>
   */
  async logout(): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>('/auth/logout');
    } catch (error) {
      ErrorHandler.logError(error, 'logout');
      throw error;
    }
  }

  /**
   * 退出所有设备登录
   * @returns Promise<{ message: string }>
   */
  async logoutAll(): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>('/auth/logout-all');
    } catch (error) {
      ErrorHandler.logError(error, 'logoutAll');
      throw error;
    }
  }

  /**
   * 获取RSA公钥
   * @returns Promise<{ message: string }>
   */
  async getRsaPublicKey(): Promise<{ message: string }> {
    try {
      return await this.get<{ message: string }>('/auth/rsa/public-key');
    } catch (error) {
      ErrorHandler.logError(error, 'getRsaPublicKey');
      throw error;
    }
  }

  
}



// 导出单例实例
export const authApi = new AuthApi();