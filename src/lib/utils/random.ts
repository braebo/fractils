/**
 * Returns a random float within a range.
 *
 * @example
 * ```ts
 * randomRange() // 0-1
 * randomRange(10) // 0-10
 * randomRange(10, 5) // 5-10
 * ```
 */
export function randomFloat(
	/**
	 * The upper bound of the range.
	 * @default 1
	 */
	max = 1,
	/**
	 * The lower bound of the range.
	 * @default 0
	 */
	min = 0,
) {
	return Math.random() * (max - min) + min
}

/**
 * Returns a random integer within a range.
 *
 * @example
 * ```ts
 * randomInt() // 0-1
 * randomInt(10) // 0-10
 * randomInt(10, 5) // 5-10
 * ```
 */
export function randomInt(
	/**
	 * The lower bound of the range.
	 * @default 1
	 */
	min = 1,
	/**
	 * The upper bound of the range.
	 * @default 100
	 */
	max = 100,
) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Returns a random string of characters.
 *
 * @param length default `10`
 * @param chars default `'abcdefghijklmnopqrstuvwxyz'`
 *
 * @example
 * ```ts
 * randomString() // 'xouuqyjzqz' (10)
 * randomString(5) // 'xouuq' (5)
 * randomString(2, 'abc') // 'ca'
 * ```
 */
export function randomString(
	/**
	 * The length of the string.
	 * @default 10
	 */
	length = 10,
	/**
	 * The characters to choose from.
	 * @default 'abcdefghijklmnopqrstuvwxyz'
	 */
	chars = 'abcdefghijklmnopqrstuvwxyz',
) {
	let result = ''
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(Math.random() * chars.length)]
	}
	return result
}
