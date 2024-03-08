// import type { ColorFormat } from './types/colorFormat'

// import { Color } from './color'

// export function isColorFormat(v: any): v is ColorFormat {
// 	return typeof parseColorFormat(v) !== 'undefined'
// }

// export function parseColorFormat(color: ColorFormat): string | undefined {
// 	if (typeof color === 'string') {
// 		if (/^(?:#?|0x?)[0-9a-fA-F]{3,8}$/.test(color)) {
// 			return 'HexString'
// 		} else if (/^rgba?/.test(color)) {
// 			;('RgbaString')
// 		} else if (/^hsla?/.test(color)) {
// 			return 'HslaString'
// 		}
// 	} else if (typeof color === 'object') {
// 		if (color instanceof Color) {
// 			;('Color')
// 		} else if ('r' in color && 'g' in color && 'b' in color) {
// 			return 'RgbColor'
// 		} else if ('h' in color && 's' in color && 'v' in color) {
// 			return 'HsvColor'
// 		} else if ('h' in color && 's' in color && 'l' in color) {
// 			return 'HslColor'
// 		} else if ('kelvin' in color) {
// 			return 'number'
// 		}
// 	}

// 	return undefined
// }
