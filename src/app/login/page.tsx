'use client'

import React from 'react'
import Link from 'next/link'
import {  Lock, User } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { useAuthForm } from '@/hooks/useAuthForm'
import { LoginRequest } from '@/types'

export default function LoginPage() {
	const {
		formData,
		errors,
		isLoading,
		showPassword,
		setShowPassword,
		handleInputChange,
		handleSubmit,
	} = useAuthForm({ type: 'login' })

	type TypeFormData = LoginRequest & { rememberMe: boolean }
	const loginData: TypeFormData = formData as TypeFormData

	return (
		<AuthLayout
			title='登录账户'
			subtitle='还没有账户？'
			linkText='立即注册'
			linkHref='/register'>
			<form onSubmit={handleSubmit} className='space-y-6'>
				<AuthInput
					id='username'
					name='username'
					type='user'
					label='用户名'
					placeholder='请输入用户名'
					value={loginData.username}
					onChange={handleInputChange}
					error={errors.username}
					icon={User}
					autoComplete='username'
					required
				/>

				<AuthInput
					id='password'
					name='password'
					type='password'
					label='密码'
					placeholder='请输入密码'
					value={loginData.password}
					onChange={handleInputChange}
					error={errors.password}
					icon={Lock}
					showPasswordToggle
					showPassword={showPassword}
					onTogglePassword={() => setShowPassword(!showPassword)}
					autoComplete='current-password'
					required
				/>

				<div className='flex items-center justify-between'>
					<div className='flex items-center'>
						<input
							id='rememberMe'
							name='rememberMe'
							type='checkbox'
							checked={loginData.rememberMe}
							onChange={handleInputChange}
							className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
						/>
						<label
							htmlFor='rememberMe'
							className='ml-2 block text-sm text-gray-900'>
							记住我
						</label>
					</div>

					<div className='text-sm'>
						<Link
							href='/forgot-password'
							className='text-blue-600 hover:text-blue-500'>
							忘记密码？
						</Link>
					</div>
				</div>

				<div>
					<button
						type='submit'
						disabled={isLoading}
						className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						{isLoading ? '登录中...' : '登录'}
					</button>
				</div>
			</form>
		</AuthLayout>
	)
}
