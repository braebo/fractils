import type { ColorFormat } from './types/colorFormat'

import type {
	ColorObject,
	HslColor,
	HslaColor,
	HsvColor,
	HsvaColor,
	RgbColor,
	RgbaColor,
} from './types/objects'

import type {
	ColorString,
	HexAlphaString,
	HexString,
	HslString,
	HslaString,
	RgbString,
	RgbaString,
} from './types/strings'

import {
	REGEX_FUNCTIONAL_RGB,
	REGEX_FUNCTIONAL_RGBA,
	REGEX_FUNCTIONAL_HSL,
	REGEX_FUNCTIONAL_HSLA,
	REGEX_HEX_3,
	REGEX_HEX_4,
	REGEX_HEX_6,
	REGEX_HEX_8,
} from './regex'

import { kelvinToRgb } from './conversions/kelvinToRgb'
import { rgbToKelvin } from './conversions/rgbToKelvin'
import { rgbToHsv } from './conversions/rgbToHsv'
import { hslToHsv } from './conversions/hslToHsv'
import { hsvToHsl } from './conversions/hsvToHsl'
import { hsvToRgb } from './conversions/hsvToRgb'

import { parseHexInt } from './conversions/parseHexInt'
import { parseUnit } from './conversions/parseUnit'
import { intToHex } from './conversions/intToHex'

export type ColorMode = 'hsv' | 'hsl' | 'rgb'

export type ColorValue = Color | ColorString | ColorObject

const DEFAULT_COLOR = { h: 0, s: 0, v: 0, a: 1 }

/**
 * A color class with rgb, hsl, hsv, and kelvin color objects, strings, and conversion methods.
 */
export class Color {
	readonly isColor = true as const

	#hsva: HsvaColor // The primary internal color value (source of truth).
	readonly #initialValue: HsvaColor

	/**
	 * @param color - The initial color value.
	 * The value can be any valid color representation:
	 * - A hex string: '#5500ee' | '#5500eeff'
	 * - An rgba string: 'rgba(85, 0, 238, 1)' | 'rgba(85, 0, 238, 1.0)'
	 * - An hsla string: 'hsla(261, 100%, 47%, 1)' | 'hsla(261, 100%, 47%, 1.0)'
	 * - An {@link RgbvColor}: { r: 85, g: 0, b: 238, a: 1 }
	 * - An {@link HsvColor}: { h: 261, s: 100, v: 47, a: 1 }
	 * - An {@link HslColor}: { h: 261, s: 100, l: 47, a: 1 }
	 * - An {@link KelvinColor}: { kelvin: 6500 }
	 */
	constructor(color?: ColorValue | (string & {})) {
		this.#hsva = DEFAULT_COLOR

		if (color) this.set(color as ColorValue)

		this.#initialValue = structuredClone(this.#hsva)

		return this
	}

	/**
	 * Sets the Color from any valid {@link ColorValue}.
	 */
	set(color: ColorValue) {
		if (typeof color === 'string') {
			if (/^(?:#?|0x?)[0-9a-fA-F]{3,8}$/.test(color as string)) {
				this.hexString = color as HexString
			} else if (/^rgba?/.test(color as string)) {
				this.rgbString = color as RgbaString
			} else if (/^hsla?/.test(color as string)) {
				this.hslString = color as HslaString
			}
		} else if (typeof color === 'object') {
			if (color instanceof Color) {
				this.hsva = color.hsva
			} else if ('r' in color && 'g' in color && 'b' in color) {
				this.rgb = color as RgbColor
			} else if ('h' in color && 's' in color && 'v' in color) {
				this.hsv = color
			} else if ('h' in color && 's' in color && 'l' in color) {
				this.hsl = color as HslColor
			} else if ('kelvin' in color) {
				this.kelvin = color.kelvin as number
			}
		} else {
			throw new Error('Invalid color value: ' + color)
		}
	}

	/**
	 * Shortcut to set a specific channel value.
	 * @param format - hsv | hsl | rgb
	 * @param channel - Individual channel to set, for example, if format = hsl, chanel = h | s | l
	 * @param value - New value for the channel.
	 */
	setChannel<Mode extends ColorMode>(
		format: Mode,
		channel: Mode extends 'hsv'
			? 'h' | 's' | 'v'
			: Mode extends 'hsl'
				? 'h' | 's' | 'l'
				: Mode extends 'rgb'
					? 'r' | 'g' | 'b'
					: never,
		value: number,
	) {
		this[format] = { ...this[format], [channel]: value }
	}

	/**
	 * Reset color back to its initial value
	 */
	reset() {
		this.hsva = this.#initialValue
	}

	/**
	 * Returns a new Color instance with the same values as this one.
	 */
	clone() {
		return new Color(this)
	}

	/** i.e. `{ h: 261, s: 100, v: 47 }` */
	get hsv(): HsvColor {
		const { h, s, v } = this.#hsva
		return { h, s, v }
	}

	// All other setters go through this one.
	set hsv(value: Partial<HsvaColor>) {
		const oldValue = this.#hsva

		const mergedValue = { ...oldValue, ...value }

		if (
			this.#hsva.h === mergedValue.h &&
			this.#hsva.s === mergedValue.s &&
			this.#hsva.v === mergedValue.v &&
			this.#hsva.a === mergedValue.a
		) {
			return
		}

		this.#hsva = {
			h: Math.round(mergedValue.h),
			s: Math.round(mergedValue.s),
			v: Math.round(mergedValue.v),
			a: mergedValue.a,
		}

		// this.#hsva = mergedValue
	}

