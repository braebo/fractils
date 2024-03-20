export const load = () => {
	const routes = Object.keys(
		import.meta.glob<{ default: any }>('./**/+page.svelte', {
			eager: true,
		}),
	)
		.toSpliced(0, 1)
		.map((path) => path.replace(/\.\/+/g, '').replace(/\/\+page\.svelte$/, ''))

	return { routes }
}
