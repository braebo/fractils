/**
 * Converts an array of rgb values to a css hex color string.
 */
export function rgbToHex(r: number, g: number, b: number) {
	return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}
