'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse, User } from '@/types'

// 认证状态接口
interface AuthState {
	user: User | null
	access_token: string | null
	isAuthenticated: boolean
	login: (response: LoginResponse) => void
	logout: () => void
	updateUser: (user: Partial<User>) => void
}

// 全局设置状态接口
interface SettingsState {
	theme: 'light' | 'dark' | 'system'
	language: 'zh' | 'en'
	fontSize: 'small' | 'medium' | 'large'
	setTheme: (theme: 'light' | 'dark' | 'system') => void
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
			login: (response: LoginResponse) => {
				const { user, access_token } = response
				set({
					user,
					access_token,
					isAuthenticated: true,
				})
				// 设置axios默认header
				if (typeof window !== 'undefined') {
					localStorage.setItem('access_token', access_token)
				}
			},
			logout: async () => {
				try {
					// 调用API退出登录
					const { auth } = await import('@/lib/api')
					await auth.logout()
				} catch (error) {
					// 即使API调用失败，也要清除本地状态
					console.error('Logout API failed:', error)
				} finally {
					// 清除本地状态
					set({
						user: null,
						access_token: null,
						isAuthenticated: false,
					})
					// 清除token
					if (typeof window !== 'undefined') {
						localStorage.removeItem('access_token')
					}
				}
			},
			updateUser: (userData: Partial<User>) => {
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
			partialize: (state) => ({
				user: state.user,
				token: state.access_token,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
)

// 创建设置状态store
export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			theme: 'system',
			language: 'zh',
			fontSize: 'medium',
			setTheme: (theme) => set({ theme }),
			setLanguage: (language) => set({ language }),
			setFontSize: (fontSize) => set({ fontSize }),
		}),
		{
			name: 'settings-storage',
		}
	)
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
	return localStorage.getItem('access_token')
}

// 检查是否已认证的工具函数
export const isAuthenticated = (): boolean => {
	const token = getAuthToken()
	return !!token
}

// 获取当前用户的工具函数
export const getCurrentUser = (): User | null => {
	return useAuthStore.getState().user
}
