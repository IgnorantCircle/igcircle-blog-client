import { Box, Text, Stack, Flex } from '@chakra-ui/react'
import { PublicArticleType } from '@/types'
import Link from 'next/link'

interface CompactArticleCardServerProps {
	article: PublicArticleType
	rank?: number
}

/**
 * 服务端CompactArticleCard组件
 * 紧凑型文章卡片，用于侧边栏等空间有限的地方
 */
export function CompactArticleCardServer({
	article,
	rank,
}: CompactArticleCardServerProps) {
	return (
		<Box
			p={1.5}
			borderRadius="md"
			_hover={{
				bg: { base: 'gray.50', _dark: 'gray.700' },
			}}
			transition="background-color 0.2s"
			cursor="pointer"
			asChild
		>
			<Link href={`/articles/${article.slug}`}>
				<Flex gap={3} align="flex-start">
					{rank && (
						<Box
							minW="24px"
							h="24px"
							bg="red.500"
							color="white"
							borderRadius="full"
							display="flex"
							alignItems="center"
							justifyContent="center"
							fontSize="xs"
							fontWeight="bold"
							flexShrink={0}
						>
							{rank}
						</Box>
					)}
					<Stack gap={1} flex={1} minW={0}>
						<Text
							fontSize="sm"
							fontWeight="medium"
							color={{ base: 'gray.900', _dark: 'white' }}
							_hover={{ color: 'blue.500' }}
							transition="color 0.2s"
							lineClamp={2}
							overflow="hidden"
						>
							{article.title}
						</Text>
					</Stack>
				</Flex>
			</Link>
		</Box>
	)
}
