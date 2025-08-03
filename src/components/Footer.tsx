import React from 'react'
import Link from 'next/link'
import { Github, Mail, Rss } from 'lucide-react'

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear()

	const footerLinks = {
		blog: [
			{ label: '最新文章', href: '/articles' },
			{ label: '热门文章', href: '/articles?sort=popular' },
			{ label: '文章归档', href: '/archive' },
			{ label: 'RSS订阅', href: '/rss.xml' },
		],
		categories: [
			{ label: '技术分享', href: '/categories/tech' },
			{ label: '生活随笔', href: '/categories/life' },
			{ label: '学习笔记', href: '/categories/notes' },
			{ label: '项目经验', href: '/categories/projects' },
		],
		about: [
			{ label: '关于我们', href: '/about' },
			{ label: '联系方式', href: '/contact' },
			{ label: '友情链接', href: '/links' },
			{ label: '网站地图', href: '/sitemap' },
		],
	}

	const socialLinks = [
		{
			name: 'GitHub',
			href: 'https://github.com',
			icon: Github,
		},
		{
			name: 'Email',
			href: 'mailto:contact@example.com',
			icon: Mail,
		},
		{
			name: 'RSS',
			href: '/rss.xml',
			icon: Rss,
		},
	]

	return (
		<footer className='bg-gray-50 border-t'>
			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{/* 网站信息 */}
					<div className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>B</span>
							</div>
							<span className='font-bold text-xl text-gray-900'>
								igCircle Blog
							</span>
						</div>
						<p className='text-gray-600 text-sm leading-relaxed'>
							知识就像一个圆，你知道的越多，你不知道的就越多。
						</p>
						<div className='flex space-x-4'>
							{socialLinks.map((social) => {
								const Icon = social.icon
								return (
									<Link
										key={social.name}
										href={social.href}
										className='text-gray-400 hover:text-blue-600 transition-colors'
										target={
											social.href.startsWith('http') ? '_blank' : undefined
										}
										rel={
											social.href.startsWith('http')
												? 'noopener noreferrer'
												: undefined
										}>
										<Icon className='w-5 h-5' />
										<span className='sr-only'>{social.name}</span>
									</Link>
								)
							})}
						</div>
					</div>

					{/* 博客导航 */}
					<div>
						<h3 className='font-semibold text-gray-900 mb-4'>博客</h3>
						<ul className='space-y-2'>
							{footerLinks.blog.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className='text-gray-600 hover:text-blue-600 transition-colors text-sm'>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* 分类导航 */}
					<div>
						<h3 className='font-semibold text-gray-900 mb-4'>分类</h3>
						<ul className='space-y-2'>
							{footerLinks.categories.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className='text-gray-600 hover:text-blue-600 transition-colors text-sm'>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* 关于导航 */}
					<div>
						<h3 className='font-semibold text-gray-900 mb-4'>关于</h3>
						<ul className='space-y-2'>
							{footerLinks.about.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className='text-gray-600 hover:text-blue-600 transition-colors text-sm'>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* 底部版权信息 */}
				<div className='mt-12 pt-8 border-t border-gray-200'>
					<div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
						<div className='text-sm text-gray-600'>
							© {currentYear} igCircle Blog. All rights reserved.
						</div>
						<div className='flex space-x-6 text-sm text-gray-600'>
							<Link
								href='/privacy'
								className='hover:text-blue-600 transition-colors'>
								隐私政策
							</Link>
							<Link
								href='/terms'
								className='hover:text-blue-600 transition-colors'>
								使用条款
							</Link>
							<Link
								href='/sitemap'
								className='hover:text-blue-600 transition-colors'>
								网站地图
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
