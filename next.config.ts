import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	env: {
		SERVER_API_URL: process.env.SERVER_API_URL,
	},
	// 启用详细日志
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
}

export default nextConfig
