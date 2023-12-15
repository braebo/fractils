import type { Lang } from 'shiki'

import { highlight } from '$lib/actions/highlight'
import { readFile } from 'node:fs/promises'

export async function load() {
	const paths = ['./+page.svelte', './+page.ts', './+page.server.ts']

	const files: { title: string; text: string; lang: Lang }[] = []

	for (const path of paths) {
		const file = new URL(path, import.meta.url)
		const lang = path.split('.').pop() as 'svelte' | 'ts'
		const raw = (await readFile(file, 'utf-8'))
			.replace('$lib/actions/highlight', 'fractils')
			.replace(
				"import Code from '$lib/components/Code.svelte'",
				"import { Code } from 'fractils'",
			)
			.replace(
				'const text = await highlight(raw, { lang })',
				'[!code focus]const text = await highlight(raw, { lang })',
			)
			.trim()
		const text = await highlight(raw, { lang })

		files.push({ title: path.replace('./', ''), text, lang })
	}

	return { files }
}
