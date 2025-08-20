import { Box, Heading, Text, Stack, Card } from '@chakra-ui/react'
import { PublicCategoryType } from '@/types'
import { Folder } from 'lucide-react'

interface CategoryStatsServerProps {
	category: PublicCategoryType
}

/**
 * 服务端分类统计组件
 * 显示分类的基本信息和统计数据
 */
export function CategoryStatsServer({ category }: CategoryStatsServerProps) {
	return (
		<Card.Root
			p={6}
			bg={{ base: 'blue.50', _dark: 'blue.900' }}
			borderColor="blue.200"
		>
			<Stack gap={4}>
				<Stack direction="row" gap={3} align="center">
					<Box p={2} bg="blue.500" color="white" borderRadius="md">
						<Folder size={20} />
					</Box>
					<Stack gap={1}>
						<Heading size="xl" color="blue.700">
							{category.name}
						</Heading>
						<Text color="blue.600" fontSize="sm">
							分类 · {category.articleCount || 0} 篇文章
						</Text>
					</Stack>
				</Stack>
				{category.description && (
					<Text color="blue.700" lineHeight="1.6">
						{category.description}
					</Text>
				)}
			</Stack>
		</Card.Root>
	)
}
