'use client'

import {
	Box,
	Button,
	Input,
	Text,
	Tabs,
	Checkbox,
	Link,
	IconButton,
	HStack,
	VStack,
} from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useToast } from '@/hooks/useToast'
import { authApi } from '@/lib/api'
import { handleGlobalError } from '@/lib/error-handler'
import type {
	TypeLoginFormDate,
	TypeRegisterFormDate,
} from '@/hooks/useAuthForm'
import { TermsModal } from './TermsModal'
import { PrivacyModal } from './PrivacyModal'
import { Modal } from '@/components/ui/Modal'

interface AuthModalProps {
	isOpen: boolean
	onClose: () => void
	defaultTab?: 'login' | 'register'
}

export function AuthModal({
	isOpen,
	onClose,
	defaultTab = 'login',
}: AuthModalProps) {
	const router = useRouter()
	const { error, success } = useToast()
	const [activeTab, setActiveTab] = useState(defaultTab)
	const [showPrivacyModal, setShowPrivacyModal] = useState(false)
	const [showTermsModal, setShowTermsModal] = useState(false)
	const [emailForCode, setEmailForCode] = useState('')
	const [codeCountdown, setCodeCountdown] = useState(0)

	// 登录表单
	const loginForm = useAuthForm({
		type: 'login',
		onSuccess: () => {
			onClose()
		},
	})

	// 自定义onClose处理函数，关闭modal时重置表单
	const handleClose = () => {
		// 重置登录表单
		loginForm.setFormData({ username: '', password: '', rememberMe: false })
		loginForm.setErrors({})
		// 调用原始的onClose函数
		onClose()
	}

	// 注册表单
	const registerForm = useAuthForm({
		type: 'register',
		onSuccess: () => {
			// 注册成功后切换到登录tab，引导用户登录
			setActiveTab('login')
			// 重置登录表单
			loginForm.setFormData({ username: '', password: '', rememberMe: false })
			loginForm.setErrors({})
		},
	})

	// 初始化RSA密钥 - 只需要初始化一次
	useEffect(() => {
		if (isOpen) {
			// 只调用一次RSA初始化，因为RSA公钥是全局共享的
			loginForm.initializeRsaKey().catch(console.error)
		}
	}, [isOpen]) // 移除loginForm依赖，避免重复初始化

	// 发送验证码倒计时
	useEffect(() => {
		let timer: NodeJS.Timeout
		if (codeCountdown > 0) {
			timer = setTimeout(() => setCodeCountdown(codeCountdown - 1), 1000)
		}
		return () => clearTimeout(timer)
	}, [codeCountdown])

	// 验证邮箱格式
	const isValidEmail = (email: string): boolean => {
		if (!email) return false
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}

	// 发送邮箱验证码
	const handleSendCode = async () => {
		if (!emailForCode) {
			error('请先输入邮箱地址')
			return
		}

		if (!isValidEmail(emailForCode)) {
			error('请输入有效的邮箱地址')
			return
		}

		try {
			await authApi.sendVerificationCode(emailForCode)
			setCodeCountdown(60)
			success('验证码已发送到您的邮箱')
		} catch (err) {
			handleGlobalError(err, '发送邮箱验证码失败')
		}
	}

	// 切换tab时重置表单
	const handleTabChange = (value: string) => {
		setActiveTab(value as 'login' | 'register')
		// 重置表单数据和错误状态
		if (value === 'login') {
			// 重置登录表单
			loginForm.setFormData({ username: '', password: '', rememberMe: false })
			loginForm.setErrors({})
		} else {
			// 重置注册表单
			registerForm.setFormData({
				username: '',
				email: '',
				password: '',
				confirmPassword: '',
				verificationCode: '',
				agreeToTerms: false,
			})
			registerForm.setErrors({})
			// 重置邮箱验证码相关状态
			setEmailForCode('')
			setCodeCountdown(0)
		}
	}

	return (
		<>
			{/* 主认证模态框 */}
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				title="欢迎来到 igCircle Blog"
				maxWidth="500px"
				showCloseButton={true}
				closeOnBackdropClick={true}
				closeOnEsc={true}
			>
				<Box maxHeight="80vh" overflowY="auto">
					<Tabs.Root
						value={activeTab}
						onValueChange={(details) => handleTabChange(details.value)}
					>
						<Tabs.List mb={6}>
							<Tabs.Trigger value="login" flex={1}>
								登录
							</Tabs.Trigger>
							<Tabs.Trigger value="register" flex={1}>
								注册
							</Tabs.Trigger>
							<Tabs.Indicator />
						</Tabs.List>

						{/* 登录表单 */}
						<Tabs.Content value="login">
							<Box as="form" onSubmit={loginForm.handleSubmit}>
								<VStack gap={4}>
									{/* 用户名输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											用户名
										</Text>
										<Input
											name="username"
											value={loginForm.formData.username}
											onChange={loginForm.handleInputChange}
											onBlur={() => loginForm.handleFieldBlur('username')}
											placeholder="请输入用户名"
											size="lg"
											borderColor={
												loginForm.errors.username ? 'red.500' : undefined
											}
										/>
										{loginForm.errors.username && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{loginForm.errors.username}
											</Text>
										)}
									</Box>

									{/* 密码输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											密码
										</Text>
										<Box position="relative">
											<Input
												name="password"
												type={loginForm.showPassword ? 'text' : 'password'}
												value={loginForm.formData.password}
												onChange={loginForm.handleInputChange}
												onBlur={() => loginForm.handleFieldBlur('password')}
												placeholder="请输入密码"
												size="lg"
												pr={12}
												borderColor={
													loginForm.errors.password ? 'red.500' : undefined
												}
											/>
											<IconButton
												variant="ghost"
												size="sm"
												position="absolute"
												right={2}
												top="50%"
												transform="translateY(-50%)"
												onClick={() =>
													loginForm.setShowPassword(!loginForm.showPassword)
												}
												aria-label={
													loginForm.showPassword ? '隐藏密码' : '显示密码'
												}
											>
												{loginForm.showPassword ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</IconButton>
										</Box>
										{loginForm.errors.password && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{loginForm.errors.password}
											</Text>
										)}
									</Box>

									{/* 记住登录 */}
									<HStack justify="space-between" w="full">
										<Checkbox.Root
											size="sm"
											checked={
												(loginForm.formData as TypeLoginFormDate).rememberMe
											}
											onCheckedChange={(details) => {
												loginForm.handleInputChange({
													target: {
														name: 'rememberMe',
														type: 'checkbox',
														checked: details.checked,
													},
												} as React.ChangeEvent<HTMLInputElement>)
											}}
										>
											<Checkbox.HiddenInput name="rememberMe" />
											<Checkbox.Control>
												<Checkbox.Indicator />
											</Checkbox.Control>
											<Checkbox.Label>记住登录</Checkbox.Label>
										</Checkbox.Root>
										<Link
											fontSize="sm"
											color="blue.500"
											_hover={{ color: 'blue.600' }}
											cursor="pointer"
											onClick={() => {
												onClose()
												router.push('/forgot-password')
											}}
										>
											忘记密码？
										</Link>
									</HStack>

									{/* 登录按钮 */}
									<Button
										type="submit"
										colorPalette="blue"
										size="lg"
										w="full"
										loading={loginForm.isLoading}
										loadingText="登录中..."
									>
										登录
									</Button>
								</VStack>
							</Box>
						</Tabs.Content>

						{/* 注册表单 */}
						<Tabs.Content value="register">
							<Box as="form" onSubmit={registerForm.handleSubmit}>
								<VStack gap={4}>
									{/* 用户名输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											用户名
										</Text>
										<Input
											name="username"
											value={registerForm.formData.username}
											onChange={registerForm.handleInputChange}
											onBlur={() => registerForm.handleFieldBlur('username')}
											placeholder="请输入用户名"
											size="lg"
											borderColor={
												registerForm.errors.username ? 'red.500' : undefined
											}
										/>
										{registerForm.errors.username && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.username}
											</Text>
										)}
									</Box>

									{/* 邮箱输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											邮箱地址
										</Text>
										<Input
											name="email"
											type="email"
											value={
												(registerForm.formData as TypeRegisterFormDate).email
											}
											onChange={(e) => {
												registerForm.handleInputChange(e)
												setEmailForCode(e.target.value)
											}}
											onBlur={() => registerForm.handleFieldBlur('email')}
											placeholder="请输入邮箱地址"
											size="lg"
											borderColor={
												registerForm.errors.email ? 'red.500' : undefined
											}
										/>
										{registerForm.errors.email && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.email}
											</Text>
										)}
									</Box>

									{/* 密码输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											密码
										</Text>
										<Box position="relative">
											<Input
												name="password"
												type={registerForm.showPassword ? 'text' : 'password'}
												value={registerForm.formData.password}
												onChange={registerForm.handleInputChange}
												onBlur={() => registerForm.handleFieldBlur('password')}
												placeholder="请输入密码"
												size="lg"
												pr={12}
												borderColor={
													registerForm.errors.password ? 'red.500' : undefined
												}
											/>
											<IconButton
												variant="ghost"
												size="sm"
												position="absolute"
												right={2}
												top="50%"
												transform="translateY(-50%)"
												onClick={() =>
													registerForm.setShowPassword(
														!registerForm.showPassword,
													)
												}
												aria-label={
													registerForm.showPassword ? '隐藏密码' : '显示密码'
												}
											>
												{registerForm.showPassword ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</IconButton>
										</Box>
										{registerForm.errors.password && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.password}
											</Text>
										)}
									</Box>

									{/* 确认密码输入 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											确认密码
										</Text>
										<Box position="relative">
											<Input
												name="confirmPassword"
												type={
													registerForm.showConfirmPassword ? 'text' : 'password'
												}
												value={
													(registerForm.formData as TypeRegisterFormDate)
														.confirmPassword
												}
												onChange={registerForm.handleInputChange}
												onBlur={() =>
													registerForm.handleFieldBlur('confirmPassword')
												}
												placeholder="请再次输入密码"
												size="lg"
												pr={12}
												borderColor={
													registerForm.errors.confirmPassword
														? 'red.500'
														: undefined
												}
											/>
											<IconButton
												variant="ghost"
												size="sm"
												position="absolute"
												right={2}
												top="50%"
												transform="translateY(-50%)"
												onClick={() =>
													registerForm.setShowConfirmPassword(
														!registerForm.showConfirmPassword,
													)
												}
												aria-label={
													registerForm.showConfirmPassword
														? '隐藏密码'
														: '显示密码'
												}
											>
												{registerForm.showConfirmPassword ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</IconButton>
										</Box>
										{registerForm.errors.confirmPassword && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.confirmPassword}
											</Text>
										)}
									</Box>

									{/* 邮箱验证码 */}
									<Box w="full">
										<Text mb={2} fontSize="sm" fontWeight="medium">
											邮箱验证码
										</Text>
										<HStack>
											<Input
												name="verificationCode"
												value={
													(registerForm.formData as TypeRegisterFormDate)
														.verificationCode
												}
												onChange={registerForm.handleInputChange}
												onBlur={() =>
													registerForm.handleFieldBlur('verificationCode')
												}
												placeholder="请输入6位验证码"
												size="lg"
												maxLength={6}
												borderColor={
													registerForm.errors.verificationCode
														? 'red.500'
														: undefined
												}
											/>
											<Button
												variant="outline"
												size="lg"
												onClick={handleSendCode}
												disabled={
													!isValidEmail(emailForCode) || codeCountdown > 0
												}
												minW="120px"
											>
												{codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
											</Button>
										</HStack>
										{registerForm.errors.verificationCode && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.verificationCode}
											</Text>
										)}
									</Box>

									{/* 同意条款 */}
									<Box w="full">
										<Checkbox.Root
											size="sm"
											checked={
												(registerForm.formData as TypeRegisterFormDate)
													.agreeToTerms
											}
											onCheckedChange={(details) => {
												registerForm.handleInputChange({
													target: {
														name: 'agreeToTerms',
														type: 'checkbox',
														checked: details.checked,
													},
												} as React.ChangeEvent<HTMLInputElement>)
											}}
										>
											<Checkbox.HiddenInput name="agreeToTerms" />
											<Checkbox.Control>
												<Checkbox.Indicator />
											</Checkbox.Control>
											<Checkbox.Label>
												<Text fontSize="sm">
													我已阅读并同意
													<Link
														color="blue.500"
														_hover={{ color: 'blue.600' }}
														onClick={() => setShowTermsModal(true)}
													>
														《用户协议》
													</Link>
													和
													<Link
														color="blue.500"
														_hover={{ color: 'blue.600' }}
														onClick={() => setShowPrivacyModal(true)}
													>
														《隐私政策》
													</Link>
												</Text>
											</Checkbox.Label>
										</Checkbox.Root>
										{registerForm.errors.agreeToTerms && (
											<Text color="red.500" fontSize="sm" mt={1}>
												{registerForm.errors.agreeToTerms}
											</Text>
										)}
									</Box>

									{/* 注册按钮 */}
									<Button
										type="submit"
										colorPalette="blue"
										size="lg"
										w="full"
										loading={registerForm.isLoading}
										loadingText="注册中..."
									>
										注册账号
									</Button>
								</VStack>
							</Box>
						</Tabs.Content>
					</Tabs.Root>
				</Box>
			</Modal>

			{/* 用户协议对话框 */}
			<TermsModal
				isOpen={showTermsModal}
				onClose={() => setShowTermsModal(false)}
			/>

			{/* 隐私政策对话框 */}
			<PrivacyModal
				isOpen={showPrivacyModal}
				onClose={() => setShowPrivacyModal(false)}
			/>
		</>
	)
}
