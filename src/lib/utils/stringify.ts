export type StringifyOptions = typeof stringifyOptionsDefault

const stringifyOptionsDefault = {
	indentation: 2,
	highlight: false,
	singleQuote: false,
}

/**
 * JSON.stringify with circular reference support.
 */
export function stringify(obj: {}, options?: StringifyOptions): string {
	const opts = {
		...stringifyOptionsDefault,
		...options,
	}

	const seen = new WeakSet()

	const str = JSON.stringify(
		obj,
		(_, value) => {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					return 'CIRCULAR'
				}
				seen.add(value)
			}
			return value
		},
		opts.indentation,
	)

	return str
}
