import { Box, Container, Flex, Text, Stack, Separator } from '@chakra-ui/react'
import Link from 'next/link'

export function Footer() {
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
								<Box asChild>
									<Link href="/">
										<Text
											color={{ base: 'gray.600', _dark: 'gray.400' }}
											_hover={{ color: 'blue.500' }}
											transition="color 0.2s"
										>
											首页
										</Text>
									</Link>
								</Box>
								<Box asChild>
									<Link href="/articles">
										<Text
											color={{ base: 'gray.600', _dark: 'gray.400' }}
											_hover={{ color: 'blue.500' }}
											transition="color 0.2s"
										>
											文章列表
										</Text>
									</Link>
								</Box>
								<Box asChild>
									<Link href="/categories">
										<Text
											color={{ base: 'gray.600', _dark: 'gray.400' }}
											_hover={{ color: 'blue.500' }}
											transition="color 0.2s"
										>
											分类目录
										</Text>
									</Link>
								</Box>
								<Box asChild>
									<Link href="/tags">
										<Text
											color={{ base: 'gray.600', _dark: 'gray.400' }}
											_hover={{ color: 'blue.500' }}
											transition="color 0.2s"
										>
											标签云
										</Text>
									</Link>
								</Box>
								<Box asChild>
									<Link href="/archive">
										<Text
											color={{ base: 'gray.600', _dark: 'gray.400' }}
											_hover={{ color: 'blue.500' }}
											transition="color 0.2s"
										>
											文章归档
										</Text>
									</Link>
								</Box>
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
								<Text
									color={{ base: 'gray.600', _dark: 'gray.400' }}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									cursor="pointer"
								>
									前端开发
								</Text>
								<Text
									color={{ base: 'gray.600', _dark: 'gray.400' }}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									cursor="pointer"
								>
									后端开发
								</Text>
								<Text
									color={{ base: 'gray.600', _dark: 'gray.400' }}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									cursor="pointer"
								>
									技术分享
								</Text>
								<Text
									color={{ base: 'gray.600', _dark: 'gray.400' }}
									_hover={{ color: 'blue.500' }}
									transition="color 0.2s"
									cursor="pointer"
								>
									学习笔记
								</Text>
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
							网站备案号
						</Text>
					</Flex>
				</Stack>
			</Container>
		</Box>
	)
}
