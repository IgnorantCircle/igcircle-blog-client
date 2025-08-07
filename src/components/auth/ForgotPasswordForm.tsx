'use client'

import React, { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ForgotPasswordFormProps {
	onBack?: () => void
	onSuccess?: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
	onBack,
	onSuccess,
}) => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [sent, setSent] = useState(false)
	const [error, setError] = useState('')
	const [countdown, setCountdown] = useState(0)

	const toast = useToast()

	const validateEmail = (email: string): boolean => {
		if (!email) {
			setError('请输入邮箱地址')
			return false
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError('请输入有效的邮箱地址')
			return false
		}
		setError('')
		return true
	}

	const startCountdown = () => {
		setCountdown(60)
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateEmail(email)) {
			return
		}

		setLoading(true)
		try {
			await authApi.sendVerificationCode(email)
			setSent(true)
			startCountdown()
			toast.success('重置密码邮件已发送，请查收邮箱')
			onSuccess?.()
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setLoading(false)
		}
	}

	const handleResend = async () => {
		if (countdown > 0) return

		setLoading(true)
		try {
			await authApi.sendVerificationCode(email)
			startCountdown()
			toast.success('重置密码邮件已重新发送')
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (value: string) => {
		setEmail(value)
		if (error) {
			setError('')
		}
	}

	if (sent) {
		return (
			<div className='w-full max-w-md mx-auto'>
				<div className='bg-white rounded-lg shadow-md p-6'>
					<div className='text-center mb-6'>
						<div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
							<CheckCircle className='w-8 h-8 text-green-600' />
						</div>
						<h2 className='text-2xl font-bold text-gray-900'>邮件已发送</h2>
						<p className='text-gray-600 mt-2'>
							我们已向{' '}
							<span className='font-medium text-gray-900'>{email}</span>{' '}
							发送了重置密码的邮件
						</p>
					</div>

					<div className='space-y-4'>
						<div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
							<p className='text-sm text-blue-800'>
								请检查您的邮箱（包括垃圾邮件文件夹），点击邮件中的链接重置密码。
							</p>
						</div>

						<Button
							type='button'
							variant='outline'
							className='w-full'
							onClick={handleResend}
							disabled={loading || countdown > 0}>
							{countdown > 0
								? `重新发送 (${countdown}s)`
								: loading
								? '发送中...'
								: '重新发送邮件'}
						</Button>

						{onBack && (
							<Button
								type='button'
								variant='ghost'
								className='w-full'
								onClick={onBack}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								返回登录
							</Button>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='w-full max-w-md mx-auto'>
			<div className='bg-white rounded-lg shadow-md p-6'>
				<div className='text-center mb-6'>
					<h2 className='text-2xl font-bold text-gray-900'>忘记密码</h2>
					<p className='text-gray-600 mt-2'>
						输入您的邮箱地址，我们将发送重置密码的链接
					</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 mb-1'>
							邮箱地址
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Mail className='h-5 w-5 text-gray-400' />
							</div>
							<input
								id='email'
								type='email'
								value={email}
								onChange={(e) => handleInputChange(e.target.value)}
								className={cn(
									'block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
									error ? 'border-red-300' : 'border-gray-300'
								)}
								placeholder='请输入邮箱地址'
								disabled={loading}
							/>
						</div>
						{error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
					</div>

					<Button type='submit' className='w-full' disabled={loading}>
						{loading ? '发送中...' : '发送重置邮件'}
					</Button>
				</form>

				{onBack && (
					<div className='mt-6 text-center'>
						<button
							type='button'
							onClick={onBack}
							className='text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center mx-auto'
							disabled={loading}>
							<ArrowLeft className='w-4 h-4 mr-1' />
							返回登录
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default ForgotPasswordForm
