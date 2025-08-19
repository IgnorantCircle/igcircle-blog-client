'use client'

import { useState, useEffect, Suspense } from 'react'
import {
	Container,
	Box,
	Text,
	VStack,
	Button,
	Input,
	Heading,
	Link,
	IconButton,
} from '@chakra-ui/react'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { authApi } from '@/lib/api'
import { showError, showSuccess } from '@/lib/error-handler'
import { ResetPasswordRequestType } from '@/types'
import rsaUtil from '@/lib/rsa'
import { rsaManager } from '@/lib/rsa-manager'
import { useAuthModal } from '@/contexts/AuthModalContext'

/**
 * 重置密码页面
 */
export default function ResetPasswordPage() {
	return (
		<ErrorBoundary>
			<MainLayout>
				<Suspense fallback={<div>Loading...</div>}>
					<ResetPasswordContent />
				</Suspense>
			</MainLayout>
		</ErrorBoundary>
	)
}

function ResetPasswordContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isRsaReady, setIsRsaReady] = useState(false)

	// 初始化RSA
	useEffect(() => {
		const initRsa = async () => {
			try {
				await rsaManager.initialize()
				setIsRsaReady(true)
			} catch (error) {
				console.error('RSA初始化失败:', error)
				setError('系统初始化失败，请刷新页面重试')
			}
		}
		initRsa()
	}, [])

	// 检查token是否存在
	useEffect(() => {
		if (!token) {
			setError('重置链接无效或已过期')
		}
	}, [token])

	// 验证密码
	const validatePassword = (password: string): string | null => {
		if (!password) {
			return '请输入新密码'
		}
		if (password.length < 6) {
			return '密码长度至少6位'
		}
		if (password.length > 50) {
			return '密码长度不能超过50位'
		}
		return null
	}

	// 处理表单提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// 验证token
		if (!token) {
			setError('重置链接无效或已过期')
			return
		}

		// 验证RSA是否准备就绪
		if (!isRsaReady) {
			setError('系统未准备就绪，请稍后重试')
			return
		}

		// 验证密码
		const passwordError = validatePassword(newPassword)
		if (passwordError) {
			setError(passwordError)
			return
		}

		// 验证确认密码
		if (newPassword !== confirmPassword) {
			setError('两次输入的密码不一致')
			return
		}

		setIsLoading(true)

		try {
			// 加密密码
			const encryptedPassword = rsaUtil.encrypt(newPassword)
			if (!encryptedPassword) {
				throw new Error('密码加密失败')
			}

			const requestData: ResetPasswordRequestType = {
				token,
				newPassword: encryptedPassword,
			}

			const response = await authApi.resetPassword(
				requestData.token,
				requestData.newPassword,
			)

			if (response.success) {
				setIsSuccess(true)
				showSuccess(response.message)
			} else {
				setError(response.message || '密码重置失败')
			}
		} catch (err) {
			console.error('Reset password error:', err)
			showError(err as Error, '重置密码')
			setError('密码重置失败，请稍后重试')
		} finally {
			setIsLoading(false)
		}
	}

	// 返回登录页面
	const handleBackToLogin = () => {
		router.push('/login')
	}

	// 如果没有token，显示错误页面
	if (!token) {
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
							<Box color="red.500">
								<Lock size={48} />
							</Box>
							<Heading size="lg" textAlign="center">
								链接无效
							</Heading>
							<Text textAlign="center" color="gray.600">
								重置链接无效或已过期，请重新申请密码重置。
							</Text>
							<VStack gap={3} w="full">
								<Button
									colorScheme="blue"
									w="full"
									onClick={() => router.push('/forgot-password')}
								>
									重新申请重置
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

	// 如果重置成功，显示成功页面
	if (isSuccess) {
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
								密码重置成功
							</Heading>
							<Text textAlign="center" color="gray.600">
								您的密码已成功重置，请使用新密码登录。
							</Text>
							<Button
								colorScheme="blue"
								w="full"
								bg="blue.500"
								onClick={handleBackToLogin}
							>
								立即登录
							</Button>
						</VStack>
					</Box>
				</VStack>
			</Container>
		)
	}

	// 重置密码表单
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
								<Lock size={48} />
							</Box>
							<Heading size="lg">重置密码</Heading>
							<Text textAlign="center" color="gray.600">
								请输入您的新密码。
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
								{/* 新密码输入框 */}
								<Box position="relative" w="full">
									<Input
										type={showPassword ? 'text' : 'password'}
										placeholder="请输入新密码"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										size="lg"
										pr="12"
									/>
									<IconButton
										position="absolute"
										right="2"
										top="50%"
										transform="translateY(-50%)"
										variant="ghost"
										size="sm"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={showPassword ? '隐藏密码' : '显示密码'}
									>
										{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
									</IconButton>
								</Box>

								{/* 确认密码输入框 */}
								<Box position="relative" w="full">
									<Input
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder="请确认新密码"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										size="lg"
										pr="12"
									/>
									<IconButton
										position="absolute"
										right="2"
										top="50%"
										transform="translateY(-50%)"
										variant="ghost"
										size="sm"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
									>
										{showConfirmPassword ? (
											<EyeOff size={16} />
										) : (
											<Eye size={16} />
										)}
									</IconButton>
								</Box>

								<Button
									type="submit"
									colorScheme="blue"
									size="lg"
									bg="blue.500"
									w="full"
									disabled={isLoading || !isRsaReady}
								>
									{isLoading ? '重置中...' : '重置密码'}
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
									返回登录
								</Link>
							</Text>
						</VStack>
					</VStack>
				</Box>
			</VStack>
		</Container>
	)
}
