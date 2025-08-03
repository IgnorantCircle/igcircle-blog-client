import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'igCircle Blog - 技术分享与学习成长',
	description: '知识就像一个圆，你知道的越多，你不知道的就越多',
	keywords: '无知的圆,igCricle,技术博客,编程,开发,前端,后端,全栈',
	authors: [{ name: 'igCircle' }],
	viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='zh-CN'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
				<Header />
				<main className='flex-1'>{children}</main>
				<Footer />
			</body>
		</html>
	)
}
