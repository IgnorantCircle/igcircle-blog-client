// URL安全性验证
export function isValidAndSafeUrl(url: string): boolean {
	try {
		const urlObj = new URL(url)

		// 只允许 http 和 https 协议
		if (!['https:'].includes(urlObj.protocol)) {
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

// 确保内容前后有适当的空行，以便ReactMarkdown正确解析
function ensureProperSpacing(content: string): string {
	if (!content) return content

	let result = content.trim()

	// 处理内容中的多个代码块之间的间距
	result = result.replace(
		/(```[\s\S]*?```)(\s*)(```)/g,
		(match, firstBlock, spacing, secondBlockStart) => {
			// 确保代码块之间至少有一个空行
			const hasEmptyLine = /\n\s*\n/.test(spacing)
			return hasEmptyLine ? match : `${firstBlock}\n\n${secondBlockStart}`
		},
	)

	// 如果内容只包含代码块（没有其他文本），确保代码块能正确解析
	const isOnlyCodeBlocks = /^\s*```[\s\S]*```\s*$/.test(result)
	if (isOnlyCodeBlocks) {
		// 对于只包含代码块的情况，确保代码块前后有换行
		result = result.replace(/^(\s*```)/gm, '\n$1')
		result = result.replace(/(```\s*)$/gm, '$1\n')
		result = result.trim()
	}

	return result
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
			// 确保代码块前后有空行，以便正确解析
			const processedContent = ensureProperSpacing(content.trim())
			return `<div class="custom-container custom-container-code-group" data-type="code-group"${titleAttr}>

${processedContent}

</div>`
		} else if (type === 'detail') {
			// 处理详情容器
			const titleAttr = title ? ` data-title="${escapeHtml(title)}"` : ''
			// 确保内容前后有空行，以便正确解析
			const processedContent = ensureProperSpacing(content.trim())
			return `<div class="custom-container custom-container-detail" data-type="detail"${titleAttr}>

${processedContent}

</div>`
		} else {
			// 处理其他容器 - 关键修复：检查内容是否只包含代码块
			const titleAttr = title ? ` data-title="${escapeHtml(title)}"` : ''
			const trimmedContent = content.trim()

			// 检查内容是否只包含一个代码块（没有其他文本）
			const isOnlyCodeBlock = /^\s*```[\w]*\s*\n[\s\S]*?\n\s*```\s*$/.test(
				trimmedContent,
			)

			if (isOnlyCodeBlock) {
				// 如果只包含代码块，将其提取出来单独处理
				const codeBlockMatch = trimmedContent.match(
					/^\s*```([\w]*)\s*\n([\s\S]*?)\n\s*```\s*$/,
				)
				if (codeBlockMatch) {
					const [, language, code] = codeBlockMatch
					// 使用特殊的标记，让ReactMarkdown知道这是一个预处理的代码块
					return `<div class="custom-container custom-container-${type}" data-type="${type}"${titleAttr}>

\`\`\`${language}
${code}
\`\`\`

</div>`
				}
			}

			// 对于包含其他内容的情况，正常处理
			const processedContent = ensureProperSpacing(trimmedContent)
			return `<div class="custom-container custom-container-${type}" data-type="${type}"${titleAttr}>

${processedContent}

</div>`
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
