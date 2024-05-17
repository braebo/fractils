/// <reference types="vite/client" />

/**
 * @fileoverview Generates syntax-highlighted HTML from code blocks.
 */

import { c, l, m, o, y } from '../../lib/utils/l'
import { getHighlighter } from 'shiki'
import theme from './serendipity'
import fs from 'fs/promises'

const lang = 'svelte'

const highlighter = await getHighlighter({
	themes: [theme],
	langs: [lang, 'typescript'],
})

const files = import.meta.glob<{ default: string }>('../../examples/**/*.example.js')

l(
	`Highlighting ${y(Object.keys(files).length)} examples. Lang: "${o(lang)}" Theme: "${m(theme.name)}".`,
)

for await (const [path, module] of Object.entries(files)) {
	const { default: code } = await module()

	l(`Processing ${c(path.split('/').pop())}`)

	const highlighted = highlighter.codeToHtml(code, {
		theme: 'serendipity',
		lang,
	})

	const output = new URL(path, import.meta.url).pathname.replace('.example.js', '.html')

	await fs.writeFile(output, highlighted)
}
