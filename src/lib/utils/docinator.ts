import type { ParsedFile, TSDocComment } from '$scripts/extractinator/src/types'
import type { BundledLanguage } from 'shiki'

import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { markedHighlight } from 'marked-highlight'
import { Marked, Renderer } from 'marked'
import { highlight } from './highlight'
import { l, d, r, n, b, m } from './l'
import { resolve } from 'node:path'

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
}

export interface Block {
	type: 'code' | 'other' | (string & {})
	content: string
}

export interface HighlightedBlock extends Block {
	type: 'code'
	content: string
	lang: BundledLanguage
	raw: string
	title?: string
}

export type Blocks = (Block | HighlightedBlock)[]

class CustomRenderer extends Renderer {
	blocks: HighlightedBlock[] = []
	codeBlockCounter = 0

	constructor() {
		super()
	}

	async = true

	code(code: string) {
		this.codeBlockCounter++
		// this.blocks.push({ type: 'code', content: code, lang })
		return `<__DOCINATOREPLACE__>${code}</__DOCINATOREPLACE__>`
	}
}

const renderer = new CustomRenderer()

interface ParsedHighlightedBlock {
	code: string
	info: string
	lang: string
	theme: string
}
const HL_MAP = new Map<string, ParsedHighlightedBlock>()

const instance = new Marked(
	markedHighlight({
		async: true,
		async highlight(code, lang, info) {
			// try {
			if (!code || !lang) return await highlight(code)

			// console.log('highlighting', { code, lang, info })

			const highlighted = await highlight(code, {
				lang,
				theme: 'serendipity',
			})
			HL_MAP.set(highlighted, { code, info, lang, theme: 'serendipity' })
			return highlighted
			// } catch (e) {
			// 	console.trace()
			// 	throw e
			// }
		},
	}),
)

instance.setOptions({ renderer })

/**
 * Converts rich-text from examples to {@link Blocks} with syntax highlighting using shikiji.
 */
async function main(input_path: string, output_path: string) {
	// Resolve the input and output paths to absolute paths.
	const input = resolve(input_path)
	const output = resolve(output_path)

	n()
	l(b(d('╭') + m('  docinator  ') + d('╭')))
	l(b(d('⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲⎲')))
	n()
	l('Input:', d(input))
	l('Output:', d(output))

	// Read the directory and get all the files recursively.
	const files = (await readdir(input)).filter(f => f.endsWith('.doc.json'))

	n()
	l(files.length, d('files found'))

	const start = Date.now()

	// Read all the files.
	const docs = await Promise.all(
		files.map(async file => {
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
		highlighted.map(async doc => {
			const path = `${output}/${doc.fileName}.doc.json`
			await writeFile(path, JSON.stringify(doc, null, 2), 'utf-8')
		}),
	)

	l('\ncode blocks:', HL_MAP.size)
	const end = Date.now()
	l('\nDone in', b(end - start), d('ms'))
}

async function highlightDocs(docs: ParsedFile[]) {
	const highlighted = await Promise.all(
		docs.map(async doc => {
			if (!doc) return doc

			if (doc.type === 'svelte') {
				// A top-level comment describing the svelte component.
				if (doc.comment) {
					doc.comment = await highlightComment(doc.comment)
				}

				const hasComment = ['props', 'slots', 'events', 'exports'] as const

				for (const key of hasComment) {
					const value = doc[key]
					if (!value) continue

					for (const [index, item] of Object.entries(value)) {
						if (!item.comment) continue
						doc[key][+index].comment = await highlightComment(item.comment)

						// Highlight default values.
						const { defaultValue } = item.comment
						if (defaultValue) {
							doc[key][+index].comment!.defaultValue = await highlight(defaultValue, {
								lang: 'ts',
							})
						}
					}
				}
			}

			if (doc.type === 'ts') {
				const { exports } = doc

				if (exports) {
					for (const [index, file] of Object.entries(doc.exports)) {
						const { comment } = file
						if (!comment) continue

						doc.exports[+index].comment = await highlightComment(comment)
					}
				}
			}

			return doc
		}),
	).catch(err => {
		console.error(err)
		throw err
	})

	return highlighted
}

async function highlightComment(_comment: TSDocComment) {
	const comment = structuredClone(_comment)

	// // @ts-expect-error
	// delete comment.raw

	if (comment.summary) {
		const split = await instance.parse(comment.summary, {
			async: true,
		})
		if (split) {
			comment.summary = split
		}
	}

	let examples = comment.examples
	if (comment.examples) {
		examples = await Promise.all(
			comment.examples.map(async example => {
				return {
					...example,
					blocks: await hl(example.content),
				}
			}),
		)

		return {
			...comment,
			examples,
		}
	}

	return comment
}

async function hl(str: string) {
	try {
		const highlighted = await instance.parse(str)
		const blocks = splitContent(highlighted)

		return blocks ?? highlighted
	} catch (error) {
		console.trace()
		throw error
	}
}

function splitContent(input: string): Blocks | null {
	const regex = /<__DOCINATOREPLACE__>(.*?)<\/__DOCINATOREPLACE__>/gs
	let result: Blocks = []
	let lastIndex = 0

	input.replace(regex, (match, p1, offset) => {
		// Add 'other' content before the code block, if any
		if (offset > lastIndex) {
			const block: Block = {
				type: 'other',
				content: input.slice(lastIndex, offset),
			}
			result.push(block)
		}

		// Add 'code' content
		const content = p1.trim()
		const og = HL_MAP.get(content)

		if (!og) {
			console.error('Unable to find original code block')
			// console.log({ content, og, HL_MAP })
			return match
		}

		const codeBlock: HighlightedBlock = {
			type: 'code',
			content,
			lang: og.lang as BundledLanguage,
			raw: og.code,
			title: getTitle(og) ?? '',
		}
		result.push(codeBlock)
		// console.log({result})

		// Update lastIndex to end of current match
		lastIndex = offset + match.length
		return match // Return value not used
	})

	// Add any remaining 'other' content after the last code block
	if (lastIndex < input.length) {
		result.push({ type: 'other', content: input.slice(lastIndex).trim() })
	}

	if (!result.some(b => b.type === 'code')) {
		return null
	}

	return result
}

function getTitle(block: ParsedHighlightedBlock): string | undefined {
	const info = block.info.replace(block.lang, '').trim()
	if (!info) return undefined

	const title = info.split(' ')[0]
	if (!title) return undefined

	return title
}

await main(input, output)
