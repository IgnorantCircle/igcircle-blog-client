'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponseType, UserType } from '@/types'
import { handleGlobalError } from '@/lib/error-handler'

// 认证状态接口
interface AuthState {
	user: UserType | null
	access_token: string | null
	isAuthenticated: boolean
	rememberMe: boolean
	login: (response: LoginResponseType, rememberMe?: boolean) => void
	logout: () => void
	updateUser: (user: Partial<UserType>) => void
}

// 全局设置状态接口
interface SettingsState {
	theme: 'light' | 'dark'
	language: 'zh' | 'en'
	fontSize: 'small' | 'medium' | 'large'
	setTheme: (theme: 'light' | 'dark') => void
	setLanguage: (language: 'zh' | 'en') => void
	setFontSize: (fontSize: 'small' | 'medium' | 'large') => void
}

// 全局UI状态接口
interface UIState {
	sidebarOpen: boolean
	searchOpen: boolean
	loading: boolean
	setSidebarOpen: (open: boolean) => void
	setSearchOpen: (open: boolean) => void
	setLoading: (loading: boolean) => void
}

// 创建认证状态store
export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			access_token: null,
			isAuthenticated: false,
			rememberMe: false,
			login: (response: LoginResponseType, rememberMe: boolean = false) => {
				const { user, access_token } = response
				set({
					user,
					access_token,
					isAuthenticated: true,
					rememberMe,
				})
				// 设置localStorage中的token
				if (typeof window !== 'undefined') {
					if (rememberMe) {
						// 记住登录：使用localStorage，持久保存
						localStorage.setItem('access_token', access_token)
						localStorage.setItem('remember_me', 'true')
					} else {
						// 不记住登录：使用sessionStorage，关闭浏览器后清除
						sessionStorage.setItem('access_token', access_token)
						localStorage.removeItem('access_token')
						localStorage.removeItem('remember_me')
					}
				}
			},
			logout: async () => {
				try {
					// 调用API退出登录
					const { authApi } = await import('@/lib/api')
					await authApi.logout()
				} catch (error) {
					handleGlobalError(error, 'logout')
				}

				// 清除本地状态（无论API调用是否成功）
				set({
					user: null,
					access_token: null,
					isAuthenticated: false,
					rememberMe: false,
				})
				// 清除所有存储的token和记住登录状态
				if (typeof window !== 'undefined') {
					localStorage.removeItem('access_token')
					localStorage.removeItem('remember_me')
					sessionStorage.removeItem('access_token')
				}
			},
			updateUser: (userData: Partial<UserType>) => {
				const currentUser = get().user
				if (currentUser) {
					set({
						user: { ...currentUser, ...userData },
					})
				}
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => {
				// 只有在记住登录时才持久化完整状态
				if (state.rememberMe) {
					return {
						user: state.user,
						access_token: state.access_token,
						isAuthenticated: state.isAuthenticated,
						rememberMe: state.rememberMe,
					}
				}
				// 不记住登录时，不持久化敏感信息
				return {
					user: null,
					access_token: null,
					isAuthenticated: false,
					rememberMe: false,
				}
			},
		},
	),
)

// 创建设置状态store
export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			theme:
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light',
			language: 'zh',
			fontSize: 'medium',
			setTheme: (theme) => set({ theme }),
			setLanguage: (language) => set({ language }),
			setFontSize: (fontSize) => set({ fontSize }),
		}),
		{
			name: 'settings-storage',
		},
	),
)

// 创建UI状态store
export const useUIStore = create<UIState>()((set) => ({
	sidebarOpen: false,
	searchOpen: false,
	loading: false,
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
	setSearchOpen: (open) => set({ searchOpen: open }),
	setLoading: (loading) => set({ loading }),
}))

// 获取token的工具函数
export const getAuthToken = (): string | null => {
	if (typeof window === 'undefined') return null
	// 优先从localStorage获取（记住登录的情况）
	const localToken = localStorage.getItem('access_token')
	if (localToken) return localToken
	// 如果localStorage没有，从sessionStorage获取（不记住登录的情况）
	return sessionStorage.getItem('access_token')
}

// 检查是否已认证的工具函数
export const isAuthenticated = (): boolean => {
	const token = getAuthToken()
	return !!token
}

// 获取当前用户的工具函数
export const getCurrentUser = (): UserType | null => {
	return useAuthStore.getState().user
}

// 初始化认证状态的工具函数
export const initializeAuthState = () => {
	if (typeof window === 'undefined') return

	// 检查是否有记住登录的标记
	const rememberMe = localStorage.getItem('remember_me') === 'true'
	const token = getAuthToken()

	// 如果没有记住登录但localStorage中有token，清除它
	if (!rememberMe && localStorage.getItem('access_token')) {
		localStorage.removeItem('access_token')
	}

	// 如果有token但store中没有认证状态，可能需要重新验证token有效性
	if (token && !useAuthStore.getState().isAuthenticated) {
		// 这里可以添加token验证逻辑
		console.log('Found existing token, may need to validate')
	}
}
