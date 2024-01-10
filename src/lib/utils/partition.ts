/**
 * Partitions an array into two arrays based on a predicate.  The second argument
 * is a callback that takes an element from the array and returns a boolean.
 * - If it returns true, the element will be placed in the first array.
 * - If it returns false, the element will be placed in the second array.
 *
 * @example
 * ```ts
 * const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
 *
 * console.log(even) // [2, 4]
 * console.log(odd) // [1, 3, 5]
 * ```
 */
export function partition<const T>(array: T[], predicate: (element: T) => boolean): [T[], T[]] {
	const left = [] as T[]
	const right = [] as T[]

	for (const element of array) {
		if (predicate(element)) {
			left.push(element)
		} else {
			right.push(element)
		}
	}

	return [left, right]
}
