'use client'

import { toaster } from '@/components/ui/toaster'

export const useToast = () => {
	const toast = (options: {
		title?: string
		description?: string
		type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
		duration?: number
		closable?: boolean
	}) => {
		return toaster.create({
			title: options.title,
			description: options.description,
			type: options.type || 'info',
			duration: options.duration || 2000,
			closable: options.closable !== false,
		})
	}

	const success = (title: string, description?: string) => {
		return toast({ title, description, type: 'success' })
	}

	const error = (title: string, description?: string) => {
		return toast({ title, description, type: 'error' })
	}

	const warning = (title: string, description?: string) => {
		return toast({ title, description, type: 'warning' })
	}

	const info = (title: string, description?: string) => {
		return toast({ title, description, type: 'info' })
	}

	return {
		toast,
		success,
		error,
		warning,
		info,
	}
}
