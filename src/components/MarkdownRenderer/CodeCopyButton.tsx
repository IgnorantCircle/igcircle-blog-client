'use client'

import React, { useState } from 'react'
import { IconButton } from '@chakra-ui/react'
import { Copy, Check } from 'lucide-react'
import { handleGlobalError } from '@/lib/error-handler'

interface CodeCopyButtonProps {
	code: string
}

const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ code }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			handleGlobalError(error, 'CodeCopyButton - 复制代码')
			// 降级方案
			const textArea = document.createElement('textarea')
			textArea.value = code
			document.body.appendChild(textArea)
			textArea.select()
			try {
				document.execCommand('copy')
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			} finally {
				document.body.removeChild(textArea)
			}
		}
	}

	return (
		<IconButton
			aria-label={copied ? 'Copied!' : 'Copy code'}
			size="sm"
			variant="ghost"
			onClick={handleCopy}
			className="copy-icon"
		>
			{copied ? <Check size={16} /> : <Copy size={16} />}
		</IconButton>
	)
}

export default CodeCopyButton