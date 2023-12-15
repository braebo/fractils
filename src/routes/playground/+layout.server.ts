export async function load() {
	const routeMap = import.meta.glob('./**/+page.svelte')

	const routes = Object.entries(routeMap)
		.map(([path]) => {
			const match = path.match(/\.\/(.*)\/\+page\.svelte$/)

			return match?.[1]
		})
		.filter(Boolean)

	return {
		routes,
	}
}
