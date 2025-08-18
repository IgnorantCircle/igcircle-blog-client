'use client'

import React, {
	Component,
	ErrorInfo,
	ReactNode,
	useCallback,
	useState,
} from 'react'
import {
	Box,
	Container,
	Text,
	Button,
	VStack,
	HStack,
	Badge,
} from '@chakra-ui/react'
import { RefreshCw, Home, AlertTriangle, Bug } from 'lucide-react'
interface Props {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: ErrorInfo) => void
	showErrorDetails?: boolean
	level?: 'page' | 'component' | 'critical'
	title?: string
	description?: string
	enableRetry?: boolean
	enableReset?: boolean
	maxRetries?: number
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
	retryCount: number
	errorId: string
	timestamp: number
}

// 错误边界组件
class ErrorBoundaryClass extends Component<Props, State> {
	private maxRetries: number

	constructor(props: Props) {
		super(props)
		this.maxRetries = props.maxRetries || 3
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: 0,
			errorId: '',
			timestamp: 0,
		}
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		// 更新 state 使下一次渲染能够显示降级后的 UI
		const errorId = `error_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`
		console.error('🚨 ErrorBoundary 捕获到错误:', { error, errorId })

		return {
			hasError: true,
			error,
			errorId,
			timestamp: Date.now(),
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// 记录错误信息
		console.error('🚨 ErrorBoundary 详细错误信息:', {
			error,
			errorInfo,
			componentStack: errorInfo.componentStack,
			errorId: this.state.errorId,
			timestamp: new Date().toISOString(),
		})

		this.setState({
			errorInfo,
		})

		// 调用外部错误处理函数
		if (this.props.onError) {
			this.props.onError(error, errorInfo)
		}
	}

	// 重试渲染
	retry = () => {
		if (this.state.retryCount < this.maxRetries) {
			console.log(
				`🔄 ErrorBoundary 重试渲染 (${this.state.retryCount + 1}/${
					this.maxRetries
				})`,
			)
			this.setState({
				hasError: false,
				error: null,
				errorInfo: null,
				retryCount: this.state.retryCount + 1,
				errorId: '',
				timestamp: 0,
			})
		} else {
			console.warn('⚠️ ErrorBoundary 已达到最大重试次数')
		}
	}

	// 重置错误状态
	reset = () => {
		console.log('🔄 ErrorBoundary 重置错误状态')
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: 0,
			errorId: '',
			timestamp: 0,
		})
	}

	render() {
		if (this.state.hasError) {
			// 如果有自定义的 fallback UI，使用它
			if (this.props.fallback) {
				return this.props.fallback
			}

			// 默认的错误 UI
			return (
				<DefaultErrorUI
					error={this.state.error}
					errorInfo={this.state.errorInfo}
					retryCount={this.state.retryCount}
					maxRetries={this.maxRetries}
					errorId={this.state.errorId}
					timestamp={this.state.timestamp}
					level={this.props.level || 'component'}
					title={this.props.title}
					description={this.props.description}
					enableRetry={this.props.enableRetry !== false}
					enableReset={this.props.enableReset !== false}
					onRetry={this.retry}
					onReset={this.reset}
					showErrorDetails={this.props.showErrorDetails}
				/>
			)
		}

		return this.props.children
	}
}

// 默认错误UI组件
interface DefaultErrorUIProps {
	error: Error | null
	errorInfo: ErrorInfo | null
	retryCount: number
	maxRetries: number
	errorId: string
	timestamp: number
	level: 'page' | 'component' | 'critical'
	title?: string
	description?: string
	enableRetry: boolean
	enableReset: boolean
	onRetry: () => void
	onReset: () => void
	showErrorDetails?: boolean
}

