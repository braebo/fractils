/**
 * A faster `.toFixed()` alternative.
 */
export function truncate(
	/**
	 * A number to truncate.
	 */
	value: number,
	/**
	 * The number of decimal places to keep.
	 */
	decimals: number,
) {
	return ~~(value * decimals) / decimals
}
