import type { Options } from './types'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import colors from 'kleur'

/**
 * @param {import("./types").Options} options
 */
export function create_validator(options: import('./types').Options) {
	const { analyse_code, validate } = _create_validator(options)

	return {
		/**
		 * Checks a file content for problematic imports and things like `import.meta`
		 */
		analyse_code(name: string, content: string) {
			analyse_code(name, content)
		},
		validate() {
			const pkg: Record<string, any> = JSON.parse(
				readFileSync(join(options.cwd, 'package.json'), 'utf-8'),
			)
			const warnings = validate(pkg)
			// Just warnings, not errors, because
			// - would be annoying in watch mode (would have to restart the server)
			// - maybe there's a custom post-build script that fixes some of these
			if (warnings.length) {
				console.log(
					colors
						.bold()
						.yellow(
							'@sveltejs/package found the following issues while packaging your library:',
						),
				)
				for (const warning of warnings) {
					console.log(colors.yellow(`${warning}\n`))
				}
			}
		},
	}
}
/**
 * @param {import("./types").Options} options
 */
export function _create_validator(options: Options) {
	/** @type {Set<string>} */
	const imports: Set<string> = new Set()
	let uses_import_meta = false
	let has_svelte_files = false

	/**
	 * Checks a file content for problematic imports and things like `import.meta`
	 * @param {string} name
	 * @param {string} content
	 */
	function analyse_code(name: string, content: string) {
		has_svelte_files =
			has_svelte_files ||
			(options.config.extensions ?? ['.svelte']).some((ext) => name.endsWith(ext))
		uses_import_meta = uses_import_meta || content.includes('import.meta.env')

		const file_imports = [
			...content.matchAll(/from\s+('|")([^"';,]+?)\1/g),
			...content.matchAll(/import\s*\(\s*('|")([^"';,]+?)\1\s*\)/g),
		]
		for (const [, , import_path] of file_imports) {
			if (import_path.startsWith('$app/')) {
				imports.add(import_path)
			}
		}
	}

	/**
	 * @param {Record<string, any>} pkg
	 */
	function validate(pkg: Record<string, any>) {
		/** @type {string[]} */
		const warnings: string[] = []

		if (
			imports.has('$app/environment') &&
			[...imports].filter((i) => i.startsWith('$app/')).length === 1
		) {
			warnings.push(
				'Avoid usage of `$app/environment` in your code, if you want to library to work for people not using SvelteKit (only regular Svelte, for example). ' +
					'Consider using packages like `esm-env` instead which provide cross-bundler-compatible environment variables.',
			)
		}

		if (uses_import_meta) {
			warnings.push(
				'Avoid usage of `import.meta.env` in your code. It requires a bundler to work. ' +
					'Consider using packages like `esm-env` instead which provide cross-bundler-compatible environment variables.',
			)
		}

		if (
			!(pkg.dependencies?.['@sveltejs/kit'] || pkg.peerDependencies?.['@sveltejs/kit']) &&
			([...imports].some((i) => i.startsWith('$app/')) || imports.has('@sveltejs/kit'))
		) {
			warnings.push(
				'You are using SvelteKit-specific imports in your code, but you have not declared a dependency on `@sveltejs/kit` in your `package.json`. ' +
					'Add it to your `dependencies` or `peerDependencies`.',
			)
		}

		if (
			!(pkg.dependencies?.svelte || pkg.peerDependencies?.svelte) &&
			(has_svelte_files ||
				[...imports].some((i) => i.startsWith('svelte/') || imports.has('svelte')))
		) {
			warnings.push(
				'You are using Svelte components or Svelte-specific imports in your code, but you have not declared a dependency on `svelte` in your `package.json`. ' +
					'Add it to your `dependencies` or `peerDependencies`.',
			)
		}

		if (pkg.exports) {
			const { conditions } = traverse_exports(pkg.exports)
			if (has_svelte_files && !pkg.svelte && !conditions.has('svelte')) {
				warnings.push(
					'You are using Svelte files, but did not declare a `svelte` condition in one of your `exports` in your `package.json`. ' +
						'Add a `svelte` condition to your `exports` to ensure that your package is recognized as Svelte package by tooling. ' +
						'See https://kit.svelte.dev/docs/packaging#anatomy-of-a-package-json-exports for more info',
				)
			}

			if (pkg.svelte) {
				const root_export = pkg.exports['.']
				if (!root_export) {
					warnings.push(
						'You have a `svelte` field in your `package.json`, but no root export in your `exports`. Please align them so that bundlers will resolve consistently to the same file.',
					)
				} else {
					const { exports } = traverse_exports({ '.': root_export })
					if (
						![...exports]
							.map(export_to_regex)
							.some((_export) => _export.test(pkg.svelte))
					) {
						warnings.push(
							'The `svelte` field in your `package.json` does not match any export in your root `exports`. Please align them so that bundlers will resolve consistently to the same file.',
						)
						Object.keys(pkg.exports).map(export_to_regex)
					}
				}
			}
		} else {
			warnings.push(
				'No `exports` field found in `package.json`, please provide one. ' +
					'See https://kit.svelte.dev/docs/packaging#anatomy-of-a-package-json-exports for more info',
			)
		}

		return warnings
	}

	return {
		analyse_code,
		validate,
	}
}

/**
 * @param {Record<string, any>} exports_map
 * @returns {{ exports: Set<string>; conditions: Set<string> }}
 */
function traverse_exports(exports_map: Record<string, any>): {
	exports: Set<string>
	conditions: Set<string>
} {
	/** @type {Set<string>} */
	const exports: Set<string> = new Set()
	/** @type {Set<string>} */
	const conditions: Set<string> = new Set()

	/**
	 * @param {Record<string, any>} exports_map
	 * @param {boolean} is_first_level
	 */
	function traverse(exports_map: Record<string, any>, is_first_level: boolean) {
		for (const key of Object.keys(exports_map ?? {})) {
			if (!is_first_level) {
				conditions.add(key)
			}

			const _export = exports_map[key]

			if (typeof _export === 'string') {
				exports.add(_export)
			} else {
				traverse(_export, false)
			}
		}
	}

	traverse(exports_map, true)

	return { exports, conditions }
}

/** @param {string} _export */
function export_to_regex(_export: string) {
	// $& means the whole matched string
	const regex_str = _export.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
	return new RegExp(`^${regex_str}$`)
}
