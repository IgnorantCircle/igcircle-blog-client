'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import Image from 'next/image'
interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ className, size = 'md' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const toast = useToast();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      toast.success('已成功退出登录');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('退出登录失败，请重试');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!user) {
    return null;
  }

  // 获取用户头像
  const getAvatarSrc = () => {
    if (user.avatar) {
      return user.avatar;
    }
    // 使用用户名首字母作为默认头像
    return null;
  };

  // 获取显示名称
  const getDisplayName = () => {
    return user.nickname || user.username;
  };

  // 获取用户名首字母
  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={cn(
          'flex items-center justify-center rounded-full border-2 border-transparent hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          sizeClasses[size]
        )}
      >
        {avatarSrc ? (
          <Image
            src={user.avatar || '/default-avatar.png'}
            alt={user.avatar ? '用户头像' : '默认头像'}
            className={cn('rounded-full object-cover', sizeClasses[size])}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-blue-500 text-white font-medium',
              sizeClasses[size]
            )}
          >
            {getInitials()}
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {/* 用户信息 */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className={cn('mr-3', iconSizeClasses[size])} />
              个人资料
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit className={cn('mr-3', iconSizeClasses[size])} />
              编辑资料
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className={cn('mr-3', iconSizeClasses[size])} />
              设置
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className={cn('mr-3', iconSizeClasses[size])} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;