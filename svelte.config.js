import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],
	kit: {
		adapter: vercel(),
		alias: {
			$lib: resolve('./src/lib'),
			$examples: resolve('./src/examples'),
			$scripts: resolve('./src/scripts'),
		},
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'control-meta'
		},
	},
}

export default config
