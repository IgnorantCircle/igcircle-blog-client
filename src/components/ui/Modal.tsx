'use client'

import { Box, Button, IconButton, Text, HStack } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
	/** 是否显示模态框 */
	isOpen: boolean
	/** 关闭模态框的回调 */
	onClose: () => void
	/** 模态框标题 */
	title?: string
	/** 模态框内容 */
	children: ReactNode
	/** 最大宽度 */
	maxWidth?: string
	/** 最大高度 */
	maxHeight?: string
	/** 是否显示关闭按钮 */
	showCloseButton?: boolean
	/** 点击背景是否关闭 */
	closeOnBackdropClick?: boolean
	/** 按 ESC 键是否关闭 */
	closeOnEsc?: boolean
	/** 自定义底部按钮 */
	footer?: ReactNode
	/** 是否阻止背景滚动 */
	preventScroll?: boolean
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = '500px',
	maxHeight = '80vh',
	showCloseButton = true,
	closeOnBackdropClick = true,
	closeOnEsc = true,
	footer,
	preventScroll = true,
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null)

	// 处理 ESC 键关闭
	useEffect(() => {
		if (!isOpen || !closeOnEsc) return

		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEsc)
		return () => document.removeEventListener('keydown', handleEsc)
	}, [isOpen, closeOnEsc, onClose])

	// 处理背景滚动
	useEffect(() => {
		if (!isOpen || !preventScroll) return
		// 保存当前滚动位置和原始样式
		const scrollY = window.scrollY
		const originalBodyOverflow = document.body.style.overflow
		const originalHtmlOverflow = document.documentElement.style.overflow
		const originalBodyPaddingRight = document.body.style.paddingRight

		// 获取滚动条宽度
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth

		// 锁定滚动并补偿滚动条宽度
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'
		document.body.style.paddingRight = `${scrollbarWidth}px`

		// 保存滚动位置到body的data属性中
		document.body.setAttribute('data-scroll-y', scrollY.toString())

		return () => {
			// 恢复原始样式
			document.body.style.overflow = originalBodyOverflow
			document.documentElement.style.overflow = originalHtmlOverflow
			document.body.style.paddingRight = originalBodyPaddingRight
			// 恢复滚动位置
			const savedScrollY = document.body.getAttribute('data-scroll-y')
			if (savedScrollY) {
				window.scrollTo(0, parseInt(savedScrollY, 10))
				document.body.removeAttribute('data-scroll-y')
			}
		}
	}, [isOpen, preventScroll])

	// 处理点击背景关闭
	const handleBackdropClick = (event: React.MouseEvent) => {
		if (closeOnBackdropClick && event.target === event.currentTarget) {
			onClose()
		}
	}

	// 聚焦管理
	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.focus()
		}
	}, [isOpen])

	if (!isOpen) return null

	return createPortal(
		<Box
			position="fixed"
			top={0}
			left={0}
			right={0}
			minHeight="100vh"
			zIndex={9999}
			display="flex"
			alignItems="center"
			justifyContent="center"
			p={4}
			onClick={handleBackdropClick}
		>
			{/* 背景遮罩 */}
			<Box
				position="fixed"
				top={0}
				left={0}
				right={0}
				bottom={0}
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>

			{/* 模态框内容 */}
			<Box
				ref={modalRef}
				position="relative"
				bg="chakra-body-bg"
				borderRadius="lg"
				boxShadow="2xl"
				maxW={maxWidth}
				maxH={maxHeight}
				w="full"
				overflow="hidden"
				tabIndex={-1}
				outline="none"
				transform="scale(1)"
				transition="all 0.2s"
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'blue.500',
					outlineOffset: '2px',
				}}
			>
				{/* 头部 */}
				{(title || showCloseButton) && (
					<HStack
						justify="space-between"
						align="center"
						p={6}
						pb={title ? 4 : 6}
						borderBottom={title ? '1px solid' : 'none'}
						borderColor="border"
					>
						{title && (
							<Text
								fontSize="xl"
								fontWeight="semibold"
								color="chakra-body-text"
							>
								{title}
							</Text>
						)}
						{showCloseButton && (
							<IconButton
								variant="ghost"
								size="sm"
								aria-label="关闭模态框"
								onClick={onClose}
								ml={title ? 0 : 'auto'}
							>
								<X size={18} />
							</IconButton>
						)}
					</HStack>
				)}

				{/* 内容区域 */}
				<Box
					p={6}
					pt={title ? 6 : 6}
					overflowY="auto"
					maxH={footer ? 'calc(80vh - 140px)' : 'calc(80vh - 80px)'}
				>
					{children}
				</Box>

				{/* 底部 */}
				{footer && (
					<Box
						p={6}
						pt={4}
						borderTop="1px solid"
						borderColor="border"
						bg="bg-subtle"
					>
						{footer}
					</Box>
				)}
			</Box>
		</Box>,
		document.body,
	)
}

// 便捷的确认对话框组件
interface ConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	message: string
	confirmText?: string
	cancelText?: string
	confirmColorPalette?: string
	isLoading?: boolean
}

export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = '确认操作',
	message,
	confirmText = '确认',
	cancelText = '取消',
	confirmColorPalette = 'red',
	isLoading = false,
}: ConfirmModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			maxWidth="400px"
			closeOnBackdropClick={!isLoading}
			closeOnEsc={!isLoading}
			footer={
				<HStack justify="flex-end" gap={3}>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						{cancelText}
					</Button>
					<Button
						colorPalette={confirmColorPalette}
						onClick={onConfirm}
						loading={isLoading}
					>
						{confirmText}
					</Button>
				</HStack>
			}
		>
			<Text color="chakra-body-text">{message}</Text>
		</Modal>
	)
}

// 导出类型
export type { ModalProps, ConfirmModalProps }
