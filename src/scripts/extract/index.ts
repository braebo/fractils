/**
 * @fileoverview
 * Extracts all tsdoc comments from the `src/lib` folder
 * and writes them to `*.doc.json` files for further processing.
 *
 * Run with `pnpm extract` or `bun src/scripts/extract/index.ts`.
 */

import { readFile, writeFile, unlink } from 'node:fs/promises'
import { start, type StartOptions } from '$lib/utils/time'
import { Extractor, type ParsedFile } from './Extractor'
import { entries, values } from '$lib/utils/object'
import { bd, dim, g, l, n } from '$lib/utils/l'
import { svelte2tsx } from 'svelte2tsx'
import { globbySync } from 'globby'

const lib = 'src/lib/'
// prettier-ignore
const folders = [
	// 'components',
	// 'actions',
	'stores',
	'theme',
	// 'utils',
] as const

type FilePath = string

interface Category {
	category: string
	folderPath: string
	files: FilePath[]
}

interface ParsedCategory {
	category: string
	folderPath: string
	files: ParsedFile[]
}

type CategoryMap = Record<(typeof folders)[number], Category>

let fileCount = 0
let commentCount = 0
let jsonCount = 0
const opts: StartOptions = {
	pad: false,
	logStart: false,
}

await extract(false)

async function extract(verbose = false) {
	const end = start(bd('extract'), {
		...opts,
		symbol: '🏁',
	})

	// Get all files.
	const categories = buildCategoryMap()

	if (verbose) {
		l('Extracting:\n' + Object.keys(categories))
	}

	fileCount += Object.values(categories).reduce((acc, { files }) => acc + files.length, 0)

	// Transform svelte to typescript.
	await transformSvelte(categories)

	// Extract doc comments.
	const comments = await getComments(categories, verbose)

	commentCount += comments.reduce(
		(acc, { files }) => acc + files.reduce((acc, { variables }) => acc + variables.length, 0),
		0,
	)

	// Save the results.
	await writeComments(comments, verbose)

	// Remove the generated files.
	await cleanup()

	n()
	l(dim('Files analysed     '), g(fileCount))
	l(dim('Comments extracted '), g(commentCount))
	l(dim('JSON written       '), g(jsonCount))
	n()

	end()
}

/**
 * Writes all comments to `*.doc.json` files.
 */
async function writeComments(comments: ParsedCategory[], verbose = false) {
	const end = start('writeComments', opts)

	for (const { files } of comments) {
		for (const parsedFile of files) {
			const out = parsedFile.file.replace(/\.(svelte|ts)/, '.doc.json')

			if (!out.endsWith('.doc.json')) {
				throw new Error('malformed json file: ' + out)
			}

			if (verbose) l(dim('Writing file: ') + out)

			await writeFile(out, JSON.stringify(files, null, 2), {
				encoding: 'utf-8',
			})

			jsonCount++
		}
	}

	end()
}

function buildCategoryMap() {
	const categories = folders.reduce((acc, folder) => {
		acc[folder] = {
			category: folder,
			folderPath: lib + folder,
			files: globbySync(lib + folder, {
				expandDirectories: {
					extensions: ['svelte', 'ts'],
				},
			}).filter((p) => !p.endsWith('.svelte.ts')),
		}
		return acc
	}, {} as CategoryMap)

	return categories
}

/**
 * Extracts and parses all comments from a given {@link CategoryMap}.
 * @param map {@link CategoryMap}
 */
async function getComments(map: CategoryMap, verbose: boolean) {
	const end = start('getComments', opts)

	let comments: ParsedCategory[] = []

	for (const [name, category] of entries(map)) {
		if (!category.files.length) {
			comments.push({
				...category,
				files: [],
			} as ParsedCategory)
		}

		const parsedFile = await Extractor.scanFiles(category.files, verbose)
		comments.push({
			...category,
			files: parsedFile,
		} as ParsedCategory)
	}

	if (verbose) {
		for (const comment of comments) {
			for (const { variables } of comment.files) {
				for (const comment of variables) {
					Extractor.logComment(comment)
				}
			}
		}
	}

	end()
	return comments
}

/**
 * Transforms all `*.svelte` files to `*.svelte.ts` files using `svelte2tsx`.
 */
async function transformSvelte(map: CategoryMap) {
	const end = start('transformSvelte', opts)

	for (const [name, category] of entries(map)) {
		for (const filepath of category.files.filter((p) => p.endsWith('.svelte'))) {
			const buffer = await readFile(filepath, {
				encoding: 'utf-8',
			})

			const filename = filepath.split('/').pop() as string

			const compiled = svelte2tsx(buffer, {
				filename,
				isTsFile: true,
			})

			await writeFile(filepath + '.ts', compiled.code)

			map[name].files[map[name].files.indexOf(filepath)] += '.ts'
		}
	}

	end()
}

/** Removes all generated `*.svelte.ts` files after the extraction process. */
async function cleanup() {
	const files = globbySync('src/lib/**/*.svelte.ts')

	for (const file of files) {
		await unlink(file)
	}
}
