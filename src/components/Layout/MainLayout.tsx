'use client'

import { Box, Flex } from '@chakra-ui/react'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	return (
		<Flex direction="column" minH="100vh">
			<Header />
			<Box as="main" flex="1">
				{children}
			</Box>
			<Footer />
		</Flex>
	)
}
