// TLDR; Use the `highlight` function on the server and return the HTML to the client.

import { readFile } from 'node:fs/promises'
import { transform } from './transform'
import { highlight } from '$lib/utils/highlight'

export const prerender = true

// Read and highlight this folder's source code.
export async function load() {
	const paths = ['./+page.svelte', './+page.server.ts']

	const files: { title: string; text: string; highlightedText: string; lang: string }[] = []

	for (const path of paths) {
		const file = new URL(path, import.meta.url)
		const lang = path.split('.').pop() as 'svelte' | 'ts'
		const text = transform(await readFile(file, 'utf-8'))
		const highlightedText = await highlight(text, { lang }) // [!code focus]

		files.push({
			title: path.replace('./', ''),
			text,
			highlightedText,
			lang,
		})
	}

	return { files }
}
