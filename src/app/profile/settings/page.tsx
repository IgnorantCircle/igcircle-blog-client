'use client'

import { useState, useEffect } from 'react'
import {
	Container,
	Box,
	Text,
	HStack,
	VStack,
	Button,
	Card,
	Input,
	Textarea,
	Spinner,
	Heading,
	IconButton,
} from '@chakra-ui/react'
import { Save, ArrowLeft, Upload, Key, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Avatar } from '@/components/ui/avatar'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuthStore } from '@/lib/store'
import { userProfileApi } from '@/lib/api/user-profile'
import { authApi } from '@/lib/api/auth'
import { UserType } from '@/types'
import rsaUtil from '@/lib/rsa'
import { rsaManager } from '@/lib/rsa-manager'
import { useToast } from '@/hooks/useToast'

/**
 * 用户设置页面
 */
export default function ProfileSettingsPage() {
	return (
		<AuthGuard>
			<ProfileSettingsContent />
		</AuthGuard>
	)
}

function ProfileSettingsContent() {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [formErrors, setFormErrors] = useState<{
		nickname?: string
		bio?: string
	}>({})
	const [user, setUser] = useState<UserType | null>(null)
	const [formData, setFormData] = useState({
		nickname: '',
		bio: '',
		avatar: '',
	})
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string>('')
	const toast = useToast()

	// 密码重置表单状态
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [passwordErrors, setPasswordErrors] = useState<{
		currentPassword?: string
		newPassword?: string
		confirmPassword?: string
	}>({})
	const [isChangingPassword, setIsChangingPassword] = useState(false)

	// 密码显示/隐藏状态
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	// AuthGuard已经处理了登录状态检查，这里不再需要

	// 加载用户数据
	useEffect(() => {
		const loadUserData = async () => {
			if (!isAuthenticated) return

			setIsLoading(true)

			try {
				const userInfo = await userProfileApi.getCurrentUser()
				if (userInfo) {
					setUser(userInfo)
					setFormData({
						nickname: userInfo.nickname || '',
						bio: userInfo.bio || '',
						avatar: userInfo.avatar || '',
					})
					// 设置头像预览
					setAvatarPreview(userInfo.avatar || '')
				}
			} catch (err) {
				console.error('加载用户信息失败:', err)
				toast.error('加载用户信息失败', '请重新登录')
			} finally {
				setIsLoading(false)
			}
		}

		loadUserData()
	}, [isAuthenticated])

	// 清理预览URL，避免内存泄漏
	useEffect(() => {
		return () => {
			if (avatarPreview && avatarPreview.startsWith('blob:')) {
				URL.revokeObjectURL(avatarPreview)
			}
		}
	}, [avatarPreview])

	// 验证表单字段
	const validateProfileField = (name: string, value: string) => {
		let error = ''

		switch (name) {
			case 'nickname':
				if (value.length > 50) {
					error = '昵称不能超过50个字符'
				}
				break
			case 'bio':
				if (value.length > 200) {
					error = '个人简介不能超过200个字符'
				}
				break
		}

		return error
	}

	// 处理表单字段失去焦点
	const handleProfileFieldBlur = (name: string, value: string) => {
		const error = validateProfileField(name, value)
		setFormErrors((prev) => ({
			...prev,
			[name]: error,
		}))
	}

	// 处理表单提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		// 提交前验证所有字段
		const nicknameError = validateProfileField('nickname', formData.nickname)
		const bioError = validateProfileField('bio', formData.bio)

		const newErrors = {
			nickname: nicknameError,
			bio: bioError,
		}

		setFormErrors(newErrors)

		// 如果有错误，不提交
		if (nicknameError || bioError) {
			return
		}

		setIsSaving(true)

		try {
			let updatedUser = user

			// 如果有新的头像文件，先上传头像
			if (avatarFile) {
				try {
					updatedUser = await userProfileApi.uploadAvatar(avatarFile)
					setUser(updatedUser)
					// 清除头像文件状态
					setAvatarFile(null)
					// 更新表单数据中的头像
					setFormData((prev) => ({ ...prev, avatar: updatedUser.avatar || '' }))
					setAvatarPreview(updatedUser.avatar || '')
				} catch (avatarError) {
					console.error('头像上传失败:', avatarError)
					toast.error('头像上传失败')
					return // 头像上传失败则不继续更新其他信息
				}
			}

			// 更新其他个人资料信息
			updatedUser = await userProfileApi.updateProfile({
				nickname: formData.nickname,
				bio: formData.bio,
			})

			if (updatedUser) {
				setUser(updatedUser)
				toast.success('个人资料更新成功')
			}
		} catch (err) {
			console.error('Failed to update profile:', err)
			toast.error('更新个人资料失败')
		} finally {
			setIsSaving(false)
		}
	}

	// 处理头像文件选择 - 只进行预览，不立即上传
	const handleAvatarUpload = async (file: File) => {
		if (!user) return

		// 验证文件大小（1MB限制）
		if (file.size > 1024 * 1024) {
			toast.error('头像文件大小不能超过1MB')
			return
		}

		// 验证文件类型
		const allowedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
		]
		if (!allowedTypes.includes(file.type)) {
			toast.error('只支持 JPG、PNG、GIF、WebP 格式的图片')
			return
		}

		try {
			// 保存文件对象，用于后续上传
			setAvatarFile(file)

			// 创建预览URL
			const previewUrl = URL.createObjectURL(file)
			setAvatarPreview(previewUrl)

			// 清理之前的预览URL（如果存在）
			return () => {
				URL.revokeObjectURL(previewUrl)
			}
		} catch (err) {
			console.error('头像预览失败', err)
			toast.error('头像预览失败')
		}
	}

	// 验证密码字段
	const validatePasswordField = (name: string, value: string) => {
		let error = ''

		switch (name) {
			case 'currentPassword':
				if (!value) {
					error = '请输入当前密码'
				}
				break
			case 'newPassword':
				if (!value) {
					error = '请输入新密码'
				} else {
					if (value.length < 8) return '密码至少需要8位字符'
					if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
						return '密码必须包含大小写字母和数字'
					}
				}
				break
			case 'confirmPassword':
				if (!value) {
					error = '请确认新密码'
				} else if (value !== passwordData.newPassword) {
					error = '新密码和确认密码不匹配'
				}
				break
		}

		return error
	}

	// 处理密码字段失去焦点
	const handlePasswordFieldBlur = (name: string, value: string) => {
		const error = validatePasswordField(name, value)
		setPasswordErrors((prev) => ({
			...prev,
			[name]: error,
		}))
	}

	// 处理密码重置
	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		// 提交前验证所有字段
		const currentPasswordError = validatePasswordField(
			'currentPassword',
			passwordData.currentPassword,
		)
		const newPasswordError = validatePasswordField(
			'newPassword',
			passwordData.newPassword,
		)
		const confirmPasswordError = validatePasswordField(
			'confirmPassword',
			passwordData.confirmPassword,
		)

		const newErrors = {
			currentPassword: currentPasswordError,
			newPassword: newPasswordError,
			confirmPassword: confirmPasswordError,
		}

		setPasswordErrors(newErrors)

		// 如果有错误，不提交
		if (currentPasswordError || newPasswordError || confirmPasswordError) {
			return
		}

		setIsChangingPassword(true)

		try {
			// 确保RSA公钥已初始化
			await rsaManager.initialize()

			// 加密密码
			const encryptedCurrentPassword = rsaUtil.encrypt(
				passwordData.currentPassword,
			)
			const encryptedNewPassword = rsaUtil.encrypt(passwordData.newPassword)

			// 调用密码修改API
			await authApi.changePassword(
				encryptedCurrentPassword,
				encryptedNewPassword,
			)

			// 重置表单
			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			})
			toast.success('密码修改成功，即将重新登录...')
			router.push('/login')
		} catch (err) {
			toast.error('密码修改失败')
		} finally {
			setIsChangingPassword(false)
		}
	}

	// AuthGuard已经处理了认证检查

	if (isLoading) {
		return (
			<MainLayout>
				<Container maxW="4xl" py={8}>
					<VStack gap={4}>
						<Spinner size="lg" />
						<Text>加载中...</Text>
					</VStack>
				</Container>
			</MainLayout>
		)
	}

	if (!user) {
		return (
			<MainLayout>
				<Container maxW="4xl" py={8}>
					<Box p={4} bg="red.50" color="red.600" borderRadius="md">
						<Heading size="md">加载失败</Heading>
						<Text>无法加载用户信息</Text>
					</Box>
				</Container>
			</MainLayout>
		)
	}

	return (
		<ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
			<MainLayout>
				<Container maxW="4xl" py={8}>
					{/* 页面标题 */}
					<HStack mb={6}>
						<Button variant="ghost" size="sm" onClick={() => router.back()}>
							<ArrowLeft size={16} />
							返回
						</Button>
						<Heading size="lg">编辑个人资料</Heading>
					</HStack>

					{/* 错误和成功提示已移除，改用toast */}

					{/* 设置表单 */}
					<Card.Root p={6}>
						<form onSubmit={handleSubmit}>
							<VStack gap={6} align="stretch">
								{/* 头像设置 */}
								<Box>
									<Text fontWeight="semibold" mb={3}>
										头像
									</Text>
									<HStack gap={4}>
										<Avatar
											size="xl"
											name={user.nickname || user.username}
											src={avatarPreview || formData.avatar}
										/>
										<VStack align="start">
											<Button
												size="sm"
												variant="outline"
												disabled={isSaving}
												onClick={() => {
													const input = document.createElement('input')
													input.type = 'file'
													input.accept = 'image/*'
													input.onchange = (e) => {
														const file = (e.target as HTMLInputElement)
															.files?.[0]
														if (file) {
															handleAvatarUpload(file)
														}
													}
													input.click()
												}}
											>
												<Upload size={16} />
												上传头像
											</Button>
											<Text fontSize="sm" color="gray.600">
												支持 JPG、PNG、GIF、WebP 格式，文件大小不超过 1MB
											</Text>
											{avatarFile && (
												<Text fontSize="sm" color="blue.600">
													已选择新头像，点击保存后生效
												</Text>
											)}
										</VStack>
									</HStack>
								</Box>

								{/* 用户名（只读） */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										用户名
									</Text>
									<Input value={user.username} disabled placeholder="用户名" />
									<Text fontSize="sm" color="gray.600" mt={1}>
										用户名不可修改
									</Text>
								</Box>

								{/* 昵称 */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										昵称
									</Text>
									<Input
										value={formData.nickname}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												nickname: e.target.value,
											}))
										}
										onBlur={(e) =>
											handleProfileFieldBlur('nickname', e.target.value)
										}
										placeholder="请输入昵称"
										maxLength={50}
										borderColor={formErrors.nickname ? 'red.500' : undefined}
									/>
									{formErrors.nickname && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{formErrors.nickname}
										</Text>
									)}
								</Box>

								{/* 个人简介 */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										个人简介
									</Text>
									<Textarea
										value={formData.bio}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, bio: e.target.value }))
										}
										onBlur={(e) =>
											handleProfileFieldBlur('bio', e.target.value)
										}
										placeholder="介绍一下自己吧..."
										maxLength={200}
										rows={4}
										borderColor={formErrors.bio ? 'red.500' : undefined}
									/>
									{formErrors.bio && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{formErrors.bio}
										</Text>
									)}
									<Text fontSize="sm" color="gray.600" mt={1}>
										{formData.bio.length}/200
									</Text>
								</Box>

								{/* 提交按钮 */}
								<HStack justify="flex-end" pt={4}>
									<Button
										type="submit"
										colorPalette="blue"
										disabled={isSaving}
										loading={isSaving}
									>
										<Save size={16} />
										{isSaving
											? avatarFile
												? '上传头像并保存中...'
												: '保存中...'
											: avatarFile
												? '上传头像并保存'
												: '保存更改'}
									</Button>
								</HStack>
							</VStack>
						</form>
					</Card.Root>

					{/* 密码修改 */}
					<Card.Root p={6} mt={6}>
						<form onSubmit={handlePasswordChange}>
							<VStack gap={6} align="stretch">
								<HStack>
									<Key size={20} />
									<Heading size="md">修改密码</Heading>
								</HStack>

								{/* 当前密码 */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										当前密码
									</Text>
									<Box position="relative">
										<Input
											type={showCurrentPassword ? 'text' : 'password'}
											value={passwordData.currentPassword}
											onChange={(e) =>
												setPasswordData((prev) => ({
													...prev,
													currentPassword: e.target.value,
												}))
											}
											onBlur={(e) =>
												handlePasswordFieldBlur(
													'currentPassword',
													e.target.value,
												)
											}
											placeholder="请输入当前密码"
											required
											pr={12}
											borderColor={
												passwordErrors.currentPassword ? 'red.500' : undefined
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
												setShowCurrentPassword(!showCurrentPassword)
											}
											aria-label={showCurrentPassword ? '隐藏密码' : '显示密码'}
										>
											{showCurrentPassword ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</IconButton>
									</Box>
									{passwordErrors.currentPassword && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{passwordErrors.currentPassword}
										</Text>
									)}
								</Box>

								{/* 新密码 */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										新密码
									</Text>
									<Box position="relative">
										<Input
											type={showNewPassword ? 'text' : 'password'}
											value={passwordData.newPassword}
											onChange={(e) =>
												setPasswordData((prev) => ({
													...prev,
													newPassword: e.target.value,
												}))
											}
											onBlur={(e) =>
												handlePasswordFieldBlur('newPassword', e.target.value)
											}
											placeholder="请输入新密码（至少6位）"
											minLength={6}
											required
											pr={12}
											borderColor={
												passwordErrors.newPassword ? 'red.500' : undefined
											}
										/>
										<IconButton
											variant="ghost"
											size="sm"
											position="absolute"
											right={2}
											top="50%"
											transform="translateY(-50%)"
											onClick={() => setShowNewPassword(!showNewPassword)}
											aria-label={showNewPassword ? '隐藏密码' : '显示密码'}
										>
											{showNewPassword ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</IconButton>
									</Box>
									{passwordErrors.newPassword && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{passwordErrors.newPassword}
										</Text>
									)}
								</Box>

								{/* 确认新密码 */}
								<Box>
									<Text fontWeight="semibold" mb={2}>
										确认新密码
									</Text>
									<Box position="relative">
										<Input
											type={showConfirmPassword ? 'text' : 'password'}
											value={passwordData.confirmPassword}
											onChange={(e) =>
												setPasswordData((prev) => ({
													...prev,
													confirmPassword: e.target.value,
												}))
											}
											onBlur={(e) =>
												handlePasswordFieldBlur(
													'confirmPassword',
													e.target.value,
												)
											}
											placeholder="请再次输入新密码"
											required
											pr={12}
											borderColor={
												passwordErrors.confirmPassword ? 'red.500' : undefined
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
												setShowConfirmPassword(!showConfirmPassword)
											}
											aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
										>
											{showConfirmPassword ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</IconButton>
									</Box>
									{passwordErrors.confirmPassword && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{passwordErrors.confirmPassword}
										</Text>
									)}
								</Box>

								{/* 提交按钮 */}
								<HStack justify="flex-end" pt={4}>
									<Button
										type="submit"
										colorPalette="red"
										disabled={
											isChangingPassword ||
											!passwordData.currentPassword ||
											!passwordData.newPassword ||
											!passwordData.confirmPassword
										}
										loading={isChangingPassword}
									>
										<Key size={16} />
										{isChangingPassword ? '修改中...' : '修改密码'}
									</Button>
								</HStack>
							</VStack>
						</form>
					</Card.Root>
				</Container>
			</MainLayout>
		</ErrorBoundary>
	)
}
