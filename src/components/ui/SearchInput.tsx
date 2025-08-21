'use client'

import { Box, Input, Field, IconButton } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { forwardRef } from 'react'

export interface SearchInputProps {
	/** 输入框的值 */
	value: string
	/** 值变化时的回调 */
	onChange: (value: string) => void
	/** 占位符文本 */
	placeholder?: string
	/** 标签文本 */
	label?: string
	/** 输入框大小 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	/** 最大宽度 */
	maxWidth?: string
	/** 是否显示清除按钮 */
	showClearButton?: boolean
	/** 清除按钮的回调 */
	onClear?: () => void
	/** 是否禁用 */
	disabled?: boolean
	/** 额外的样式类名 */
	className?: string
	/** 容器的额外属性 */
	containerProps?: Record<string, unknown>
	/** 最大字符数限制 */
	maxLength?: number
	/** 错误信息 */
	errorText?: string
}

/**
 * 通用搜索输入框组件
 * 支持浮动标签、清除按钮等功能
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
	(
		{
			value,
			onChange,
			placeholder = '',
			size = 'md',
			maxWidth = 'md',
			showClearButton = true,
			onClear,
			disabled = false,
			className,
			containerProps,
			maxLength,
			errorText,
		},
		ref,
	) => {
		const handleClear = () => {
			onChange('')
			onClear?.()
		}

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value
			if (maxLength && newValue.length > maxLength) {
				return // 阻止输入超过限制的字符
			}
			onChange(newValue)
		}

		const isError = Boolean(errorText)
		const isOverLimit = Boolean(maxLength && value.length > maxLength)

		return (
			<Field.Root {...containerProps} invalid={isError || isOverLimit}>
				<Box maxW={maxWidth} mx="auto" w="full" pos="relative">
					<Input
						ref={ref}
						className={`peer ${className || ''}`}
						placeholder={placeholder}
						value={value}
						onChange={handleInputChange}
						size={size}
						disabled={disabled}
						pr={
							maxLength
								? showClearButton && value
									? '20'
									: '16'
								: showClearButton && value
									? '12'
									: undefined
						}
						maxLength={maxLength}
						borderColor={isOverLimit ? 'red.500' : undefined}
						_focus={{
							borderColor: isOverLimit ? 'red.500' : 'blue.500',
							boxShadow: isOverLimit
								? '0 0 0 1px var(--chakra-colors-red-500)'
								: '0 0 0 1px var(--chakra-colors-blue-500)',
						}}
					/>
					{/* 字符计数器 */}
					{maxLength && (
						<Box
							position="absolute"
							right={showClearButton && value ? '12' : '3'}
							top="50%"
							transform="translateY(-50%)"
							fontSize="xs"
							color={isOverLimit ? 'red.500' : 'gray.500'}
							pointerEvents="none"
							zIndex={1}
						>
							{value.length}/{maxLength}
						</Box>
					)}

					{/* 清除按钮 */}
					{showClearButton && value && !disabled && (
						<IconButton
							aria-label="清除搜索"
							variant="ghost"
							size="sm"
							position="absolute"
							right="2"
							top="50%"
							transform="translateY(-50%)"
							onClick={handleClear}
							color="fg.muted"
							_hover={{
								color: 'fg',
								bg: 'bg.muted',
							}}
							zIndex={1}
						>
							<X size={16} />
						</IconButton>
					)}
				</Box>

				{/* 错误信息 */}
				{(errorText || isOverLimit) && (
					<Field.ErrorText>
						{errorText || (maxLength && `搜索内容不能超过${maxLength}个字符`)}
					</Field.ErrorText>
				)}
			</Field.Root>
		)
	},
)

SearchInput.displayName = 'SearchInput'
