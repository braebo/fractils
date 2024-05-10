import type { StyleCodes } from './types'

import { hexToRgb, rgbToAnsi256, rgbToAnsi16, ansi256To16 } from './utils'
import { getColorSpace } from './color-support'

const colorSpace = getColorSpace()
export const isSupported = colorSpace > 0
const mono: StyleCodes = { open: '', close: '' }
const monoFn = () => mono
const esc = isSupported
	? (open: number | string, close: number | string) => ({
			open: `\x1b[${open}m`,
			close: `\x1b[${close}m`,
		})
	: monoFn
const closeCode = 39
const bgCloseCode = 49

// defaults, true color
let fnAnsi256 = (code: number) => esc(`38;5;${code}`, closeCode)
let fnBgAnsi256 = (code: number) => esc(`48;5;${code}`, bgCloseCode)
let fnRgb = (r: number, g: number, b: number) => esc(`38;2;${r};${g};${b}`, closeCode)
let fnBgRgb = (r: number, g: number, b: number) => esc(`48;2;${r};${g};${b}`, bgCloseCode)

const createRgbFn = (fn: (code: number) => StyleCodes) => (r: number, g: number, b: number) =>
	fn(rgbToAnsi256(r, g, b))

const createHexFn = (fn: (r: number, g: number, b: number) => StyleCodes) => (hex: string) => {
	let [r, g, b] = hexToRgb(hex)
	return fn(r, g, b)
}

if (colorSpace === 1) {
	// ANSI 16 colors
	fnAnsi256 = code => esc(ansi256To16(code), closeCode)
	fnBgAnsi256 = code => esc(ansi256To16(code) + 10, bgCloseCode)
	fnRgb = (r, g, b) => esc(rgbToAnsi16(r, g, b), closeCode)
	fnBgRgb = (r, g, b) => esc(rgbToAnsi16(r, g, b) + 10, bgCloseCode)
} else if (colorSpace === 2) {
	// ANSI 256 colors
	fnRgb = createRgbFn(fnAnsi256)
	fnBgRgb = createRgbFn(fnBgAnsi256)
}

export const baseStyles: Record<string, StyleCodes> = {
	// misc
	visible: mono,
	reset: esc(0, 0),
	inverse: esc(7, 27),
	hidden: esc(8, 28),

	// styles
	bold: esc(1, 22),
	dim: esc(2, 22),
	italic: esc(3, 23),
	underline: esc(4, 24),
	strikethrough: esc(9, 29),
	strike: esc(9, 29), // alias for strikethrough

	grey: esc(90, closeCode), // UK spelling alias for blackBright
	gray: esc(90, closeCode), // US spelling alias for blackBright
	bgGrey: esc(100, bgCloseCode), // UK spelling alias for bgBlackBright
	bgGray: esc(100, bgCloseCode), // US spelling alias for bgBlackBright
}

// generate ANSI 16 colors dynamically and save ~450 bytes
let styles = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
let bright = 'Bright'
let code = 30
let name: string
let bgName: string

for (name of styles) {
	bgName = 'bg' + name[0].toUpperCase() + name.slice(1)

	baseStyles[name] = esc(code, closeCode) // Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ visible: { open: string; close: string; }; reset: { open: string; close: string; }; inverse: { open: string; close: string; }; hidden: { open: string; close: string; }; bold: { open: string; close: string; }; dim: { ...; }; ... 7 more ...; bgGray: { ...; }; }'.  // No index signature with a parameter of type 'string' was found on type '{ visible: { open: string; close: string; }; reset: { open: string; close: string; }; inverse: { open: string; close: string; }; hidden: { open: string; close: string; }; bold: { open: string; close: string; }; dim: { ...; }; ... 7 more ...; bgGray: { ...; }; }'.ts(7053)
	baseStyles[name + bright] = esc(code + 60, closeCode) // Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ visible: { open: string; close: string; }; reset: { open: string; close: string; }; inverse: { open: string; close: string; }; hidden: { open: string; close: string; }; bold: { open: string; close: string; }; dim: { ...; }; ... 7 more ...; bgGray: { ...; }; }'.  // No index signature with a parameter of type 'string' was found on type '{ visible: { open: string; close: string; }; reset: { open: string; close: string; }; inverse: { open: string; close: string; }; hidden: { open: string; close: string; }; bold: { open: string; close: string; }; dim: { ...; }; ... 7 more ...; bgGray: { ...; }; }'.ts(7053)
	baseStyles[bgName] = esc(code + 10, bgCloseCode) // etc
	baseStyles[bgName + bright] = esc(code + 70, bgCloseCode) // etc

	code++
}

export const styleMethods = {
	fg: fnAnsi256,
	bg: fnBgAnsi256,
	rgb: fnRgb,
	bgRgb: fnBgRgb,
	// note: the `...` operator is too slow
	//hex: (hex) => fnRgb(...hexToRgb(hex)),
	hex: createHexFn(fnRgb),
	// note: the `...` operator is too slow
	//bgHex: (hex) => fnBgRgb(...hexToRgb(hex)),
	bgHex: createHexFn(fnBgRgb),

	// reserved for future: hyperlink (OSC 8) is not widely supported (works in iTerm)
	// link: hasColor
	//   ? (url) => ({ open: ESC + ']8;;' + url + BEL, close: ESC + ']8;;' + BEL })
	//   : (url) => ({ open: '', close: `(${ZWSP}${url}${ZWSP})` }),
} as const

export const rgb = fnRgb
