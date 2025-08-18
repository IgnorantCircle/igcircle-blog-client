'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { Box, Text } from '@chakra-ui/react'
import tocbot from 'tocbot'
import { useSettingsStore } from '@/lib/store'
import './tocbot.scss'

interface TableOfContentsProps {
	content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
	const tocRef = useRef<HTMLDivElement>(null)
	const { theme } = useSettingsStore()
	const isDark = theme === 'dark'

	// tocbot配置
	const getTocbotConfig = useCallback(() => {
		return {
			// 目录容器选择器
			tocSelector: '.js-toc',
			// 内容容器选择器
			contentSelector: '.js-toc-content',
			// 标题选择器
			headingSelector: 'h1, h2, h3, h4, h5, h6',
			// 忽略的标题选择器
			ignoreSelector: '.toc-ignore',
			// 链接类名
			linkClass: 'toc-link',
			// 激活的链接类名
			activeLinkClass: 'is-active-link',
			// 列表类名
			listClass: 'toc-list',
			// 列表项类名
			listItemClass: 'toc-list-item',
			// 激活的列表项类名
			activeListItemClass: 'is-active-li',
			// 可折叠类名
			isCollapsedClass: 'is-collapsed',
			collapsibleClass: 'is-collapsible',
			// 启用折叠功能，默认展开3层
			collapseDepth: 3,
			// 是否包含HTML
			includeHtml: false,
			// 标题偏移量 - 用于固定头部的偏移
			headingsOffset: -80,
			// 平滑滚动
			scrollSmooth: true,
			// 平滑滚动持续时间
			scrollSmoothDuration: 420,
			// 平滑滚动偏移量
			scrollSmoothOffset: -80,
			// 节流时间
			throttleTimeout: 50,
			// 启用哈希更新
			updateUrl: true,
		}
	}, [])

	// 折叠功能处理
	const handleToggleCollapse = useCallback((listItem: HTMLElement) => {
		const subList = listItem.querySelector('.toc-list')
		if (!subList || subList.children.length === 0) return

		listItem.classList.toggle('is-collapsed')
	}, [])

	// 初始化桌面端tocbot
	useEffect(() => {
		const timer = setTimeout(() => {
			// 先销毁之前的实例
			tocbot.destroy()

			// 初始化桌面端目录
			tocbot.init(getTocbotConfig())

			// 添加折叠功能的事件监听
			const tocContainer = document.querySelector('.js-toc')
			if (tocContainer) {
				// 延迟添加事件监听器，确保DOM已渲染
				setTimeout(() => {
					// 获取目录层级深度的辅助函数
					const getDepth = (element: Element): number => {
						let depth = 0
						let current = element.parentElement
						while (current && !current.classList.contains('js-toc')) {
							if (current.classList.contains('toc-list')) {
								depth++
							}
							current = current.parentElement
						}
						return depth
					}

					// 为所有有子列表的项目添加折叠样式和事件
					const listItems = tocContainer.querySelectorAll('.toc-list-item')
					listItems.forEach((listItem) => {
						const subList = listItem.querySelector('.toc-list')
						if (subList && subList.children.length > 0) {
							listItem.classList.add('is-collapsible')

							// 获取当前项目的深度
							const depth = getDepth(listItem)

							// 如果深度大于等于3（第4层及以后），默认折叠
							if (depth >= 3) {
								listItem.classList.add('is-collapsed')
							}

							// 为折叠图标添加点击事件
							const link = listItem.querySelector('.toc-link') as HTMLElement
							if (link) {
								// 创建折叠图标元素
								let collapseIcon = link.querySelector(
									'.collapse-icon',
								) as HTMLElement
								if (!collapseIcon) {
									collapseIcon = document.createElement('span')
									collapseIcon.className = 'collapse-icon'
									collapseIcon.innerHTML = '▼'
									collapseIcon.style.cssText = `
										position: absolute;
										left: -12px;
										top: 50%;
										transform: translateY(-50%);
										font-size: 10px;
										color: var(--chakra-colors-gray-400);
										transition: transform 0.2s ease;
										cursor: pointer;
										z-index: 10;
									`
									link.style.position = 'relative'
									link.appendChild(collapseIcon)
								}

								// 设置初始图标状态
								if (listItem.classList.contains('is-collapsed')) {
									;(collapseIcon as HTMLElement).style.transform =
										'translateY(-50%) rotate(-90deg)'
								} else {
									;(collapseIcon as HTMLElement).style.transform =
										'translateY(-50%)'
								}

								// 为折叠图标添加点击事件
								collapseIcon.addEventListener('click', (e) => {
									e.preventDefault()
									e.stopPropagation()
									handleToggleCollapse(listItem as HTMLElement)

									// 更新图标状态
									if (listItem.classList.contains('is-collapsed')) {
										;(collapseIcon as HTMLElement).style.transform =
											'translateY(-50%) rotate(-90deg)'
									} else {
										;(collapseIcon as HTMLElement).style.transform =
											'translateY(-50%)'
									}
								})
							}
						}
					})
				}, 300)
			}
		}, 100)

		return () => {
			clearTimeout(timer)
			tocbot.destroy()
		}
	}, [content, getTocbotConfig, handleToggleCollapse])

	// 主题变化时刷新
	useEffect(() => {
		const timer = setTimeout(() => {
			tocbot.refresh()
		}, 100)
		return () => clearTimeout(timer)
	}, [isDark])

	// 检查是否有标题内容
	const hasHeadings = content.match(/^#{1,6}\s+.+$/gm)

	if (!hasHeadings || hasHeadings.length === 0) {
		return null
	}

	return (
		<Box
			position="sticky"
			top={20}
			w="280px"
			maxH="calc(100vh - 120px)"
			overflowY="auto"
			bg={{ base: 'white', _dark: 'gray.800' }}
			border="1px solid"
			borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
			borderRadius="lg"
			p={4}
			boxShadow="sm"
		>
			<Text
				fontWeight="bold"
				mb={4}
				color={{ base: 'gray.900', _dark: 'white' }}
			>
				目录
			</Text>
			<div className="js-toc" ref={tocRef}></div>
		</Box>
	)
}
