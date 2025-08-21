import { Metadata } from 'next'
import { ProfileClient } from './ProfileClient'

export const metadata: Metadata = {
	title: '个人中心 - igCircle博客',
	description: '查看您的个人资料、文章、评论和收藏',
}

/**
 * 用户个人中心页面
 * 服务端组件，负责SEO和初始数据
 */
export default function ProfilePage() {
	return <ProfileClient />
}
