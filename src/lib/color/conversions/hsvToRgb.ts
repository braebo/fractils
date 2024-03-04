import type { HsvColor, RgbColor } from '../types/objects'

import { clamp } from '../../utils/clamp'

/**
 * Converts an {@link HsvColor} object to an {@link RgbColor} object.
 * @param hsv - {@link HsvColor} object to convert.
 */
export function hsvToRgb(hsv: HsvColor): RgbColor {
	const h = hsv.h / 60
	const s = hsv.s / 100
	const v = hsv.v / 100

	const i = Math.floor(h)
	const f = h - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)

	const mod = i % 6

	const r = [v, q, p, p, t, v][mod]
	const g = [t, v, v, q, p, p][mod]
	const b = [p, p, t, v, v, q][mod]

	return {
		r: clamp(r * 255, 0, 255),
		g: clamp(g * 255, 0, 255),
		b: clamp(b * 255, 0, 255),
	}
}
