'use client'

import React, { useState, useEffect } from 'react'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface EmailVerificationFormProps {
	email: string
	onSuccess?: () => void
	onResend?: () => void
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
	email,
	onSuccess,
	onResend,
}) => {
	const [loading, setLoading] = useState(false)
	const [countdown, setCountdown] = useState(0)
	const [verified, setVerified] = useState(false)

	const toast = useToast()

	// 启动倒计时
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

	// 组件挂载时启动倒计时
	useEffect(() => {
		startCountdown()
	}, [])

	const handleResendEmail = async () => {
		if (countdown > 0) return

		setLoading(true)
		try {
			await authApi.sendVerificationCode(email)
			startCountdown()
			toast.success('验证邮件已重新发送')
			onResend?.()
		} catch (error) {
			toast.error(error as Error)
		} finally {
			setLoading(false)
		}
	}

	const handleVerifySuccess = () => {
		setVerified(true)
		toast.success('邮箱验证成功！')
		onSuccess?.()
	}

	if (verified) {
		return (
			<div className='w-full max-w-md mx-auto'>
				<div className='bg-white rounded-lg shadow-md p-6'>
					<div className='text-center'>
						<div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
							<CheckCircle className='w-8 h-8 text-green-600' />
						</div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>验证成功</h2>
						<p className='text-gray-600 mb-6'>
							您的邮箱已成功验证，现在可以正常使用所有功能了。
						</p>
						<Button
							onClick={() => (window.location.href = '/')}
							className='w-full'>
							开始使用
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
					<div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
						<Mail className='w-8 h-8 text-blue-600' />
					</div>
					<h2 className='text-2xl font-bold text-gray-900'>验证您的邮箱</h2>
					<p className='text-gray-600 mt-2'>
						我们已向 <span className='font-medium text-gray-900'>{email}</span>{' '}
						发送了验证邮件
					</p>
				</div>

				<div className='space-y-4'>
					<div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
						<h3 className='text-sm font-medium text-blue-800 mb-2'>
							请按以下步骤完成验证：
						</h3>
						<ol className='text-sm text-blue-700 space-y-1 list-decimal list-inside'>
							<li>检查您的邮箱收件箱</li>
							<li>查找来自我们的验证邮件</li>
							<li>点击邮件中的验证链接</li>
							<li>如果没有收到，请检查垃圾邮件文件夹</li>
						</ol>
					</div>

					<div className='flex flex-col space-y-3'>
						<Button
							type='button'
							variant='outline'
							className='w-full'
							onClick={handleResendEmail}
							disabled={loading || countdown > 0}>
							<RefreshCw
								className={cn('w-4 h-4 mr-2', loading && 'animate-spin')}
							/>
							{countdown > 0
								? `重新发送 (${countdown}s)`
								: loading
								? '发送中...'
								: '重新发送验证邮件'}
						</Button>

						<Button
							type='button'
							variant='ghost'
							className='w-full'
							onClick={() => (window.location.href = '/login')}>
							稍后验证，先去登录
						</Button>
					</div>

					<div className='text-center'>
						<p className='text-xs text-gray-500'>
							验证邮件有效期为24小时，请及时完成验证
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default EmailVerificationForm
