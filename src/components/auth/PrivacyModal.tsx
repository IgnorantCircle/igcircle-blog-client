'use client'

import { Button, Text, VStack } from '@chakra-ui/react'
import { Modal } from '@/components/ui/Modal'

interface PrivacyModalProps {
	isOpen: boolean
	onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="隐私政策"
			maxWidth="800px"
			maxHeight="80vh"
			showCloseButton={true}
			closeOnBackdropClick={true}
			closeOnEsc={true}
			footer={
				<Button colorPalette="blue" onClick={onClose}>
					我已了解
				</Button>
			}
		>
			<VStack gap={4} align="start">
				<Text fontSize="lg" fontWeight="semibold">
					1. 信息收集
				</Text>
				<Text>
					我们收集您主动提供的信息，如注册时的用户名、邮箱地址等。我们也会自动收集一些技术信息，如IP地址、浏览器类型等。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					2. 信息使用
				</Text>
				<Text>
					我们使用收集的信息来提供、维护和改进我们的服务，处理交易，发送通知，以及防止欺诈和滥用。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					3. 信息共享
				</Text>
				<Text>
					我们不会向第三方出售、交易或转让您的个人信息，除非获得您的同意或法律要求。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					4. 数据安全
				</Text>
				<Text>
					我们采用适当的技术和组织措施来保护您的个人信息免受未经授权的访问、使用或披露。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					5. Cookie使用
				</Text>
				<Text>
					我们使用Cookie来改善用户体验，分析网站使用情况，并提供个性化内容。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					6. 您的权利
				</Text>
				<Text>
					您有权访问、更正、删除或限制处理您的个人信息。如需行使这些权利，请联系我们。
				</Text>

				<Text fontSize="sm" color="gray.600" mt={4}>
					最后更新时间：2025年8月14日
				</Text>
			</VStack>
		</Modal>
	)
}
