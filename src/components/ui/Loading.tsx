import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', className }) => {
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
	}

	return (
		<div className={cn('flex items-center justify-center', className)}>
			<div
				className={cn(
					'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
					sizes[size]
				)}
			/>
		</div>
	)
}

interface LoadingSkeletonProps {
	className?: string
	lines?: number
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
	className,
	lines = 3,
}) => {
	return (
		<div className={cn('animate-pulse', className)}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={index}
					className={cn(
						'h-4 bg-gray-200 rounded mb-2',
						index === lines - 1 && 'w-3/4' // 最后一行稍短
					)}
				/>
			))}
		</div>
	)
}

interface LoadingCardProps {
	className?: string
}

const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
	return (
		<div
			className={cn(
				'animate-pulse bg-white rounded-lg border shadow-sm p-6',
				className
			)}>
			{/* 图片占位 */}
			<div className='w-full h-48 bg-gray-200 rounded mb-4' />

			{/* 标题占位 */}
			<div className='h-6 bg-gray-200 rounded mb-2' />

			{/* 摘要占位 */}
			<div className='space-y-2 mb-4'>
				<div className='h-4 bg-gray-200 rounded' />
				<div className='h-4 bg-gray-200 rounded' />
				<div className='h-4 bg-gray-200 rounded w-3/4' />
			</div>

			{/* 元信息占位 */}
			<div className='flex items-center space-x-4'>
				<div className='w-8 h-8 bg-gray-200 rounded-full' />
				<div className='flex-1'>
					<div className='h-3 bg-gray-200 rounded mb-1 w-1/3' />
					<div className='h-3 bg-gray-200 rounded w-1/4' />
				</div>
			</div>
		</div>
	)
}

export { Loading, LoadingSkeleton, LoadingCard }
