import { sveltekit } from '@sveltejs/kit/vite'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: {
			plugins: [autoprefixer],
		},
	},
})
