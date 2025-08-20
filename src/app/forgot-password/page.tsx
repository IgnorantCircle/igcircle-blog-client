'use client'

import { useState } from 'react'
import {
	Container,
	Box,
	Text,
	VStack,
	Button,
	Input,
	Heading,
	Link,
} from '@chakra-ui/react'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { authApi } from '@/lib/api'
import { showError, showSuccess } from '@/lib/error-handler'
import { ForgotPasswordRequestType } from '@/types'
import { useAuthModal } from '@/contexts/AuthModalContext'

/**
 * 忘记密码页面
 */
export default function ForgotPasswordPage() {
	return (
		<ErrorBoundary>
			<MainLayout>
				<ForgotPasswordContent />
			</MainLayout>
		</ErrorBoundary>
	)
}

function ForgotPasswordContent() {
	const { openModal } = useAuthModal()
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// 处理表单提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// 验证邮箱
		if (!email) {
			setError('请输入邮箱地址')
			return
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			setError('请输入有效的邮箱地址')
			return
		}

		setIsLoading(true)

		try {
			const requestData: ForgotPasswordRequestType = { email }
			const response = await authApi.forgotPassword(requestData.email)

			if (response.success) {
				setIsSubmitted(true)
				showSuccess(response.message)
			} else {
				setError(response.message || '发送重置邮件失败')
			}
		} catch (err) {
			console.error('Forgot password error:', err)
			showError(err as Error, '忘记密码')
			setError('发送重置邮件失败，请稍后重试')
		} finally {
			setIsLoading(false)
		}
	}

	// 返回登录页面
	const handleBackToLogin = () => {
		openModal('login')
	}

	// 重新发送邮件
	const handleResend = () => {
		setIsSubmitted(false)
		setError(null)
	}

	if (isSubmitted) {
		return (
			<Container maxW="md" py={8}>
				<VStack gap={6}>
					<Box
						p={8}
						w="full"
						bg={{ base: 'white', _dark: 'gray.800' }}
						borderRadius="lg"
						boxShadow="md"
					>
						<VStack gap={6} align="center">
							<Box color="green.500">
								<CheckCircle size={48} />
							</Box>
							<Heading size="lg" textAlign="center">
								邮件已发送
							</Heading>
							<Text textAlign="center" color="gray.600">
								我们已向 <strong>{email}</strong> 发送了密码重置邮件。
								请检查您的邮箱并点击邮件中的链接来重置密码。
							</Text>
							<Text fontSize="sm" color="gray.500" textAlign="center">
								如果您没有收到邮件，请检查垃圾邮件文件夹，或者稍后重试。
							</Text>
							<VStack gap={3} w="full">
								<Button variant="outline" w="full" onClick={handleResend}>
									重新发送邮件
								</Button>
								<Button variant="ghost" w="full" onClick={handleBackToLogin}>
									<ArrowLeft size={16} style={{ marginRight: '8px' }} />
									返回登录
								</Button>
							</VStack>
						</VStack>
					</Box>
				</VStack>
			</Container>
		)
	}

	return (
		<Container maxW="md" py={8}>
			<VStack gap={6}>
				<Box
					p={8}
					w="full"
					bg={{ base: 'white', _dark: 'gray.800' }}
					borderRadius="lg"
					boxShadow="md"
				>
					<VStack gap={6}>
						<VStack gap={2} align="center">
							<Box color="blue.500">
								<Mail size={48} />
							</Box>
							<Heading size="lg">忘记密码</Heading>
							<Text textAlign="center" color="gray.600">
								请输入您的邮箱地址，我们将向您发送密码重置链接。
							</Text>
						</VStack>

						{error && (
							<Box
								p={3}
								bg="red.50"
								borderRadius="md"
								border="1px solid"
								borderColor="red.200"
								w="full"
							>
								<Text color="red.600" fontSize="sm">
									{error}
								</Text>
							</Box>
						)}

						<Box as="form" onSubmit={handleSubmit} w="full">
							<VStack gap={4}>
								<Input
									type="email"
									placeholder="请输入邮箱地址"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									size="lg"
								/>
								<Button
									type="submit"
									colorScheme="blue"
									size="lg"
									w="full"
									bg={isLoading ? 'gray.500' : 'blue.500'}
									// loading={isLoading}
									disabled={isLoading}
								>
									{isLoading ? '发送中...' : '发送重置邮件'}
								</Button>
							</VStack>
						</Box>

						<VStack gap={2}>
							<Text fontSize="sm" color="gray.500">
								想起密码了？
								<Link
									color="blue.500"
									ml={1}
									onClick={handleBackToLogin}
									cursor="pointer"
								>
									马上登录
								</Link>
							</Text>
						</VStack>
					</VStack>
				</Box>
			</VStack>
		</Container>
	)
}
