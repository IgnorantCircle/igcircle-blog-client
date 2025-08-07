'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { authApi } from '@/lib/api'
import rsaUtil from '@/lib/rsa'
import {
	ApiError,
	LoginRequest,
	RegisterRequest,
} from '@/types'

type TypeLoginFormDate = LoginRequest & { rememberMe: boolean }

type TypeRegisterFormDate = RegisterRequest & {
	confirmPassword: string
}

type FormData = TypeLoginFormDate | TypeRegisterFormDate

interface UseAuthFormOptions {
	type: 'login' | 'register'
	onSuccess?: () => void
}

interface ValidationContext {
	password?: string
	type?: 'login' | 'register'
}

interface ValidationRules {
	[key: string]: (
		value: string | boolean,
		formData?: ValidationContext
	) => string | null
}

const validationRules: ValidationRules = {
	email: (value: string | boolean) => {
		const emailValue = value as string
		if (!emailValue) return '请输入邮箱地址'
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))
			return '请输入有效的邮箱地址'
		return null
	},

	password: (value: string | boolean, formData?: ValidationContext) => {
		const passwordValue = value as string
		if (!passwordValue) return '请输入密码'
		if (formData?.type === 'login') {
			if (passwordValue.length < 6) return '密码至少需要6位字符'
		} else {
			if (passwordValue.length < 8) return '密码至少需要8位字符'
			if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordValue)) {
				return '密码必须包含大小写字母和数字'
			}
		}
		return null
	},

	username: (value: string | boolean) => {
		const usernameValue = value as string
		if (!usernameValue) return '请输入用户名'
		if (usernameValue.length < 3) return '用户名至少需要3个字符'
		if (!/^[a-zA-Z0-9_]+$/.test(usernameValue))
			return '用户名只能包含字母、数字和下划线'
		return null
	},

	confirmPassword: (value: string | boolean, formData?: ValidationContext) => {
		const confirmValue = value as string
		if (!confirmValue) return '请确认密码'
		if (formData?.password !== confirmValue) return '两次输入的密码不一致'
		return null
	},

	verificationCode: (value: string | boolean) => {
		const codeValue = value as string
		if (!codeValue) return '请输入邮箱验证码'
		if (!/^\d{6}$/.test(codeValue)) return '验证码必须是6位数字'
		return null
	},

	agreeToTerms: (value: string | boolean) => {
		const agreeValue = value as boolean
		if (!agreeValue) return '请同意服务条款和隐私政策'
		return null
	},
}

export const useAuthForm = ({ type, onSuccess }: UseAuthFormOptions) => {
	const [formData, setFormData] = useState<FormData>(
		type === 'login'
			? ({ username: '', password: '', rememberMe: false } as TypeLoginFormDate)
			: ({
					username: '',
					email: '',
					password: '',
					confirmPassword: '',
					verificationCode: '',
					agreeToTerms: false,
			  } as TypeRegisterFormDate)
	)

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const { login } = useAuthStore()
	const toast = useToast()
	const router = useRouter()

	// 组件挂载时获取RSA公钥
	useEffect(() => {
		const initRsaKey = async () => {
			try {
				const response = await authApi.getRsaPublicKey()
				rsaUtil.setPublicKey(response.publicKey)
			} catch (error) {
				console.error('获取RSA公钥失败:', error)
				toast.error('初始化加密失败，请刷新页面重试')
			}
		}
		
		initRsaKey()
	}, [])

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}
		const validationContext: ValidationContext = {
			password: formData.password || '',
			type,
		}

		Object.keys(formData).forEach((key) => {
			const rule = validationRules[key]
			if (rule) {
				const error = rule(
					formData[key as keyof typeof formData],
					validationContext
				)
				if (error) {
					newErrors[key] = error
				}
			}
		})

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type: inputType, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: inputType === 'checkbox' ? checked : value,
		}))

		// Clear field error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsLoading(true)

		try {
			// 检查RSA公钥是否已设置
			if (!rsaUtil.hasPublicKey()) {
				toast.error('加密初始化失败，请刷新页面重试')
				return
			}

			if (type === 'login') {
				const loginData = formData as LoginRequest
				// 加密密码
				const encryptedPassword = rsaUtil.encrypt(loginData.password)
				const response = await authApi.login({
					username: loginData.username,
					password: encryptedPassword,
				})

				toast.success('登录成功！')
				login(response)
			} else {
				const registerData = formData as RegisterRequest
				// 加密密码
				const encryptedPassword = rsaUtil.encrypt(registerData.password)
				await authApi.register({
					username: registerData.username,
					email: registerData.email,
					password: encryptedPassword,
					verificationCode: registerData.verificationCode,
				})
				router.push('/login')
				toast.success('注册成功！欢迎加入我们！')
			}

			if (onSuccess) {
				onSuccess()
			} else {
				router.push('/')
			}
		} catch (err: unknown) {
			const error = err as ApiError
			const errorMessage =
				error.message || `${type === 'login' ? '登录' : '注册'}失败，请重试`
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return {
		formData,
		errors,
		isLoading,
		showPassword,
		showConfirmPassword,
		setShowPassword,
		setShowConfirmPassword,
		handleInputChange,
		handleSubmit,
		validateForm,
	}
}
