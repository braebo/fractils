import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],

	kit: {
		adapter: vercel(),
		vite: {
			resolve: {
				alias: {
					$examples: resolve('./src/examples'),
				},
			},
		},
	},
}

export default config
