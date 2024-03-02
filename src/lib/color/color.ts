import type { CSSColor } from '../color/cssColors'

import { Logger } from '../utils/logger'
import { colors } from './cssColors'

/**
 * A hex color string.
 */
export type HexColor = `#${string}`
export type RGBA = { r: number; g: number; b: number; a: number }
export type HSLA = { h: number; s: number; l: number; a: number }
export type ColorRepresentation =
	| HexColor
	| { r: number; g: number; b: number; a: number }
	| { h: number; s: number; l: number; a: number }
	| CSSColor

export class Color {
	readonly isColor = true as const

	#hex: HexColor = '#ffffffff'
	#rgba: RGBA = { r: 255, g: 255, b: 255, a: 1 }
	#hsla: HSLA = { h: 0, s: 0, l: 1, a: 1 }

	#log = new Logger('Color', { fg: 'green' })

	constructor(color?: ColorRepresentation | Color) {
		if (color instanceof Color) {
			this.hex = color.hex
		} else if (this.isHex(color)) {
			this.hex = color
			this.rgba = this.hexToRGBA(color)
		}
	}

	get hex() {
		return this.#hex
	}
	set hex(v: HexColor) {
		this.#hex = v
		this.#rgba = this.hexToRGBA(v)
		this.#hsla = this.rgbaToHSLA(this.#rgba)
	}
	get hexString() {
		return this.hex
	}

	get rgba() {
		return this.#rgba
	}
	set rgba(v: RGBA) {
		this.#rgba = v
		this.#hex = this.rgbaToHex(v)
		this.#hsla = this.rgbaToHSLA(v)
	}
	get rgbaString() {
		const { r, g, b, a } = this.rgba
		return `rgba(${r}, ${g}, ${b}, ${a})`
	}

	get hsla() {
		return this.#hsla
	}
	set hsla(v: HSLA) {
		this.#hsla = v
		this.#rgba = this.hslaToRGBA(v)
		this.#hex = this.rgbaToHex(this.#rgba)
	}
	get hslaString() {
		return `hsla(${this.hsla.h}, ${this.hsla.s}%, ${this.hsla.l}% ${this.hsla.a})`
	}

	get array() {
		return [this.rgba.r, this.rgba.g, this.rgba.b, this.rgba.a]
	}
	set array([r, g, b, a]: [number, number, number, number]) {
		this.rgba = { r, g, b, a }
		this.hex = this.rgbaToHex({ r, g, b, a })
	}

	isHex = (color: unknown): color is HexColor => {
		return typeof color === 'string' && color.startsWith('#')
	}

	isCSS = (color: unknown): color is CSSColor => {
		return typeof color === 'string' && (colors as any as string[]).includes(color)
	}

	hexToRGBA = (hex: HexColor): { r: number; g: number; b: number; a: number } => {
		const rgba = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		this.#log.fn('hexToRGBA').info({ hex, rgba })

		return rgba
			? {
					r: parseInt(rgba[1], 16),
					g: parseInt(rgba[2], 16),
					b: parseInt(rgba[3], 16),
					a: rgba[4] ? parseInt(rgba[4], 16) / 255 : 1,
				}
			: { r: 0, g: 0, b: 0, a: 1 }
	}

	rgbaToHex = (rgba: RGBA): HexColor => {
		const hex =
			`#${((1 << 24) + (rgba.r << 16) + (rgba.g << 8) + rgba.b).toString(16).slice(1)}` as const

		this.#log.fn('rgbaToHex').info({ rgba, hex })

		return hex
	}

	hslaToRGBA(hsl: HSLA): RGBA {
		const { h, s, l, a } = hsl

		let c = (1 - Math.abs(2 * l - 1)) * s
		let x = c * (1 - Math.abs(((h / 60) % 2) - 1))
		let m = l - c / 2

		let r = 0
		let g = 0
		let b = 0

		// prettier-ignore
		if (h >= 0 && h < 60) {
			r = c; g = x; b = 0;
		} else if (h >= 60 && h < 120) {
			r = x; g = c; b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0; g = c; b = x;
		} else if (h >= 180 && h < 240) {
			r = 0; g = x; b = c;
		} else if (h >= 240 && h < 300) {
			r = x; g = 0; b = c;
		} else if (h >= 300 && h < 360) {
			r = c; g = 0; b = x;
		}

		const rgba = {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
			a,
		}

		this.#log.fn('hslaToRGBA').info({ hsl, rgba })

		return rgba
	}

	rgbaToHSLA(rgba: RGBA): HSLA {
		this.#log.fn('rgbqToHSLA')
		let { r, g, b, a } = rgba

		;(r /= 255), (g /= 255), (b /= 255)
		let max = Math.max(r, g, b)
		let min = Math.min(r, g, b)

		let h!: number
		let s!: number
		let l = (max + min) / 2

		if (max === min) {
			h = s = 0 // achromatic
		} else {
			let d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
			// prettier-ignore
			switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
			h *= 60
		}

		return { h, s, l, a }
	}

	hueToRGBA(hue: number): RGBA {
		const h = hue / 60
		const c = 255
		const x = (1 - Math.abs((h % 2) - 1)) * c
		const i = Math.floor(h)
		switch (i) {
			case 0:
				return { r: c, g: x, b: 0, a: this.rgba.a }
			case 1:
				return { r: x, g: c, b: 0, a: this.rgba.a }
			case 2:
				return { r: 0, g: c, b: x, a: this.rgba.a }
			case 3:
				return { r: 0, g: x, b: c, a: this.rgba.a }
			case 4:
				return { r: x, g: 0, b: c, a: this.rgba.a }
			case 5:
				return { r: c, g: 0, b: x, a: this.rgba.a }
			default:
				return { r: 0, g: 0, b: 0, a: this.rgba.a }
		}
	}
}