	/** i.e. `{ h: 261, s: 100, v: 47, a: 1 }` */
	get hsva(): HsvaColor {
		return structuredClone(this.#hsva)
	}
	set hsva(value: HsvaColor) {
		this.hsv = value
	}

	/** The value of `H` in `HSVA`. */
	get hue(): number {
		return this.#hsva.h
	}
	set hue(value: number) {
		this.hsv = { h: value }
	}

	/** The value of `S` in `HSVA`. */
	get saturation(): number {
		return this.#hsva.s
	}
	set saturation(value: number) {
		this.hsv = { s: value }
	}

	/** The value of `V` in `HSVA`. */
	get value(): number {
		return this.#hsva.v
	}
	set value(value: number) {
		this.hsv = { v: value }
	}

	/** The value of `L` in `HSLA`. */
	get lightness(): number {
		return this.hsl.l
	}
	set lightness(value: number) {
		this.hsl = { ...this.hsl, l: value }
	}

	get alpha(): number {
		return this.#hsva.a ?? 1
	}
	set alpha(value: number) {
		this.hsv = { ...this.hsv, a: value }
	}

	get kelvin(): number {
		return rgbToKelvin(this.rgb)
	}
	set kelvin(value: number) {
		this.rgb = kelvinToRgb(value)
	}

	get red(): number {
		return this.rgb.r
	}
	set red(value: number) {
		this.rgb = { ...this.rgb, r: value }
	}
	/**
	 * A float version of the {@link red} channel value as a fraction of 1 (0-1 vs 0-255).
	 */
	get r(): number {
		// return this.red
		return this.rgb.r / 255
	}
	set r(value: number) {
		this.red = value * 255
	}

	get green(): number {
		return this.rgb.g
	}
	set green(value: number) {
		this.rgb = { ...this.rgb, g: value }
	}
	/**
	 * A float version of the {@link green} channel value as a fraction of 1 (0-1 vs 0-255).
	 */
	get g(): number {
		// return this.green
		return this.rgb.g / 255
	}
	set g(value: number) {
		this.green = value * 255
	}

	get blue(): number {
		return this.rgb.b
	}
	set blue(value: number) {
		this.rgb = { ...this.rgb, b: value }
	}
	/**
	 * A float version of the {@link blue} channel value as a fraction of 1 (0-1 vs 0-255).
	 */
	get b(): number {
		return this.rgb.b / 255
	}
	set b(value: number) {
		this.blue = value * 255
	}

	/** i.e. `{ r: 85, g: 0, b: 238 }` */
	get rgb(): RgbColor {
		const { r, g, b } = hsvToRgb(this.#hsva)
		return {
			r: Math.round(r),
			g: Math.round(g),
			b: Math.round(b),
		}
	}

	set rgb(value: RgbColor | RgbaColor) {
		this.hsv = {
			...rgbToHsv(value),
			a: 'a' in value ? value.a : 1,
		}
	}

	/**
	 * A float version of {@link rgb} values as a fraction of 1 (0-1 vs 0-255).
	 */
	get rgbf(): RgbColor {
		return {
			r: this.r,
			g: this.g,
			b: this.b,
		}
	}
	set rgbf(value: RgbColor) {
		this.rgb = {
			r: value.r,
			g: value.g,
			b: value.b,
		}
	}

	/** i.e. `'rgba(85, 0, 238, 1)'` */
	get rgba(): RgbaColor {
		return { ...this.rgb, a: this.alpha }
	}
	set rgba(value: RgbColor | RgbaColor) {
		this.rgb = value
	}

	/** i.e. `'hsl(261, 100%, 47%)'` */
	get hsl(): HslColor {
		const { h, s, l } = hsvToHsl(this.#hsva)
		return {
			h: Math.round(h),
			s: Math.round(s),
			l: Math.round(l),
		}
	}
	set hsl(value: HslColor | HslaColor) {
		this.hsv = {
			...hslToHsv(value),
			a: 'a' in value ? value.a : 1,
		}
	}

	/** i.e. `'hsla(261, 100%, 47%, 1)'` */
	get hsla(): HslaColor {
		return { ...this.hsl, a: this.alpha }
	}
	set hsla(value: HslColor | HslaColor) {
		this.hsl = value
	}

	/** i.e. `'rgb(85, 0, 238)'` */
	get rgbString(): RgbString {
		return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
	}
	set rgbString(value: RgbString | RgbaString | (string & {})) {
		let match: RegExpExecArray | null

		let r: number
		let g: number
		let b: number
		let a = 1

		if ((match = REGEX_FUNCTIONAL_RGB.exec(value))) {
			r = parseUnit(match[1], 255)
			g = parseUnit(match[2], 255)
			b = parseUnit(match[3], 255)
		} else if ((match = REGEX_FUNCTIONAL_RGBA.exec(value))) {
			r = parseUnit(match[1], 255)
			g = parseUnit(match[2], 255)
			b = parseUnit(match[3], 255)
			a = parseUnit(match[4], 1)
		} else {
			throw new Error('Invalid rgb string: ' + value)
		}

		this.rgb = { r, g, b, a }
	}

	/** i.e. `'rgba(85, 0, 238, 1)'` */
	get rgbaString(): RgbaString {
		const rgba = this.rgba
		return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
	}
	set rgbaString(value: RgbaString | (string & {})) {
		this.rgbString = value
	}

	/**
	 * Hex string with an alpha channel, i.e. `'#5500eeff'`. Identical to {@link hex8String}.
	 */
	get hex(): HexString {
		return this.hex8String
	}
	/** Hex string with no alpha channel, i.e. `'#5500ee'` */
	get hexString(): HexString {
		const rgb = this.rgb
		return `#${intToHex(rgb.r)}${intToHex(rgb.g)}${intToHex(rgb.b)}` as HexString
	}
	set hexString(value: HexString | HexAlphaString | (string & {})) {
		const match =
			value.match(REGEX_HEX_3) ||
			value.match(REGEX_HEX_4) ||
			value.match(REGEX_HEX_6) ||
			value.match(REGEX_HEX_8)

		if (!match) throw new Error('Invalid hex string')

		const [r, g, b, a = 255] = match
			.slice(1)
			.map(c => parseHexInt(c.length === 1 ? `${c}${c}` : c))

		this.rgb = { r, g, b, a: +a / 255 }
	}

	get hex8(): HexAlphaString {
		return this.hex8String
	}
	/** i.e. `'#5500eeff'` */
	get hex8String(): HexAlphaString {
		const rgba = this.rgba
		return `#${intToHex(rgba.r)}${intToHex(rgba.g)}${intToHex(rgba.b)}${intToHex(Math.floor((rgba.a ?? 1) * 255))}` as HexAlphaString
	}
	set hex8String(value: HexAlphaString | (string & {})) {
		this.hexString = value
	}

	/** i.e. `'rgb(85, 0, 238)'` */
	get hslString(): HslString {
		const hsl = this.hsl
		return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
	}
	set hslString(value: HslString | (string & {})) {
		const match = REGEX_FUNCTIONAL_HSL.exec(value) || REGEX_FUNCTIONAL_HSLA.exec(value)
		if (!match) throw new Error('Invalid rgb string: ' + value)

		const [r, g, b, a = 1] = match
			.slice(1)
			.map((val, index) => parseUnit(val, index < 3 ? 255 : 1))

		this.rgb = { r, g, b, a }
	}

	/** i.e. `'hsla(261, 100%, 47%, 1)'` */
	get hslaString(): string {
		const hsla = this.hsla
		return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`
	}
	set hslaString(value: HslaString | (string & {})) {
		this.hslString = value
	}

	toString() {
		return this.hex8String
	}

	toJSON() {
		return {
			isColor: true,
			...this.rgba,
			hex: this.hex8String,
		}
	}
}

export function isColor(color: any): color is Color {
	return !!color.isColor
}

export function isColorFormat(color: any): color is ColorFormat {
	return typeof parseColorFormat(color) !== 'undefined'
}

export function parseColorFormat(color: ColorFormat | (string & {})) {
	if (typeof color === 'string') {
		if (color.match(/^#?[0-9a-fA-F]{6}$/)) {
			return 'HexString' as const
		} else if (color.match(/^#?[0-9a-fA-F]{8}$/)) {
			return 'Hex8String' as const
		} else if (color.match(/^rgba?/)) {
			return 'RgbaString' as const
		} else if (color.match(/^hsla?/)) {
			return 'HslaString' as const
		}
	} else if (typeof color === 'object') {
		if (color instanceof Color) {
			return 'Color' as const
		} else if ('r' in color && 'g' in color && 'b' in color) {
			return 'RgbColor' as const
		} else if ('h' in color && 's' in color && 'v' in color) {
			return 'HsvColor' as const
		} else if ('h' in color && 's' in color && 'l' in color) {
			return 'HslColor' as const
		} else if ('kelvin' in color) {
			return 'number' as const
		}
	}

	return undefined
}
