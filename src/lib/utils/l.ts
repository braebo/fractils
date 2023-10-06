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
	l(bd(hex(label)))
	n()

	const start = performance.now()

	return () => {
		n()
		const end =
			format === 'ms'
				? (performance.now() - start).toFixed(2) + 'ms'
				: ((performance.now() - start) / 1000).toFixed(1).replace('.0', '') + 's'

		l(`${hex(label.replace('()', ''))} ${end}`)
		n()
	}
}
