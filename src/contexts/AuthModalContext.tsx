'use client'

import React, { createContext, useContext, useState } from 'react'
import { AuthModal } from '@/components/Auth/AuthModal'

interface AuthModalContextType {
	isOpen: boolean
	authModalTab: 'login' | 'register'
	openModal: (tab: 'login' | 'register') => void
	closeModal: () => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
	undefined,
)

export const useAuthModal = () => {
	const context = useContext(AuthModalContext)
	if (!context) {
		throw new Error('useAuthModal must be used within AuthModalProvider')
	}
	return context
}

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
		'login',
	)

	const openModal = (tab: 'login' | 'register') => {
		setAuthModalTab(tab)
		setIsOpen(true)
	}

	const closeModal = () => {
		setIsOpen(false)
	}

	return (
		<AuthModalContext.Provider
			value={{ isOpen, authModalTab, openModal, closeModal }}
		>
			{children}
			<AuthModal
				isOpen={isOpen}
				onClose={closeModal}
				defaultTab={authModalTab}
			/>
		</AuthModalContext.Provider>
	)
}
