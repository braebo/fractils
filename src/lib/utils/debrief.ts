/**
 * Configuration for {@link debrief}.
 */
export interface DebriefOptions {
	/**
	 * The max depth to traverse.
	 * @default 2
	 */
	depth?: number

	/**
	 * The max number of object or array entries before truncating.
	 * @default 4
	 */
	siblings?: number

	/**
	 * If `true` the {@link siblings} limit is bypassed on the top level.
	 * @default false
	 */
	preserveRootSiblings?: boolean

	/**
	 * The max number of chars per string before truncating.
	 * @default 30
	 */
	trim?: number

	/**
	 * The max number of decimal places to round numbers to.
	 * @default 3
	 */
	round?: number | false
}

/**
 * `tree` for objects, with variable depth, max siblings, and max string/number length.
 *
 * Useful when you want to:
 * - TLDR a large object
 * - serialize circular references
 * - pretty-print a complex object
 */
export function debrief<T>(
	/**
	 * The object to debrief.
	 */
	obj: unknown,
	/**
	 * Optional {@link DebriefOptions}.
	 */
	{
		depth = 2,
		siblings = 4,
		preserveRootSiblings = false,
		trim = 30,
		round = 3,
	}: DebriefOptions = {},
) {
	function parse(o: unknown, d: number): unknown {
		if (o === null) {
			return o
		}

		switch (typeof o) {
			case 'boolean':
			case 'symbol':
			case 'undefined': {
				return o
			}
			case 'string': {
				// Trim strings that are too long.
				if (o.length < trim + 3) return o
				return o.slice(0, trim) + '...'
			}

			case 'number': {
				// Trim numbers that are too long.
				const s = round ? o.toFixed(round) : o.toString()
				if (s.length > trim + 3) {
					return +s.slice(0, trim) + '...'
				}
				return +s
			}

			case 'bigint': {
				// Bigints can't be serialized, so we have to trim them.
				return +o.toString().slice(0, trim)
			}

			case 'function': {
				return o.name
			}

			case 'object': {
				const depthReached = d > depth

				if (Array.isArray(o)) {
					// if (depthReached) return `[...${o.length} ${o.length === 1 ? 'item' : 'items'}]`
					if (depthReached) return `[ ...${o.length} ]`
					if (o.length <= siblings || d === 0) return o.map(s => parse(s, d + 1))

					return [
						...o.slice(0, siblings).map(s => parse(s, d)),
						`...${o.length - siblings} more`,
					]
				}

				const keyCount = Object.keys(o).length

				if (depthReached) {
					return `{...${keyCount} ${keyCount === 1 ? 'entry' : 'entries'}}`
				}

				if (keyCount <= siblings || (preserveRootSiblings && d === 0)) {
					return Object.fromEntries(
						Object.entries(o).map(([k, v]) => [k, parse(v, d + 1)]),
					)
				}

				return Object.fromEntries(
					Object.entries(o)
						.slice(0, siblings)
						.concat([['...', `${keyCount - siblings} more`]])
						.map(([k, v]) => [k, parse(v, d + 1)]),
				)
			}
		}

		return o
	}

	return parse(obj, 0) as T
}
