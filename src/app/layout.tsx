import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
	title: '技术博客 - igCircle Blog',
	description: '技术博客，分享前端、后端等的知识，以及个人经验',
	keywords:
		'博客,文章,技术,前端,后端,JavaScript,TypeScript,Vue,React,Node,MongoDB,MySQL,Docker,Linux,Git',
	authors: [{ name: 'igCircle' }],
	viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="zh-CN">
			<body>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
