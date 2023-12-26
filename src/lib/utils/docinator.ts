import type { ParsedFile, TSDocComment } from '$scripts/extractinator/src/types'
import type { Lang } from 'shiki'

import { markedHighlight } from 'marked-highlight'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { getHighlighterInstance, highlight } from './highlight'
// import { codeToHtml } from 'shikiji'
import MarkdownIt from 'markdown-it'
import { Marked } from 'marked'
import { l, d, b, r, n } from './l'
import { resolve } from 'node:path'
import { fromHighlighter } from 'markdown-it-shikiji/core'

const hl = new Marked(
	markedHighlight({
		async: true,
		async highlight(code, lang) {
			// return await codeToHtml(code, { lang, theme: 'one-dark-pro'})
			return await highlight(code, { lang: lang as Lang, theme: 'serendipity' })
		},
	}),
)

// const code = `# Hello World
// \`\`\`js
// const a = 1
// \`\`\`
// `

// console.log(await marked.parse(code))

const args = process.argv.slice(2)

const input = args[0]
const output = args[1]

if (!input || !output) {
	!input &&
		l(
			r('Error:'),
			'Please provide an input folder:',
			d('docinator'),
			r('<input>'),
			d('<output>'),
		)
	!output &&
		l(
			r('Error:'),
			'Please provide an output folder:',
			d('docinator'),
			d('<input>'),
			r('<output>'),
		)
} else {
	main(input, output)
}

async function main(input_path: string, output_path: string) {
	// Resolve the input and output paths to absolute paths.
	const input = resolve(input_path)
	const output = resolve(output_path)

	n()
	l('Input:', d(input))
	l('Output:', d(output))

	// Read the directory and get all the files recursively.
	const files = (await readdir(input)).filter((f) => f.endsWith('.doc.json'))

	n()
	l(files.length, d('files found'))

	const start = Date.now()

	// Read all the files.
	const docs = await Promise.all(
		files.map(async (file) => {
			const path = `${input}/${file}`
			const json = await import(path)
			return json.default as ParsedFile
		}),
	)

	// Highlight all the docs.
	const highlighted = await highlightDocs(docs)

	// Ensure the output folder exists.
	await mkdir(output, { recursive: true })

	// Write all the files.
	await Promise.all(
		highlighted.map(async (doc) => {
			const path = `${output}/${doc.fileName}.doc.json`
			await writeFile(path, JSON.stringify(doc, null, 2), 'utf-8')
		}),
	)
}

async function highlightDocs(docs: ParsedFile[]) {
	const md = MarkdownIt()

	md.use(
		// @ts-expect-error - shikiji's fault
		fromHighlighter(await getHighlighterInstance(), {
			theme: 'serendipity',
		}),
	)

	const highlighted = await Promise.all(
		docs.map(async (doc) => {
			if (!doc) return doc

			if (doc.type === 'svelte') {
				// A top-level comment describing the svelte component.
				if (doc.comment) {
					doc.comment = await highlightComment(doc.comment, md)
				}

				const hasComment = ['props', 'slots', 'events', 'exports'] as const

				for (const key of hasComment) {
					const value = doc[key]
					if (!value) continue

					for (const [index, item] of Object.entries(value)) {
						if (!item.comment) continue
						doc[key][index].comment = await highlightComment(item.comment, md)
					}
				}
			}

			if (doc.type === 'ts') {
				const { exports } = doc

				if (exports) {
					for (const [index, file] of Object.entries(doc.exports)) {
						const { comment } = file
						if (!comment) continue

						doc.exports[index].comment = await highlightComment(comment, md)
					}
				}
			}

			return doc
		}),
	)

	return highlighted
}

async function highlightComment(comment: TSDocComment, md: MarkdownIt) {
	const { summary, examples } = comment

	let summary_h = summary
	if (summary) {
		// summary_h = md.render(summary)
		summary_h = await hl.parse(summary)
	}

	let examples_h = examples
	if (examples) {
		examples_h = await Promise.all(
			examples.map(async ({ name, content }) => {
				return {
					name,
					// content: md.render(content),
					content: await hl.parse(content),
				}
			}),
		)
	}

	return {
		...comment,
		summary: summary_h,
		examples: examples_h,
	}
}
