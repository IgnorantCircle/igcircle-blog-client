import CategoryPage from './CategoryPage'

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
	return (
		<CategoryPage params={resolvedParams} searchParams={resolvedSearchParams} />
	)
}
