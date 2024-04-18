import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import autoprefixer from 'autoprefixer'

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: {
			plugins: [autoprefixer],
		},
	},
	define: {
		'import.meta.env.FRACTILS_LOG_LEVEL': JSON.stringify('info'),
	},
	test: {
		environment: 'happy-dom',
	},
})
