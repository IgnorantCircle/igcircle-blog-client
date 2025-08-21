'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { showError, showSuccess } from '@/lib/error-handler'
import { authApi } from '@/lib/api'
import rsaUtil from '@/lib/rsa'
import { rsaManager } from '@/lib/rsa-manager'
import { LoginRequestType, RegisterRequestType } from '@/types'

export type TypeLoginFormDate = LoginRequestType & { rememberMe: boolean }

export type TypeRegisterFormDate = RegisterRequestType & {
	confirmPassword: string
	agreeToTerms: boolean
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
		formData?: ValidationContext,
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

	password: (value: string | boolean) => {
		const passwordValue = value as string
		if (!passwordValue) return '请输入密码'

		if (passwordValue.length < 8) return '密码至少需要8位字符'
		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordValue)) {
			return '密码必须包含大小写字母和数字'
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
				} as TypeRegisterFormDate),
	)

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const { login } = useAuthStore()
	const router = useRouter()

	// 登录状态
	const [isLoading, setIsLoading] = useState(false)

	// 手动初始化RSA公钥的函数
	const initializeRsaKey = async () => {
		// 使用RSA管理器确保只获取一次公钥
		await rsaManager.initialize()
	}

	// 执行登录
	const performLogin = async (
		loginData: { username: string; password: string },
		rememberMe: boolean = false,
	) => {
		try {
			setIsLoading(true)
			const response = await authApi.login(loginData)
			showSuccess('登录成功！')
			login(response, rememberMe)
			if (onSuccess) {
				onSuccess()
			} else {
				router.push('/')
			}
		} catch (error) {
			showError(error as Error, '用户登录')
		} finally {
			setIsLoading(false)
		}
	}

	// 执行注册
	const performRegister = async (registerData: RegisterRequestType) => {
		try {
			setIsLoading(true)
			await authApi.register(registerData)
			showSuccess('注册成功！欢迎加入我们！')
			if (onSuccess) {
				onSuccess()
			}
		} catch (error) {
			showError(error as Error, '用户注册')
		} finally {
			setIsLoading(false)
		}
	}

	// 校验单个字段
	const validateField = (fieldName: string): string | null => {
		const rule = validationRules[fieldName]
		if (!rule) return null

		const validationContext: ValidationContext = {
			password: formData.password || '',
			type,
		}

		const error = rule(
			formData[fieldName as keyof typeof formData],
			validationContext,
		)

		return error
	}

	// 处理字段失去焦点时的校验
	const handleFieldBlur = (fieldName: string) => {
		const error = validateField(fieldName)
		setErrors((prev) => ({
			...prev,
			[fieldName]: error || '',
		}))
	}

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
					validationContext,
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
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		// 检查RSA公钥是否已设置
		if (!rsaUtil.hasPublicKey()) {
			showError(new Error('加密初始化失败，请刷新页面重试'), 'RSA加密初始化')
			return
		}

		if (type === 'login') {
			const loginData = formData as TypeLoginFormDate
			// 加密密码
			const encryptedPassword = rsaUtil.encrypt(loginData.password)
			await performLogin(
				{
					username: loginData.username,
					password: encryptedPassword,
				},
				loginData.rememberMe,
			)
		} else {
			const registerData = formData as RegisterRequestType
			// 加密密码
			const encryptedPassword = rsaUtil.encrypt(registerData.password)
			await performRegister({
				username: registerData.username,
				email: registerData.email,
				password: encryptedPassword,
				verificationCode: registerData.verificationCode,
			})
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
		setFormData,
		setErrors,
		handleInputChange,
		handleSubmit,
		validateForm,
		validateField,
		handleFieldBlur,
		initializeRsaKey,
	}
}
