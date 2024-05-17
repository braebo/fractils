// hmr-reset

import type { ParsedFile } from '$scripts/extractinator/src/types'
import { error, type Load } from '@sveltejs/kit'

// import { getHighlighterInstance } from '$lib/utils/highlight'
// import { fromHighlighter } from 'markdown-it-shikiji/core'
// import { getHighlighterCore } from 'shikiji/core'
// import { getWasmInlined } from 'shikiji/wasm'
// import MarkdownIt from 'markdown-it'

export const prerender = true
export const csr = false
// export const ssr = false

export const load: Load = async () => {
	console.clear()

	const modules = import.meta.glob<{ default: ParsedFile }>(
		// '../../docs/highlighted/Code.svelte.doc.json',
		'../../../../docs/highlighted/test/Test.svelte.doc.json',
		{
			eager: true,
		},
	)

	// const start = performance.now()

	// const docs = await highlightDocs(Object.values(modules).map((m) => m.default))
	const docs = Object.values(modules).map(m => m.default)

	// const end = performance.now()
	// console.log('highlighted in', end - start + 'ms')

	if (docs.length === 0) {
		error(424, {
			message: 'Failed to read docs from disk.',
		})
	}

	return { docs }
}

// async function highlightDocs(docs: ParsedFile[]) {
// 	const md = MarkdownIt()

// 	md.use(
// 		// @ts-expect-error - shikiji's fault
// 		fromHighlighter(await getHighlighterInstance(), {
// 			theme: 'serendipity',
// 		}),
// 	)

// 	const highlighted = await Promise.all(
// 		docs.map(async (doc) => {
// 			if (!doc) return doc

// 			if (doc.type === 'svelte') {
// 				// A top-level comment describing the svelte component.
// 				if (doc.comment) {
// 					doc.comment = await highlightComment(doc.comment, md)
// 				}

// 				const hasComment = ['props', 'slots', 'events', 'exports'] as const

// 				for (const key of hasComment) {
// 					const value = doc[key]
// 					if (!value) continue

// 					for (const [index, item] of Object.entries(value)) {
// 						if (!item.comment) continue
// 						doc[key][index].comment = await highlightComment(item.comment, md)
// 					}
// 				}
// 			}

// 			if (doc.type === 'ts') {
// 				const { exports } = doc

// 				if (exports) {
// 					for (const [index, file] of Object.entries(doc.exports)) {
// 						const { comment } = file
// 						if (!comment) continue

// 						doc.exports[index].comment = await highlightComment(comment, md)
// 					}
// 				}
// 			}

// 			return doc
// 		}),
// 	)

// 	return highlighted
// }

// async function highlightComment(comment: TSDocComment, md: MarkdownIt) {
// 	const { summary, examples } = comment

// 	let summary_h = summary
// 	if (summary) {
// 		summary_h = md.render(summary)
// 	}

// 	let examples_h = examples
// 	if (examples) {
// 		examples_h = await Promise.all(
// 			examples.map(async ({ name, content }) => {
// 				return {
// 					name,
// 					content: md.render(content),
// 				}
// 			}),
// 		)
// 	}

// 	return {
// 		...comment,
// 		summary: summary_h,
// 		examples: examples_h,
// 	}
// }
