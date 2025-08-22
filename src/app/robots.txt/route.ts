import { NextResponse } from 'next/server'

export async function GET() {
	const robotsContent = `User-agent: *
Allow: /

# 禁止访问私有页面
Disallow: /profile/
Disallow: /login/
Disallow: /reset-password/
Disallow: /forgot-password/
Disallow: /test-*/

# 允许访问公开内容
Allow: /articles/
Allow: /categories/
Allow: /tags/
Allow: /archive/
Allow: /about/
Allow: /search/

# Sitemap位置
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/blog/sitemap.xml

# 爬取延迟（可选）
Crawl-delay: 1`

	return new NextResponse(robotsContent, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400',
		},
	})
}
