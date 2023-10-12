import type { File } from './types'

import { posixify, mkdirp, walk } from '$lib/utils/filesystem'
import { r, g, b, bd, dim, entries } from '$lib'
import tsdoc from '@microsoft/tsdoc'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { log } from 'console'
import ts from 'typescript'
import os from 'node:os'

/**
 * Resolves aliases. `file` should be relative to `input`.
 */
export function resolve_aliases(
	input: string,
	file: string,
	content: string,
	aliases: Record<string, string>,
) {
	const replace_import_path = (match: string, _: string, import_path: string) => {
		for (const [alias, value] of entries(aliases)) {
			if (!import_path.startsWith(alias)) continue

			const full_path = path.join(input, file)
			const full_import_path = path.join(value, import_path.slice(alias.length))
			let resolved = posixify(path.relative(path.dirname(full_path), full_import_path))
			resolved = resolved.startsWith('.') ? resolved : './' + resolved
			return match.replace(import_path, resolved)
		}
		return match
	}

	content = content.replace(/from\s+('|")([^"';,]+?)\1/g, replace_import_path)
	content = content.replace(/import\s*\(\s*('|")([^"';,]+?)\1\s*\)/g, replace_import_path)
	return content
}

/**
 * Strip out lang="X" or type="text/X" tags. Doing it here is only a temporary solution.
 * See https://github.com/sveltejs/kit/issues/2450 for ideas for places where it's handled better.
 */
export function strip_lang_tags(content: string) {
	return content
		.replace(
			/(<!--[^]*?-->)|(<script[^>]*?)\s(?:type|lang)=(["'])(.*?)\3/g,
			// things like application/ld+json should be kept as-is. Preprocessed languages are "ts" etc
			(match, s1, s2, _, s4) =>
				s4?.startsWith('application/') ? match : (s1 ?? '') + (s2 ?? ''),
		)
		.replace(/(<!--[^]*?-->)|(<style[^>]*?)\s(?:type|lang)=(["']).*?\3/g, '$1$2')
}

/**
 * Write a file, creating any intermediate directories as necessary.
 */
export function write(file: string, contents: Parameters<typeof fs.writeFileSync>[1]) {
	mkdirp(path.dirname(file))
	fs.writeFileSync(file, contents)
}

export function scan(input: string, extensions: string[]) {
	return walk(input).map((file) => analyze(file, extensions))
}

export function analyze(file: string, extensions: string[]) {
	const name = posixify(file)

	const svelte_extension = extensions.find((ext) => name.endsWith(ext))

	const base = svelte_extension ? name : name.slice(0, -path.extname(name).length)

	const dest = svelte_extension
		? name.slice(0, -svelte_extension.length) + '.svelte'
		: name.endsWith('.d.ts')
		? name
		: name.endsWith('.ts')
		? name.slice(0, -3) + '.js'
		: name

	return {
		name,
		dest,
		base,
		is_svelte: !!svelte_extension,
	} satisfies File
}

export function reportCompilerErrors(program: ts.Program, verbose = false) {
	const l = verbose ? log : () => {}
	const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> = program.getSemanticDiagnostics()
	const count = compilerDiagnostics.length

	if (count <= 0) {
		l(g('No compiler errors.'))
		return
	}

	l(`\n${bd(r(count))} compiler ${count === 1 ? 'error' : 'errors'} found:\n`)

	if (verbose) {
		for (const diagnostic of compilerDiagnostics) {
			const message: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, os.EOL)
			if (diagnostic.file) {
				const location: ts.LineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(
					diagnostic.start!,
				)
				const formattedMessage: string =
					b('\n[TypeScript] ') +
					r(message) +
					dim(
						`\n${diagnostic.file.fileName}(${location.line + 1},${
							location.character + 1
						})`,
					)
				l(formattedMessage)
			} else {
				l(r(message))
			}
		}
	}
}

/**
 * Pretty prints a {@link DocNode} tree to the console.
 */
export function logTSDocTree(
	docNode: tsdoc.DocNode,
	outputLines: string[] = [],
	indent: string = '',
) {
	let dumpText: string = ''
	if (docNode instanceof tsdoc.DocExcerpt) {
		const content: string = docNode.content.toString()
		dumpText += dim(`${indent}* ${docNode.excerptKind}: `) + b(JSON.stringify(content))
	} else {
		dumpText += `${indent}- ${docNode.kind}`
	}
	outputLines.push(dumpText)

	for (const child of docNode.getChildNodes()) {
		logTSDocTree(child, outputLines, indent + '  ')
	}

	return outputLines
}
