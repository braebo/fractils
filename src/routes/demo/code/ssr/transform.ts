export function transform(str: string) {
	return str
		.replace('$lib/utils/highlight', 'fractils')
		.replace(
			"import Code from '$lib/components/Code.svelte'",
			"import { Code } from 'fractils'",
		)
		.replace('<!-- [!code focus] -->', '// [!code focus]')
		.trim()
}
