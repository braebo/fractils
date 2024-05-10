import type { AnsisInstance, AnsisProps, StyleCodes } from './types.js'

import { baseStyles, styleMethods, rgb, isSupported } from './ansi-codes.js'
import { hexToRgb, replaceAll } from './utils.js'

const stripANSIRegEx = /[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
const regexLFCR = /(\r?\n)/g
const ESC = '\x1b'
const LF = '\x0a'
const styles = {} as AnsisInstance

type Wrapper = (
	strings: string | TemplateStringsArray | number,
	values: string[],
	props: AnsisProps,
) => string

/**
 * Wraps a string with styling and reset codes.
 * @param strings A string or template literals.
 * @param values The values of the template literals.
 */
const wrap: Wrapper = (strings, values, props): string => {
	if (!strings) return ''

	const { _a: openStack, _b: closeStack } = props

	// @ts-expect-error
	// convert the number to the string
	let string = strings.raw != null ? String.raw(strings, ...values) : strings + ''

	if (string.includes(ESC)) {
		while (props != null) {
			//string = string.replaceAll(props.close, props.open); // too slow!
			string = replaceAll(string, props.close, props.open) // much faster than native replaceAll
			props = props._p!
		}
	}

	if (string.includes(LF)) {
		string = string.replace(regexLFCR, closeStack + '$1' + openStack)
	}

	return openStack + string + closeStack
}

const createStyle = (
	{ _p: props }: { _p: AnsisProps },
	{ open, close }: { open: string; close: string },
): AnsisInstance => {
	const style: ((
		strings: string | TemplateStringsArray | number,
		...values: string[]
	) => string) &
		// @ts-expect-error
		Ansis = (strings, ...values) => wrap(strings, values as string[], style._p)

	let openStack = open
	let closeStack = close

	if (props != null) {
		openStack = props._a + open
		closeStack = close + props._b
	}

	Object.setPrototypeOf(style, stylePrototype)
	style._p = { open, close, _a: openStack, _b: closeStack, _p: props }
	style.open = openStack
	style.close = closeStack

	return style
}

const Ansis = function () {
	const self = (str: string) => str + ''

	/**
	 * Whether the output supports ANSI color and styles.
	 *
	 * @return {boolean}
	 */
	self.isSupported = (): boolean => isSupported

	/**
	 * Remove ANSI styling codes.
	 * @param {string} str
	 * @return {string}
	 */
	self.strip = (str: string): string => str.replace(stripANSIRegEx, '')

	/**
	 * @callback getStyleCodes
	 * @param {string} value
	 */

	/**
	 * Extend base colors with custom ones.
	 *
	 * @param colors The object with key as color name and value as hex
	 * code of custom color or the object with 'open' and 'close' codes.
	 */
	self.extend = (colors: Record<string, string | StyleCodes>): void => {
		for (let name in colors) {
			let value = colors[name]
			// @ts-expect-error
			// detect whether the value is style property Object {open, close} or a string with hex code of color '#FF0000'
			let isStyle = value.open != null
			let styleCodes = isStyle ? value : rgb(...hexToRgb(value as string))

			styles[name] = {
				get() {
					const style = createStyle(this, styleCodes as StyleCodes)
					Object.defineProperty(this, name, { value: style })
					return style
				},
			}
		}

		stylePrototype = Object.defineProperties({} as AnsisInstance, styles)
		Object.setPrototypeOf(self, stylePrototype)
	}

	// extend styles with base colors & styles
	self.extend(baseStyles)

	return self as AnsisInstance
}

// extend styles with methods: rgb(), hex(), etc.
for (let name in styleMethods) {
	styles[name] = {
		get() {
			// @ts-expect-error
			return (...args: any[]) => createStyle(this, styleMethods[name](...args))
		},
	}
}

// define method aliases for compatibility with chalk
styles.ansi256 = styles.fg
styles.bgAnsi256 = styles.bg

// note: place it here to allow the compiler to group all constants
let stylePrototype: AnsisInstance

// @ts-expect-error
const ansis = new Ansis()

// for distribution code, the export will be replaced (via @rollup/plugin-replace) with the following export:
// module.exports = ansis;
// module.exports.Ansis = Ansis;

export { ansis as default, Ansis }
