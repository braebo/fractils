export type ColorObject =
	| HsvColor
	| HsvaColor
	| RgbColor
	| RgbaColor
	| HslColor
	| HslaColor
	| KelvinColor

export interface ColorChanges {
	h: boolean
	s: boolean
	v: boolean
	a: boolean
}

export interface HsvColor {
	h: number
	s: number
	v: number
}

export interface HsvaColor extends HsvColor {
	a: number
}

export interface RgbColor {
	r: number
	g: number
	b: number
}

export interface RgbaColor extends RgbColor {
	a: number
}

export interface HslColor {
	h: number
	s: number
	l: number
}

export interface HslaColor extends HslColor {
	a: number
}

export interface KelvinColor {
	kelvin: number
}
