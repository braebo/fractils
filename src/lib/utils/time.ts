import { l, n, dim } from './l'
import c from 'chalk'

/**
 * Options for `start`.
 */
export interface StartOptions {
	/**
	 * Whether to use a random color for the label.
	 * @default true
	 */
	randomColor?: boolean
	/**
	 * Whether to pad the label with newlines.
	 * @default true
	 */
	pad?: boolean
	/**
	 * Whether to log at creation.
	 * @default true
	 */
	logStart?: boolean

	/**
	 * Symbol shown before all labels.
	 * @default '▶︎'
	 */
	symbol?: string

	/**
	 * Symbol to use at the start of the label.
	 * @default '⏹'
	 */
	startSymbol?: string

	/**
	 * Symbol to use at the end of the label.
	 * @default '⏹'
	 */
	endSymbol?: string

	/**
	 * Number of decimal places to show for milliseconds.
	 * @default 1
	 */
	decimals?: number
}

/**
 * Like `console.time`, returning a `console.timeEnd` function.
 * @param label - Console label.
 * @returns `console.timeEnd` for the given label.
 * @example
 * ```ts
 * const end = start('foo')
 * // do stuff
 * end() // foo 1.2s
 * ```
 */
export function start(label: string, options?: StartOptions) {
	const { randomColor, pad, logStart } = Object.assign(
		{
			randomColor: true,
			pad: false,
			logStart: false,
		} satisfies StartOptions,
		options,
	)

	const startSymbol = options?.startSymbol ?? options?.symbol ?? '▶︎'
	const endSymbol = options?.endSymbol ?? options?.symbol ?? '⏹'

	const hex = randomColor
		? c.hex(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
		: (x: string) => x

	if (logStart) {
		if (pad) n()
		l(hex(startSymbol + ' ') + label)
		if (pad) n()
	}

	const start = performance.now()

	return () => {
		const end = fmtTime(performance.now() - start, { decimals: options?.decimals })

		if (pad) n()
		l(hex(endSymbol + ' ') + label.replace('()', '') + ' ' + end)
		if (pad) n()
	}
}

/**
 * Formats a number representing time.  Smaller numbers are formatted in
 * milliseconds, and larger numbers in seconds. In both cases, precision
 * is kept to a minimum (trailing zeroes are removed).
 * @param n - Time in milliseconds.
 * @returns Formatted time string.
 */
export function fmtTime(n: number, options?: { decimals?: number }): string {
	const { decimals = n > 1 ? 1 : 2 } = options ?? {}

	if (n < 10) {
		return removeTrailingZeroes(getBestPrecision(n)) + dim('ms')
	} else {
		return removeTrailingZeroes((n / 1000).toFixed(decimals)) + dim('s')
	}

	function removeTrailingZeroes(str: string): string {
		return str.replace(/\.?0+$/, '')
	}

	function getBestPrecision(ms: number) {
		for (let decimals = 1; decimals <= 10; decimals++) {
			const value = ms.toFixed(decimals)
			if (value.at(-1) !== '0') {
				return value
			}
		}
		return ms.toString() // Just in case...
	}
}
