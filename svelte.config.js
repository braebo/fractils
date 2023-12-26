// import { mdsvex, escapeSvelte } from 'mdsvex'
import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'
// import shiki from 'shiki'

// /** @type {import('mdsvex').MdsvexOptions} */
// const mdsvexOptions = {
// 	extensions: ['.md', '.svelte'],
// 	highlight: {
// 		highlighter: async (code, lang = 'text') => {
// 			const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })
// 			const html = escapeSvelte(highlighter.codeToHtml(code, { lang }))
// 			return `{@html \`${html}\` }`
// 		},
// 	},
// }

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		// mdsvex(mdsvexOptions),
		preprocess(),
	],
	kit: {
		adapter: vercel(),
		alias: {
			$lib: resolve('./src/lib'),
			$examples: resolve('./src/examples'),
			$scripts: resolve('./src/scripts'),
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path === '/code/ssr') {
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
