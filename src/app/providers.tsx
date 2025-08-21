'use client'

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { useSettingsStore, initializeAuthState } from '@/lib/store'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useToast } from '@/hooks/useToast'
import {
	setGlobalToast,
	showError,
	initGlobalErrorHandlers,
} from '@/lib/error-handler'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

// 自定义颜色主题配置
const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			colors: {
				blue: {
					50: { value: '#e6f4ff' },
					100: { value: '#bae0ff' },
					200: { value: '#91caff' },
					300: { value: '#69b1ff' },
					400: { value: '#4096ff' },
					500: { value: '#1677ff' }, // 主色
					600: { value: '#0958d9' },
					700: { value: '#003eb3' },
					800: { value: '#002c8c' },
					900: { value: '#001d66' },
				},
				gray: {
					50: { value: '#fafafa' },
					100: { value: '#f5f5f5' },
					200: { value: '#e8e8e8' },
					300: { value: '#d9d9d9' },
					400: { value: '#bfbfbf' },
					500: { value: '#8c8c8c' },
					600: { value: '#595959' },
					700: { value: '#434343' },
					800: { value: '#262626' },
					900: { value: '#1f1f1f' },
				},
				red: {
					50: { value: '#fff2f0' },
					100: { value: '#ffccc7' },
					200: { value: '#ffa39e' },
					300: { value: '#ff7875' },
					400: { value: '#ff4d4f' },
					500: { value: '#f5222d' },
					600: { value: '#cf1322' },
					700: { value: '#a8071a' },
					800: { value: '#820014' },
					900: { value: '#5c0011' },
				},
				green: {
					50: { value: '#f6ffed' },
					100: { value: '#d9f7be' },
					200: { value: '#b7eb8f' },
					300: { value: '#95de64' },
					400: { value: '#73d13d' },
					500: { value: '#52c41a' },
					600: { value: '#389e0d' },
					700: { value: '#237804' },
					800: { value: '#135200' },
					900: { value: '#092b00' },
				},
				yellow: {
					50: { value: '#feffe6' },
					100: { value: '#ffffb8' },
					200: { value: '#fffb8f' },
					300: { value: '#fff566' },
					400: { value: '#ffec3d' },
					500: { value: '#fadb14' },
					600: { value: '#d4b106' },
					700: { value: '#ad8b00' },
					800: { value: '#876800' },
					900: { value: '#614700' },
				},
				orange: {
					50: { value: '#fff7e6' },
					100: { value: '#ffe7ba' },
					200: { value: '#ffd591' },
					300: { value: '#ffc069' },
					400: { value: '#ffa940' },
					500: { value: '#fa8c16' },
					600: { value: '#d46b08' },
					700: { value: '#ad4e00' },
					800: { value: '#873800' },
					900: { value: '#612500' },
				},
				purple: {
					50: { value: '#f9f0ff' },
					100: { value: '#efdbff' },
					200: { value: '#d3adf7' },
					300: { value: '#b37feb' },
					400: { value: '#9254de' },
					500: { value: '#722ed1' },
					600: { value: '#531dab' },
					700: { value: '#391085' },
					800: { value: '#22075e' },
					900: { value: '#120338' },
				},
			},
		},
		semanticTokens: {
			colors: {
				'chakra-body-bg': {
					value: { _light: '#ffffff', _dark: '#141414' },
				},
				'chakra-body-text': {
					value: { _light: '#1f1f1f', _dark: '#ffffff' },
				},
				// 主要交互色
				primary: {
					value: { _light: '{colors.blue.500}', _dark: '{colors.blue.400}' },
				},
				'primary-hover': {
					value: { _light: '{colors.blue.600}', _dark: '{colors.blue.300}' },
				},
				// 成功色
				success: {
					value: { _light: '{colors.green.500}', _dark: '{colors.green.400}' },
				},
				// 警告色
				warning: {
					value: {
						_light: '{colors.yellow.500}',
						_dark: '{colors.yellow.400}',
					},
				},
				// 错误色
				error: {
					value: { _light: '{colors.red.500}', _dark: '{colors.red.400}' },
				},
				// 边框色
				border: {
					value: { _light: '{colors.gray.200}', _dark: '{colors.gray.700}' },
				},
				'border-hover': {
					value: { _light: '{colors.gray.300}', _dark: '{colors.gray.600}' },
				},
				// 背景色
				'bg-subtle': {
					value: { _light: '{colors.gray.50}', _dark: '{colors.gray.800}' },
				},
				'bg-muted': {
					value: { _light: '{colors.gray.100}', _dark: '{colors.gray.700}' },
				},
				// 文字色
				'text-secondary': {
					value: { _light: '{colors.gray.600}', _dark: '{colors.gray.400}' },
				},
				'text-tertiary': {
					value: { _light: '{colors.gray.500}', _dark: '{colors.gray.500}' },
				},
				'text-disabled': {
					value: { _light: '{colors.gray.400}', _dark: '{colors.gray.600}' },
				},
			},
		},
	},
})

export function Providers({ children }: { children: React.ReactNode }) {
	const { theme } = useSettingsStore()
	const [mounted, setMounted] = useState(false)
	const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
	const toast = useToast()

	// 初始化全局错误处理器和认证状态
	useEffect(() => {
		setGlobalToast(toast)
		initGlobalErrorHandlers()
		// 初始化认证状态
		initializeAuthState().catch(console.error)
	}, [toast])

	// 处理主题切换逻辑
	useEffect(() => {
		setMounted(true)
		setCurrentTheme(theme as 'light' | 'dark')
	}, [theme])

	// 应用主题到 document - 使用 requestAnimationFrame 确保平滑过渡
	useEffect(() => {
		if (mounted) {
			// 使用 requestAnimationFrame 来批量更新 DOM，避免闪烁
			requestAnimationFrame(() => {
				const root = document.documentElement
				const isDark = currentTheme === 'dark'

				// 批量更新所有主题相关的属性
				root.setAttribute('data-theme', currentTheme)
				root.setAttribute('data-color-mode', currentTheme)

				// 使用更平滑的类切换
				if (isDark) {
					root.classList.add('dark')
				} else {
					root.classList.remove('dark')
				}
			})
		}
	}, [currentTheme, mounted])

	// 防止服务端渲染不匹配
	if (!mounted) {
		return (
			<ChakraProvider value={system}>
				<AuthModalProvider>
					<ErrorBoundary
						showErrorDetails={process.env.NODE_ENV === 'development'}
						onError={(error, errorInfo) => {
							if (process.env.NODE_ENV === 'development') {
								console.error('🚨 全局错误边界捕获到错误:', {
									error,
									errorInfo,
								})
							}
							// 显示错误通知
							showError(error, '页面渲染')
						}}
					>
						{children}
					</ErrorBoundary>
				</AuthModalProvider>
			</ChakraProvider>
		)
	}

	return (
		<ChakraProvider value={system}>
			<AuthModalProvider>
				<ErrorBoundary
					showErrorDetails={process.env.NODE_ENV === 'development'}
					onError={(error, errorInfo) => {
						if (process.env.NODE_ENV === 'development') {
							console.error('🚨 全局错误边界捕获到错误:', { error, errorInfo })
						}
						// 显示错误通知
						showError(error, '页面渲染')
					}}
				>
					{children}
				</ErrorBoundary>
			</AuthModalProvider>
		</ChakraProvider>
	)
}
