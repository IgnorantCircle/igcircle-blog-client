'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Spinner, VStack, Text } from '@chakra-ui/react'

interface AuthGuardProps {
	children: React.ReactNode
	requireAuth?: boolean
	redirectTo?: string
	fallback?: React.ReactNode
}

export function AuthGuard({
	children,
	requireAuth = true,
	redirectTo = '/login',
	fallback,
}: AuthGuardProps) {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		// 简单的延迟检查，确保store已经初始化
		const timer = setTimeout(() => {
			setIsChecking(false)

			if (requireAuth && !isAuthenticated) {
				// 需要登录但未登录，重定向到登录页
				router.push(redirectTo)
				return
			}
		}, 100) // 100ms延迟确保store初始化完成

		return () => clearTimeout(timer)
	}, [isAuthenticated, requireAuth, redirectTo, router])

	// 正在检查认证状态
	if (isChecking) {
		if (fallback) {
			return <>{fallback}</>
		}

		return (
			<VStack justify="center" align="center" minH="200px" gap={4}>
				<Spinner size="lg" />
				<Text color="gray.600">正在验证登录状态...</Text>
			</VStack>
		)
	}

	// 需要登录但未登录
	if (requireAuth && !isAuthenticated) {
		return null // 已经重定向，不渲染任何内容
	}

	// 认证通过或不需要认证，渲染子组件
	return <>{children}</>
}

// 高阶组件版本
export function withAuthGuard<P extends object>(
	Component: React.ComponentType<P>,
	options: Omit<AuthGuardProps, 'children'> = {},
) {
	return function AuthGuardedComponent(props: P) {
		return (
			<AuthGuard {...options}>
				<Component {...props} />
			</AuthGuard>
		)
	}
}

// Hook版本
export function useAuthGuard(requireAuth = true) {
	const router = useRouter()
	const { isAuthenticated, user } = useAuthStore()
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		// 简单的延迟检查，确保store已经初始化
		const timer = setTimeout(() => {
			setIsChecking(false)

			if (requireAuth && !isAuthenticated) {
				router.push('/login')
				return
			}
		}, 100)

		return () => clearTimeout(timer)
	}, [isAuthenticated, requireAuth, router])

	return {
		isAuthenticated,
		isChecking,
		user,
		canAccess: !requireAuth || isAuthenticated,
	}
}
