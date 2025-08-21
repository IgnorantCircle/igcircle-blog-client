import { Box, Container, Flex, Text, Stack, Separator } from '@chakra-ui/react'
import Link from 'next/link'

export function Footer() {
	const categories = [
		{
			id: '5d856252-ce85-4181-a5db-3980f17356d3',
			name: '前端开发',
		},
		{
			id: '0747c5e7-6c58-4816-9898-b42ce4639cf2',
			name: '后端开发',
		},
		{
			id: '43179624-4a48-48d9-941e-f03023e0957b',
			name: '面试技巧',
		},
		{
			id: '6d916387-c539-4ecc-b73a-15efe0005aed',
			name: '算法技巧',
		},
	]

	const navLinks = [
		{
			link: '/',
			name: '首页',
		},
		{
			link: '/articles',
			name: '文章列表',
		},
		{
			link: '/categories',
			name: '分类目录',
		},
		{
			link: '/tags',
			name: '标签云',
		},
		{
			link: '/about',
			name: '关于本站',
		},
	]

	return (
		<Box
			as="footer"
			bg={{ base: 'gray.100', _dark: 'gray.900' }}
			borderTop="1px"
			borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
			mt="auto"
		>
			<Container maxW="7xl" py={8}>
				<Stack gap={8}>
					<Flex
						direction={{ base: 'column', md: 'row' }}
						justify="space-between"
						align={{ base: 'center', md: 'flex-start' }}
						gap={8}
					>
						<Stack gap={4} align={{ base: 'center', md: 'flex-start' }}>
							<Text fontSize="xl" fontWeight="bold" color="blue.500">
								igCircle Blog
							</Text>
							<Text
								color={{ base: 'gray.600', _dark: 'gray.400' }}
								maxW="300px"
								textAlign={{ base: 'center', md: 'left' }}
							>
								知识就像一个圆，你知道的越多，你不知道的就越多
							</Text>
						</Stack>

						<Stack gap={4} align={{ base: 'center', md: 'flex-start' }}>
							<Text
								fontWeight="semibold"
								color={{ base: 'gray.900', _dark: 'white' }}
							>
								快速导航
							</Text>
							<Stack gap={2} align={{ base: 'center', md: 'flex-start' }}>
								{navLinks.map((item, name) => (
									<Box asChild key={name}>
										<Link href={item.link}>
											<Text
												color={{ base: 'gray.600', _dark: 'gray.400' }}
												_hover={{ color: 'blue.500' }}
												transition="color 0.2s"
											>
												{item.name}
											</Text>
										</Link>
									</Box>
								))}
							</Stack>
						</Stack>

						<Stack gap={4} align={{ base: 'center', md: 'flex-start' }}>
							<Text
								fontWeight="semibold"
								color={{ base: 'gray.900', _dark: 'white' }}
							>
								热门分类
							</Text>
							<Stack gap={2} align={{ base: 'center', md: 'flex-start' }}>
								{categories.map((item, index) => (
									<Box asChild key={index}>
										<Link href={`/categories/${item.id}`}>
											<Text
												color={{ base: 'gray.600', _dark: 'gray.400' }}
												_hover={{ color: 'blue.500' }}
												transition="color 0.2s"
											>
												{item.name}
											</Text>
										</Link>
									</Box>
								))}
							</Stack>
						</Stack>
					</Flex>

					<Separator />
					<Flex
						direction={{ base: 'column', md: 'row' }}
						justify="space-between"
						align="center"
						gap={4}
					>
						<Text
							color={{ base: 'gray.600', _dark: 'gray.400' }}
							fontSize="sm"
							textAlign={{ base: 'center', md: 'left' }}
						>
							© 2025 igCircle Blog. All rights reserved.
						</Text>
						<Text
							color={{ base: 'gray.600', _dark: 'gray.400' }}
							fontSize="sm"
							textAlign={{ base: 'center', md: 'right' }}
						>
							网站备案号：
							<a
								href="https://beian.miit.gov.cn/"
								target="_blank"
								rel="noopener noreferrer"
							>
								粤ICP备2025452143号
							</a>
						</Text>
					</Flex>
				</Stack>
			</Container>
		</Box>
	)
}
