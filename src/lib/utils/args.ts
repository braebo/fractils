import { coerce as coerceValue } from './coerce'

export class ArgMap {
	map: Map<string, string | number | boolean>

	constructor(public args: string[]) {
		if (typeof args === 'undefined') throw new Error('No arguments provided.')

		this.map = mapArgs(this.args)
	}

	get(name: string) {
		return this.resolve(name)
	}

	set(name: string, value: string | number | boolean) {
		this.map.set(name, value)
		return this
	}

	toObject() {
		return Object.fromEntries(this.map.entries())
	}

	/**
	 * Resolves a long or short name to its value. If the name is not
	 * found, it looks for an existing match of the first character
	 * as an implicit short name.
	 */
	resolve(name: string) {
		const long = this.map.get(name)
		if (typeof long !== 'undefined') {
			return long
		}

		// Find the key-value pair with the first letter of the name matching the short name
		const char = name.charAt(0)
		const short = Array.from(this.map.entries()).find(([k]) => k.charAt(0) === char)
		if (short) {
			return short[1]
		}

		return undefined
	}
}

/**
 * Get the value of a command line argument by name from an array of arguments.
 */
export function resolveArg(name: string, args: string[]) {
	const kvRegex = new RegExp(`^--${name}=`)
	const flagRegex = new RegExp(`^-${name.charAt(0)}$|^--${name}$`)

	for (let i = 0; i < args.length; i++) {
		if (kvRegex.test(args[i])) {
			// Handle key-value pairs like --input=/path
			return args[i].split('=')[1]
		} else if (args[i] === `-${name.charAt(0)}` || args[i] === `--${name}`) {
			// Handle separated key and value like --input /path
			if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
				return args[i + 1]
			}
			return true // Handle boolean flags when no following value is present
		}
	}

	// After checking for key-value pairs, check for a standalone boolean flag
	for (let i = 0; i < args.length; i++) {
		if (flagRegex.test(args[i])) {
			return true
		}
	}

	return undefined
}

/**
 * Converts an array of args to a Map of key-value pairs.
 * - Arguments starting with -- support spaces and `=` as a separator, e.g. `--name=John` or `--name John`
 * - Arguments starting with - support k/v with spaces, e.g. `-n John` or boolean flags, e.g. `-n`
 * - Arguments without a leading - or -- are treated as positional arguments and ignored.
 * @param args The array of arguments to convert.
 * @param coerce Whether to coerce numbers and booleans, or leave them as strings.  Defaults to true.
 */
export function mapArgs(args: string[], coerce = true): Map<string, string | number | boolean> {
	const map = new Map<string, string | number | boolean>()

	for (let i = 0; i < args.length; i++) {
		const a = args[i]

		const long = new RegExp(`^--([a-zA-Z0-9-]+)=?`)
		const short = new RegExp(`^-${a.charAt(0)}$`)

		const name = a.match(long)?.[1] ?? a.match(short)?.[1] ?? a

		if (!name) continue

		const value = resolveArg(name, args)

		if (typeof value !== 'undefined') {
			console.log({ name, value })
			map.set(name!, coerce && typeof value === 'string' ? coerceValue(value) : value)
		}

		if (a.startsWith('--') || a.startsWith('-')) {
			const next = args[i + 1]

			if (next && !next.startsWith('-')) {
				map.set(a.replace(/^-+/, ''), coerce ? coerceValue(next) : next)
			} else {
				map.set(a.replace(/^-+/, ''), true)
			}
		}
	}

	return map
}
