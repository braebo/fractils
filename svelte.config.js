import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],

	kit: {
		adapter: vercel(),
		alias: {
			$examples: resolve('./src/examples'),
		},
	},

	vitePlugin: {
		inspector: true,
	},
}

export default config
