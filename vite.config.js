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
	define: {
		// Determines the maximum log level for `Logger` globally.
		'import.meta.env.FRACTILS_LOG_LEVEL': JSON.stringify('info'),
		// Disables `Logger` during tests when empty ('').
		'import.meta.env.FRACTILS_LOG_VITEST': JSON.stringify(''),
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './mocks.ts',
		include: ['**/src/lib/**/*.test.ts'],
		exclude: ['test/**.*', '**/scripts/**.*'],
		browser: {
			provider: 'playwright',
		},
	},
})
