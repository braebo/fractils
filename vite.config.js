import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { sveltekit } from '@sveltejs/kit/vite'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		vanillaExtractPlugin({
			// identifiers: ({ hash }) => `fractils_${hash}`,
			identifiers: ({ hash, debugId }) => `fractils-${debugId}`,
		}),
		sveltekit(),
	],
	css: {
		postcss: {
			plugins: [autoprefixer],
		},
	},
})
