// TLDR; Use the `highlight` function on the server and return the HTML to the client.

import type { Lang } from 'shiki'

import { highlight } from '$lib/utils/highlight'
import { readFile } from 'node:fs/promises'
import { transform } from './transform'

// Read and highlight this folder's source code.
export async function load() {
	const paths = ['./+page.svelte', './+page.ts', './+page.server.ts']

	const files: { title: string; text: string; lang: Lang }[] = []

	for (const path of paths) {
		const file = new URL(path, import.meta.url)
		const lang = path.split('.').pop() as 'svelte' | 'ts'
		const raw = transform(await readFile(file, 'utf-8'))
		const text = await highlight(raw, { lang }) // [!code focus]

		files.push({ title: path.replace('./', ''), text, lang })
	}

	return { files }
}
