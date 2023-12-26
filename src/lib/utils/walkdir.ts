import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Walks a directory recursively and calls a callback for each file.
 * @param dir The directory to walk.
 * @param cb The callback to call for each file.
 * @param filter Optional regex to filter files names by.
 *
 * @example
 * ```ts
 * import { walkdir } from 'fractils'
 *
 * walkdir('./static', console.log, /\.jpg$/)
 * ```
 *
 * @nodejs
 */
export async function walk(dir: string, cb: (path: string) => void, filter = /.*/) {
	const files = await readdir(dir, { withFileTypes: true })

	for (const file of files) {
		const res = resolve(dir, file.name)

		if (file.isDirectory()) {
			await walk(res, cb, filter)
			continue
		}

		if (filter.test(file.name)) {
			cb(res)
		}
	}
}
