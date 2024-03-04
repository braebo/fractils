import type { HslColor, HsvColor } from '../types/objects'

import { clamp } from '../../utils/clamp'

/**
 * Converts {@link HslColor} object to an {@link HsvColor} object.
 * @param hsl - {@link HslColor} object to convert.
 */
export function hslToHsv(hsl: HslColor): HsvColor {
	const l = hsl.l * 2
	const s = (hsl.s * (l <= 100 ? l : 200 - l)) / 100
	// Avoid division by zero when l + s is near 0
	const saturation = l + s < 1e-9 ? 0 : (2 * s) / (l + s)

	return {
		h: hsl.h,
		s: clamp(saturation * 100, 0, 100),
		v: clamp((l + s) / 2, 0, 100),
	}
}
