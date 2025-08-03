'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NavItem {
	label: string
	href: string
	active?: boolean
}

const Header: React.FC = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const pathname = usePathname()

	const navItems: NavItem[] = [
		{ label: '首页', href: '/' },
		{ label: '文章', href: '/articles' },
		{ label: '分类', href: '/categories' },
		{ label: '标签', href: '/tags' },
		{ label: '归档', href: '/archive' },
		{ label: '关于', href: '/about' },
	]

	// 关闭移动端菜单当路由改变时
	useEffect(() => {
		setIsMenuOpen(false)
	}, [pathname])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(
				searchQuery.trim()
			)}`
		}
	}

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
			<div className='container mx-auto px-4'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo */}
					<Link href='/' className='flex items-center space-x-2'>
						<div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
							<span className='text-white font-bold text-lg'>B</span>
						</div>
						<span className='font-bold text-xl text-gray-900'>
							igCircle Blog
						</span>
					</Link>

					<nav className='hidden md:flex items-center space-x-8'>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'text-sm font-medium transition-colors hover:text-blue-600',
									pathname === item.href ? 'text-blue-600' : 'text-gray-600'
								)}>
								{item.label}
							</Link>
						))}
					</nav>

					{/* 适配手机端 */}
					<div className='flex items-center space-x-4'>
						<div className='relative'>
							{isSearchOpen ? (
								<form onSubmit={handleSearch} className='flex items-center'>
									<input
										type='text'
										placeholder='搜索文章...'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										autoFocus
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => setIsSearchOpen(false)}
										className='ml-2'>
										<X className='w-4 h-4' />
									</Button>
								</form>
							) : (
								<Button
									variant='ghost'
									size='sm'
									onClick={() => setIsSearchOpen(true)}>
									<Search className='w-4 h-4' />
								</Button>
							)}
						</div>

						<Button
							variant='ghost'
							size='sm'
							className='md:hidden'
							onClick={() => setIsMenuOpen(!isMenuOpen)}>
							{isMenuOpen ? (
								<X className='w-5 h-5' />
							) : (
								<Menu className='w-5 h-5' />
							)}
						</Button>
					</div>
				</div>

				{isMenuOpen && (
					<div className='md:hidden border-t bg-white'>
						<nav className='flex flex-col space-y-4 px-4 py-6'>
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'text-base font-medium transition-colors hover:text-blue-600',
										pathname === item.href ? 'text-blue-600' : 'text-gray-600'
									)}>
									{item.label}
								</Link>
							))}

							<form onSubmit={handleSearch} className='pt-4 border-t'>
								<div className='flex space-x-2'>
									<input
										type='text'
										placeholder='搜索文章...'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<Button type='submit' size='sm'>
										搜索
									</Button>
								</div>
							</form>
						</nav>
					</div>
				)}
			</div>
		</header>
	)
}

export default Header
