'use client'

import {
	createToaster,
	Toaster as ChakraToaster,
	Box,
	IconButton,
	HStack,
} from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'

const toaster = createToaster({
	placement: 'top-end',
	pauseOnPageIdle: true,
	overlap: true,
})

export const Toaster = () => {
	return (
		<ChakraToaster toaster={toaster}>
			{(toast) => (
				<HStack
					bg={
						toast.type === 'success'
							? 'green.500'
							: toast.type === 'error'
								? 'red.400'
								: toast.type === 'warning'
									? 'orange.400'
									: 'blue.400'
					}
					p={3}
					borderRadius="md"
					m={2}
				>
					<Box color="white">
						{toast.title && <Box fontWeight="bold">{toast.title}</Box>}
						{toast.description && <Box>{toast.description}</Box>}
					</Box>
					{toast.closable && (
						<IconButton
							aria-label="Close toast"
							size="sm"
							variant="ghost"
							bg={'transparent'}
							color={'gray.50'}
							onClick={() => toaster.dismiss(toast.id)}
						>
							<LuX />
						</IconButton>
					)}
				</HStack>
			)}
		</ChakraToaster>
	)
}

export { toaster }
