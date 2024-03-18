/**
 * Fast, fuzzy string search.
 * @param needle - The query string to search for.
 * @param haystack - The string to search in.
 * @returns `true` if the needle is found in the haystack, `false` otherwise.
 * @example
 * ```ts
 * fuzzysearch('needle', 'haystackneedlehaystack') // true
 * ```
 * @see https://github.com/helyo-world/fuzzysearch-ts
 */
export function fuzzysearch(needle: string, haystack: string) {
	const n = needle.length
	const h = haystack.length

	if (n > h) {
		return false
	}

	if (n === h) {
		return needle === haystack
	}

	outer: for (let i = 0, j = 0; i < n; i++) {
		let nch = needle.charCodeAt(i)
		while (j < h) {
			if (haystack.charCodeAt(j++) === nch) {
				continue outer
			}
		}
		return false
	}

	return true
}
