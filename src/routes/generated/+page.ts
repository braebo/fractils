import type { ParsedFile, ParsedSvelteFile } from '$scripts/extractinator/src/types'
import type { Load } from '@sveltejs/kit'

export const load: Load = async () => {
	const modules = import.meta.glob('$lib/../**/*.doc.json')

	const docs = await Promise.all(
		Object.entries(modules).map(async ([path, module]) => {
			// @ts-expect-error
			const contents = (await module()).default as ParsedFile
			return { path, contents }
		}),
	)

	return {
		docs,
	}
}
