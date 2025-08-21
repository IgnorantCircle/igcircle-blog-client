import { Metadata } from 'next'
import {
	Container,
	Box,
	Heading,
	Text,
	Stack,
	Card,
	Grid,
	Badge,
	Button,
	Flex,
	HStack,
} from '@chakra-ui/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Avatar } from '@/components/ui/avatar'
import {
	Github,
	Mail,
	Globe,
	Code,
	Database,
	Server,
	Monitor,
	Settings,
	Eye,
} from 'lucide-react'
import Link from 'next/link'

// 技能数据
const skills = [
	{
		category: '前端开发',
		percentage: 98,
		color: 'green',
		icon: <Monitor size={20} />,
		techs: ['HTML5', 'CSS3', 'Sass', 'Less', 'JavaScript', 'TypeScript', 'ES6'],
	},
	{
		category: '前端框架与组件库',
		percentage: 97,
		color: 'purple',
		icon: <Code size={20} />,
		techs: ['Vue', 'React', 'Next.js', 'Uni-app', 'Ant Design', 'Vant', 'AntV'],
	},
	{
		category: '后端与数据库',
		percentage: 95,
		color: 'blue',
		icon: <Database size={20} />,
		techs: [
			'Node.js',
			'Express.js',
			'Koa.js',
			'Nest.js',
			'MySQL',
			'MongoDB',
			'Redis',
		],
	},
	{
		category: '工程化与工具',
		percentage: 93,
		color: 'orange',
		icon: <Settings size={20} />,
		techs: ['Vite', 'Webpack', 'Rollup', 'Git', 'ESLint', 'Chrome DevTools'],
	},
	{
		category: '计算机专业知识',
		percentage: 93,
		color: 'pink',
		icon: <Settings size={20} />,
		techs: [
			'算法与数据结构',
			'计算机网络',
			'编译原理',
			'操作系统',
			'数据库原理',
		],
	},
	{
		category: '运维与Linux',
		percentage: 86,
		color: 'red',
		icon: <Server size={20} />,
		techs: ['Nginx', 'Docker', 'Kubernetes', 'Wireshark', 'Fail2Ban'],
	},
]

// 开源项目数据
const projects = [
	{
		name: 'igCircle Blog',
		description:
			'博客系统，分为管理端、用户端和服务端。用户端采用Next.js，管理端采用Umi+antd,后端采用Nest.js+MySQL',
		tags: ['Next.js', 'Umi', 'Nest.js', 'MySQL'],
		githubLink: 'https://github.com/IgnorantCircle/igcircle-blog-client',
		link: '/articles/博客系统实现',
	},
	{
		name: 'github-star-classify',
		tags: ['github', 'React', '分类', '工具'],
		description:
			'GitHub star仓库分类管理工具，可以查看自己或者其他GitHub用户的收藏，并且可以根据关键词规则对仓库进行分类',
		githubLink: 'https://github.com/IgnorantCircle/github-star-classify',
		link: '/articles/github收藏分类管理项目介绍',
	},
	{
		name: 'f-wallpaper',
		description:
			'一个基于 uni-app 开发的跨平台壁纸应用，提供精美壁纸浏览、下载、分类和评分等功能。',
		tags: ['uni-app', 'Vue', '壁纸'],
		githubLink: 'https://github.com/IgnorantCircle/f-wallpaper',
		link: '/articles/基于uni-app的壁纸实现',
	},
]

