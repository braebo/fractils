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
}

/**
 * Like `tree` for objects, with options for depth, max siblings, and max string length.
 */
export function debrief<T>(
	obj: unknown,
	{ depth = 2, siblings = 4, preserveRootSiblings = false, trim = 30 }: DebriefOptions = {},
) {
	function parse(o: unknown, d: number): unknown {
		if (o === null) return o

		const depthReached = d > depth

		if (Array.isArray(o)) {
			if (depthReached) return `[...${o.length} ${o.length === 1 ? 'item' : 'items'}]`
			if (o.length <= siblings || d === 0) return o.map(s => parse(s, d + 1))
			return [...o.slice(0, siblings).map(s => parse(s, d)), `...${o.length - siblings} more`]
		}

		if (typeof o === 'object') {
			const keyCount = Object.keys(o).length
			if (depthReached) return `{...${keyCount} ${keyCount === 1 ? 'entry' : 'entries'}}`

			if (keyCount <= siblings || (preserveRootSiblings && d === 0)) {
				return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, parse(v, d + 1)]))
			}

			return Object.fromEntries(
				Object.entries(o)
					.slice(0, siblings)
					.concat([['...', `${keyCount - siblings} more`]])
					.map(([k, v]) => [k, parse(v, d + 1)]),
			)
		}

		if (['boolean', 'symbol', 'undefined'].includes(typeof o)) return o

		switch (typeof o) {
			case 'string': {
				// Trim strings that are too long.
				if (o.length < trim + 3) return o
				return o.slice(0, trim) + '...'
			}

			case 'number': {
				// Trim numbers that are too long.
				if (o.toString().length > trim + 3) {
					return +o.toFixed(trim)
				}
				return o
			}

			case 'bigint': {
				// Bigints can't be serialized, so we have to trim them.
				return +o.toString().slice(0, trim)
			}

			case 'function': {
				return o.name
			}
		}

		return o
	}

	return parse(obj, 0) as T
}
