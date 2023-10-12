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

/** chalk.magenta */
export function m(...args: unknown[]) {
	return c.magenta(...args)
}

const orange = c.hex('#cc6630')
/** orange chalk.hex('#cc6630') */
export function o(...args: unknown[]) {
	return orange(...args)
}

const pink = c.hex('#eaa')
/** pink chalk.hex('#eaa') */
export function p(...args: unknown[]) {
	return pink(...args)
}

const lightGreen = c.hex('#aea')
/** lightGreen chalk.hex('#aea') */
export function lg(...args: unknown[]) {
	return lightGreen(...args)
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
	 * @default 1
	 */
	count = 1,
) {
	for (let i = 0; i < count; i++) console.log()
}

/** JSON.Stringify */
export function j(o: unknown) {
	return stringify(o, 2)
}
