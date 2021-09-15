import preprocess from 'svelte-preprocess'
import _static from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],

	kit: {
		target: '#svelte',
		adapter: _static(),
	},
}

export default config
