'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ResetPasswordFormProps {
	token: string
	onSuccess?: () => void
}

interface ResetPasswordData {
	password: string
	confirmPassword: string
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
	token,
	onSuccess,
}) => {
	const [formData, setFormData] = useState<ResetPasswordData>({
		password: '',
		confirmPassword: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [errors, setErrors] = useState<Partial<ResetPasswordData>>({})

	const toast = useToast()

	const validateForm = (): boolean => {
		const newErrors: Partial<ResetPasswordData> = {}

		// 密码验证
		if (!formData.password) {
			newErrors.password = '请输入新密码'
		} else if (formData.password.length < 8) {
			newErrors.password = '密码长度至少8位'
		} else if (formData.password.length > 50) {
			newErrors.password = '密码长度不能超过50位'
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password = '密码必须包含大小写字母和数字'
		}

		// 确认密码验证
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = '请确认新密码'
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = '两次输入的密码不一致'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setLoading(true)
		try {
			// 调用重置密码的API
			await authApi.resetPassword(token, formData.password)

			setSuccess(true)
			toast.success('密码重置成功！')
			onSuccess?.()
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		// 清除对应字段的错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	if (success) {
		return (
			<div className='w-full max-w-md mx-auto'>
				<div className='bg-white rounded-lg shadow-md p-6'>
					<div className='text-center'>
						<div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
							<CheckCircle className='w-8 h-8 text-green-600' />
						</div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							密码重置成功
						</h2>
						<p className='text-gray-600 mb-6'>
							您的密码已成功重置，现在可以使用新密码登录了。
						</p>
						<Button
							onClick={() => (window.location.href = '/login')}
							className='w-full'>
							前往登录
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='w-full max-w-md mx-auto'>
			<div className='bg-white rounded-lg shadow-md p-6'>
				<div className='text-center mb-6'>
					<h2 className='text-2xl font-bold text-gray-900'>重置密码</h2>
					<p className='text-gray-600 mt-2'>请输入您的新密码</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* 新密码输入 */}
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700 mb-1'>
							新密码 *
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Lock className='h-5 w-5 text-gray-400' />
							</div>
							<input
								id='password'
								type={showPassword ? 'text' : 'password'}
								value={formData.password}
								onChange={(e) => handleInputChange('password', e.target.value)}
								className={cn(
									'block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
									errors.password ? 'border-red-300' : 'border-gray-300'
								)}
								placeholder='请输入新密码'
								disabled={loading}
							/>
							<button
								type='button'
								className='absolute inset-y-0 right-0 pr-3 flex items-center'
								onClick={() => setShowPassword(!showPassword)}
								disabled={loading}>
								{showPassword ? (
									<EyeOff className='h-5 w-5 text-gray-400' />
								) : (
									<Eye className='h-5 w-5 text-gray-400' />
								)}
							</button>
						</div>
						{errors.password && (
							<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
						)}
						{/* 密码强度提示 */}
						{formData.password && (
							<div className='mt-2'>
								<div className='text-xs text-gray-600 mb-1'>密码强度：</div>
								<div className='flex space-x-1'>
									<div
										className={cn(
											'h-1 flex-1 rounded',
											formData.password.length >= 8
												? 'bg-green-500'
												: 'bg-gray-200'
										)}
									/>
									<div
										className={cn(
											'h-1 flex-1 rounded',
											/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)
												? 'bg-green-500'
												: 'bg-gray-200'
										)}
									/>
									<div
										className={cn(
											'h-1 flex-1 rounded',
											/(?=.*\d)/.test(formData.password)
												? 'bg-green-500'
												: 'bg-gray-200'
										)}
									/>
									<div
										className={cn(
											'h-1 flex-1 rounded',
											/(?=.*[!@#$%^&*])/.test(formData.password)
												? 'bg-green-500'
												: 'bg-gray-200'
										)}
									/>
								</div>
								<div className='text-xs text-gray-500 mt-1'>
									密码需包含：8位以上、大小写字母、数字
								</div>
							</div>
						)}
					</div>

					{/* 确认新密码输入 */}
					<div>
						<label
							htmlFor='confirmPassword'
							className='block text-sm font-medium text-gray-700 mb-1'>
							确认新密码 *
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Lock className='h-5 w-5 text-gray-400' />
							</div>
							<input
								id='confirmPassword'
								type={showConfirmPassword ? 'text' : 'password'}
								value={formData.confirmPassword}
								onChange={(e) =>
									handleInputChange('confirmPassword', e.target.value)
								}
								className={cn(
									'block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
									errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
								)}
								placeholder='请再次输入新密码'
								disabled={loading}
							/>
							<button
								type='button'
								className='absolute inset-y-0 right-0 pr-3 flex items-center'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								disabled={loading}>
								{showConfirmPassword ? (
									<EyeOff className='h-5 w-5 text-gray-400' />
								) : (
									<Eye className='h-5 w-5 text-gray-400' />
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.confirmPassword}
							</p>
						)}
					</div>

					{/* 重置按钮 */}
					<Button type='submit' className='w-full' disabled={loading}>
						{loading ? '重置中...' : '重置密码'}
					</Button>
				</form>

				<div className='mt-6 text-center'>
					<p className='text-sm text-gray-600'>
						记起密码了？
						<a
							href='/login'
							className='ml-1 text-blue-600 hover:text-blue-500 font-medium'>
							返回登录
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default ResetPasswordForm
