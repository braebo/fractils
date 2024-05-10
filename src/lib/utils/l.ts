import { stringify } from './stringify'
import ch from 'chalk'
// import ch from '../color/ansi'

// Ridiculously short color logging functions that
// nobody should ever use. I just like them sometimes.

/** color reset */
export const reset = ch.reset

/** fn from hex string */
export const hex = (str: string) => ch.hex(str)

/** console.log */
export function l(...args: unknown[]) {
	console.log(...args)
}

/** chalk.red */
export function r(...args: unknown[]) {
	return ch.red(...args)
}

/** chalk.green */
export function g(...args: unknown[]) {
	return ch.green(...args)
}

/** chalk.blue */
export function b(...args: unknown[]) {
	return ch.blue(...args)
}

/** chalk.cyan */
export function c(...args: unknown[]) {
	return ch.cyan(...args)
}

/** chalk.yellow */
export function y(...args: unknown[]) {
	return ch.yellow(...args)
}

/** chalk.magenta */
export function m(...args: unknown[]) {
	return ch.magenta(...args)
}

const orange = ch.hex('#cc6630')
export function o(...args: unknown[]) {
	return orange(...args)
}

const pink = ch.hex('#eaa')
/** pink chalk.hex('#eaa') */
export function p(...args: unknown[]) {
	return pink(...args)
}

const lightGreen = ch.hex('#aea')
/** lightGreen chalk.hex('#aea') */
export function lg(...args: unknown[]) {
	return lightGreen(...args)
}

/** chalk.dim */
export function dim(...args: unknown[]) {
	return ch.dim(...args)
}

/** chalk.dim */
export function d(...args: unknown[]) {
	return dim(...args)
}

/** chalk.gray */
export function gr(...args: unknown[]) {
	return ch.gray(...args)
}

/** chalk.bold */
export function bd(...args: unknown[]) {
	return ch.bold(...args)
}

/** chalk.italic */
export function i(...args: unknown[]) {
	return ch.italic(...args)
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

export function fn(functionName: string, color = gr) {
	return color(functionName) + dim('()')
}