function DefaultErrorUI({
	error,
	errorInfo,
	retryCount,
	maxRetries,
	errorId,
	timestamp,
	level,
	title,
	description,
	enableRetry,
	onRetry,
	showErrorDetails = false,
}: DefaultErrorUIProps) {
	const getErrorIcon = () => {
		switch (level) {
			case 'critical':
				return <AlertTriangle size={48} color="#e53e3e" />
			case 'page':
				return <Bug size={48} color="#d69e2e" />
			default:
				return <AlertTriangle size={48} color="#f56565" />
		}
	}

	const getErrorTitle = () => {
		if (title) return title
		switch (level) {
			case 'critical':
				return '系统发生严重错误'
			case 'page':
				return '页面加载失败'
			default:
				return '组件渲染出错'
		}
	}

	const getErrorDescription = () => {
		if (description) return description
		switch (level) {
			case 'critical':
				return '应用遇到了严重错误，建议刷新页面或联系技术支持。'
			case 'page':
				return '页面无法正常加载，请尝试刷新页面或返回首页。'
			default:
				return '页面部分功能出现问题，您可以尝试重新加载或继续使用其他功能。'
		}
	}

	return (
		<Container maxW="2xl" py={8}>
			<VStack gap={6} align="stretch">
				{/* 错误图标和标题 */}
				<VStack gap={4} textAlign="center">
					{getErrorIcon()}
					<VStack gap={2}>
						<Text
							fontSize="xl"
							fontWeight="bold"
							color={level === 'critical' ? 'red.600' : 'red.500'}
						>
							{getErrorTitle()}
						</Text>
						<Text color="gray.600" maxW="md">
							{getErrorDescription()}
						</Text>
					</VStack>
				</VStack>

				{/* 错误统计信息 */}
				<Box p={4} bg="gray.50" borderRadius="md">
					<HStack justify="space-between" wrap="wrap" gap={4}>
						<VStack align="start" gap={1}>
							<Text fontSize="sm" color="gray.600">
								重试次数: {retryCount}/{maxRetries}
							</Text>
							<Text fontSize="sm" color="gray.600">
								错误时间: {new Date(timestamp).toLocaleString()}
							</Text>
						</VStack>
						<VStack align="end" gap={1}>
							<Badge
								colorPalette={
									level === 'critical'
										? 'red'
										: level === 'page'
											? 'orange'
											: 'yellow'
								}
							>
								{level === 'critical'
									? '严重'
									: level === 'page'
										? '页面'
										: '组件'}
							</Badge>
							<Text fontSize="xs" color="gray.500" fontFamily="mono">
								ID: {errorId.slice(-8)}
							</Text>
						</VStack>
					</HStack>
				</Box>

				{/* 操作按钮 */}
				<VStack gap={3}>
					{enableRetry && retryCount < maxRetries && (
						<Button colorPalette="blue" onClick={onRetry} size="lg" w="full">
							<RefreshCw size={16} />
							重试加载 ({maxRetries - retryCount} 次机会)
						</Button>
					)}

					<HStack w="full" gap={3}>
						<Button
							variant="outline"
							onClick={() => window.location.reload()}
							size="lg"
							flex={1}
						>
							<RefreshCw size={16} />
							刷新页面
						</Button>

						<Button
							variant="ghost"
							onClick={() => (window.location.href = '/')}
							size="lg"
							flex={1}
						>
							<Home size={16} />
							返回首页
						</Button>
					</HStack>
				</VStack>

				{/* 错误详情 (开发模式) */}
				{showErrorDetails && error && (
					<Box
						p={4}
						bg="red.50"
						borderRadius="md"
						border="1px solid"
						borderColor="red.200"
					>
						<HStack justify="space-between" mb={3}>
							<Text fontWeight="bold" color="red.700">
								错误详情 (开发模式)
							</Text>
							<Badge colorPalette="red" size="sm">
								DEBUG
							</Badge>
						</HStack>

						<VStack align="stretch" gap={3}>
							<Box>
								<Text
									fontSize="sm"
									fontWeight="semibold"
									color="red.700"
									mb={1}
								>
									错误消息:
								</Text>
								<Text
									fontSize="sm"
									color="red.600"
									fontFamily="mono"
									p={2}
									bg="red.100"
									borderRadius="sm"
								>
									{error.message}
								</Text>
							</Box>

							{error.stack && (
								<Box>
									<Text
										fontSize="sm"
										fontWeight="semibold"
										color="red.700"
										mb={1}
									>
										错误堆栈:
									</Text>
									<Text
										fontSize="xs"
										color="red.500"
										fontFamily="mono"
										whiteSpace="pre-wrap"
										p={2}
										bg="red.100"
										borderRadius="sm"
										maxH="200px"
										overflowY="auto"
									>
										{error.stack}
									</Text>
								</Box>
							)}

							{errorInfo?.componentStack && (
								<Box>
									<Text
										fontSize="sm"
										fontWeight="semibold"
										color="red.700"
										mb={1}
									>
										组件堆栈:
									</Text>
									<Text
										fontSize="xs"
										color="red.500"
										fontFamily="mono"
										whiteSpace="pre-wrap"
										p={2}
										bg="red.100"
										borderRadius="sm"
										maxH="150px"
										overflowY="auto"
									>
										{errorInfo.componentStack}
									</Text>
								</Box>
							)}
						</VStack>
					</Box>
				)}
			</VStack>
		</Container>
	)
}

// 导出的错误边界组件
export function ErrorBoundary(props: Props) {
	return <ErrorBoundaryClass {...props} />
}

// 高阶组件：为组件添加错误边界
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<Props, 'children'>,
) {
	return function WrappedComponent(props: P) {
		return (
			<ErrorBoundary {...errorBoundaryProps}>
				<Component {...props} />
			</ErrorBoundary>
		)
	}
}

// Hook：用于函数组件中的错误处理
export function useErrorHandler() {
	const [error, setError] = useState<Error | null>(null)

	const resetError = useCallback(() => {
		setError(null)
	}, [])

	const handleError = useCallback((error: Error) => {
		setError(error)
		console.error('Error caught by useErrorHandler:', error)
	}, [])

	return {
		error,
		resetError,
		handleError,
		hasError: !!error,
	}
}

// 异步错误处理Hook
export function useAsyncError() {
	const [, setError] = useState()

	return useCallback((error: Error) => {
		setError(() => {
			throw error
		})
	}, [])
}

export default ErrorBoundary
