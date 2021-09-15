import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'

console.log(resolve('./src/test'))

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],

	kit: {
		target: '#svelte',
		adapter: vercel(),
		vite: {
			resolve: {
				alias: {
					$test: resolve('./src/test'),
				},
			},
		},
	},
}

export default config
