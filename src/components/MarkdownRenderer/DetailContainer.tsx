'use client'

import React, { useState } from 'react'
import { Collapsible } from '@chakra-ui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface DetailContainerProps {
	title?: string
	children: React.ReactNode
}

const DetailContainer: React.FC<DetailContainerProps> = ({
	title,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='detail-container' >
			<button className='detail-trigger' onClick={() => setIsOpen(!isOpen)}>
				{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
				<span>{title || '展开查看内容'}</span>
			</button>
			<Collapsible.Root open={isOpen}>
				<Collapsible.Content className='detail-content'>
					{children}
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	)
}

export default DetailContainer
