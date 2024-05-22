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
		prerender: {
			handleHttpError: ({ path }) => {
				// if (path === 'demo/code/ssr') {
				// 	console.error('yayeet : ssr')
				// 	return
				// }
				// if (path === 'demo/code/csr') {
				// 	console.error('yayeet : csr')
				// 	return
				// }
			},
			/// todo - remove
			handleMissingId: ({ path }) => {
				if (path === 'demo/docinator#ssr') {
					return
				}
			},
		},
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'control-meta',
		},
	},
}

export default config
