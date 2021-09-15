import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],

	kit: {
		target: '#svelte',
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			paths: {
				base: '/fractils',
				appDir: 'internal',
			},
			fallback: null,
		}),
	},
}

export default config
