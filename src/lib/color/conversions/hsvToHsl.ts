import type { HsvColor, HslColor } from '../types/objects'

import { clamp } from '../../utils/clamp'

/**
 * Converts {@link HsvColor} object to an {@link HslColor} object.
 * @param hsv - {@link HsvColor} object to convert.
 */
export function hsvToHsl(hsv: HsvColor): HslColor {
	const s = hsv.s / 100
	const v = hsv.v / 100
	const l = (2 - s) * v

	const divisor = l <= 1 ? l : 2 - l

	// Avoid division by zero when lightness is close to zero
	const saturation = divisor < 1e-9 ? 0 : (s * v) / divisor

	return {
		h: hsv.h,
		s: clamp(saturation * 100, 0, 100),
		l: clamp(l * 50, 0, 100),
	}
}
