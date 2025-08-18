'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, VStack, Text, Button, HStack } from '@chakra-ui/react'
import { AuthModal } from '@/components/Auth/AuthModal'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [showAuthModal, setShowAuthModal] = useState(false)

	// 如果已经登录，重定向到首页
	useEffect(() => {
		if (isAuthenticated) {
			router.push('/')
		}
	}, [isAuthenticated, router])

	// 页面加载时自动打开登录弹窗
	useEffect(() => {
		if (!isAuthenticated) {
			setShowAuthModal(true)
		}
	}, [isAuthenticated])

	// 关闭弹窗时返回首页
	const handleCloseModal = () => {
		setShowAuthModal(false)
		//已经登录，返回首页
		if (isAuthenticated) {
			router.push('/')
		}
	}

	// 如果已经登录，不渲染任何内容
	if (isAuthenticated) {
		return null
	}

	return (
		<Container maxW="container.xl" py={8}>
			<VStack gap={8} align="center" minH="60vh" justify="center">
				<Box textAlign="center">
					<Text fontSize="3xl" fontWeight="bold" mb={4}>
						欢迎来到 igCircle Blog
					</Text>
					<Text fontSize="lg" color="gray.600" mb={8}>
						请登录您的账户以继续
					</Text>
				</Box>
				<HStack gap={8}>
					<Button
						colorPalette="blue"
						size="lg"
						onClick={() => setShowAuthModal(true)}
					>
						立即登录
					</Button>
					<Button
						colorPalette="gray"
						size="lg"
						onClick={() => router.push('/')}
					>
						返回首页
					</Button>
				</HStack>
			</VStack>

			{/* 复用AuthModal组件 */}
			<AuthModal
				isOpen={showAuthModal}
				onClose={handleCloseModal}
				defaultTab="login"
			/>
		</Container>
	)
}
