/// <reference types="vite/client" />

/**
 * @fileoverview Generates syntax-highlighted HTML from code blocks.
 */

import { getHighlighter } from 'shiki'
import theme from './serendipity'
import fs from 'fs/promises'

const lang = 'svelte'

const highlighter = await getHighlighter({
	themes: [theme],
	langs: [lang],
})

const files = import.meta.glob<{ default: string }>('../../examples/**/*.example.js')

for await (const [path, module] of Object.entries(files)) {
	const { default: code } = await module()

	const highlighted = highlighter.codeToHtml(code, {
		theme: 'serendipity',
		lang: 'svelte',
	})

	const output = new URL(path, import.meta.url).pathname.replace('.example.js', '.html')

	await fs.writeFile(output, highlighted)
}
