import { fontSize } from './fontSize'
import { logger } from './logger'
import { r } from './l'

const log = logger('getPx', { fg: 'Red', deferred: false })

/**
 * Accepts `rem`, `vw`, and `vh` css units, and returns the
 * corresponding pixel value.
 *
 * @param str A string containing a css unit.
 * @param relativeParentSize The size of the parent element, if the unit is `%`.
 *
 * @throws If the string is not a valid css unit.
 *
 * @example
 * ```ts
 * measure('1rem') // 16
 * measure('100vw') // 1920 (on a 1920x1080 screen)
 * ```
 */
export function getPx(
	str: `${number}${'px' | 'rem' | 'vw' | 'vh' | '%'}`,
	relativeParentSize?: number,
): number {
	if (!str.length) return NaN

	const match = str.match(/([\d.]+)(px|rem|vw|vh)/)
	if (!match) throw new Error('Invalid css unit: ' + str)

	const [, num, unit] = match
	const n = parseFloat(num)

	switch (unit) {
		case 'px':
			return n
		case 'rem':
			return n * parseInt(fontSize)
		case 'vw':
			const width = typeof window === 'undefined' ? 1000 : window.innerWidth
			return (n * width) / 100
		case 'vh':
			const height = typeof window === 'undefined' ? 1000 : window.innerHeight
			return (n * height) / 100
		case '%':
			if (typeof relativeParentSize === 'undefined') {
				log(r('ERROR: Got `%` unit, but no relative parent size was provided.'))
				return NaN
			}
			return (n * relativeParentSize) / 100
		default:
			throw new Error('Invalid css unit: ' + str)
	}
}
