import { stringify } from './stringify'
import c from 'chalk'

// Ridiculously short color logging functions that
// nobody should ever use. I just like them sometimes.

/** console.log */
export function l(...args: unknown[]) {
	console.log(...args)
}

/** chalk.red */
export function r(...args: unknown[]) {
	return c.red(...args)
}

/** chalk.green */
export function g(...args: unknown[]) {
	return c.green(...args)
}

/** chalk.blue */
export function b(...args: unknown[]) {
	return c.blue(...args)
}

/** chalk.yellow */
export function y(...args: unknown[]) {
	return c.yellow(...args)
}

/** chalk.dim */
export function dim(...args: unknown[]) {
	return c.dim(...args)
}

/** chalk.bold */
export function bd(...args: unknown[]) {
	return c.bold(...args)
}

/**
 * Logs an empty line.
 */
export function n(
	/**
	 * Number of empty lines to log.
	 * @defaultValue 1
	 */
	count = 1,
) {
	for (let i = 0; i < count; i++) console.log()
}

n()

/** JSON.Stringify */
export function j(o: unknown) {
	return stringify(o, 2)
}

/** Short timestamp. */
export function timestamp() {
	return new Date()
		.toISOString()
		.replace(/[-:.TZ]/g, '')
		.slice(2, 12)
}

/**
 * Like `console.time`, returning a `console.timeEnd` function.
 * @param label Console label.
 * @param randomColor Whether to use a random color for the label.
 * @param format Whether to log the time in seconds or milliseconds.
 * @returns `console.timeEnd` for the given label.
 * @example
 * const end = start('foo')
 * // do stuff
 * end() // foo 1.2s
 */
export function start(label: string, randomColor = true, format: 's' | 'ms' = 's') {
	const hex = randomColor
		? c.hex(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
		: (x: string) => x

	n()
	l(hex('▶︎ ') + label)
	n()

	const start = performance.now()

	return () => {
		n()
		const end = performance.now() - start

		l(hex('⏹ ') + label.replace('()', '') + ' ' + fmtTime(end))
		n()
	}
}

/**
 * Formats a number representing time.  Smaller numbers are formatted in
 * milliseconds, and larger numbers in seconds. In both cases, precision
 * is kept to a minimum and trailing zeroes are removed.
 * @param n Time in milliseconds.
 * @returns Formatted time string.
 */
export function fmtTime(n: number): string {
	if (n < 10) {
		return removeTrailingZeroes(getBestPrecision(n)) + dim('ms')
	} else {
		return removeTrailingZeroes((n / 1000).toFixed(1)) + dim('s')
	}

	function removeTrailingZeroes(str: string): string {
		return str.replace(/\.?0+$/, '')
	}

	function getBestPrecision(ms: number) {
		for (let precision = 1; precision <= 10; precision++) {
			const value = ms.toFixed(precision)
			if (value.at(-1) !== '0') {
				return value
			}
		}
		return ms.toString() // Unlikely.
	}
}
