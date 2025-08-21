'use client'

import {
	Box,
	Flex,
	Text,
	Button,
	Container,
	Stack,
	IconButton,
	Menu,
	Input,
	InputGroup,
	HStack,
} from '@chakra-ui/react'
import {
	Moon,
	Sun,
	Menu as MenuIcon,
	User,
	Settings,
	LogOut,
	UserCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSettingsStore, useAuthStore } from '@/lib/store'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { LuSearch } from 'react-icons/lu'

export function Header() {
	const router = useRouter()
	const pathname = usePathname()
	const [searchQuery, setSearchQuery] = useState('')
	const { theme, setTheme } = useSettingsStore()
	const { isAuthenticated, user, logout } = useAuthStore()

	// 安全地获取 AuthModal context，避免服务端渲染错误
	let openModal: ((tab: 'login' | 'register') => void) | undefined
	try {
		const authModal = useAuthModal()
		openModal = authModal.openModal
	} catch (error) {
		// 在服务端渲染或 Provider 未初始化时，使用路由跳转作为后备
		openModal = (tab: 'login' | 'register') => {
			router.push(tab === 'login' ? '/login' : '/register')
		}
	}

	// 主题切换处理函数：只在亮色和暗色之间切换
	const handleThemeToggle = () => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	// 获取当前主题图标
	const getThemeIcon = () => {
		return theme === 'light' ? <Sun size={20} /> : <Moon size={20} />
	}

	// 获取主题提示文本
	const getThemeLabel = () => {
		return theme === 'light' ? '切换到暗色主题' : '切换到亮色主题'
	}

	// 检查当前路径是否激活
	const isActiveRoute = (path: string) => {
		if (path === '/') {
			return pathname === '/'
		}
		return pathname.startsWith(path)
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(
				`/articles?keyword=${encodeURIComponent(
					searchQuery.trim(),
				)}&searchMode=title`,
			)
		}
	}

	return (
		<Box
			as="header"
			bg={{ base: 'white', _dark: 'gray.800' }}
			borderBottom="1px"
			borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
			position="sticky"
			top={0}
			zIndex={1000}
			shadow="sm"
		>
			<Container maxW="15xl" py={4}>
				<Flex align="center" justify="space-between">
					<Box asChild>
						<Link href="/">
							<Text
								fontSize="2xl"
								fontWeight="bold"
								color="blue.500"
								_hover={{ color: 'blue.600' }}
								transition="color 0.2s"
							>
								igCircle Blog
							</Text>
						</Link>
					</Box>

					<Stack direction="row" gap={8} display={{ base: 'none', md: 'flex' }}>
						<Box asChild>
							<Link href="/">
								<Text
									color={isActiveRoute('/') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={isActiveRoute('/') ? 'semibold' : 'medium'}
								>
									首页
								</Text>
							</Link>
						</Box>
						<Box asChild>
							<Link href="/articles">
								<Text
									color={isActiveRoute('/articles') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={
										isActiveRoute('/articles') ? 'semibold' : 'medium'
									}
								>
									文章
								</Text>
							</Link>
						</Box>
						<Box asChild>
							<Link href="/categories">
								<Text
									color={isActiveRoute('/categories') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={
										isActiveRoute('/categories') ? 'semibold' : 'medium'
									}
								>
									分类
								</Text>
							</Link>
						</Box>
						<Box asChild>
							<Link href="/tags">
								<Text
									color={isActiveRoute('/tags') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={isActiveRoute('/tags') ? 'semibold' : 'medium'}
								>
									标签
								</Text>
							</Link>
						</Box>
						<Box asChild>
							<Link href="/archive">
								<Text
									color={isActiveRoute('/archive') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={isActiveRoute('/archive') ? 'semibold' : 'medium'}
								>
									归档
								</Text>
							</Link>
						</Box>
						<Box asChild>
							<Link href="/about#projects">
								<Text
									color={isActiveRoute('/archive') ? 'blue.500' : 'inherit'}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									fontWeight={isActiveRoute('/archive') ? 'semibold' : 'medium'}
								>
									查看项目
								</Text>
							</Link>
						</Box>
					</Stack>

					<Stack direction="row" gap={4}>
						<HStack
							as="form"
							onSubmit={handleSearch}
							display={{ base: 'none', md: 'flex' }}
							gap={2}
						>
							{/* 搜索输入框 */}
							<InputGroup maxW="220px" startElement={<LuSearch />}>
								<Input
									placeholder="搜索文章..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									bg={{ base: 'gray.50', _dark: 'gray.700' }}
									border="none"
									_focus={{
										bg: { base: 'white', _dark: 'gray.600' },
										borderColor: 'blue.500',
										boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
									}}
								/>
							</InputGroup>
						</HStack>

						{isAuthenticated ? (
							<Menu.Root>
								<Menu.Trigger asChild>
									<Button
										variant="ghost"
										size="sm"
										display={{ base: 'none', md: 'flex' }}
										gap={2}
									>
										<UserCircle size={16} />
										{user?.username}
									</Button>
								</Menu.Trigger>
								<Menu.Positioner>
									<Menu.Content>
										<Menu.Item value="profile" asChild>
											<Link href="/profile">
												<UserCircle size={16} />
												个人资料
											</Link>
										</Menu.Item>
										<Menu.Item value="settings" asChild>
											<Link href="/profile/settings">
												<Settings size={16} />
												设置
											</Link>
										</Menu.Item>
										<Menu.Separator />
										<Menu.Item value="logout" onClick={logout}>
											<LogOut size={16} />
											退出登录
										</Menu.Item>
									</Menu.Content>
								</Menu.Positioner>
							</Menu.Root>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={() => openModal?.('login')}
								display={{ base: 'none', md: 'flex' }}
							>
								<User size={16} />
								登录
							</Button>
						)}

						<IconButton
							aria-label={getThemeLabel()}
							variant="ghost"
							size="md"
							onClick={handleThemeToggle}
							className="theme-toggle"
							_hover={{
								bg: { base: 'gray.100', _dark: 'gray.700' },
							}}
						>
							{getThemeIcon()}
						</IconButton>

						{/* 移动端 */}
						<Menu.Root>
							<Menu.Trigger asChild>
								<IconButton
									aria-label="菜单"
									variant="ghost"
									display={{ base: 'flex', md: 'none' }}
								>
									<MenuIcon size={20} />
								</IconButton>
							</Menu.Trigger>
							<Menu.Positioner>
								<Menu.Content>
									<Menu.Item value="home" asChild>
										<Link href="/">首页</Link>
									</Menu.Item>
									<Menu.Item value="articles" asChild>
										<Link href="/articles">文章</Link>
									</Menu.Item>
									<Menu.Item value="categories" asChild>
										<Link href="/categories">分类</Link>
									</Menu.Item>
									<Menu.Item value="tags" asChild>
										<Link href="/tags">标签</Link>
									</Menu.Item>
									<Menu.Item value="archive" asChild>
										<Link href="/archive">归档</Link>
									</Menu.Item>
									<Menu.Item value="search" asChild>
										<Link href="/search">搜索</Link>
									</Menu.Item>

									{isAuthenticated ? (
										<Menu.Item value="logout" onClick={logout}>
											退出 ({user?.username})
										</Menu.Item>
									) : (
										<Menu.Item
											value="login"
											onClick={() => openModal?.('login')}
										>
											登录
										</Menu.Item>
									)}
								</Menu.Content>
							</Menu.Positioner>
						</Menu.Root>
					</Stack>
				</Flex>
			</Container>
		</Box>
	)
}
