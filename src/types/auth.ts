// 认证相关类型定义

import { User } from "./users";

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  message: string;
  user:User;
  access_token: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  verificationCode?: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  message: string;
  user:User;
  token: string;
}

/**
 * 登录凭据
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 注册数据
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  verificationCode?: string;
}