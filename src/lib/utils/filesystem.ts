import fs from 'node:fs'
import path from 'node:path'

/**
 * Make a directory recursively if it doesn't exist.
 */
export function mkdirp(dir: string) {
	try {
		fs.mkdirSync(dir, { recursive: true })
	} catch (e: any) {
		if (e.code === 'EEXIST') return
		throw e
	}
}

/**
 * Forcably remove a directory recursively.
 * @param path - Path to the directory to remove.
 */
export function rimraf(path: string) {
	fs.rmSync(path, { force: true, recursive: true })
}

/**
 * Convert Windows paths to POSIX paths.
 */
export function posixify(str: string) {
	return str.replace(/\\/g, '/')
}

/**
 * Get a list of all files in a directory
 * @param cwd - the directory to walk
 * @param dirs - whether to include directories in the result
 */
export function walk(cwd: string, dirs = false) {
	const all_files: string[] = []

	function walk_dir(dir: string) {
		const files = fs.readdirSync(path.join(cwd, dir))

		for (const file of files) {
			const joined = path.join(dir, file)
			const stats = fs.statSync(path.join(cwd, joined))
			if (stats.isDirectory()) {
				if (dirs) all_files.push(joined)
				walk_dir(joined)
			} else {
				all_files.push(joined)
			}
		}
	}

	return walk_dir(''), all_files
}

interface CopyOptions {
	/**
	 * A function to filter files.  Provides the basename of each file
	 * and should return a boolean indicating whether to include the file.
	 * @param basename the basename of a file
	 */
	filter?: (basename: string) => boolean

	/**
	 * A map of strings to replace in copied files.
	 */
	replace?: Record<string, string>
}

/**
 * Copy a directory recursively.
 */
export function copy(source: string, target: string, opts: CopyOptions = {}) {
	if (!fs.existsSync(source)) return []

	const files: string[] = []

	const prefix = posixify(target) + '/'

	const regex = opts.replace
		? new RegExp(`\\b(${Object.keys(opts.replace).join('|')})\\b`, 'g')
		: null

	function go(from: string, to: string) {
		if (opts.filter && !opts.filter(path.basename(from))) return

		const stats = fs.statSync(from)

		if (stats.isDirectory()) {
			fs.readdirSync(from).forEach((file) => {
				go(path.join(from, file), path.join(to, file))
			})
		} else {
			mkdirp(path.dirname(to))

			if (opts.replace) {
				const data = fs.readFileSync(from, 'utf-8')
				fs.writeFileSync(
					to,
					data.replace(regex!, (_match, key) => opts.replace![key]),
				)
			} else {
				fs.copyFileSync(from, to)
			}

			files.push(
				to === target ? posixify(path.basename(to)) : posixify(to).replace(prefix, ''),
			)
		}
	}

	go(source, target)

	return files
}
