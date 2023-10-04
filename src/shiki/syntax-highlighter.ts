/// <reference types="vite/client" />

/**
 * @fileoverview Generates syntax-highlighted HTML from code blocks.
 */

import { getHighlighter, loadTheme } from 'shiki'
import fs from 'fs/promises'

const lang = 'svelte'

const theme = await loadTheme(__dirname + `/serendipity.json`)

const highlighter = await getHighlighter({
	theme,
	langs: [lang],
})

const files = import.meta.glob<{ default: string }>('../../examples/**/*.example.js')

for await (const [path, module] of Object.entries(files)) {
	const { default: code } = await module()

	const highlighted = highlighter.codeToHtml(code, lang)

	const output = new URL(path, import.meta.url).pathname.replace('.example.js', '.html')

	await fs.writeFile(output, highlighted)
}
