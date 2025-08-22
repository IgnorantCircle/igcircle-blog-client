'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Node } from 'unist'
import { ComponentPropsWithoutRef } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
	atomOneDark,
	atomOneLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Box } from '@chakra-ui/react'
import { useSettingsStore } from '@/lib/store'
import CodeCopyButton from './CodeCopyButton'
import CustomContainer from './CustomContainer'
import { preprocessCustomContainers } from './utils'
import './syntax-highlighter.scss'

// 统一导入语言
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import shell from 'react-syntax-highlighter/dist/esm/languages/hljs/shell'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown'

// 语言映射配置
const languageMap: Record<string, string> = {
	javascript,
	typescript,
	python,
	java,
	css,
	html,
	json,
	bash,
	shell,
	sql,
	markdown,
}

// 语言别名映射
const languageAliases: Record<string, string[]> = {
	javascript: ['js', 'jsx'],
	typescript: ['ts', 'tsx'],
	html: ['xml'],
	shell: ['sh'],
}

// 统一注册语言
Object.entries(languageMap).forEach(([name, language]) => {
	SyntaxHighlighter.registerLanguage(name, language)

	// 注册别名
	if (languageAliases[name]) {
		languageAliases[name].forEach((alias: string) => {
			SyntaxHighlighter.registerLanguage(alias, language)
		})
	}
})