export default function AboutPage() {
	return (
		<MainLayout>
			<Container maxW="7xl" py={12}>
				<Stack gap={12}>
					{/* 头部介绍 */}
					<Box textAlign="center">
						<Stack gap={6} align="center">
							<Avatar
								size="2xl"
								src="https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/statics/igCircle.JPG"
								name="igCircle"
							/>
							<Stack gap={3}>
								<Heading size="2xl" color="blue.500">
									你好 👋 我是igCircle
								</Heading>
								<Text
									fontSize="xl"
									color="gray.600"
									_dark={{ color: 'gray.400' }}
								>
									知识就像一个圆，你知道的越多，你不知道的就越多
								</Text>
							</Stack>
							<Flex gap={4} wrap="wrap" justify="center">
								<Link href="mailto:igcircle@163.com">
									<Button colorScheme="blue" variant="outline" gap={2}>
										<Mail size={16} />
										联系我
									</Button>
								</Link>
								<Link href="#projects">
									<Button colorScheme="green" variant="outline" gap={2}>
										<Globe size={16} />
										查看项目
									</Button>
								</Link>
							</Flex>
						</Stack>
					</Box>

					{/* 技能展示 */}
					<Box>
						<Stack gap={8}>
							<Box textAlign="center">
								<Heading size="xl" mb={2}>
									我的技能
								</Heading>
							</Box>

							<Grid
								templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
								gap={6}
							>
								{skills.map((skill, index) => (
									<Card.Root key={index} p={6}>
										<Stack gap={4}>
											<Flex align="center" gap={3}>
												<Box color={`${skill.color}.500`}>{skill.icon}</Box>
												<Heading size="md">{skill.category}</Heading>
												<Text
													ml="auto"
													fontWeight="bold"
													color={`${skill.color}.500`}
												>
													{skill.percentage}%
												</Text>
											</Flex>
											<Box
												w="full"
												h="3"
												bg="gray.200"
												rounded="full"
												overflow="hidden"
											>
												<Box
													h="full"
													w={`${skill.percentage}%`}
													bg={`${skill.color}.500`}
													transition="width 0.3s ease"
												/>
											</Box>
											<Flex wrap="wrap" gap={2}>
												{skill.techs.map((tech, techIndex) => (
													<Badge
														key={techIndex}
														colorScheme={skill.color}
														variant="subtle"
														px={2}
														py={1}
													>
														{tech}
													</Badge>
												))}
											</Flex>
										</Stack>
									</Card.Root>
								))}
							</Grid>
						</Stack>
					</Box>

					{/* 开源项目 */}
					<Box
						id="projects"
						style={{
							scrollMarginTop: '80px', // 避开 header 的高度
						}}
					>
						<Stack gap={8} alignItems="center">
							<Box textAlign="center">
								<Heading size="xl" mb={2}>
									开源项目
								</Heading>
							</Box>

							<Grid
								templateColumns={{
									base: '1fr',
									md: 'repeat(2, 1fr)',
									lg: 'repeat(3, 1fr)',
								}}
								gap={6}
							>
								{projects.map((project, index) => (
									<Card.Root
										key={index}
										p={6}
										_hover={{
											transform: 'translateY(-4px)',
											shadow: 'xl',
										}}
										transition="all 0.3s"
										cursor="pointer"
									>
										<Stack gap={4} h="full">
											<Heading size="xl" color="blue.500">
												{project.name}
											</Heading>
											<Text
												color="gray.600"
												_dark={{ color: 'gray.400' }}
												flex="1"
											>
												{project.description}
											</Text>

											<HStack gap={4}>
												{project.tags.map((item, index) => (
													<Badge
														key={index}
														colorPalette="cyan"
														px={2}
														py={1}
														variant="subtle"
													>
														{item}
													</Badge>
												))}
											</HStack>

											<HStack justify="space-between" align="center">
												<Link href={project.link}>
													<Button
														variant="outline"
														size="sm"
														gap={2}
														color="blue.500"
													>
														<Eye size={16} />
														项目介绍
													</Button>
												</Link>
												<a
													href={project.githubLink}
													target="_blank"
													rel="noreferrer"
												>
													<Button
														colorScheme="blue"
														variant="outline"
														size="sm"
														gap={2}
													>
														<Github size={16} />
														项目地址
													</Button>
												</a>
											</HStack>
										</Stack>
									</Card.Root>
								))}
							</Grid>
							<Box asChild>
								<Link href="/categories/4378b71e-62e2-41b0-8055-ff05b1e38543">
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
										<Eye size={20} />
										查看更多项目
									</Button>
								</Link>
							</Box>
						</Stack>
					</Box>

					{/* 关于本站 */}
					<Box>
						<Card.Root p={8}>
							<Stack gap={6} textAlign="center">
								<Heading size="xl" color="blue.500">
									关于本站
								</Heading>
								<Stack gap={4} maxW="4xl" mx="auto">
									<Text fontSize="lg" lineHeight="taller">
										欢迎来到 igCircle Blog！
										这里是我分享技术心得、记录学习历程的个人博客。
										本站致力于分享前端开发、后端技术、全栈开发等相关内容。
										希望在这里能够与大家一起交流学习，共同进步！
									</Text>
									<Text color="gray.600" _dark={{ color: 'gray.400' }}>
										本站使用 Next.js + TypeScript + Chakra UI 构建
									</Text>
									<Flex gap={4} justify="center" wrap="wrap">
										<Badge colorScheme="blue" px={3} py={1} fontSize="sm">
											Next.js
										</Badge>
										<Badge colorScheme="purple" px={3} py={1} fontSize="sm">
											TypeScript
										</Badge>
										<Badge colorScheme="green" px={3} py={1} fontSize="sm">
											Chakra UI
										</Badge>
										<Badge colorScheme="orange" px={3} py={1} fontSize="sm">
											React
										</Badge>
									</Flex>
								</Stack>
							</Stack>
						</Card.Root>
					</Box>
				</Stack>
			</Container>
		</MainLayout>
	)
}

// 页面元数据
export const metadata: Metadata = {
	title: '关于本站 - igCircle Blog',
	description: '了解 igCircle Blog 的技术栈、开源项目和博客文章。',
	keywords: [
		'技术博客',
		'开源项目',
		'Next.js',
		'TypeScript',
		'React',
		'前端开发',
		'全栈开发',
	],
	openGraph: {
		title: '关于本站 - igCircle Blog',
		description: '了解 igCircle Blog 的技术栈、开源项目和博客文章。',
		type: 'website',
	},
}
