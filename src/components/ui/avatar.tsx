import { Avatar as ChakraAvatar } from '@chakra-ui/react'
import { forwardRef } from 'react'

interface AvatarProps {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
	name?: string
	src?: string
	children?: React.ReactNode
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
	({ size = 'md', name, src, children, ...props }, ref) => {
		return (
			<ChakraAvatar.Root ref={ref} size={size} {...props}>
				<ChakraAvatar.Fallback>
					{name?.charAt(0).toUpperCase()}
				</ChakraAvatar.Fallback>
				{src && <ChakraAvatar.Image src={src} alt={name} />}
				{children}
			</ChakraAvatar.Root>
		)
	},
)

Avatar.displayName = 'Avatar'
