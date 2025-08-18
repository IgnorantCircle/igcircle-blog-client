'use client'

import React from 'react'
import CodeGroup from './CodeGroup'
import DetailContainer from './DetailContainer'

interface CustomContainerProps {
	type: string
	title?: string
	children: React.ReactNode
}

const CustomContainer: React.FC<CustomContainerProps> = ({
	type,
	title,
	children,
}) => {
	// 根据类型设置图标和样式
	const getContainerConfig = (containerType: string) => {
		switch (containerType) {
			case 'tip':
				return { icon: '💡', label: '提示' }
			case 'warning':
				return { icon: '⚠️', label: '警告' }
			case 'danger':
				return { icon: '🚨', label: '危险' }
			case 'info':
				return { icon: 'ℹ️', label: '信息' }
			case 'note':
				return { icon: '📝', label: '注意' }
			case 'success':
				return { icon: '✅', label: '成功' }
			case 'error':
				return { icon: '❌', label: '错误' }
			case 'code-group':
				return { icon: '📦', label: '代码组' }
			case 'detail':
				return { icon: '📋', label: '详情' }
			default:
				return { icon: '📄', label: '容器' }
		}
	}

	const config = getContainerConfig(type)

	// 特殊处理代码组和详情容器
	if (type === 'code-group') {
		return <CodeGroup title={title}>{children}</CodeGroup>
	}

	if (type === 'detail') {
		return <DetailContainer title={title}>{children}</DetailContainer>
	}

	return (
		<div className={`custom-container container-${type}`} data-type={type}>
			<div className="container-header">
				<span className="container-icon">{config.icon}</span>
				<span className="container-title">{title || config.label}</span>
			</div>
			<div className="container-content">{children}</div>
		</div>
	)
}

export default CustomContainer
