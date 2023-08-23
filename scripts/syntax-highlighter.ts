/// <reference types="vite/client" />

/**
 * @fileoverview Generates syntax-highlighted HTML from code blocks.
 */

import { getHighlighter, loadTheme } from 'shiki';
import fs from 'fs/promises';

const lang = 'svelte';
// const theme = await loadTheme(__dirname + `/moxer.json`);
const theme = await loadTheme(__dirname + `/serendipity.json`);

const highlighter = await getHighlighter({
	theme,
	langs: [lang],
});

const files = import.meta.glob<{ default: string }>('../src/examples/**/*.example.js');

for await (const [path, module] of Object.entries(files)) {
	const { default: code } = await module();

	const highlighted = highlighter.codeToHtml(code, lang);

	await fs.writeFile(path.replace('.example.js', '.html'), highlighted);
}
