import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'

import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs'

interface Options {
	cwd: string
	input: string
	output: string
	types: boolean
	config: {
		extensions?: string[]
		kit?: {
			alias?: Record<string, string>
			files?: {
				lib?: string
			}
			outDir?: string
		}
		preprocess?: PreprocessorGroup
	}
}

/**
 * Loads and validates svelte.config.js
 */
export async function load_config(options?: Options) {
	const cwd = options?.cwd || process.cwd()
	const config_file = path.join(cwd, 'svelte.config.js')

	if (!fs.existsSync(config_file)) {
		return {}
	}

	const module = await import(`${url.pathToFileURL(config_file).href}?ts=${Date.now()}`)
	const config = module.default

	if (config.package) {
		throw new Error(
			'config.package is no longer supported. See https://github.com/sveltejs/kit/discussions/8825 for more information.',
		)
	}

	return config satisfies Options
}

/**
 * Loads and validates package.json.
 */
export function load_pkg_json(cwd = process.cwd()) {
	const pkg_json_file = path.join(cwd, 'package.json')

	if (!fs.existsSync(pkg_json_file)) {
		return {}
	}

	return JSON.parse(fs.readFileSync(pkg_json_file, 'utf-8')) as Record<string, any>
}
