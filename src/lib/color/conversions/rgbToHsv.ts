import type { RgbColor, HsvColor } from '../types/objects'

import { clamp } from '../../utils/clamp'

/**
 * Converts an {@link RgbColor} object to an {@link HSVColor} object.
 * @param rgb - {@link RGBColor} object to convert.
 */
export function rgbToHsv(rgb: RgbColor): HsvColor {
	const r = rgb.r / 255
	const g = rgb.g / 255
	const b = rgb.b / 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const delta = max - min

	let hue = 0
	let value = max
	let saturation = max === 0 ? 0 : delta / max

	switch (max) {
		case min:
			hue = 0 // achromatic
			break
		case r:
			hue = (g - b) / delta + (g < b ? 6 : 0)
			break
		case g:
			hue = (b - r) / delta + 2
			break
		case b:
			hue = (r - g) / delta + 4
			break
	}

	return {
		h: (hue * 60) % 360,
		s: clamp(saturation * 100, 0, 100),
		v: clamp(value * 100, 0, 100),
	}
}