interface MarkdownRendererProps {
	source: string
	style?: React.CSSProperties
	className?: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
	source,
	style,
}) => {
	// 使用Chakra UI主题系统
	const { theme } = useSettingsStore()
	const isDark = theme === 'dark'

	// 预处理源码 - 使用 useMemo 优化
	const processedSource = useMemo(() => {
		return preprocessCustomContainers(source)
	}, [source])

	// 提取所有标题并生成ID映射 - 使用 useMemo 优化
	const headings = useMemo(() => {
		const headingRegex = /^(#{1,6})\s+(.+)$/gm
		const result: Array<{ level: number; text: string; id: string }> = []
		let match
		let headingCounter = 0

		while ((match = headingRegex.exec(processedSource)) !== null) {
			headingCounter++
			const level = match[1].length
			const text = match[2].trim()
			const id = `heading-${headingCounter}`
			result.push({ level, text, id })
		}
		return result
	}, [processedSource])

	// 创建标题文本到ID的映射 - 使用 useMemo 优化
	const getHeadingId = useMemo(() => {
		return (children: React.ReactNode): string => {
			const text =
				typeof children === 'string'
					? children
					: Array.isArray(children)
						? children.join('')
						: children?.toString() || ''

			const heading = headings.find((h) => h.text === text.trim())
			return heading
				? heading.id
				: `heading-${Math.random().toString(36).substr(2, 9)}`
		}
	}, [headings])

	const handleImageClick = (src: string, alt: string) => {
		// 打开一个空白新窗口
		const newWindow = window.open('', 'ImagePreview', 'width=800,height=600')

		if (newWindow) {
			// 在新窗口中写入HTML，嵌入图片
			newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>图片预览</title>
            <style>
              body { margin: 0; padding: 20px; background: #f0f0f0; }
              .preview-container { display: flex; justify-content: center; align-items: center; height: 90vh; }
              img { max-width: 100%; max-height: 100%; box-shadow: 0 0 20px rgba(0,0,0,0.2); }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <img src="${src}" alt="${alt || '预览图片'}" />
            </div>
          </body>
        </html>
      `)
			newWindow.document.close() // 完成文档写入
		}
	}
	return (
		<Box
			style={style}
			color="chakra-body-text"
			bg="chakra-body-bg"
			className="js-toc-content"
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					// 标题组件 - 添加ID以支持目录跳转
					h1: ({ children, ...props }) => (
						<h1 className="heading-1" id={getHeadingId(children)} {...props}>
							{children}
							<div className="heading-underline"></div>
						</h1>
					),
					h2: ({ children, ...props }) => (
						<h2 className="heading-2" id={getHeadingId(children)} {...props}>
							{children}
						</h2>
					),
					h3: ({ children, ...props }) => (
						<h3 className="heading-3" id={getHeadingId(children)} {...props}>
							{children}
						</h3>
					),
					h4: ({ children, ...props }) => (
						<h4 className="heading-4" id={getHeadingId(children)} {...props}>
							{children}
						</h4>
					),
					h5: ({ children, ...props }) => (
						<h5 className="heading-5" id={getHeadingId(children)} {...props}>
							{children}
						</h5>
					),
					h6: ({ children, ...props }) => (
						<h6 className="heading-6" id={getHeadingId(children)} {...props}>
							{children}
						</h6>
					),
					// 段落 - 优化文本展示，处理图片容器
					p: ({ children, ...props }) => {
						// 检查是否只包含图片
						const hasOnlyImage =
							React.Children.count(children) === 1 &&
							React.Children.toArray(children).every(
								(child) => React.isValidElement(child) && child.type === 'img',
							)

						if (hasOnlyImage) {
							// 如果段落只包含图片，使用div容器
							return <div className="image-container">{children}</div>
						}

						return (
							<p className="paragraph" {...props}>
								{children}
							</p>
						)
					},
					// 引用块
					blockquote: ({ children, ...props }) => (
						<blockquote className="blockquote" {...props}>
							<div className="blockquote-content">{children}</div>
						</blockquote>
					),
					// 列表
					ul: ({ children, ...props }) => (
						<ul className="list-unordered" {...props}>
							{children}
						</ul>
					),
					ol: ({ children, ...props }) => (
						<ol className="list-ordered" {...props}>
							{children}
						</ol>
					),
					li: ({ children, ...props }) => (
						<li className="list-item" {...props}>
							<span className="list-item-content">{children}</span>
						</li>
					),
					// 链接
					a: ({ children, href, ...props }) => (
						<a
							href={href}
							className="link"
							{...props}
							target="_blank"
							rel="noopener noreferrer"
						>
							{children}
						</a>
					),
					// 表格
					table: ({ children, ...props }) => (
						<div
							className="table-wrapper"
							style={{
								overflowX: 'auto',
								WebkitOverflowScrolling: 'touch',
								border: '1px solid var(--chakra-colors-gray-200)',
								borderRadius: '8px',
							}}
						>
							<table className="table" style={{ minWidth: '100%' }} {...props}>
								{children}
							</table>
						</div>
					),
					thead: ({ children, ...props }) => (
						<thead className="table-head" {...props}>
							{children}
						</thead>
					),
					th: ({ children, ...props }) => (
						<th className="table-header" {...props}>
							{children}
						</th>
					),
					td: ({ children, ...props }) => (
						<td className="table-cell" {...props}>
							{children}
						</td>
					),
					// 水平线 - 更有设计感
					hr: ({ ...props }) => (
						<div className="divider" {...props}>
							<div className="divider-line"></div>
							<div className="divider-symbol">✦</div>
							<div className="divider-line"></div>
						</div>
					),
					// 图片 - 避免HTML嵌套问题
					img: ({ src, alt, ...props }) => (
						<img
							src={src}
							alt={alt}
							className="image"
							{...props}
							onClick={() => handleImageClick(src as string, alt as string)}
						/>
					),
					// 代码块和内联代码
					code({
						className,
						children,
						...props
					}: ComponentPropsWithoutRef<'code'> & {
						'data-title'?: string
						title?: string
					}) {
						const match = /language-(\w+)/.exec(className || '')
						const language = match ? match[1] : 'text'
						let codeContent = String(children).replace(/\n$/, '')
						// 代码块（有语言标识，如 ```javascript）
						const inline = !className?.startsWith('language-')
						// 内联代码
						if (inline) {
							return (
								<code
									className="inline-code"
									style={{
										wordBreak: 'break-word',
										overflowWrap: 'break-word',
									}}
									{...props}
								>
									{children}
								</code>
							)
						}

						// 从 props 中提取代码标题，优先使用 data-title
						let codeTitle =
							props['data-title'] || (props as { title?: string }).title || ''

						// 检查代码内容中是否有特殊注释格式的标题
						const titleCommentMatch = codeContent.match(
							/^<!--\s*BLOCK_TITLE:\s*([^>]+)\s*-->\s*\n?/,
						)
						if (titleCommentMatch) {
							codeTitle = titleCommentMatch[1].trim()
							// 从代码内容中移除标题注释
							codeContent = codeContent.replace(
								/^<!--\s*BLOCK_TITLE:\s*[^>]+\s*-->\s*\n?/,
								'',
							)
						}

						// 如果没有标题，尝试从代码内容中提取 [title] 格式的标题
						if (!codeTitle) {
							const titleMatch = codeContent.match(/^\s*\[([^\]]+)\]\s*$/m)
							if (titleMatch) {
								codeTitle = titleMatch[1]
								// 从代码内容中移除标题行
								codeContent = codeContent.replace(/^\s*\[([^\]]+)\]\s*\n?/m, '')
							}
						}

						// 代码块
						return (
							<div className="code-block">
								{/* 代码块头部 */}
								<div className="code-header">
									<div className="code-controls">
										<div className="code-dots">
											<div className="dot dot-red"></div>
											<div className="dot dot-yellow"></div>
											<div className="dot dot-green"></div>
										</div>
										<div className="code-info">
											<span className="code-language">{language}</span>
											{codeTitle && (
												<span className="code-title">{codeTitle}</span>
											)}
										</div>
									</div>
									<CodeCopyButton code={codeContent} />
								</div>
								{/* 代码内容 */}
								<div
									className="code-content"
									style={{
										overflowX: 'auto',
										maxWidth: '100%',
										WebkitOverflowScrolling: 'touch',
									}}
								>
									<SyntaxHighlighter
										language={language}
										style={isDark ? atomOneDark : atomOneLight}
										showLineNumbers={true}
										useInlineStyles={false}
										customStyle={{
											margin: 0,
											padding: '1.5rem',
											background: 'transparent',
											fontSize: '0.875rem',
											lineHeight: '1.4',
											borderRadius: 0,
											whiteSpace: 'pre-wrap',
											overflowX: 'auto',
											overflowY: 'auto',
											wordBreak: 'normal',
											overflowWrap: 'normal',
											maxWidth: '100%',
										}}
										lineNumberStyle={{
											minWidth: '3em',
											paddingRight: '1em',
											color: 'var(--text-muted)',
											textAlign: 'right',
											userSelect: 'none',
										}}
										className="syntax-highlighter"
									>
										{codeContent}
									</SyntaxHighlighter>
								</div>
							</div>
						)
					},
					// 处理自定义容器指令
					div({
						className,
						children,
						...props
					}: React.HTMLAttributes<HTMLDivElement> & {
						node?: Node
						'data-title'?: string
					}) {
						if (className && className.includes('custom-container')) {
							const typeMatch = className.match(/custom-container-([\w-]+)/)
							if (typeMatch) {
								const type = typeMatch[1]
								const title = (props['data-title'] as string) || undefined

								// 如果是iframe容器，直接渲染内容
								if (type === 'iframe') {
									return <div className="iframe-container">{children}</div>
								}

								return (
									<CustomContainer type={type} title={title}>
										{children}
									</CustomContainer>
								)
							}
						}

						// 默认div渲染
						return (
							<div className={className} {...props}>
								{children}
							</div>
						)
					},
				}}
			>
				{processedSource}
			</ReactMarkdown>
		</Box>
	)
}

export default MarkdownRenderer
