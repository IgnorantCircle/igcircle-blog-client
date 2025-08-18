'use client'

import { Button, Text, VStack } from '@chakra-ui/react'
import { Modal } from '@/components/ui/Modal'

interface TermsModalProps {
	isOpen: boolean
	onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="用户协议"
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
					1. 服务条款
				</Text>
				<Text>
					欢迎使用igCircle
					Blog。通过访问和使用本网站，您同意遵守以下条款和条件。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					2. 用户责任
				</Text>
				<Text>
					用户承诺不会发布违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					3. 知识产权
				</Text>
				<Text>
					本网站的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受知识产权法保护。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					4. 免责声明
				</Text>
				<Text>
					本网站按&ldquo;现状&rdquo;提供服务，不对服务的准确性、完整性、可靠性做任何明示或暗示的保证。
				</Text>

				<Text fontSize="lg" fontWeight="semibold">
					5. 服务变更
				</Text>
				<Text>我们保留随时修改或终止服务的权利，恕不另行通知。</Text>

				<Text fontSize="sm" color="gray.600" mt={4}>
					最后更新时间：2025年8月14日
				</Text>
			</VStack>
		</Modal>
	)
}
