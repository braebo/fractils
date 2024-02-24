import type { CSSColor } from '$lib/color/cssColors'

import { colors } from './cssColors'

/**
 * A hex color string.
 */
export type HexColor = `#${string}`
export type RGB = { r: number; g: number; b: number }
export type HSL = { h: number; s: number; l: number }
export type ColorRepresentation =
	| HexColor
	| { r: number; g: number; b: number }
	| { h: number; s: number; l: number }
	| CSSColor

export class Color {
	readonly isColor = true as const

	#hex: HexColor = '#ffffff'
	#rgb: RGB = { r: 255, g: 255, b: 255 }
	#hsl: HSL = { h: 0, s: 0, l: 1 }

	constructor(color?: ColorRepresentation | Color) {
		if (color instanceof Color) {
			Object.assign(this, color)
		}

		if (Color.isHex(color)) {
			this.hex = color
			this.rgb = Color.hexToRGB(color)
		}
	}

	get hex() {
		return this.#hex
	}
	set hex(v: HexColor) {
		this.#hex = v
		this.rgb = Color.hexToRGB(v)
	}
	get hexString() {
		return this.hex
	}

	get rgb() {
		return this.#rgb
	}
	set rgb(v: RGB) {
		this.#rgb = v
		this.hex = Color.rgbToHex(v)
	}
	get rgbString() {
		return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
	}

	get hsl() {
		return this.#hsl
	}
	set hsl(v: HSL) {
		this.#hsl = v
		this.rgb = Color.hslToRGB(v)
	}
	get hslString() {
		return `hsl(${this.hsl.h}, ${this.hsl.s}%, ${this.hsl.l}%)`
	}

	get array() {
		return [this.rgb.r, this.rgb.g, this.rgb.b]
	}
	set array([r, g, b]: [number, number, number]) {
		this.rgb = { r, g, b }
		this.hex = Color.rgbToHex({ r, g, b })
	}

	static isHex = (color: unknown): color is HexColor => {
		return typeof color === 'string' && color.startsWith('#')
	}

	static isCSS = (color: unknown): color is CSSColor => {
		return typeof color === 'string' && (colors as any as string[]).includes(color)
	}

	static hexToRGB = (hex: HexColor): { r: number; g: number; b: number } => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
				}
			: { r: 0, g: 0, b: 0 }
	}

	static rgbToHex = (rgb: RGB): HexColor => {
		return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`
	}

	static hslToRGB(hsl: HSL): RGB {
		const { h, s, l } = hsl

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

		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
		}
	}

	static rgbToHSL(r: number, g: number, b: number): HSL {
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

		return { h, s, l }
	}
}
