'use client'

import React, { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface EmailCodeInputProps {
	email: string
	value: string
	onChange: (value: string) => void
	error?: string
	disabled?: boolean
	onCodeSent?: () => void
}

const EmailCodeInput: React.FC<EmailCodeInputProps> = ({
	email,
	value,
	onChange,
	error,
	disabled = false,
	onCodeSent,
}) => {
	const [isLoading, setIsLoading] = useState(false)
	const [countdown, setCountdown] = useState(0)
	const [codeSent, setCodeSent] = useState(false)
	const toast = useToast()

	// 倒计时逻辑
	useEffect(() => {
		let timer: NodeJS.Timeout
		if (countdown > 0) {
			timer = setTimeout(() => {
				setCountdown(countdown - 1)
			}, 1000)
		}
		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [countdown])

	const handleSendCode = async () => {
		if (!email || countdown > 0 || isLoading) return

		setIsLoading(true)
		try {
			await authApi.sendVerificationCode(email)
			setCodeSent(true)
			setCountdown(60)
			toast.success('验证码已发送到您的邮箱')
			onCodeSent?.()
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setIsLoading(false)
		}
	}

	const canSendCode = email && !isLoading && countdown === 0

	return (
		<div>
			<label
				htmlFor='verificationCode'
				className='block text-sm font-medium text-gray-700 mb-1'>
				邮箱验证码
			</label>
			<div className='flex space-x-2'>
				<div className='flex-1 relative'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Mail className='h-5 w-5 text-gray-400' />
					</div>
					<input
						id='verificationCode'
						type='text'
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={cn(
							'block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
							error ? 'border-red-300' : 'border-gray-300'
						)}
						placeholder='请输入6位验证码'
						disabled={disabled}
						maxLength={6}
					/>
				</div>
				<button
					type='button'
					onClick={handleSendCode}
					disabled={!canSendCode || disabled}
					className={cn(
						'px-4 py-2 text-sm font-medium rounded-md border transition-colors',
						canSendCode && !disabled
							? 'border-blue-600 text-blue-600 hover:bg-blue-50'
							: 'border-gray-300 text-gray-400 cursor-not-allowed'
					)}>
					<RefreshCw
						className={cn('w-4 h-4 mr-1 inline', isLoading && 'animate-spin')}
					/>
					{countdown > 0
						? `${countdown}s`
						: isLoading
						? '发送中'
						: codeSent
						? '重新发送'
						: '发送验证码'}
				</button>
			</div>
			{error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
			{codeSent && !error && (
				<p className='mt-1 text-sm text-green-600'>
					验证码已发送到 {email}，请查收邮件
				</p>
			)}
		</div>
	)
}

export default EmailCodeInput
