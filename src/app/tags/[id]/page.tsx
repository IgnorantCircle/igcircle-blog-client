import TagPage from './TagPage'

interface PageProps {
	params: Promise<{
		id: string
	}>
	searchParams: Promise<{
		page?: string
	}>
}

export default async function Page({ params, searchParams }: PageProps) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams
	return <TagPage params={resolvedParams} searchParams={resolvedSearchParams} />
}
