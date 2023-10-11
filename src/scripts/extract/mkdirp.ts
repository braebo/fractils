import fs from 'node:fs'

export function mkdirp(dir: string) {
	try {
		fs.mkdirSync(dir, { recursive: true })
	} catch (e) {
		if ((e as any).code === 'EEXIST') {
			if (!fs.statSync(dir).isDirectory()) {
				throw new Error(
					`Cannot create directory ${dir}, a file already exists at this position`,
				)
			}
			return
		}
		throw e
	}
}
