/**
 * All valid color objects and strings.
 */
export type ColorString =
	| HexString
	| HexAlphaString
	| HexStringShorthand
	| HexAlphaStringShorthand
	| RgbString
	| RgbaString
	| PercentageRgbString
	| PercentageRgbaString
	| RgbObject
	| RgbaObject
	| HslString
	| HslaString
	| HslObject
	| HslaObject
	| HsvObject
	| HsvaObject

/** A 6-character hex color string: `'#5500ee'` */
export type HexString = `#${string}${string}${string}${string}${string}${string}`
/** An 8-character hex color string with alpha: `'#5500eeff'` */
export type HexAlphaString =
	`#${string}${string}${string}${string}${string}${string}${string}${string}`
/** A 3-character hex color string: `'#50e'` */
export type HexStringShorthand = `#${string}${string}${string}`
/** A 4-character hex color string with alpha: `'#50ef'` */
export type HexAlphaStringShorthand = `#${string}${string}${string}${string}`
/** An rgb color string: `rgb(85, 0, 238)` */
export type RgbString = `rgb(${number}, ${number}, ${number})`
/** An rgba color string: `rgba(85, 0, 238, 1)` */
export type RgbaString = `rgba(${number}, ${number}, ${number}, ${number})`
/** A percentage rgb color string: `rgb(33%, 0%, 93%)` */
export type PercentageRgbString = `rgb(${number}%, ${number}%, ${number}%)`
/** A percentage rgba color string: `rgba(33%, 0%, 93%, 1)` */
export type PercentageRgbaString = `rgba(${number}%, ${number}%, ${number}%, ${number}%)`
/** An object representing an rgb color: `{ r: 85, g: 0, b: 238 }` */
export type RgbObject = { r: number; g: number; b: number }
/** An object representing an rgba color: `{ r: 85, g: 0, b: 238, a: 1 }` */
export type RgbaObject = { r: number; g: number; b: number; a: number }
/** An hsl color string: `hsl(261, 100%, 47%)` */
export type HslString = `hsl(${number}, ${number}%, ${number}%)`
/** An hsla color string: `hsla(261, 100%, 47%, 1)` */
export type HslaString = `hsla(${number}, ${number}%, ${number}%, ${number})`
/** An object representing an hsl color: `{ h: 261, s: 100, l: 47 }` */
export type HslObject = { h: number; s: number; l: number }
/** An object representing an hsla color: `{ h: 261, s: 100, l: 47, a: 1 }` */
export type HslaObject = { h: number; s: number; l: number; a: number }
/** An object representing an hsv color: `{ h: 261, s: 100, v: 47 }` */
export type HsvObject = { h: number; s: number; v: number }
/** An object representing an hsva color: `{ h: 261, s: 100, v: 47, a: 1 }` */
export type HsvaObject = { h: number; s: number; v: number; a: number }
