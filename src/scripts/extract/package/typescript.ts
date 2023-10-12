import type { File } from './types'
import type ts from 'typescript'

import { posixify, mkdirp, rimraf, walk } from '$lib/utils/filesystem'
import { resolve_aliases, write } from './utils'
import { createRequire } from 'node:module'
import { load_pkg_json } from './config.js'
import { emitDts } from 'svelte2tsx'
import * as path from 'node:path'
import * as fs from 'node:fs'
import semver from 'semver'

/**
 * Generates d.ts files by invoking TypeScript's "emit d.ts files from input files".
 * The files are written to a temporary location and those which should be kept
 * are sanitized ($lib alias resolved) and copied over to the destination folder.
 */
export async function emit_dts(
	input: string,
	output: string,
	cwd: string,
	alias: Record<string, string>,
	files: File[],
) {
	const tmp = `${output}/__package_types_tmp__`
	rimraf(tmp)
	mkdirp(tmp)

	const require = createRequire(import.meta.url)
	const pkg = load_pkg_json(cwd)
	const svelte_dep = pkg.peerDependencies?.svelte || pkg.dependencies?.svelte || '3.0'
	const no_svelte_3 = !semver.intersects(svelte_dep, '^3.0.0')
	await emitDts({
		libRoot: input,
		svelteShimsPath: no_svelte_3
			? require.resolve('svelte2tsx/svelte-shims-v4.d.ts')
			: require.resolve('svelte2tsx/svelte-shims.d.ts'),
		declarationDir: path.relative(cwd, tmp),
	})

	const handwritten = new Set()

	// skip files that conflict with hand-written .d.ts
	for (const file of files) {
		if (file.name.endsWith('.d.ts')) {
			handwritten.add(file.name)
		}
	}

	// resolve $lib alias (TODO others), copy into package dir
	for (const file of walk(tmp)) {
		const normalized = posixify(file)

		if (handwritten.has(normalized)) {
			console.warn(`Using $lib/${normalized} instead of generated .d.ts file`)
		}

		const source = fs.readFileSync(path.join(tmp, normalized), 'utf8')
		write(path.join(output, normalized), resolve_aliases(input, normalized, source, alias))
	}

	rimraf(tmp)
}

/**
 * TS -> JS
 */
export async function transpile_ts(filename: string, source: string) {
	const ts = await try_load_ts()
	return ts.transpileModule(source, {
		compilerOptions: load_tsconfig(filename, ts),
		fileName: filename,
	}).outputText
}

async function try_load_ts() {
	try {
		return (await import('typescript')).default
	} catch (e) {
		throw new Error(
			'You need to install TypeScript if you want to transpile TypeScript files and/or generate type definitions',
		)
	}
}

function load_tsconfig(filename: string, typescript: typeof ts) {
	let config_filename: string | undefined

	// ts.findConfigFile is broken (it will favour a distant tsconfig
	// over a near jsconfig, and then only when you call it twice)
	// so we implement it ourselves
	let dir = filename
	while (dir !== (dir = path.dirname(dir))) {
		const tsconfig = path.join(dir, 'tsconfig.json')
		const jsconfig = path.join(dir, 'jsconfig.json')

		if (fs.existsSync(tsconfig)) {
			config_filename = tsconfig
			break
		}

		if (fs.existsSync(jsconfig)) {
			config_filename = jsconfig
			break
		}
	}

	if (!config_filename) {
		throw new Error('Failed to locate tsconfig or jsconfig')
	}

	const { error, config } = typescript.readConfigFile(config_filename, typescript.sys.readFile)

	if (error) {
		throw new Error('Malformed tsconfig\n' + JSON.stringify(error, null, 2))
	}

	// Do this so TS will not search for initial files which might take a while
	config.include = []
	config.files = []
	const { options } = typescript.parseJsonConfigFileContent(
		config,
		typescript.sys,
		path.dirname(config_filename),
		{ sourceMap: false },
		config_filename,
	)
	return options
}
