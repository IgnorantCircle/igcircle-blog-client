import SearchPage from './SearchPage'

interface PageProps {
	searchParams: Promise<{
		q?: string
		category?: string
		tag?: string
		sortBy?: 'publishedAt' | 'viewCount' | 'likeCount'
		sortOrder?: 'ASC' | 'DESC'
		page?: string
	}>
}

export default async function Page({ searchParams }: PageProps) {
	const resolvedSearchParams = await searchParams
	return <SearchPage searchParams={resolvedSearchParams} />
}
