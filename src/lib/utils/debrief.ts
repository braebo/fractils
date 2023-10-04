/**
 * Like tree for objects, with controls for depth, max siblings, and string length.
 */
export function debrief<T>(
	obj: unknown,
	{
		depth = 2,
		siblings = 4,
		trim = 15,
	}: { depth?: number; siblings?: number; trim?: number; verbose?: boolean } = {},
) {
	function parse(o: unknown, d: number): unknown {
		if (o === null) return o

		if (Array.isArray(o)) {
			if (d > depth) return `[...${o.length} ${o.length === 1 ? 'item' : 'items'}]`
			if (o.length <= siblings) return o.map((s) => parse(s, d + 1))
			return [
				...o.slice(0, siblings).map((s) => parse(s, d)),
				`...${o.length - siblings} more`,
			]
		}

		if (typeof o === 'object') {
			const keyCount = Object.keys(o).length
			if (d > depth) return `{...${keyCount} ${keyCount === 1 ? 'item' : 'items'}}`

			if (keyCount <= siblings) {
				return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, parse(v, d + 1)]))
			}

			return Object.fromEntries(
				Object.entries(o)
					.slice(0, siblings)
					.concat([['...', `${keyCount - siblings} more`]])
					.map(([k, v]) => [k, parse(v, d + 1)]),
			)
		}

		if (d > depth) return '...'

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
