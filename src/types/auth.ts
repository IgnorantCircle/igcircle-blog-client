// 认证相关类型定义

import { UserType } from './users'

/**
 * 登录请求
 */
export interface LoginRequestType {
	username: string
	password: string
}

/**
 * 登录响应
 */
export interface LoginResponseType {
	message: string
	user: UserType
	accessToken: string
}

/**
 * 注册请求
 */
export interface RegisterRequestType {
	username: string
	email: string
	password: string
	nickname?: string
	verificationCode?: string
}

/**
 * 注册响应
 */
export interface RegisterResponseType {
	message: string
	user: UserType
	token: string
}

/**
 * 登录凭据
 */
export interface LoginCredentialsType {
	email: string
	password: string
}

/**
 * 注册数据
 */
export interface RegisterDataType {
	username: string
	email: string
	password: string
	nickname?: string
	verificationCode?: string
}

/**
 * 忘记密码请求
 */
export interface ForgotPasswordRequestType {
	email: string
}

/**
 * 忘记密码响应
 */
export interface ForgotPasswordResponseType {
	success: boolean
	message: string
}

/**
 * 重置密码请求
 */
export interface ResetPasswordRequestType {
	token: string
	newPassword: string
}

/**
 * 重置密码响应
 */
export interface ResetPasswordResponseType {
	success: boolean
	message: string
}
