// URL安全性验证
export function isValidAndSafeUrl(url: string): boolean {
	try {
		const urlObj = new URL(url)

		// 只允许 http 和 https 协议
		if (!['http:', 'https:'].includes(urlObj.protocol)) {
			return false
		}

		// 检查是否为可信域名（可以根据需要扩展）
		const trustedDomains = [
			'codepen.io',
			'codesandbox.io',
			'stackblitz.com',
			'jsfiddle.net',
			'github.com',
			'gist.github.com',
		]

		const hostname = urlObj.hostname.toLowerCase()
		const isAllowed = trustedDomains.some(
			(domain) => hostname === domain || hostname.endsWith('.' + domain),
		)

		return isAllowed
	} catch (error) {
		console.error('URL验证失败:', error)
		return false
	}
}

// HTML转义函数
export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

// 预处理自定义容器
export function preprocessCustomContainers(markdown: string): string {
	// 匹配 ::: type 到 ::: 的模式（包括iframe）
	let result = markdown

	// 处理普通容器
	const containerRegex = /:::\s*([\w-]+)(?:\s*\[([^\]]+)])?\s*([\s\S]*?)\n?:::/g

	result = result.replace(containerRegex, (match, type, title, content) => {
		if (type === 'iframe') {
			// 处理iframe
			const url = content.trim()

			// 验证URL安全性
			if (!isValidAndSafeUrl(url)) {
				console.warn('Unsafe or invalid iframe URL blocked:', url)
				return `<div class="custom-container custom-container-error" data-type="error">
					<p><strong>⚠️ 不安全的iframe链接</strong></p>
					<p>出于安全考虑，此链接已被阻止：<code>${escapeHtml(url)}</code></p>
					<p>只允许来自可信域名的iframe内容。</p>
				</div>`
			}

			// 转义URL以防止XSS
			const safeUrl = escapeHtml(url)
			return `<div class="iframe-container" data-type="iframe">
				<iframe 
					src="${safeUrl}" 
					width="100%" 
					height="400" 
					frameborder="0" 
					allowfullscreen
					sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
					loading="lazy"
					title="嵌入内容">
				</iframe>
			</div>`
		} else if (type === 'code-group') {
			// 处理代码组容器 - 保持代码块语法不变，只添加容器
			const titleAttr = title ? ` data-title="${escapeHtml(title)}"` : ''
			return `<div class="custom-container custom-container-code-group" data-type="code-group"${titleAttr}>

${content}

</div>`
		} else if (type === 'detail') {
			// 处理详情容器
			const titleAttr = title ? ` data-title="${escapeHtml(title)}"` : ''
			return `<div class="custom-container custom-container-detail" data-type="detail"${titleAttr}>${content}</div>`
		} else {
			// 处理其他容器
			const titleAttr = title ? ` data-title="${escapeHtml(title)}"` : ''
			const safeContent = content // 内容由ReactMarkdown处理，这里不需要转义
			return `<div class="custom-container custom-container-${type}" data-type="${type}"${titleAttr}>${safeContent}</div>`
		}
	})

	// 处理普通代码块标题 - 将 ```lang [title] 转换为特殊注释格式
	result = result.replace(
		/```(\w+)\s*\[([^\]]+)\]/g,
		(match: string, lang: string, blockTitle: string) => {
			// 使用特殊注释格式来传递标题信息
			return `\`\`\`${lang}\n<!-- BLOCK_TITLE: ${escapeHtml(blockTitle)} -->`
		},
	)

	// 处理代码组内的代码块标题 - 将代码块内的 [title] 行转换为 data-title 属性
	result = result.replace(
		/(```\w+[^\n]*\n)\s*\[([^\]]+)\]\s*\n/g,
		(match: string, codeStart: string, blockTitle: string) => {
			return codeStart.replace(
				'```',
				`\`\`\` data-title="${escapeHtml(blockTitle)}"`,
			)
		},
	)

	return result
}
