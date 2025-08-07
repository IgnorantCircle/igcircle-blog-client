'use client';

import React from 'react';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import EmailCodeInput from '@/components/auth/EmailCodeInput';
import { useAuthForm } from '@/hooks/useAuthForm';

export default function RegisterPage() {
  const {
    formData,
    errors,
    isLoading,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    handleSubmit
  } = useAuthForm({ type: 'register' });

  const registerData = formData as {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode: string;
    agreeToTerms: boolean;
  };

  return (
    <AuthLayout
      title="创建账户"
      subtitle="已有账户？"
      linkText="立即登录"
      linkHref="/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthInput
          id="username"
          name="username"
          type="text"
          label="用户名"
          placeholder="请输入用户名"
          value={registerData.username}
          onChange={handleInputChange}
          error={errors.username}
          icon={User}
          autoComplete="username"
          required
        />

        <AuthInput
          id="email"
          name="email"
          type="email"
          label="邮箱地址"
          placeholder="请输入邮箱地址"
          value={registerData.email}
          onChange={handleInputChange}
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <EmailCodeInput
          email={registerData.email}
          value={registerData.verificationCode}
          onChange={(value) => handleInputChange({ target: { name: 'verificationCode', value } } as React.ChangeEvent<HTMLInputElement>)}
          error={errors.verificationCode}
          disabled={isLoading}
        />

        <div>
          <AuthInput
            id="password"
            name="password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            value={registerData.password}
            onChange={handleInputChange}
            error={errors.password}
            icon={Lock}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
            required
          />
          <PasswordStrength password={registerData.password} />
        </div>

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          value={registerData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          icon={Lock}
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="new-password"
          required
        />

        <div>
          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={registerData.agreeToTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
              我同意
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 mx-1">
                服务条款
              </Link>
              和
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 mx-1">
                隐私政策
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '注册中...' : '创建账户'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或者</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}