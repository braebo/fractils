import { isObject } from './is'

/**
 * Deep merges objects together, with some special rules:
 * - Subsequent objects must be partials of the first object.
 * - Arrays are concatenated and de-duplicated.
 * - Objects are recursively merged.
 * - `true` is replaced by objects, but not `false`.
 * - An object is never replaced with `true`, `false`, or `undefined`.
 * - The original objects are not mutated.
 */
export function deepMerge<
	T extends {} = {},
	U extends Partial<T> | undefined = Partial<T> | undefined,
>(target: T, ...sources: U[]): T & U {
	return sources.reduce<T & U>(
		(acc, curr) => {
			if (!curr) return acc

			Object.keys(curr).forEach(key => {
				const v = acc[key]
				const newV = curr[key]

				if (Array.isArray(v) && Array.isArray(newV)) {
					acc[key] = [...new Set([...v, ...newV])]
				} else if (isObject(v)) {
					if (newV !== true) {
						if (isObject(newV)) {
							acc[key] = deepMerge({ ...v }, newV)
						} else if (newV === false) {
							acc[key] = newV
						}
					}
				} else if (newV !== undefined) {
					acc[key] = newV
				}
			})
			return acc
		},
		{ ...target } as T & U,
	)
}
