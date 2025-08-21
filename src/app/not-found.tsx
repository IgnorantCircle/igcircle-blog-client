'use client'

import {
	Container,
	Box,
	Heading,
	Text,
	Button,
	VStack,
	HStack,
	Flex,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Home, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 定义 CSS 动画样式
const animationStyles = `
	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		25% { transform: translateY(-10px) rotate(1deg); }
		50% { transform: translateY(-5px) rotate(-1deg); }
		75% { transform: translateY(-15px) rotate(1deg); }
	}

	@keyframes bounce {
		0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
		40%, 43% { transform: translate3d(0, -20px, 0); }
		70% { transform: translate3d(0, -10px, 0); }
		90% { transform: translate3d(0, -4px, 0); }
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); }
	}
`

export default function NotFound() {
	const router = useRouter()

	return (
		<>
			{/* 注入 CSS 动画样式 */}
			<style jsx>{animationStyles}</style>

			<MainLayout>
				<Container maxW="6xl">
					<Flex
						direction="column"
						align="center"
						justify="center"
						minH="58vh"
						textAlign="center"
						gap={8}
					>
						{/* 404 数字动画 */}
						<Box position="relative" animation="float 6s ease-in-out infinite">
							<Heading
								as="h1"
								size="4xl"
								fontWeight="900"
								bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
								bgClip="text"
								lineHeight="1"
								fontSize={{ base: '8rem', md: '12rem', lg: '16rem' }}
								letter-spacing="-0.05em"
								_hover={{
									animation: 'pulse 0.5s ease-in-out',
								}}
								cursor="default"
								transition="all 0.3s ease"
								color="blue.500"
							>
								404
							</Heading>
							{/* 发光效果 */}
							<Box
								position="absolute"
								top="50%"
								left="50%"
								transform="translate(-50%, -50%)"
								w="120%"
								h="120%"
								bg="radial-gradient(circle, rgba(66, 150, 255, 0.1) 0%, transparent 70%)"
								pointerEvents="none"
								zIndex={-1}
							/>
						</Box>

						{/* 文本内容 */}
						<VStack gap={4} animation="fadeInUp 0.8s ease-out 0.3s both">
							<Heading
								as="h2"
								size="xl"
								color="chakra-body-text"
								fontWeight="700"
								mb={2}
							>
								页面走丢了
							</Heading>
							<Text
								color="text-secondary"
								fontSize="lg"
								maxW="md"
								lineHeight="1.6"
							>
								抱歉，您访问的页面不存在或已被移动。
							</Text>
						</VStack>

						{/* 操作按钮 */}
						<HStack
							gap={4}
							flexWrap="wrap"
							justify="center"
							animation="fadeInUp 0.8s ease-out 0.6s both"
						>
							<Box asChild>
								<Link href="/">
									<Button
										colorPalette="blue"
										size="lg"
										animation="bounce 2s infinite 1s"
										_hover={{
											transform: 'translateY(-2px)',
											boxShadow: 'lg',
										}}
										transition="all 0.3s ease"
									>
										<Home size={20} />
										回到首页
									</Button>
								</Link>
							</Box>

							<Button
								onClick={() => router.back()}
								variant="outline"
								colorPalette="gray"
								size="lg"
								_hover={{
									transform: 'translateY(-2px)',
									boxShadow: 'md',
								}}
								transition="all 0.3s ease"
							>
								<ArrowLeft size={20} />
								返回上页
							</Button>
						</HStack>

						{/* 装饰性元素 */}
						<Box
							position="absolute"
							top="20%"
							left="10%"
							w={4}
							h={4}
							bg="blue.400"
							borderRadius="full"
							opacity={0.6}
							animation="float 4s ease-in-out infinite 0.5s"
							zIndex={-1}
						/>
						<Box
							position="absolute"
							top="60%"
							right="15%"
							w={6}
							h={6}
							bg="purple.400"
							borderRadius="full"
							opacity={0.4}
							animation="float 5s ease-in-out infinite 1s"
							zIndex={-1}
						/>
						<Box
							position="absolute"
							bottom="20%"
							left="20%"
							w={3}
							h={3}
							bg="pink.400"
							borderRadius="full"
							opacity={0.5}
							animation="float 6s ease-in-out infinite 2s"
							zIndex={-1}
						/>
					</Flex>
				</Container>
			</MainLayout>
		</>
	)
}
